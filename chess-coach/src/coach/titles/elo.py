"""FIDE Elo model and Monte Carlo (spec §2, §9). Rules from FIDE Handbook B.02 (Rating
Regulations effective 1 March 2024, with the 1 Oct 2025 400-point clause), fetched 2026-09-21:

  K = 40 for a new player until 30 games; K = 20 while rating < 2400; K = 10 once 2400 reached;
  K = 40 until end of the year of the 18th birthday while < 2300; K·n capped at 700 per period.
  Rating differences beyond 400 count as 400 (players below 2650).
  Floor: below 1400 -> unrated. Inactivity: no rated game in one year; one rated game restores it.
"""
from __future__ import annotations

import math
import random
from dataclasses import dataclass, field
from datetime import date

DIFF_CAP = 400
PERIOD_KN_CAP = 700


def expected_score(rating: int | float, opp: int | float) -> float:
    d = max(-DIFF_CAP, min(DIFF_CAP, rating - opp))
    return 1 / (1 + 10 ** (-d / 400))


def k_factor(rating: float, games_total: int, age_at_year_end: int | None = None, reached_2400: bool = False) -> int:
    if games_total < 30:
        return 40
    if age_at_year_end is not None and age_at_year_end < 19 and rating < 2300:
        return 40
    if reached_2400 or rating >= 2400:
        return 10
    return 20


def rating_change(rating: float, results: list[tuple[int, float]], k: int) -> float:
    """results: [(opponent_rating, score)] within one rating period; applies the K·n cap."""
    n = len(results)
    if n == 0:
        return 0.0
    k_eff = min(k, PERIOD_KN_CAP // n) if k * n > PERIOD_KN_CAP else k
    return sum(k_eff * (s - expected_score(rating, opp)) for opp, s in results)


@dataclass
class Event:
    name: str
    start: date
    rounds: int
    opp_mean: float          # average opponent rating
    opp_sd: float = 120.0
    registered: bool = False


@dataclass
class Performance:
    """How the player actually performs relative to their rating: mean offset and spread."""
    offset_mean: float = 0.0
    offset_sd: float = 100.0
    draw_rate: float = 0.25
    source: str = "assumed"
    n_games: int = 0


def simulate_game(rng: random.Random, perf_rating: float, opp: float, draw_rate: float) -> float:
    e = expected_score(perf_rating, opp)
    p_draw = draw_rate * (1 - abs(2 * e - 1))     # fewer draws in lopsided pairings
    p_win = max(0.0, e - p_draw / 2)
    r = rng.random()
    return 1.0 if r < p_win else 0.5 if r < p_win + p_draw else 0.0


def monte_carlo(rating: float, games_total: int, events: list[Event], perf: Performance, *,
                horizon: date, thresholds=(2000, 2200), runs: int = 4000, seed: int = 260703) -> dict:
    rng = random.Random(seed)
    finals = []
    crossed = {t: [] for t in thresholds}
    paths_by_event = []
    ev = sorted([e for e in events if e.start <= horizon], key=lambda e: e.start)
    for _ in range(runs):
        r, g = rating, games_total
        # each run draws a persistent "true strength" offset, plus per-event noise
        strength = rng.gauss(perf.offset_mean, perf.offset_sd / 2)
        first_cross = {t: None for t in thresholds}
        path = []
        for e in ev:
            form = rng.gauss(0, perf.offset_sd / 2)
            perf_rating = r + strength + form
            results = [(max(1000, rng.gauss(e.opp_mean, e.opp_sd)), simulate_game(rng, perf_rating, rng.gauss(e.opp_mean, e.opp_sd), perf.draw_rate))
                       for _ in range(e.rounds)]
            k = k_factor(r, g)
            r += rating_change(r, results, k)
            g += e.rounds
            path.append(round(r))
            for t in thresholds:
                if first_cross[t] is None and r >= t:
                    first_cross[t] = e.start.isoformat()
        finals.append(r)
        for t in thresholds:
            crossed[t].append(first_cross[t])
        paths_by_event.append(path)
    finals.sort()
    def pct(p):
        return round(finals[min(len(finals) - 1, int(p * len(finals)))])
    out = {
        "runs": runs, "events": [{"name": e.name, "start": e.start.isoformat(), "rounds": e.rounds, "opp_mean": e.opp_mean} for e in ev],
        "horizon": horizon.isoformat(), "start_rating": rating,
        "final": {"p10": pct(0.10), "p50": pct(0.50), "p90": pct(0.90), "mean": round(sum(finals) / len(finals))},
        "p_reach": {str(t): round(sum(1 for c in crossed[t] if c) / runs, 3) for t in thresholds},
        "per_event_median": [round(sorted(p[i] for p in paths_by_event if len(p) > i)[runs // 2]) if any(len(p) > i for p in paths_by_event) else None
                             for i in range(len(ev))],
        "performance": {"offset_mean": perf.offset_mean, "offset_sd": perf.offset_sd, "draw_rate": perf.draw_rate,
                        "source": perf.source, "n_games": perf.n_games},
    }
    return out


def gain_for_performance(rating: float, rounds: int, opp_mean: float, perf_above: float, k: int = 20) -> float:
    """Expected rating gain for one event when performing `perf_above` points above rating."""
    e_perf = expected_score(rating + perf_above, opp_mean)
    e_rate = expected_score(rating, opp_mean)
    return round(min(k, PERIOD_KN_CAP // rounds if k * rounds > PERIOD_KN_CAP else k) * rounds * (e_perf - e_rate), 1)
