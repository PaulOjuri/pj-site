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
    ing.add_argument("--source", action="append", choices=["otb", "chesscom", "lichess", "profiles"],
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
