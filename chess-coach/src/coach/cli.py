"""`coach` command line. M1 exposes `ingest` and `status`; later milestones add more."""
from __future__ import annotations

import argparse
import json
import logging
import sys

from .config import db_path, load_config
from .db import Store


def cmd_ingest(args) -> int:
    cfg = load_config()
    store = Store(db_path())
    from .ingest.http import SerialClient

    sources = args.source or ["otb", "chesscom", "lichess"]
    totals = {}
    if "otb" in sources:
        from .ingest.otb import OtbIngester
        names = [cfg.player.name, *[n for n in (cfg.identities.chesscom, cfg.identities.lichess) if n]]
        # "Ojuri, Paul" is how FIDE-style PGNs name him; accept both orders.
        if "," in cfg.player.name:
            last, first = [s.strip() for s in cfg.player.name.split(",", 1)]
            names.append(f"{first} {last}")
        else:
            parts = cfg.player.name.split()
            if len(parts) >= 2:
                names.append(f"{parts[-1]}, {' '.join(parts[:-1])}")
        totals["otb"] = OtbIngester(store, names).ingest()
    if "chesscom" in sources and cfg.identities.chesscom:
        from .ingest.chesscom import ChessComIngester
        client = SerialClient(store, cfg.user_agent, rate_limit_wait=10)
        try:
            totals["chesscom"] = ChessComIngester(client, store, cfg.identities.chesscom).ingest(
                since=args.since, limit_months=args.limit_months)
        finally:
            client.close()
    if not args.source or "profiles" in sources:
        from .ingest.profiles import fetch_chesscom, fetch_lichess
        client = SerialClient(store, cfg.user_agent)
        try:
            if cfg.identities.chesscom:
                fetch_chesscom(client, store, cfg.identities.chesscom)
            if cfg.identities.lichess:
                fetch_lichess(client, store, cfg.identities.lichess)
            totals["profiles"] = {"fetched": 2}
        finally:
            client.close()
    if not args.source or "fide" in sources:
        from .ingest.fide import run as fide_run
        snap = fide_run(store, cfg.player.fide_id, cfg.user_agent)
        totals["fide"] = {k: (v.get("rating"), "inactive" if v.get("inactive") else "active") for k, v in snap["lists"].items()}
    if "lichess" in sources and cfg.identities.lichess:
        from .ingest.lichess import LichessIngester
        # Lichess asks for >=60s after a 429.
        client = SerialClient(store, cfg.user_agent, rate_limit_wait=60)
        try:
            totals["lichess"] = LichessIngester(client, store, cfg.identities.lichess).ingest(
                max_games=args.max_games, full=args.full)
        finally:
            client.close()
    for src, st in totals.items():
        print(f"{src:9s} " + "  ".join(f"{k}={v}" for k, v in st.items()))
    store.close()
    return 0


def cmd_publish(args) -> int:
    from .publish.artifacts import publish, SITE_DATA
    cfg = load_config()
    store = Store(db_path())
    st = publish(store, cfg)
    print(f"published to {SITE_DATA}: " + "  ".join(f"{k}={v}" for k, v in st.items()))
    store.close()
    return 0


def cmd_analyse(args) -> int:
    from .analysis.runner import run
    store = Store(db_path())
    st = run(store, workers=args.workers, sources=args.source, speeds=args.speed, since=args.since,
             limit=args.limit, nodes_override=args.nodes)
    print("  ".join(f"{k}={v}" for k, v in st.items()))
    store.close()
    return 0


def cmd_tag(args) -> int:
    from .analysis.features import run
    store = Store(db_path())
    st = run(store, limit=args.limit, force=args.force)
    print("  ".join(f"{k}={v}" for k, v in st.items()))
    store.close()
    return 0


def cmd_leaks(args) -> int:
    from .scoring.leaks import run
    store = Store(db_path())
    out = run(store)
    print(f"pool: {out['pool_games']} games (weighted {out['pool_weighted']}) {out['pool_by_speed']}")
    print(f"{'#':>2} {'leak':42s} {'status':11s} {'n':>4} {'n_eff':>6} {'freq':>6} {'sev':>5} {'rec':>5} {'score':>7} trend")
    shown = 0
    for l in out["leaks"]:
        if not l["validated"] and not args.all:
            continue
        shown += 1
        if shown > args.top:
            break
        t = l["trend"]["state"]
        print(f"{shown:>2} {l['tag'][:42]:42s} {l['status']:11s} {l['n']:>4} {l['n_effective']:>6.1f} "
              f"{l['frequency_per_100']:>6.2f} {l['severity']:>5.1f} {l['recency']:>5.2f} {l['leak_score']:>7.1f} {t}")
    store.close()
    return 0


def cmd_tablebase(args) -> int:
    from .analysis.endgames import run
    from .ingest.http import SerialClient
    cfg = load_config()
    store = Store(db_path())
    client = SerialClient(store, cfg.user_agent, rate_limit_wait=60, min_interval=0.2)
    try:
        st = run(store, client, max_probes=args.max_probes)
    finally:
        client.close()
    print("  ".join(f"{k}={v}" for k, v in st.items()))
    store.close()
    return 0


def cmd_session(args) -> int:
    from .analysis.session import run
    cfg = load_config()
    store = Store(db_path())
    out = run(store, tz=cfg.availability.timezone)
    print(json.dumps(out, indent=1))
    store.close()
    return 0


def cmd_puzzles(args) -> int:
    from .planning.assets import index_puzzles, PUZZLE_DB
    n = index_puzzles()
    print(f"indexed {n} puzzles into {PUZZLE_DB}")
    return 0


def cmd_plan(args) -> int:
    from .planning.generate import generate, save_plan, evaluate_cycles
    from datetime import date
    cfg = load_config()
    store = Store(db_path())
    evaluated = evaluate_cycles(store)
    for e in evaluated:
        print(f"cycle {e['week_start']} {e['tag']}: {e['verdict']} (measured {e['measured']}, games {e['games']})")
    plan = generate(store, cfg, today=date.fromisoformat(args.date) if args.date else None)
    save_plan(store, plan)
    print(f"week {plan['week_index']} from {plan['week_start']} · phase {plan['phase']['name']} · "
          f"{plan['hours_planned']}h planned / {plan['hours_available']}h available · deload={plan['deload']}")
    for t in plan["targets"]:
        print(f"  target [{t['role']}] {t['tag']} ({t['status']}, n={t['n']}) -> {t['success']['metric']} "
              f"{t['success']['baseline']} -> {t['success']['target']} by {t['success']['window']['to']}")
    for s_ in plan["sessions"]:
        print(f"  {s_['day']:3s} {s_['duration_min']:4d}m {s_['type']:11s} {s_['title']}")
    for w in plan["warnings"]:
        print(f"  ! {w}")
    store.close()
    return 0


def cmd_sync(args) -> int:
    from .ingest.sync import run
    store = Store(db_path())
    st = run(store)
    print("  ".join(f"{k}={v}" for k, v in st.items()))
    store.close()
    return 0


def cmd_title(args) -> int:
    from .titles.tracker import build
    cfg = load_config()
    store = Store(db_path())
    out = build(store, cfg)
    store.set_state("title.latest", json.dumps(out))
    mc = out["monte_carlo"]["scenario"]
    print(f"standard {out['fide']['standard']} ({'inactive' if out['fide']['standard_inactive'] else 'active'}) · "
          f"scenario MC: median {mc['final']['p50']} (p10 {mc['final']['p10']}, p90 {mc['final']['p90']}) by {mc['horizon']} · "
          f"P(>=2000)={mc['p_reach']['2000']} P(>=2200)={mc['p_reach']['2200']}")
    print("performance:", mc["performance"])
    w = out["routes"]["wacc_u2000"]
    print(f"WACC U2000: eligible={w['eligible_now']} · registration in {w['days_to_registration']} days · start in {w['days_to_start']} days")
    for wmsg in out["warnings"]:
        print("  !", wmsg)
    store.close()
    return 0


def cmd_run(args) -> int:
    from .run import run
    from .config import DATA_DIR
    logs = DATA_DIR / "logs"
    logs.mkdir(parents=True, exist_ok=True)
    fh = logging.FileHandler(logs / "run.log")
    fh.setFormatter(logging.Formatter("%(asctime)s %(levelname)s %(name)s: %(message)s"))
    logging.getLogger().addHandler(fh)
    out = run(args.mode)
    print(json.dumps({k: v for k, v in out.items() if k != "steps"}))
    for st in out["steps"]:
        print(f"  {'ok ' if st['ok'] else 'ERR'} {st['step']:16s} {st['seconds']:7.1f}s  {json.dumps(st['result'])[:160]}")
    return 0 if all(st["ok"] for st in out["steps"]) else 1


def cmd_validate(args) -> int:
    from .analysis.validate import run, write_report
    res = run(n=args.n, seed=args.seed)
    md, js = write_report(res)
    print(md.read_text())
    return 0


def cmd_status(args) -> int:
    store = Store(db_path())
    rows = store.summary()
    if not rows:
        print("no games ingested yet")
        return 0
    print(f"{'source':9s} {'speed':14s} {'variant':10s} {'n':>6s}  first                 last")
    for r in rows:
        print(f"{r['source']:9s} {r['speed']:14s} {r['variant']:10s} {r['n']:6d}  {r['first'][:19]}   {r['last'][:19]}")
    print(f"total: {store.count_games()}")
    n_an = store.conn.execute("SELECT COUNT(*) FROM game_analysis").fetchone()[0]
    n_ev = store.conn.execute("SELECT COUNT(*) FROM evals").fetchone()[0]
    print(f"analysed: {n_an} games, {n_ev} cached position evals")
    for key in ("chesscom.last_run", "lichess.last_run", "lichess.max_created_at"):
        v = store.get_state(key)
        if v:
            print(f"{key}: {v}")
    store.close()
    return 0


def main(argv: list[str] | None = None) -> int:
    p = argparse.ArgumentParser(prog="coach")
    p.add_argument("-v", "--verbose", action="store_true")
    sub = p.add_subparsers(dest="cmd", required=True)

    ing = sub.add_parser("ingest", help="fetch new games from every configured source")
    ing.add_argument("--source", action="append", choices=["otb", "chesscom", "lichess", "profiles", "fide"],
                     help="restrict to one source (repeatable)")
    ing.add_argument("--since", help="chess.com: only archives from YYYY/MM onward")
    ing.add_argument("--limit-months", type=int, help="chess.com: only the N most recent archives")
    ing.add_argument("--max-games", type=int, help="lichess: cap games streamed this run")
    ing.add_argument("--full", action="store_true", help="lichess: ignore the incremental cursor")
    ing.set_defaults(fn=cmd_ingest)

    pb = sub.add_parser("publish", help="write JSON artifacts for the site (public) and data/private (private)")
    pb.set_defaults(fn=cmd_publish)

    an = sub.add_parser("analyse", help="engine-analyse games lacking the current analysis version")
    an.add_argument("--source", action="append", choices=["otb", "chesscom", "lichess"])
    an.add_argument("--speed", action="append",
                    choices=["ultrabullet", "bullet", "blitz", "rapid", "classical", "correspondence"])
    an.add_argument("--since", help="only games played on/after this ISO date")
    an.add_argument("--limit", type=int, help="max games this run (highest priority first)")
    an.add_argument("--workers", type=int)
    an.add_argument("--nodes", type=int, help="override the per-tier node budget (testing only)")
    an.set_defaults(fn=cmd_analyse)

    tg = sub.add_parser("tag", help="extract motifs, drift, endgame and time features from analysed games")
    tg.add_argument("--limit", type=int)
    tg.add_argument("--force", action="store_true", help="recompute even if the tagger version matches")
    tg.set_defaults(fn=cmd_tag)

    lk = sub.add_parser("leaks", help="rank leaks with confidence from tagged games")
    lk.add_argument("--top", type=int, default=15)
    lk.add_argument("--all", action="store_true", help="include motifs that failed tagger validation")
    lk.set_defaults(fn=cmd_leaks)

    tb = sub.add_parser("tablebase", help="probe Lichess tablebase for <=7-piece positions (capped, cached)")
    tb.add_argument("--max-probes", type=int, default=300)
    tb.set_defaults(fn=cmd_tablebase)

    se = sub.add_parser("session", help="tilt / session-length / time-of-day error rates (private)")
    se.set_defaults(fn=cmd_session)

    pz = sub.add_parser("puzzles", help="index the Lichess puzzle CSV into data/puzzles/puzzles.db (one-off)")
    pz.set_defaults(fn=cmd_puzzles)

    pl = sub.add_parser("plan", help="evaluate last cycles and generate this week's plan")
    pl.add_argument("--date", help="pretend today is this ISO date")
    pl.set_defaults(fn=cmd_plan)

    sy = sub.add_parser("sync", help="pull drill results / session completions / OTB logs from the site (D1)")
    sy.set_defaults(fn=cmd_sync)

    ti = sub.add_parser("title", help="title route tracker: Elo Monte Carlo, WACC eligibility, calendar")
    ti.set_defaults(fn=cmd_title)

    rn = sub.add_parser("run", help="orchestrated pipeline run: hourly | nightly | weekly | monthly")
    rn.add_argument("mode", choices=["hourly", "nightly", "weekly", "monthly"])
    rn.set_defaults(fn=cmd_run)

    va = sub.add_parser("validate", help="validate the motif tagger against the Lichess puzzle DB")
    va.add_argument("--n", type=int, default=3000)
    va.add_argument("--seed", type=int, default=260703)
    va.set_defaults(fn=cmd_validate)

    st = sub.add_parser("status", help="summarise what is in the database")
    st.set_defaults(fn=cmd_status)

    args = p.parse_args(argv)
    logging.basicConfig(level=logging.DEBUG if args.verbose else logging.INFO,
                        format="%(levelname)s %(name)s: %(message)s", stream=sys.stderr)
    logging.getLogger("httpx").setLevel(logging.WARNING)
    return args.fn(args)


if __name__ == "__main__":
    sys.exit(main())
