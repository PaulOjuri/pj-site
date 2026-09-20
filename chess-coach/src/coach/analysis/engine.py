"""Stockfish wrapper: nodes-limited, single-threaded, hash cleared per position (spec §7.1).

Determinism contract: for a given (engine build, FEN, nodes, multipv) the output is identical
on every run, because search is node-limited, single-threaded, and starts from an empty hash.
That is what lets evaluations be cached by (FEN, nodes, multipv) and re-used across games.
"""
from __future__ import annotations

import os
import shutil
from dataclasses import dataclass, field

import chess
import chess.engine

from .metrics import MATE_CP, score_to_cp

TAGGER_VERSION = "0"   # bumped in M3


@dataclass
class Line:
    move: str            # UCI
    cp: int | None
    mate: int | None
    pv: list[str] = field(default_factory=list)

    @property
    def cp_value(self) -> int:
        return score_to_cp(self.cp, self.mate)


@dataclass
class PositionEval:
    fen: str
    nodes: int
    multipv: int
    lines: list[Line]          # ordered best-first, from the side-to-move's perspective
    terminal: bool = False     # game over: no lines, cp is exact

    @property
    def best(self) -> Line | None:
        return self.lines[0] if self.lines else None

    @property
    def cp(self) -> int:
        if self.terminal:
            return self._terminal_cp
        return self.best.cp_value if self.best else 0

    _terminal_cp: int = 0

    def to_json(self) -> dict:
        return {"lines": [{"m": l.move, "cp": l.cp, "mate": l.mate, "pv": l.pv} for l in self.lines],
                "terminal": self.terminal, "tcp": self._terminal_cp}

    @classmethod
    def from_json(cls, fen: str, nodes: int, multipv: int, d: dict) -> "PositionEval":
        pe = cls(fen=fen, nodes=nodes, multipv=multipv,
                 lines=[Line(l["m"], l["cp"], l["mate"], l.get("pv", [])) for l in d["lines"]],
                 terminal=d.get("terminal", False))
        pe._terminal_cp = d.get("tcp", 0)
        return pe


def find_stockfish() -> str:
    for cand in (os.environ.get("STOCKFISH_PATH"), shutil.which("stockfish"), "/opt/homebrew/bin/stockfish",
                 "/usr/local/bin/stockfish", "/usr/games/stockfish"):
        if cand and os.path.exists(cand):
            return cand
    raise FileNotFoundError("stockfish binary not found; set STOCKFISH_PATH")


class Engine:
    def __init__(self, path: str | None = None, hash_mb: int = 64):
        self.path = path or find_stockfish()
        self.engine = chess.engine.SimpleEngine.popen_uci(self.path)
        self.engine.configure({"Threads": 1, "Hash": hash_mb})
        self.version = self.engine.id.get("name", "stockfish")

    def close(self) -> None:
        # quit() only asks the process to exit; close() stops python-chess's non-daemon
        # background thread. Without the second call the owning process cannot exit.
        try:
            self.engine.quit()
        except (chess.engine.EngineError, chess.engine.EngineTerminatedError):
            pass
        finally:
            self.engine.close()

    def evaluate(self, board: chess.Board, nodes: int, multipv: int = 1) -> PositionEval:
        fen = board.fen()
        if board.is_game_over(claim_draw=False):
            pe = PositionEval(fen=fen, nodes=nodes, multipv=multipv, lines=[], terminal=True)
            pe._terminal_cp = -MATE_CP if board.is_checkmate() else 0
            return pe
        # A fresh `game` token makes python-chess send ucinewgame -> empty hash -> reproducible.
        infos = self.engine.analyse(board, chess.engine.Limit(nodes=nodes), multipv=multipv, game=object())
        if isinstance(infos, dict):
            infos = [infos]
        lines: list[Line] = []
        for info in infos:
            if "pv" not in info or "score" not in info:
                continue
            pov = info["score"].pov(board.turn)
            lines.append(Line(move=info["pv"][0].uci(), cp=pov.score(), mate=pov.mate(),
                              pv=[m.uci() for m in info["pv"][:8]]))
        return PositionEval(fen=fen, nodes=nodes, multipv=multipv, lines=lines)


def analysis_version(engine_version: str, nodes: int, multipv: int) -> str:
    return f"{engine_version}|n{nodes}|mpv{multipv}|t{TAGGER_VERSION}"
