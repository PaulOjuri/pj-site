"""Pipeline orchestration (spec §9.3, §14). One entry point per cadence.

  hourly   ingest → sync → analyse new games (small budget) → tag → tablebase (small)
           → if anything new: leaks + publish. Cheap: 2–3 conditional HTTP requests, ~3s of
           engine per new blitz game. This is the "systematic refresh".
  nightly  same with larger budgets, always publishes, evaluates cycles.
  weekly   nightly + plan generation (Sunday evening).
  monthly  FIDE list, tagger validation, full re-tag, title recompute, publish.

Returns a dict; the shell wrapper (scripts/run.sh) reads `changed` to decide whether to build,
deploy and commit. Every step is logged to data/logs/run.log with durations.
"""
from __future__ import annotations

import json
import logging
import os
import time
from datetime import datetime, timedelta, timezone

from .config import DATA_DIR, load_config, db_path
from .db import Store

log = logging.getLogger("coach.run")
BUDGET = {
    "hourly": {"analyse_limit": 40, "analyse_since_days": 30, "tb_probes": 60, "workers": None},
    "nightly": {"analyse_limit": 600, "analyse_since_days": 120, "tb_probes": 300, "workers": None},
    "weekly": {"analyse_limit": 600, "analyse_since_days": 120, "tb_probes": 300, "workers": None},
    "monthly": {"analyse_limit": 1200, "analyse_since_days": 365, "tb_probes": 600, "workers": None},
}


class Timer:
    def __init__(self):
        self.steps = []

    def step(self, name, fn):
        t0 = time.monotonic()
        try:
            out = fn()
            ok = True
        except Exception as e:  # keep the pipeline moving; report the failure
            log.exception("step %s failed", name)
            out, ok = {"error": repr(e)}, False
        dt = round(time.monotonic() - t0, 1)
        self.steps.append({"step": name, "ok": ok, "seconds": dt, "result": out})
        log.info("%s: %s (%.1fs)", name, out if isinstance(out, dict) else "", dt)
        return out


def run(mode: str) -> dict:
    cfg = load_config()
    store = Store(db_path())
    b = BUDGET[mode]
    t = Timer()
    started = datetime.now(timezone.utc)
    before = store.conn.execute("SELECT COUNT(*) FROM game_analysis").fetchone()[0]
    games_before = store.count_games()

    # 1. ingest
    from .ingest.http import SerialClient
    from .ingest.otb import OtbIngester
    from .ingest.chesscom import ChessComIngester
    from .ingest.lichess import LichessIngester
    from .ingest.profiles import fetch_chesscom, fetch_lichess

    def ingest():
        out = {}
        names = [cfg.player.name, *[n for n in (cfg.identities.chesscom, cfg.identities.lichess) if n]]
        parts = cfg.player.name.split()
        if len(parts) >= 2:
            names.append(f"{parts[-1]}, {' '.join(parts[:-1])}")
        out["otb"] = OtbIngester(store, names).ingest()
        c = SerialClient(store, cfg.user_agent, rate_limit_wait=10)
        try:
            out["chesscom"] = ChessComIngester(c, store, cfg.identities.chesscom).ingest(limit_months=2)
            fetch_chesscom(c, store, cfg.identities.chesscom)
        finally:
            c.close()
        c = SerialClient(store, cfg.user_agent, rate_limit_wait=60)
        try:
            out["lichess"] = LichessIngester(c, store, cfg.identities.lichess).ingest()
            fetch_lichess(c, store, cfg.identities.lichess)
        finally:
            c.close()
        return {k: {kk: vv for kk, vv in v.items() if kk in ("inserted", "requests", "not_modified", "streamed")} for k, v in out.items()}
    t.step("ingest", ingest)

    # 2. sync from the site (drill results, completions, OTB logs) — then re-ingest OTB drops
    from .ingest.sync import run as sync_run
    def sync():
        try:
            out = sync_run(store)
        except RuntimeError as e:
            return {"skipped": str(e)}
        if out.get("otb_games"):
            names = [cfg.player.name]
            OtbIngester(store, names).ingest()
        return out
    t.step("sync", sync)

    # 3. analyse new games
    from .analysis.runner import run as analyse_run
    since = (started - timedelta(days=b["analyse_since_days"])).date().isoformat()
    t.step("analyse", lambda: analyse_run(store, workers=b["workers"], since=since, limit=b["analyse_limit"]))

    # 4. features + tablebase
    from .analysis.features import run as tag_run
    t.step("tag", lambda: tag_run(store))
    from .analysis.endgames import run as tb_run
    def tablebase():
        c = SerialClient(store, cfg.user_agent, rate_limit_wait=60, min_interval=0.2)
        try:
            return tb_run(store, c, max_probes=b["tb_probes"])
        finally:
            c.close()
    t.step("tablebase", tablebase)

    # 5. monthly extras: FIDE list, tagger validation report, full re-tag
    if mode == "monthly":
        from .ingest.fide import run as fide_run
        t.step("fide", lambda: {k: v.get("rating") for k, v in fide_run(store, cfg.player.fide_id, cfg.user_agent)["lists"].items()})
        from .analysis.validate import run as validate_run, write_report
        def validate():
            if not (DATA_DIR / "puzzles" / "lichess_db_puzzle.csv.zst").exists():
                return {"skipped": "no puzzle db"}
            res = validate_run(n=3000)
            write_report(res)
            return {"eligible": res["eligible_motifs"]}
        t.step("validate", validate)
        t.step("retag", lambda: tag_run(store, force=True))

    # 6. cycle evaluation + weekly plan
    from .planning.generate import evaluate_cycles, generate, plan_history, save_plan
    t.step("evaluate_cycles", lambda: {"evaluated": len(evaluate_cycles(store))})
    if mode == "weekly":
        def plan():
            p = generate(store, cfg)
            save_plan(store, p)
            return {"week": p["week_index"], "targets": [x["tag"] for x in p["targets"]]}
        t.step("plan", plan)
        from .briefing.evidence import build as build_pack
        from .briefing.generate import generate as brief_generate, save as brief_save
        from .scoring.leaks import run as leaks_run
        from .titles.tracker import build as build_title
        def brief():
            p = plan_history(store)[0]
            title = build_title(store, cfg)
            pack = build_pack(store, p, leaks_run(store), title)
            b, meta = brief_generate(pack)
            brief_save(store, p["week_start"], b, meta)
            return {"ok": b is not None, "attempts": meta["attempts"], "errors": meta["errors"][:2], "usage": meta["usage"]}
        t.step("brief", brief)
    elif store.conn.execute("SELECT COUNT(*) FROM plans").fetchone()[0] == 0 if _has_table(store, "plans") else True:
        def first_plan():
            p = generate(store, cfg)
            save_plan(store, p)
            return {"week": p["week_index"], "bootstrap": True}
        t.step("plan", first_plan)

    after = store.conn.execute("SELECT COUNT(*) FROM game_analysis").fetchone()[0]
    new_games = store.count_games() - games_before
    changed = (after != before) or new_games > 0 or mode in ("nightly", "weekly", "monthly")

    # 7. publish
    if changed:
        from .publish.artifacts import publish
        t.step("publish", lambda: publish(store, cfg))

    result = {"mode": mode, "started": started.isoformat(), "seconds": round((datetime.now(timezone.utc) - started).total_seconds(), 1),
              "new_games": new_games, "newly_analysed": after - before, "changed": changed, "steps": t.steps}
    store.set_state(f"run.{mode}.last", json.dumps({k: v for k, v in result.items() if k != "steps"}))
    store.close()
    return result


def _has_table(store: Store, name: str) -> bool:
    return store.conn.execute("SELECT 1 FROM sqlite_master WHERE type='table' AND name=?", (name,)).fetchone() is not None
