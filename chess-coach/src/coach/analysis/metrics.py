"""Pure per-move and per-game metric functions (spec §7.2), Lichess conventions.

Everything here is deterministic arithmetic on centipawn / mate values; no engine calls.
Scores are always from the *mover's* perspective unless a name says otherwise.
"""
from __future__ import annotations

import math
from statistics import pstdev
from typing import Literal

Classification = Literal["best", "good", "inaccuracy", "mistake", "blunder"]

CP_CAP = 1000            # Lichess clamps cp to ±1000 before the win% sigmoid
MATE_CP = 100_000        # sentinel used when a score is a forced mate
CPL_CAP = 1000           # uncapped CPL is dominated by already-lost positions

INACCURACY = 10.0        # win% lost thresholds (spec §7.2)
MISTAKE = 20.0
BLUNDER = 30.0
ONLY_MOVE_GAP = 100      # cp gap between best and second best
COMPLEXITY_BAND = 50     # moves within this many cp of best count as "reasonable"
CRITICAL_SWING = 25.0    # win% that could swing either way


def score_to_cp(cp: int | None, mate: int | None) -> int:
    """Collapse (cp, mate) into one signed cp value. Mate-in-n maps far outside ±CP_CAP."""
    if mate is not None:
        return MATE_CP - abs(mate) if mate > 0 else -(MATE_CP - abs(mate))
    return cp if cp is not None else 0


def win_pct(cp: int) -> float:
    """Lichess: 50 + 50 * (2 / (1 + exp(-0.00368208 * cp)) - 1), cp clamped to ±1000."""
    c = max(-CP_CAP, min(CP_CAP, cp))
    return 50 + 50 * (2 / (1 + math.exp(-0.00368208 * c)) - 1)


def move_accuracy(win_lost: float) -> float:
    """Lichess: 103.1668 * exp(-0.04354 * winPctLost) - 3.1669, clamped to [0, 100]."""
    a = 103.1668 * math.exp(-0.04354 * max(0.0, win_lost)) - 3.1669
    return max(0.0, min(100.0, a))


def classify(win_lost: float, is_best: bool) -> Classification:
    if is_best:
        return "best"
    if win_lost >= BLUNDER:
        return "blunder"
    if win_lost >= MISTAKE:
        return "mistake"
    if win_lost >= INACCURACY:
        return "inaccuracy"
    return "good"


def capped_cpl(cp_before: int, cp_after: int) -> int:
    return max(0, min(CPL_CAP, cp_before - cp_after))


def is_only_move(pv_cps: list[int]) -> bool:
    """True when the best line is >100cp better than the second best (MultiPV needed)."""
    return len(pv_cps) >= 2 and (pv_cps[0] - pv_cps[1]) > ONLY_MOVE_GAP


def complexity(pv_cps: list[int]) -> int:
    """Number of MultiPV moves within 50cp of the best. 1 = forced, 3 = several fine choices."""
    if not pv_cps:
        return 0
    return sum(1 for c in pv_cps if pv_cps[0] - c <= COMPLEXITY_BAND)


def is_critical(win_before: float, win_after_best: float, win_after_worst: float) -> bool:
    """A position where the outcome can swing >25 win% either way depending on the move."""
    return (win_after_best - win_before) > CRITICAL_SWING or (win_before - win_after_worst) > CRITICAL_SWING


def game_accuracy(win_pcts_white_pov: list[float], move_accuracies: list[float | None], color_of_ply) -> dict:
    """Per-colour game accuracy following lila's AccuracyPercent: the mean of a volatility-weighted
    average and the harmonic mean of the mover's move accuracies.

    `win_pcts_white_pov[i]` is the win% for White *after* ply i (i.e. of position i+1), with
    index 0 being the starting position. `color_of_ply(i)` returns 'white' or 'black'.
    """
    n = len(move_accuracies)
    if n == 0:
        return {"white": None, "black": None}
    window = max(2, min(8, n // 10))
    # Volatility weight per ply: stdev of win% in a window around it, clamped [0.5, 12].
    weights: list[float] = []
    for i in range(n):
        lo = max(0, i - window)
        hi = min(len(win_pcts_white_pov), i + window + 1)
        seg = win_pcts_white_pov[lo:hi]
        w = pstdev(seg) if len(seg) > 1 else 0.0
        weights.append(max(0.5, min(12.0, w)))
    out = {}
    for color in ("white", "black"):
        accs = [(a, weights[i]) for i, a in enumerate(move_accuracies) if a is not None and color_of_ply(i) == color]
        if not accs:
            out[color] = None
            continue
        weighted = sum(a * w for a, w in accs) / sum(w for _, w in accs)
        harmonic = len(accs) / sum(1 / max(a, 1e-9) for a, _ in accs)
        out[color] = round((weighted + harmonic) / 2, 1)
    return out


def time_spent(clocks: list[float] | None, ply: int, base: int | None, inc: int | None) -> float | None:
    """Seconds the mover spent on `ply` (0-based), from [%clk] values recorded after each ply.

    clk after ply = clk before ply - spent + increment, so spent = prev_clk - clk + inc,
    where prev_clk is the same mover's clock two plies earlier (or the base time).
    """
    if not clocks or ply >= len(clocks):
        return None
    clk = clocks[ply]
    if clk != clk:  # NaN
        return None
    if ply >= 2:
        prev = clocks[ply - 2]
        if prev != prev:
            return None
    elif base is not None:
        prev = float(base)
    else:
        return None
    spent = prev - clk + (inc or 0)
    return round(max(0.0, spent), 1)
