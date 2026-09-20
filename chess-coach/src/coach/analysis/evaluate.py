"""Per-game analysis: replay, evaluate every position, derive per-move metrics (spec §7.2).

Two passes. Pass 1 evaluates every position at MultiPV=1 with the tier's node budget.
Pass 2 re-evaluates at MultiPV=3 the positions where the extra lines carry information:
every error position (either side), and, for OTB/classical games, every position where
the player is to move. MultiPV data feeds `is_only_move`, `complexity`, `is_critical`.
"""
from __future__ import annotations

import json
from dataclasses import asdict, dataclass, field

import chess

from .engine import Engine, PositionEval
from .metrics import (capped_cpl, classify, complexity, game_accuracy, is_only_move, move_accuracy,
                      time_spent, win_pct)

MULTIPV = 3
CRITICAL_SWING = 25.0


@dataclass
class MoveRecord:
    ply: int                  # 0-based
    color: str                # mover
    san: str
    uci: str
    fen_before: str
    eval_before: int          # cp, mover's perspective (mate mapped far outside ±1000)
    eval_after: int
    mate_before: int | None
    mate_after: int | None
    win_before: float
    win_after: float
    win_lost: float
    cpl: int
    accuracy: float
    classification: str
    best_move: str | None
    is_best: bool
    pv_cps: list[int] = field(default_factory=list)      # MultiPV cps, best first, if run
    pv_moves: list[str] = field(default_factory=list)
    best_pv: list[str] = field(default_factory=list)      # engine's principal variation
    is_only_move: bool | None = None
    complexity: int | None = None
    is_critical: bool | None = None
    time_spent: float | None = None
    clock_after: float | None = None


@dataclass
class GameAnalysis:
    game_id: str
    nodes: int
    moves: list[MoveRecord]
    accuracy_white: float | None
    accuracy_black: float | None
    acpl_white: float | None
    acpl_black: float | None
    counts: dict            # {"white": {"blunder": n, ...}, "black": {...}}
    new_evals: list[tuple[str, int, int, dict]]   # (fen, nodes, multipv, json) to cache


@dataclass
class Task:
    game_id: str
    movetext: str
    player_color: str
    base_seconds: int | None
    increment_seconds: int | None
    clock_times: list[float] | None
    nodes: int
    full_multipv: bool
    cached: dict[tuple[str, int], dict] = field(default_factory=dict)   # (fen, multipv) -> eval json


def _replay(movetext: str) -> tuple[list[chess.Board], list[tuple[str, str]]]:
    board = chess.Board()
    boards = [board.copy()]
    moves = []
    for san in movetext.split():
        mv = board.parse_san(san)
        moves.append((san, mv.uci()))
        board.push(mv)
        boards.append(board.copy())
    return boards, moves


def analyse(task: Task, engine: Engine) -> GameAnalysis:
    boards, moves = _replay(task.movetext)
    n = len(moves)
    new_evals: list[tuple[str, int, int, dict]] = []

    def evaluate(i: int, multipv: int) -> PositionEval:
        b = boards[i]
        key = (b.fen(), multipv)
        if key in task.cached:
            return PositionEval.from_json(key[0], task.nodes, multipv, task.cached[key])
        pe = engine.evaluate(b, task.nodes, multipv)
        js = pe.to_json()
        task.cached[key] = js
        new_evals.append((key[0], task.nodes, multipv, js))
        return pe

    # Pass 1 — every position, MultiPV=1.
    evals = [evaluate(i, 1) for i in range(n + 1)]

    records: list[MoveRecord] = []
    for i, (san, uci) in enumerate(moves):
        mover = "white" if boards[i].turn == chess.WHITE else "black"
        before, after = evals[i], evals[i + 1]
        eval_before = before.cp
        eval_after = -after.cp             # position i+1 is the opponent's turn
        best = before.best
        is_best = bool(best and best.move == uci)
        wb, wa = win_pct(eval_before), win_pct(eval_after)
        lost = max(0.0, wb - wa)
        rec = MoveRecord(
            ply=i, color=mover, san=san, uci=uci, fen_before=before.fen,
            eval_before=eval_before, eval_after=eval_after,
            mate_before=best.mate if best else None,
            mate_after=(-after.best.mate if after.best and after.best.mate is not None else None),
            win_before=round(wb, 2), win_after=round(wa, 2), win_lost=round(lost, 2),
            cpl=capped_cpl(eval_before, eval_after),
            accuracy=round(move_accuracy(lost), 2),
            classification=classify(lost, is_best),
            best_move=best.move if best else None, is_best=is_best,
            best_pv=best.pv if best else [],
            time_spent=time_spent(task.clock_times, i, task.base_seconds, task.increment_seconds),
            clock_after=(task.clock_times[i] if task.clock_times and i < len(task.clock_times)
                         and task.clock_times[i] == task.clock_times[i] else None),
        )
        records.append(rec)

    # Pass 2 — MultiPV=3 where it matters.
    for rec in records:
        wanted = rec.classification in ("inaccuracy", "mistake", "blunder") or \
                 (task.full_multipv and rec.color == task.player_color)
        if not wanted or boards[rec.ply].is_game_over():
            continue
        pe = evaluate(rec.ply, MULTIPV)
        cps = [l.cp_value for l in pe.lines]
        rec.pv_cps = cps
        rec.pv_moves = [l.move for l in pe.lines]
        rec.is_only_move = is_only_move(cps)
        rec.complexity = complexity(cps)
        if cps:
            w_best, w_worst = win_pct(cps[0]), win_pct(cps[-1])
            rec.is_critical = (w_best - w_worst) > CRITICAL_SWING

    # Game summary.
    win_white_pov = []
    for i in range(n + 1):
        cp = evals[i].cp
        win_white_pov.append(win_pct(cp if boards[i].turn == chess.WHITE else -cp))
    acc = game_accuracy(win_white_pov, [r.accuracy for r in records], lambda i: records[i].color)
    counts = {c: {"blunder": 0, "mistake": 0, "inaccuracy": 0} for c in ("white", "black")}
    cpls = {"white": [], "black": []}
    for r in records:
        if r.classification in counts[r.color]:
            counts[r.color][r.classification] += 1
        cpls[r.color].append(r.cpl)

    def mean(xs):
        return round(sum(xs) / len(xs), 1) if xs else None

    return GameAnalysis(
        game_id=task.game_id, nodes=task.nodes, moves=records,
        accuracy_white=acc["white"], accuracy_black=acc["black"],
        acpl_white=mean(cpls["white"]), acpl_black=mean(cpls["black"]),
        counts=counts, new_evals=new_evals,
    )


def records_to_json(records: list[MoveRecord]) -> str:
    return json.dumps([asdict(r) for r in records], separators=(",", ":"))
