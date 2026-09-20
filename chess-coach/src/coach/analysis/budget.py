"""Node budgets and leak weights by source/speed (spec §7.1, §7.7).

Budgets are lower than the spec's suggestions for online games. Measured 2026-09-20 on an
M-series Mac (Homebrew Stockfish 19, ~0.5 Mnps/thread): 40 blitz games at 300k nodes took
482s on 8 workers, i.e. 200 games in ~40 min, double the §15 M2 acceptance ceiling. At 80k
a blitz game costs ~3s and a 200-game backlog fits in ~10 min. OTB/classical keep the full
budget: there are few of them and they are the ground truth.
"""
from __future__ import annotations

NODES = {
    "otb": 3_000_000,
    "classical": 2_000_000,
    "rapid_long": 500_000,      # online rapid >= 15 min base
    "rapid": 300_000,
    "blitz": 80_000,
    "bullet": 40_000,
    "ultrabullet": 40_000,
    "correspondence": 500_000,
}

WEIGHTS = {
    "otb": 1.00,
    "classical": 0.70,
    "rapid_long": 0.70,
    "rapid": 0.40,
    "blitz": 0.20,
    "bullet": 0.05,
    "ultrabullet": 0.05,
    "correspondence": 0.40,
}


def tier(source: str, speed: str, base_seconds: int | None) -> str:
    if source == "otb":
        return "otb"
    if speed == "rapid" and base_seconds is not None and base_seconds >= 900:
        return "rapid_long"
    return speed


def nodes_for(source: str, speed: str, base_seconds: int | None) -> int:
    return NODES[tier(source, speed, base_seconds)]


def weight_for(source: str, speed: str, base_seconds: int | None) -> float:
    return WEIGHTS[tier(source, speed, base_seconds)]
