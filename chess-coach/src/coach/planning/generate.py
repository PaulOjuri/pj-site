"""Weekly plan generator (spec §9.2–9.3, §18).

Deterministic given (leak table, FSRS due cards, availability, calendar, week index, last
cycle's outcomes). Every session is a concrete object with clickable assets and a completion
signal. Every targeted leak gets a pre-registered success metric.
"""
from __future__ import annotations

import hashlib
import json
from datetime import date, datetime, timedelta, timezone

from ..config import PlayerConfig, load_yaml
from ..db import Store
from ..scoring import leaks as leak_mod
from . import assets, fsrs, periodise

DAYS = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"]
MAX_TARGETS = 2
NON_CONFIRMED_SHARE = 0.2
BLITZ_CAP = 20
SUCCESS_WINDOW_WEEKS = 4
SUCCESS_MIN_GAMES = 30
SUCCESS_REL_IMPROVEMENT = 0.20

# How each kind of leak is trained (the "why" the site shows).
RESPONSE = {
    "tactic": "Themed puzzles at your puzzle rating plus the positions you actually got wrong. Pattern recognition first, then calculation.",
    "positional": "No puzzle fixes judgement. Unassisted annotation of your own long games, then engine comparison; calculation sets with no board movement; slower play.",
    "conversion": "Play out your own failed conversions against the engine from the entry position, both sides; tablebase check where ≤7 pieces.",
    "endgame": "Endgame drills from your own games plus theoretical positions for the endgame types you actually reach.",
    "time": "A clock rule in the long game: never move in a critical position under 20 seconds of thought; measured by fast_critical_errors.",
    "opening": "Repertoire recall via spaced repetition and one gap repaired per week.",
}


def kind_of(tag: str) -> str:
    motif = tag.split(":")[0]
    if tag in ("positional:blunder_committed", "positional_drift"):
        return "positional"
    if tag.startswith("conversion_"):
        return "conversion"
    if tag == "endgame_errors":
        return "endgame"
    if tag in ("fast_critical_errors", "time_trouble_errors"):
        return "time"
    if tag == "opening_errors":
        return "opening"
    return "tactic"


def _puzzle_rating(store: Store) -> int:
    raw = store.get_state("profile.lichess")
    if raw:
        r = json.loads(raw).get("ratings", {}).get("puzzle", {}).get("rating")
        if r:
            return int(r)
    return 1900


def pick_targets(leaks: list[dict]) -> list[dict]:
    """Up to two validated leaks: prefer confirmed; a provisional one only as a diagnostic slot."""
    valid = [l for l in leaks if l["validated"]]
    confirmed = [l for l in valid if l["status"] == "confirmed"]
    provisional = [l for l in valid if l["status"] == "provisional"]
    targets = []
    # Avoid two targets of the same kind so the week is not one-note.
    kinds = set()
    for l in confirmed:
        k = kind_of(l["tag"])
        if k in kinds:
            continue
        targets.append({"leak": l, "role": "primary" if not targets else "secondary", "share": 0.5 if not targets else 0.3})
        kinds.add(k)
        if len(targets) == MAX_TARGETS:
            break
    if len(targets) < MAX_TARGETS and provisional:
        targets.append({"leak": provisional[0], "role": "diagnostic", "share": NON_CONFIRMED_SHARE})
    return targets


def success_metric(leak: dict, week_start: date) -> dict:
    return {
        "metric": "frequency_per_100",
        "baseline": leak["frequency_per_100"],
        "target": round(leak["frequency_per_100"] * (1 - SUCCESS_REL_IMPROVEMENT), 2),
        "window": {"from": str(week_start), "to": str(week_start + timedelta(weeks=SUCCESS_WINDOW_WEEKS))},
        "min_games": SUCCESS_MIN_GAMES,
        "rule": f"weighted frequency over {SUCCESS_WINDOW_WEEKS} weeks at least {int(SUCCESS_REL_IMPROVEMENT * 100)}% below baseline, "
                f"on at least {SUCCESS_MIN_GAMES} games; otherwise 'no change' or 'worse'; fewer games -> 'not enough data'",
        "outcome": None,
    }


def generate(store: Store, cfg: PlayerConfig, *, today: date | None = None, leaks_out: dict | None = None) -> dict:
    today = today or datetime.now(timezone.utc).date()
    program_start = date.fromisoformat(cfg.goals.program_start)
    wk = periodise.program_week(program_start, today)
    ws = periodise.week_start(today)
    phase = periodise.macro_phase(program_start, today)
    deload = periodise.is_deload(wk)
    cal = load_yaml("calendar.yaml")
    taper = periodise.taper_for(cal.get("events", []), today)
    hours_by_day = cfg.availability.hours_by_day or {d: cfg.availability.hours_per_week / 7 for d in DAYS}
    minutes = {d: int(hours_by_day.get(d, 0) * 60) for d in DAYS}
    scale = 0.6 if deload else 1.0

    leaks_out = leaks_out or leak_mod.run(store)
    leaks = leaks_out["leaks"]
    targets = pick_targets(leaks)
    now = datetime.now(timezone.utc)
    puzzle_rating = _puzzle_rating(store)
    repertoire = load_yaml("repertoire.yaml")
    has_repertoire = bool((repertoire.get("white") or {}) or (repertoire.get("black") or {}))
    otb_12m = store.conn.execute("SELECT COUNT(*) FROM games WHERE source='otb' AND played_at >= ?",
                                 ((now - timedelta(days=365)).isoformat(),)).fetchone()[0]
    registered = [e for e in cal.get("events", []) if e.get("registered")]
    activity_problem = otb_12m == 0 and not registered

    # --- leak-specific assets ------------------------------------------------------------
    warnings, rationale = [], []
    for t in targets:
        l = t["leak"]
        k = kind_of(l["tag"])
        t["kind"] = k
        t["response"] = RESPONSE[k]
        t["success"] = success_metric(l, ws)
        motif = l["tag"].split(":")[0]
        themes = assets.THEMES_FOR_TAG.get(motif, [])
        used: set[str] = set()
        t["assets"] = {}
        if k == "tactic":
            t["assets"]["puzzles"] = assets.puzzle_set(themes, rating=puzzle_rating, n=20 if not deload else 12, seed=wk * 100 + 1)
            used |= {p["id"] for p in t["assets"]["puzzles"]}
            t["assets"]["own_positions"] = assets.own_game_positions(store, l["tag"], n=8)
        elif k in ("conversion", "endgame"):
            t["assets"]["endgame_drills"] = assets.endgame_drills(store, n=6)
        elif k == "positional":
            t["assets"]["calculation"] = assets.calculation_set(store, n=15, seed=wk)
            t["assets"]["annotation"] = assets.annotation_task(store)
        elif k == "time":
            t["assets"]["rule"] = "Long game: in any position the engine would call critical you must show ≥20s on the clock delta."
        rationale.append(
            f"Target '{l['description']}' ({l['status']}, n={l['n']}, {l['frequency_per_100']:.1f}/100 games, "
            f"severity {l['severity']:.0f}%): ranked #{leaks.index(l) + 1} by frequency × severity × recency."
            + (" Diagnostic allocation only: fewer than 12 observations." if t["role"] == "diagnostic" else ""))

    # Every own-game / calculation position a target references becomes a spaced-repetition card.
    created = 0
    for t in targets:
        for key in ("own_positions", "calculation"):
            for item in t["assets"].get(key, []):
                created += fsrs.upsert_card(store, item["id"], "leak_position", {**item, "tag": t["leak"]["tag"]}, now)
    store.conn.commit()
    due = fsrs.due_cards(store, now, limit=60)
    escalations = fsrs.escalations(store)
    primary = targets[0] if targets else None
    secondary = targets[1] if len(targets) > 1 else None

    # --- sessions -------------------------------------------------------------------------
    sessions = []

    def add(day, dur, type_, title, *, leak_targets=(), assets_=None, criterion="", notes=""):
        sessions.append({"id": f"w{wk}-{day}-{len(sessions) + 1}", "day": day, "duration_min": int(dur), "type": type_,
                         "title": title, "leak_targets": list(leak_targets), "assets": assets_ or {},
                         "success_criterion": criterion, "notes": notes, "done": None})

    # Monday: long game + same-day unassisted annotation (non-negotiable).
    mon = minutes["mon"]
    game_min = max(60, mon - 30)
    tc = "60+30 or slower" if game_min >= 120 else "45+15 or slower (60+30 when time allows)"
    add("mon", game_min, "play", f"Long game, {tc}",
        leak_targets=[t["leak"]["tag"] for t in targets if t["kind"] == "time"],
        assets_={"rule": (primary and primary["kind"] == "time" and primary["assets"].get("rule")) or None,
                 "where": ["lichess.org (rated, 45+15 pool or a club game)", "chess.com daily/rapid 45+15"]},
        criterion="One completed rated long game, PGN in the database by the nightly run.",
        notes="Play with the clock rule if a time leak is targeted. No blitz before the long game.")
    add("mon", mon - game_min, "analysis", "Unassisted annotation of tonight's game",
        criterion="Written annotation (critical moments, your own evals) saved before any engine use.")

    # Tuesday: tactics for the primary target (or calculation if positional).
    tac_min = int(minutes["tue"] * scale)
    if primary and primary["kind"] == "tactic":
        add("tue", tac_min, "tactics", f"Themed set: {primary['leak']['description']}",
            leak_targets=[primary["leak"]["tag"]], assets_=primary["assets"],
            criterion=f"{len(primary['assets'].get('puzzles', []))} themed puzzles + {len(primary['assets'].get('own_positions', []))} own positions attempted; score recorded.")
    elif primary and primary["kind"] == "positional":
        add("tue", tac_min, "calculation", "Calculation set: only-move positions from your own games",
            leak_targets=[primary["leak"]["tag"]], assets_={"calculation": primary["assets"].get("calculation", [])},
            criterion="15 positions, full variation written before revealing, no board movement; judgment_calibration score recorded.")
    else:
        add("tue", tac_min, "tactics", "Mixed tactics at puzzle rating",
            assets_={"puzzles": assets.puzzle_set(["fork", "discoveredAttack", "sacrifice"], rating=puzzle_rating, n=20, seed=wk)},
            criterion="20 puzzles attempted; score recorded.")

    # Wednesday: engine review of Monday's game vs own annotation.
    add("wed", int(minutes["wed"] * scale), "analysis", "Engine review of Monday's game against your annotation",
        assets_={"annotation": assets.annotation_task(store)},
        criterion="Every error tagged by you first, then compared with the pipeline's tags; disagreements logged.",
        notes="Disagreements are the interesting part. They calibrate your judgement and catch tagger mistakes.")

    # Thursday: openings.
    op_min = int(minutes["thu"] * scale)
    if taper:
        add("thu", op_min, "openings", "Repertoire recall only (taper: no new lines)",
            assets_={"due_cards": due[:30]}, criterion="All due repertoire cards reviewed.")
    elif has_repertoire:
        add("thu", op_min, "openings", "Repertoire drills (spaced repetition) + one gap repaired",
            assets_={"due_cards": [c for c in due if c["kind"] == "repertoire_line"][:30], "escalations": escalations[:5]},
            criterion="Due cards reviewed; one leak node from the opening tree studied and its line added as a card.")
    else:
        add("thu", op_min, "openings", "Repertoire audit: what do you actually play?",
            assets_={"instructions": ["List every opening reached 5+ times in the last 12 months (see /chess/games).",
                                      "Mark which are prepared and which are improvised.",
                                      "Write the result into chess-coach/config/repertoire.yaml (white.first_move, lines with priority core/developing)."]},
            criterion="repertoire.yaml is no longer empty.",
            notes="Narrowing beats broadening at this level. Two lines as White, one reply each to e4/d4/c4 as Black is enough.")

    # Friday: endgames.
    eg_min = int(minutes["fri"] * scale)
    eg_target = next((t for t in targets if t["kind"] in ("conversion", "endgame")), None)
    add("fri", eg_min, "endgames", "Play out your own failed conversions against the engine" if eg_target else "Rook endgame baseline",
        leak_targets=[eg_target["leak"]["tag"]] if eg_target else [],
        assets_={"endgame_drills": (eg_target["assets"].get("endgame_drills") if eg_target else assets.endgame_drills(store, n=6))},
        criterion="Each position played out from both sides; result vs theoretical result recorded (tablebase where ≤7 pieces).")

    # Saturday: secondary target or second tactics block + calculation.
    sat_min = int(minutes["sat"] * scale)
    if secondary and secondary["kind"] == "tactic":
        add("sat", sat_min, "tactics", f"Themed set: {secondary['leak']['description']}",
            leak_targets=[secondary["leak"]["tag"]], assets_=secondary["assets"],
            criterion="Set attempted; score recorded.")
    elif secondary and secondary["kind"] == "positional":
        add("sat", sat_min, "calculation", "Calculation set (no board movement)",
            leak_targets=[secondary["leak"]["tag"]], assets_={"calculation": secondary["assets"].get("calculation", [])},
            criterion="Positions solved with written variations; calibration recorded.")
    else:
        add("sat", sat_min, "calculation", "Calculation set: only-move positions from your own games",
            assets_={"calculation": assets.calculation_set(store, n=12, seed=wk + 7)},
            criterion="12 positions, written variations, calibration recorded.")

    # Sunday: review + admin. Activity problem overrides everything.
    sun_min = minutes["sun"]
    if activity_problem:
        add("sun", sun_min, "admin", "Get FIDE-rated: find and register for a classical event",
            assets_={"instructions": [
                "List every FIDE-rated classical event within reach of Turnhout in the next 6 months: Belgian interclubs, Belgian and Dutch opens, weekend events in northern France and western Germany.",
                "Enter dates, deadlines and formats into chess-coach/config/calendar.yaml.",
                "Register for at least one and set registered: true.",
                "Check the next FIDE World Amateur Championship: dates, U2000 eligibility (no published rating ≥2000 in the prior year), entry deadline."]},
            criterion="calendar.yaml has at least one event with registered: true.",
            notes="Both FIDE ratings are flagged inactive. Nothing else this week matters as much as this hour.")
    else:
        add("sun", sun_min, "review", "Weekly review: log OTB games, check the plan's completion signals",
            assets_={"due_cards": due[:20]}, criterion="All sessions marked done/not done; OTB PGNs dropped in data/otb/.")

    total = sum(s["duration_min"] for s in sessions)
    if taper:
        warnings.append(f"Taper: {taper['name']} starts in {taper['days_until']} days. No new openings, lighter tactics.")
    if deload:
        warnings.append("Deload week (every fourth week): tactics, openings and endgames cut to 60%. Play and review stay.")
    if activity_problem:
        warnings.append("FIDE ratings inactive and no registered event: the Sunday admin block is the priority.")

    plan = {
        "generated_at": now.isoformat(), "week_start": str(ws), "week_index": wk, "phase": phase,
        "meso_block": periodise.meso_block(wk), "deload": deload, "taper": taper,
        "hours_planned": round(total / 60, 1), "hours_available": cfg.availability.hours_per_week,
        "blitz_cap_per_week": BLITZ_CAP,
        "targets": [{"tag": t["leak"]["tag"], "description": t["leak"]["description"], "status": t["leak"]["status"],
                     "role": t["role"], "share": t["share"], "kind": t["kind"], "response": t["response"],
                     "n": t["leak"]["n"], "frequency_per_100": t["leak"]["frequency_per_100"], "severity": t["leak"]["severity"],
                     "success": t["success"]} for t in targets],
        "sessions": sessions, "warnings": warnings, "rationale": rationale,
        "fsrs": {"due_today": len(due), "escalations": len(escalations), "cards_created": created},
        "seed": not targets,
    }
    plan["inputs_hash"] = hashlib.sha1(json.dumps({"targets": [t["tag"] for t in plan["targets"]], "wk": wk, "deload": deload,
                                                   "taper": taper, "hours": minutes}, sort_keys=True).encode()).hexdigest()[:12]
    return plan


# --- persistence and cycle evaluation ---------------------------------------------------------

SCHEMA = """
CREATE TABLE IF NOT EXISTS plans (
  week_start TEXT PRIMARY KEY, week_index INTEGER NOT NULL, data TEXT NOT NULL, generated_at TEXT NOT NULL,
  evaluated_at TEXT
);
"""


def save_plan(store: Store, plan: dict) -> None:
    store.conn.executescript(SCHEMA)
    store.conn.execute("INSERT INTO plans (week_start, week_index, data, generated_at) VALUES (?,?,?,?) "
                       "ON CONFLICT(week_start) DO UPDATE SET data=excluded.data, generated_at=excluded.generated_at",
                       (plan["week_start"], plan["week_index"], json.dumps(plan), plan["generated_at"]))
    store.conn.commit()


def plan_history(store: Store) -> list[dict]:
    store.conn.executescript(SCHEMA)
    return [json.loads(r["data"]) for r in store.conn.execute("SELECT data FROM plans ORDER BY week_start DESC")]


def evaluate_cycles(store: Store, *, today: date | None = None) -> list[dict]:
    """Compute pre-registered success metrics for plans whose window has closed (spec §8.2)."""
    today = today or datetime.now(timezone.utc).date()
    store.conn.executescript(SCHEMA)
    results = []
    col = leak_mod.collect(store)
    for r in store.conn.execute("SELECT * FROM plans WHERE evaluated_at IS NULL"):
        plan = json.loads(r["data"])
        closed = all(date.fromisoformat(t["success"]["window"]["to"]) <= today for t in plan["targets"]) if plan["targets"] else True
        if not closed:
            continue
        for t in plan["targets"]:
            s = t["success"]
            start, end = datetime.fromisoformat(s["window"]["from"]).replace(tzinfo=timezone.utc), \
                datetime.fromisoformat(s["window"]["to"]).replace(tzinfo=timezone.utc)
            games = [g for g in col["games"].values() if start <= g["played_at"] < end]
            gw = sum(g["w"] for g in games)
            items = [i for i in col["occurrences"].get(t["tag"], []) if start <= datetime.fromisoformat(i["played_at"]) < end]
            freq = (sum(i["w"] for i in items) / gw * 100) if gw else None
            if len(games) < s["min_games"] or freq is None:
                verdict = "not_enough_data"
            elif freq <= s["target"]:
                verdict = "improved"
            elif freq > s["baseline"] * 1.1:
                verdict = "worse"
            else:
                verdict = "no_change"
            s["outcome"] = {"verdict": verdict, "measured": round(freq, 2) if freq is not None else None,
                            "games": len(games), "weighted_games": round(gw, 1), "occurrences": len(items),
                            "evaluated_at": today.isoformat()}
            results.append({"week_start": plan["week_start"], "tag": t["tag"], **s["outcome"]})
        store.conn.execute("UPDATE plans SET data=?, evaluated_at=? WHERE week_start=?",
                           (json.dumps(plan), today.isoformat(), plan["week_start"]))
    store.conn.commit()
    return results
