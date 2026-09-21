"""Title Route Tracker output (spec §2): current state, Monte Carlo, eligibility, calendar."""
from __future__ import annotations

import json
import math
from datetime import date, datetime, timedelta, timezone

from ..config import PlayerConfig, load_yaml
from ..db import Store
from .elo import Event, Performance, expected_score, gain_for_performance, monte_carlo
from .routes import WACC_2026, rating_routes, wacc_eligibility


def performance_from_games(store: Store, *, days: int = 365) -> Performance:
    """Estimate how the player scores relative to expectation from online rapid/classical results.
    Offset = the rating shift that would make expected score equal observed score."""
    since = (datetime.now(timezone.utc) - timedelta(days=days)).isoformat()
    rows = store.conn.execute(
        "SELECT rating_diff, result FROM games WHERE variant='standard' AND speed IN ('rapid','classical') "
        "AND rated=1 AND rating_diff IS NOT NULL AND result IN ('win','loss','draw') AND played_at >= ?", (since,)).fetchall()
    if len(rows) < 20:
        return Performance(source="assumed (fewer than 20 rated rapid/classical games in the window)")
    scores = {"win": 1.0, "draw": 0.5, "loss": 0.0}
    obs = sum(scores[r["result"]] for r in rows) / len(rows)
    exp = sum(expected_score(r["rating_diff"], 0) for r in rows) / len(rows)
    draws = sum(1 for r in rows if r["result"] == "draw") / len(rows)
    # solve for offset: mean expected score with shift = obs (monotone; bisection)
    lo, hi = -400.0, 400.0
    for _ in range(40):
        mid = (lo + hi) / 2
        if sum(expected_score(r["rating_diff"] + mid, 0) for r in rows) / len(rows) < obs:
            lo = mid
        else:
            hi = mid
    offset = round((lo + hi) / 2, 1)
    # spread: per-game score variance mapped to rating points (rough): sd of score * 400 / sqrt(n_per_event≈9)
    var = sum((scores[r["result"]] - obs) ** 2 for r in rows) / len(rows)
    sd = round(min(200.0, max(60.0, math.sqrt(var) * 400 / 3)), 1)
    return Performance(offset_mean=offset, offset_sd=sd, draw_rate=round(max(0.1, draws), 3),
                       source=f"online rapid/classical, last {days} days", n_games=len(rows))


def calendar_events(cfg: PlayerConfig, standard: int | None, today: date) -> tuple[list[Event], list[dict]]:
    cal = load_yaml("calendar.yaml")
    events, listing = [], []
    base = standard or 1795
    seen_wacc = False
    for e in cal.get("events", []):
        start = e["start"] if isinstance(e["start"], date) else date.fromisoformat(str(e["start"]))
        if start < today:
            continue
        rounds = int(e.get("rounds", 9))
        opp = float(e.get("opp_mean", base + 50))
        events.append(Event(e["name"], start, rounds, opp, registered=bool(e.get("registered"))))
        if "World Amateur" in e["name"]:
            seen_wacc = True
        listing.append({**{k: (str(v) if isinstance(v, date) else v) for k, v in e.items()}, "days_until": (start - today).days,
                        "expected_gain_at_plus150": gain_for_performance(base, rounds, opp, 150),
                        "expected_gain_at_plus250": gain_for_performance(base, rounds, opp, 250)})
    if not seen_wacc and WACC_2026["start"] >= today:
        w = WACC_2026
        events.append(Event(w["name"], w["start"], w["rounds"], 1850.0, registered=False))
        listing.append({"name": w["name"], "start": w["start"].isoformat(), "end": w["end"].isoformat(), "city": w["city"],
                        "country": w["country"], "format": f"{w['rounds']}-round Swiss, {w['time_control']}", "fide_rated": True,
                        "registered": False, "deadline": w["registration_deadline"].isoformat(), "url": w["source"],
                        "title_relevance": "wacc", "days_until": (w["start"] - today).days,
                        "days_to_deadline": (w["registration_deadline"] - today).days, "fee_eur": w["fee_eur"],
                        "expected_gain_at_plus150": gain_for_performance(base, 9, 1850, 150),
                        "expected_gain_at_plus250": gain_for_performance(base, 9, 1850, 250), "assumed": True})
    return events, sorted(listing, key=lambda x: x["start"])


def scenario_events(standard: int | None, today: date, horizon: date, per_year: int) -> list[Event]:
    """If the calendar is thin, model a scenario of N 9-round opens per year at +50 average opposition."""
    base = standard or 1795
    out, d = [], today + timedelta(days=45)
    step = timedelta(days=int(365 / max(1, per_year)))
    i = 0
    while d <= horizon:
        out.append(Event(f"scenario open #{i + 1}", d, 9, base + 50))
        d += step; i += 1
    return out


def build(store: Store, cfg: PlayerConfig, *, today: date | None = None) -> dict:
    today = today or datetime.now(timezone.utc).date()
    fide = json.loads(store.get_state("fide.latest") or "{}")
    lists = fide.get("lists", {})
    std = (lists.get("standard") or {}).get("rating") or cfg.fide_seed.get("standard")
    std_inactive = (lists.get("standard") or {}).get("inactive", cfg.fide_seed.get("standard_inactive", True))
    games_total = 30   # K=20 on the list means the 30-game threshold is already past
    history = [(r["period"], r["rating"]) for r in store.conn.execute(
        "SELECT period, rating FROM fide_history WHERE kind='standard' ORDER BY period")]
    if not history and std:
        history = [(fide.get("period", today.strftime("%Y%m")), std)]
    program_end = date.fromisoformat(cfg.goals.program_start) + timedelta(days=int(cfg.goals.horizon_months * 30.4))
    perf = performance_from_games(store)
    events, listing = calendar_events(cfg, std, today)
    real_only = [e for e in events if e.registered]
    scen_per_year = 8
    scenario = events + scenario_events(std, today, program_end, scen_per_year)
    mc_calendar = monte_carlo(std or 1795, games_total, events, perf, horizon=program_end) if events else None
    mc_scenario = monte_carlo(std or 1795, games_total, scenario, perf, horizon=program_end)
    wacc = wacc_eligibility(history, (lists.get("standard") or {}).get("title") or cfg.fide_seed.get("title"), today)
    otb_12m = store.conn.execute("SELECT COUNT(*) FROM games WHERE source='otb' AND fide_rated=1 AND played_at >= ?",
                                 ((datetime.now(timezone.utc) - timedelta(days=365)).isoformat(),)).fetchone()[0]
    return {
        "generated_at": datetime.now(timezone.utc).isoformat(), "today": today.isoformat(),
        "fide": {"standard": std, "rapid": (lists.get("rapid") or {}).get("rating"), "blitz": (lists.get("blitz") or {}).get("rating"),
                 "standard_inactive": std_inactive, "blitz_inactive": (lists.get("blitz") or {}).get("inactive", True),
                 "k": (lists.get("standard") or {}).get("k") or 20, "period": fide.get("period"), "source": fide.get("source", "seed"),
                 "games_to_restore_activity": 1 if std_inactive else 0, "rated_games_12m_on_record": otb_12m},
        "goal": {"title": cfg.goals.target_title, "route": cfg.goals.route, "program_end": program_end.isoformat()},
        "routes": {
            "rating": rating_routes(std, mc_scenario),
            "wacc_u2000": {**wacc, "event": {k: (v.isoformat() if isinstance(v, date) else v) for k, v in WACC_2026.items() if k != "sections"}},
            "norms": {"note": "Irrelevant below 2200; not modelled."},
        },
        "monte_carlo": {
            "calendar": mc_calendar, "scenario": mc_scenario,
            "scenario_assumption": f"{scen_per_year} nine-round opens per year at +50 average opposition, in addition to calendar events",
            "registered_events": len(real_only),
        },
        "calendar": listing,
        "warnings": ([f"WACC 2026 registration closes in {wacc['days_to_registration']} days (9 Oct 2026); nothing is registered."]
                     if wacc["days_to_registration"] >= 0 and not any(e.get("registered") and "World Amateur" in e.get("name", "") for e in listing) else [])
                    + (["Standard rating flagged inactive: one rated game restores activity."] if std_inactive else [])
                    + ([f"Performance model is {perf.source}."] if perf.n_games == 0 else []),
    }
