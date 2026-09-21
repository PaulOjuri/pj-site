# Architecture and decisions

Two tiers. **Tier 1** (`chess-coach/`, Python) ingests, analyses, tags, scores, plans and publishes
JSON artifacts. **Tier 2** (`src/app/chess`, Next.js static export on Cloudflare Pages) renders them
and hosts the trainer; two token-gated Pages Functions write drill results, session completion and
OTB game logs to a D1 database that Tier 1 pulls back nightly. Nothing heavy runs in a request path.

```
chess.com / lichess / FIDE lists / data/otb/*.pgn / D1 (site write-back)
        │ coach ingest, coach sync
        ▼
   coach.db (SQLite, gitignored, ~400MB)   ← coach analyse (Stockfish 19, deterministic)
        │ coach tag · coach tablebase · coach leaks · coach plan · coach brief · coach title
        ▼
   public/chess/data/*.json (committed)  →  next build → out/ → wrangler pages deploy
```

## Decisions that deviate from or refine the spec

| Topic | Decision | Why |
|---|---|---|
| Node budgets | blitz 80k, bullet 40k, rapid 300k, long rapid 500k, classical 2M, OTB 3M | Measured 0.5 Mnps/thread; the spec's 300k for blitz put a 200-game backlog at ~40 min, double the M2 ceiling. Depth ~15 is ample at 1800. |
| Determinism | `Threads=1`, fixed nodes, hash cleared before every position | Makes the (FEN, nodes, multipv) eval cache valid and the same game byte-identical across runs. |
| MultiPV | Pass 1 MultiPV=1 on every ply; pass 2 MultiPV=3 on error plies (and every player move in OTB/classical) | The spec asks for MultiPV on critical positions; running it everywhere triples the cost. |
| Tagging scope | Mistakes and blunders only; inaccuracies are not tagged | Per spec §7.3; inaccuracies are noise for motif attribution. |
| Motif eligibility | Only motifs with ≥0.7 precision on ≥20 labelled Lichess puzzles enter leak scoring (`reports/tagger_validation.md`) | Spec §13. Currently: fork family, skewer, discovered attack/check, double check, sacrifice, promotion, mate. |
| Conversion metric | "Reached ≤ −2 and did not lose" is a **save rate**, not a leak | The spec's wording lists it under conversion, but training against saves would be backwards. `conversion_fail_win` remains a leak. |
| Dedup | `(source, source_id)` for online games; movetext+date only for OTB | 52 aborted 0–1 ply online games share movetext and date and are distinct games. |
| Repo | Public; `coach.db`, raw caches, puzzle DB, engine builds, private analyses are all gitignored | DB exceeds GitHub's file limit and rebuilds from the APIs in ~40 min; engine wasm is copied from npm at build. |
| Compute | The owner's Mac runs the pipeline via launchd; GitHub Actions is the quality gate only | CI runners have no DB and 4 cores; the Mac has the DB, Stockfish and 10 cores. |
| Refresh cadence | Hourly refresh (3 conditional requests + ~3 s engine per new blitz game); publish/deploy only when something changed | Cheap enough to run every hour without touching the rate limits. |
| Published game payloads | Full per-game JSON for rapid-and-slower, the last 14 days, and every leak-evidence game; index rows for the rest | Next emits ~9 files per prerendered page; Cloudflare Pages caps at 20k files. |
| Engine in the browser | Lite builds; multi-threaded when `crossOriginIsolated`, single-threaded otherwise; COOP/COEP scoped to `/chess/train` and to `/chess/engine/*` | The worker script itself must carry COEP on an isolated page, and pthread sub-workers re-fetch it by path. |
| Board and pieces | Own SVG board (patterned checkerboard) with glyph pieces | No Chess.com assets (their terms); tiny markup for pages with many boards. |
| LLM briefing | `claude-opus-5`, structured output parsed against a Pydantic schema, then a traceability check against the evidence pack; one retry with the violations, then no briefing | Spec §11: every claim carries a game id / ply / leak tag the pipeline can verify; the plan is generated deterministically first. |
| WACC direct titles | U2000 gold → FM, silver/bronze → CM; U1700 gold → CM; continental amateur rows carried conservatively | From FIDE B.01 table 1.23 and the 2026 WACC regulations (both in `data/reference/`). |

## Privacy (§12)

Public artifacts: ratings, game list and per-game analyses (opponent names and ratings as on the
source sites), leaks with evidence, plan, training queue, title tracker, changelog, briefing.
Private (never leaves `data/`): session/tilt, hour-of-day, OTB free-text notes, drill history,
FSRS state. `config/player.yaml` `public_mode` gates each section; `/chess/train` and `/chess/log`
are `noindex` and only write with the token. CI greps the client bundle for token patterns.

## Where things are

- `src/coach/ingest/` clients (serial, ETag/304, backoff), OTB drop folder, FIDE lists, site sync
- `src/coach/analysis/` engine, metrics, motifs, features, endgames (tablebase), session, validate
- `src/coach/scoring/leaks.py` leak score, Wilson CI, status, trend
- `src/coach/planning/` periodisation, weekly generator, FSRS, drill assets
- `src/coach/titles/` Elo/K rules, Monte Carlo, routes, tracker
- `src/coach/briefing/` evidence pack, schema-validated briefing
- `src/coach/publish/` artifact schemas and writer
- `src/coach/run.py` orchestration; `scripts/run.sh` + `launchd/` scheduling
- `reports/tagger_validation.md` the precision/recall report that gates motif scoring
