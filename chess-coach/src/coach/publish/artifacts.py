"""Emit versioned JSON artifacts for the site (spec §3, §10.2, §12).

Public artifacts go to <site>/public/chess/data/. Private analyses (session/tilt, hour of
day) go to chess-coach/data/private/, which is gitignored, so they render only locally.
Which sections are public is decided by config/player.yaml `public_mode`.
"""
from __future__ import annotations

import json
import logging
import os

import chess
from datetime import datetime, timedelta, timezone
from pathlib import Path

from ..config import DATA_DIR, ROOT, PlayerConfig
from ..db import Store
from ..analysis.budget import weight_for
from ..scoring import leaks as leak_mod
from ..analysis import session as session_mod
from .schemas import GameIndex, GameOut, Leaks, MoveOut, Summary

log = logging.getLogger(__name__)
SITE_DATA = Path(os.environ.get("COACH_SITE_DATA", ROOT.parent / "public" / "chess" / "data"))
PRIVATE_DIR = DATA_DIR / "private"
PUBLISH_FULL_WEIGHT = 0.4       # rapid and slower always get a full per-game payload
PUBLISH_RECENT_DAYS = 14        # plus anything recent (blitz/bullet volume is high; keeps page count sane)


def _write(path: Path, payload) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    data = payload.model_dump() if hasattr(payload, "model_dump") else payload
    path.write_text(json.dumps(data, separators=(",", ":"), ensure_ascii=False))


def _game_meta(g) -> dict:
    return {"played_at": g["played_at"], "speed": g["speed"], "source": g["source"], "result": g["result"],
            "color": g["player_color"], "white": {"name": g["white_name"], "rating": g["white_rating"]},
            "black": {"name": g["black_name"], "rating": g["black_rating"]}, "time_control": g["time_control_raw"],
            "eco": g["eco"], "opening": g["opening_name"], "url": g["url"], "event": g["event"], "round": g["round"],
            "fide_rated": bool(g["fide_rated"]), "termination": g["termination"], "ply_count": g["ply_count"]}


def publish(store: Store, cfg: PlayerConfig, *, now: datetime | None = None) -> dict:
    now = now or datetime.now(timezone.utc)
    stamp = now.isoformat()
    pub = cfg.public_mode
    out_stats = {"games_indexed": 0, "games_full": 0, "leaks": 0}

    # --- leaks --------------------------------------------------------------------------
    leak_out = leak_mod.run(store, now=now)
    evidence_games = {e["game_id"] for l in leak_out["leaks"] for e in l["evidence"]}
    leaks_payload = Leaks(
        generated_at=stamp, pool_games=leak_out["pool_games"], pool_weighted=leak_out["pool_weighted"],
        pool_by_speed=leak_out["pool_by_speed"],
        rules={"confirmed_min_n": leak_mod.CONFIRMED_N, "provisional_min_n": leak_mod.PROVISIONAL_N,
               "half_life_days": leak_mod.HALF_LIFE_DAYS, "trend_window_days": leak_mod.TREND_WINDOW_DAYS,
               "weights": {"otb": 1.0, "classical": 0.7, "rapid_long": 0.7, "rapid": 0.4, "blitz": 0.2, "bullet": 0.05},
               "max_training_share_non_confirmed": 0.2},
        leaks=[l for l in leak_out["leaks"] if l["validated"]] if pub.get("leaks", True) else [],
    )
    _write(SITE_DATA / "leaks.json", leaks_payload)
    out_stats["leaks"] = len(leaks_payload.leaks)

    # --- games index + full payloads ---------------------------------------------------
    rows = store.conn.execute(
        "SELECT g.*, a.accuracy_white, a.accuracy_black, a.acpl_white, a.acpl_black, a.counts, a.moves AS a_moves, "
        "a.analysis_version AS av, f.data AS fdata FROM games g JOIN game_analysis a ON a.game_id=g.id "
        "LEFT JOIN game_features f ON f.game_id=g.id WHERE g.variant='standard' ORDER BY g.played_at DESC").fetchall()
    hits_by_game: dict[str, list[dict]] = {}
    for h in store.conn.execute("SELECT * FROM motif_hits"):
        hits_by_game.setdefault(h["game_id"], []).append(
            {"ply": h["ply"], "motif": h["motif"], "attribution": h["attribution"], "fen": h["fen"],
             "line": json.loads(h["line"]), "detail": h["detail"], "win_lost": h["win_lost"],
             "classification": h["classification"], "phase": h["phase"]})
    index_rows = []
    recent = []
    games_dir = SITE_DATA / "games"
    cutoff = now - timedelta(days=PUBLISH_RECENT_DAYS)
    for g in rows:
        me = g["player_color"]
        acc = g["accuracy_white"] if me == "white" else g["accuracy_black"]
        acpl = g["acpl_white"] if me == "white" else g["acpl_black"]
        counts = json.loads(g["counts"])[me]
        w = weight_for(g["source"], g["speed"], g["base_seconds"])
        played = datetime.fromisoformat(g["played_at"])
        full = w >= PUBLISH_FULL_WEIGHT or played >= cutoff or g["id"] in evidence_games
        opp = g["black_name"] if me == "white" else g["white_name"]
        row = {"id": g["id"], "played_at": g["played_at"], "speed": g["speed"], "source": g["source"],
               "result": g["result"], "color": me, "opponent": opp, "opponent_rating": g["opponent_rating"],
               "accuracy": acc, "acpl": acpl, "blunders": counts["blunder"], "mistakes": counts["mistake"],
               "inaccuracies": counts["inaccuracy"], "eco": g["eco"], "opening": g["opening_name"],
               "url": g["url"], "published": full}
        index_rows.append(row)
        if len(recent) < 20:
            recent.append({"id": g["id"], "played_at": g["played_at"], "speed": g["speed"], "source": g["source"],
                           "result": g["result"], "color": me, "opponent_rating": g["opponent_rating"],
                           "accuracy": acc, "blunders": counts["blunder"], "url": g["url"]})
        if full and pub.get("games", True):
            moves = json.loads(g["a_moves"])
            features = json.loads(g["fdata"]) if g["fdata"] else {}
            board = chess.Board()
            fens = []
            for m in moves:
                board.push_uci(m["uci"])
                fens.append(board.fen())
            mo = [MoveOut(p=m["ply"], s=m["san"], u=m["uci"], f=fens[m["ply"]], eb=m["eval_before"], ea=m["eval_after"],
                          wl=m["win_lost"], c=m["classification"], b=m["best_move"],
                          pv=m["best_pv"][:6] if m["classification"] in ("inaccuracy", "mistake", "blunder") else [],
                          t=m["time_spent"], k=m["clock_after"], om=m["is_only_move"], cx=m["complexity"],
                          cr=m["is_critical"]) for m in moves]
            payload = GameOut(
                id=g["id"], meta=_game_meta(g),
                analysis={"version": g["av"], "accuracy": {"white": g["accuracy_white"], "black": g["accuracy_black"]},
                          "acpl": {"white": g["acpl_white"], "black": g["acpl_black"]}, "counts": json.loads(g["counts"])},
                moves=mo, motifs=hits_by_game.get(g["id"], []),
                features={k: v for k, v in features.items() if k in ("drift", "endgame", "conversion", "error_plies")},
            )
            _write(games_dir / f"{g['id'].replace(':', '_')}.json", payload)
            out_stats["games_full"] += 1
    if pub.get("games", True):
        _write(SITE_DATA / "games" / "index.json", GameIndex(generated_at=stamp, count=len(index_rows), games=index_rows))
    out_stats["games_indexed"] = len(index_rows)

    # --- summary ------------------------------------------------------------------------
    seed = cfg.fide_seed
    fide = {"standard": seed.get("standard"), "rapid": seed.get("rapid"), "blitz": seed.get("blitz"),
            "standard_inactive": bool(seed.get("standard_inactive")), "blitz_inactive": bool(seed.get("blitz_inactive")),
            "title": seed.get("title"), "as_of": "2026-09-20", "source": "config seed (ratings.fide.com profile)"}
    latest = store.get_state("fide.latest")
    if latest:
        fl = json.loads(latest).get("lists", {})
        for k in ("standard", "rapid", "blitz"):
            if k in fl:
                fide[k] = fl[k].get("rating")
                if k != "rapid":
                    fide[f"{k}_inactive"] = bool(fl[k].get("inactive"))
        fide["as_of"] = json.loads(latest).get("period", fide["as_of"])
        fide["source"] = f"FIDE rating lists ({json.loads(latest).get('source')})"
    fide.update({k: v for k, v in (cfg.manual_override or {}).items() if k in fide})
    online = {}
    for key in ("chesscom", "lichess"):
        raw = store.get_state(f"profile.{key}")
        if raw:
            online[key] = json.loads(raw)
    otb_12m = store.conn.execute("SELECT COUNT(*) FROM games WHERE source='otb' AND fide_rated=1 AND played_at >= ?",
                                 ((now - timedelta(days=365)).isoformat(),)).fetchone()[0]
    last_otb = store.conn.execute("SELECT MAX(played_at) FROM games WHERE source='otb'").fetchone()[0]
    warnings = []
    if fide["standard_inactive"]:
        warnings.append("FIDE standard rating is flagged inactive: no rated classical games in the current window.")
    if otb_12m == 0:
        warnings.append("No FIDE-rated classical games recorded in the last 12 months. Training cannot move a rating that is not being played.")
    confirmed = [l for l in leaks_payload.leaks if l["status"] == "confirmed"][:2]
    pool = {"analysed": len(index_rows), "by_speed": leak_out["pool_by_speed"], "weighted": leak_out["pool_weighted"]}
    summary = Summary(
        generated_at=stamp,
        player={"name": cfg.player.name, "fide_id": cfg.player.fide_id, "federation": cfg.player.federation,
                "birth_year": cfg.player.birth_year, "chesscom": cfg.identities.chesscom, "lichess": cfg.identities.lichess},
        fide=fide, online=online, pool=pool, recent_form=recent,
        focus=[{"tag": l["tag"], "description": l["description"], "status": l["status"], "n": l["n"],
                "frequency_per_100": l["frequency_per_100"], "severity": l["severity"]} for l in confirmed],
        activity={"fide_rated_games_12m": otb_12m, "last_otb_game": last_otb,
                  "route": cfg.goals.route, "target_title": cfg.goals.target_title},
        warnings=warnings,
    )
    _write(SITE_DATA / "summary.json", summary)

    # --- plan ---------------------------------------------------------------------------
    from ..planning.generate import plan_history
    from ..planning import fsrs
    plans = plan_history(store)
    if plans and pub.get("plan", True):
        current = dict(plans[0])
        from ..briefing.generate import latest as latest_briefing
        current["briefing"] = latest_briefing(store, current["week_start"])
        _write(SITE_DATA / "plan" / "current.json", current)
        slim = [{k: v for k, v in p.items() if k not in ("sessions", "rationale")} |
                {"sessions": [{k: v for k, v in s_.items() if k != "assets"} for s_ in p["sessions"]]} for p in plans]
        _write(SITE_DATA / "plan" / "history.json", {"generated_at": stamp, "plans": slim})
        # Training queue: due cards plus this week's session assets, for /chess/train.
        due = fsrs.due_cards(store, now, limit=80)
        _write(SITE_DATA / "train.json", {"generated_at": stamp, "week_start": current["week_start"], "due_cards": due,
                                          "sessions": [{"id": s_["id"], "day": s_["day"], "type": s_["type"], "title": s_["title"],
                                                        "assets": s_["assets"]} for s_ in current["sessions"]
                                                       if s_["type"] in ("tactics", "calculation", "endgames", "openings")]})
        out_stats["plan_week"] = current["week_index"]

    # --- title tracker -------------------------------------------------------------------
    from ..titles.tracker import build as build_title
    if pub.get("title", True):
        title = build_title(store, cfg, today=now.date())
        store.set_state("title.latest", json.dumps(title))
        _write(SITE_DATA / "title.json", title)
        for wmsg in title["warnings"]:
            if wmsg not in warnings and "WACC" in wmsg:
                warnings.append(wmsg)
        summary.warnings = warnings
        _write(SITE_DATA / "summary.json", summary)

    # --- private ------------------------------------------------------------------------
    PRIVATE_DIR.mkdir(parents=True, exist_ok=True)
    sess = session_mod.run(store, tz=cfg.availability.timezone)
    _write(PRIVATE_DIR / "session.json", {"generated_at": stamp, **sess})
    if pub.get("session_tilt"):
        _write(SITE_DATA / "session.json", {"generated_at": stamp, **sess})

    # --- changelog ----------------------------------------------------------------------
    log_path = SITE_DATA / "changelog.json"
    entries = json.loads(log_path.read_text()) if log_path.exists() else []
    entry = {"at": stamp, "kind": "publish", "games_analysed": len(index_rows),
             "top_leaks": [l["tag"] for l in leaks_payload.leaks[:3]],
             "note": "Artifacts regenerated from the current database."}
    if plans:
        cur = plans[0]
        entry["plan"] = {"week": cur["week_index"], "targets": [t["tag"] for t in cur["targets"]], "why": cur["rationale"]}
        if len(plans) > 1:
            prev = plans[1]
            a, b = [t["tag"] for t in prev["targets"]], [t["tag"] for t in cur["targets"]]
            if a != b:
                entry["plan"]["changed_from"] = a
    if entries and entries[0].get("plan") == entry.get("plan") and entries[0].get("top_leaks") == entry["top_leaks"]:
        entries[0] = entry          # same state, just refresh the timestamp
    else:
        entries.insert(0, entry)
    _write(log_path, entries[:200])
    return out_stats
