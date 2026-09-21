# chess-coach (Tier 1)

Offline pipeline behind `paulojuri.com/chess`. Spec: `../CHESS_COACH_SPEC.md`. Status: **M1–M7 done**, live at paulojuri.com/chess. Design notes: `docs/ARCHITECTURE.md`.

## Setup

```sh
cd chess-coach
python3 -m venv .venv && .venv/bin/pip install -e ".[dev]"
.venv/bin/pytest
```

Config lives in `config/player.yaml`. Optional env: `LICHESS_TOKEN` (raises export throughput; required later for the puzzle dashboard), `COACH_DB` (defaults to `data/coach.db`).

## Running everything locally, end to end

```sh
brew install stockfish zstd
cd chess-coach && python3 -m venv .venv && .venv/bin/pip install -e ".[dev]"
.venv/bin/coach ingest                 # ~40 min the first time (81k games); seconds afterwards
.venv/bin/coach analyse --speed rapid --limit 50
.venv/bin/coach tag && .venv/bin/coach leaks
.venv/bin/coach plan && .venv/bin/coach brief   # brief needs ANTHROPIC_API_KEY (.env or pj-site/.env.local)
.venv/bin/coach title && .venv/bin/coach publish
cd .. && npm install --legacy-peer-deps && npm run build && npx serve out    # open /chess
```

Optional: `data/puzzles/lichess_db_puzzle.csv.zst` from database.lichess.org, then `coach puzzles`
(builds the local index used for themed drill sets) and `coach validate` (tagger report).
Write-back from the site needs `CHESS_TOKEN` in `.env` matching the Cloudflare Pages secret.

## Commands

```sh
coach ingest                          # otb → chess.com → lichess, incremental
coach ingest --source chesscom --limit-months 3
coach ingest --source lichess --max-games 500
coach ingest --source lichess --full   # ignore the cursor, re-stream everything
coach status                           # counts by source/speed/variant
coach analyse [--speed rapid] [--since 2025-09-20] [--limit N] [--workers N]
                                       # Stockfish per-move analysis, highest-weight games first
coach tag                              # motifs, drift, endgame, conversion, time features
coach leaks [--top 15] [--all]         # ranked leaks with confidence; --all shows unvalidated motifs
coach session                          # tilt / session length / hour-of-day (private)
coach tablebase [--max-probes 300]     # Lichess tablebase accuracy for <=7-piece positions
coach validate [--n 3000]              # tagger precision/recall vs Lichess puzzle DB -> reports/
coach plan [--date YYYY-MM-DD]         # evaluate closed cycles, generate this week's plan
coach brief [--dump-pack]              # schema-validated LLM briefing from the evidence pack
coach title                            # title route tracker (Elo Monte Carlo, WACC eligibility)
coach publish                          # write public artifacts + private analyses
coach sync                             # pull drill results / completions / OTB logs from the site
coach run hourly|nightly|weekly|monthly
```

Needs Stockfish on PATH (`brew install stockfish`) and, for `validate`, the puzzle DB at
`data/puzzles/lichess_db_puzzle.csv.zst` from https://database.lichess.org/ (gitignored, 300MB).

## Analysis pipeline

`analyse` is deterministic: single-threaded Stockfish, fixed nodes per tier (`analysis/budget.py`),
hash cleared before every position, evals cached by (FEN, nodes, multipv, engine). Pass 1 is
MultiPV=1 on every ply; pass 2 is MultiPV=3 on error positions (and every player move in
OTB/classical). Per-move metrics follow Lichess: win% sigmoid, accuracy curve, error thresholds
at 10/20/30 win% lost.

`tag` attributes each mistake/blunder by the player: `own_tactic_missed` (the best line had a
tactic), `opponent_tactic_missed` (the played move allowed one), else `blunder_committed`
(positional). Motif detection is rule-based over the PV and conservative: a motif only counts
when the line actually cashes it in. `reports/tagger_validation.md` is the per-theme
precision/recall against Lichess puzzles; motifs under 0.7 precision never enter leak ranking.

`leaks` scores each tag as frequency × severity × recency with source weights (OTB 1.0,
classical/long rapid 0.7, rapid 0.4, blitz 0.2, bullet 0.05), a Wilson interval, a status
(confirmed ≥12 / provisional 5–11 / watch <5) and a 60-day trend that says "not enough data"
when either window has fewer than 5 occurrences.

Drop OTB PGNs in `data/otb/`. A sidecar `name.yaml` next to `name.pgn` can add `event`, `round`, `time_control`, `note`, `fide_rated`.

## How sync stays cheap

- One request in flight at a time, always. Both APIs 429 parallel traffic.
- chess.com: archive months in the past are immutable and fetched exactly once (`http_cache.final`). The current month is re-fetched with `If-None-Match`; unchanged → 304, no parse.
- Lichess: NDJSON stream, cursor `lichess.max_created_at` in `sync_state`, passed as `since`.
- 429 / 5xx → exponential backoff honouring `Retry-After` (Lichess base 60s, chess.com 10s). 410 is remembered and never re-requested.
- Raw bodies live in `data/raw/` (gitignored); `coach.db` stores games and cache metadata. Both are gitignored: with ~80k online games the DB is ~300MB+, over GitHub's 100MB file limit, and it rebuilds from the APIs in ~40 minutes. Analysis results and published artifacts are what get committed (from M2 on).

## Dedup rule

`dedup_key = sha1(movetext | YYYY-MM-DD)`. Same `(source, source_id)` is always skipped. A `dedup_key` collision only counts as a duplicate when an OTB game is involved: that is the "entered the same game twice" case. Two online bullet games with identical short move sequences on the same day are real, distinct games.

## Automation

The pipeline runs on the owner's Mac (the 400MB database and the engine work live here), scheduled
by launchd (`launchd/*.plist`, install with `scripts/install-launchd.sh`):

| cadence | when | what |
|---|---|---|
| hourly | every hour | `coach run hourly`: ingest (3 conditional requests), sync site results, analyse ≤40 new games, tag, 60 tablebase probes; publish + build + deploy + commit only if something changed |
| nightly | 03:15 | same with bigger budgets, always publishes, evaluates finished cycles |
| weekly | Sunday 21:00 | nightly + next week's plan |
| monthly | 1st, 04:00 | FIDE lists, tagger validation report, full re-tag, title recompute |

`scripts/run.sh` holds a lock (and yields to a manual `coach analyse`), runs under `caffeinate`,
then `npm run build`, `wrangler pages deploy`, and commits `public/chess/data` + `reports/` +
`config/` to git. Logs: `data/logs/`. GitHub Actions (`.github/workflows/chess-ci.yml`) runs the
tests, type-check, build and a client-bundle secret scan on every push; it does not deploy.

## Title tracker

`coach title` (and `coach publish`) recompute the route tracker from the latest FIDE list
(`coach ingest --source fide`), the calendar and a performance model estimated from rated online
rapid/classical results. Regulations are cited in `src/coach/titles/routes.py`; the source PDFs
and HTML are kept in `data/reference/`.
