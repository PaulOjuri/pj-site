"""PGN → canonical Game fields shared by every source.

Each source module builds the metadata it knows (ids, ratings, speed, termination) and
calls `parse_pgn` for the parts that only the movetext can supply: SAN list, final FEN,
ply count, clock times, and the tags the PGN carries.
"""
from __future__ import annotations

import io
import re
from dataclasses import dataclass
from datetime import datetime, timezone

import chess
import chess.pgn

from ..models import Color, Result

_TC_RE = re.compile(r"^(\d+)(?:\+(\d+))?$")


@dataclass
class ParsedPgn:
    headers: dict[str, str]
    movetext: str
    final_fen: str
    ply_count: int
    clock_times: list[float] | None
    result_tag: str


def parse_pgn(pgn: str) -> ParsedPgn:
    game = chess.pgn.read_game(io.StringIO(pgn))
    if game is None:
        raise ValueError("unparseable PGN")
    board = game.board()
    sans: list[str] = []
    clocks: list[float] = []
    saw_clock = False
    for node in game.mainline():
        sans.append(board.san(node.move))
        board.push(node.move)
        clk = node.clock()
        if clk is not None:
            saw_clock = True
            clocks.append(round(clk, 1))
        else:
            clocks.append(float("nan"))
    return ParsedPgn(
        headers=dict(game.headers),
        movetext=" ".join(sans),
        final_fen=board.fen(),
        ply_count=len(sans),
        clock_times=clocks if saw_clock else None,
        result_tag=game.headers.get("Result", "*"),
    )


def parse_time_control(tc: str | None) -> tuple[int | None, int | None]:
    """'300+2' -> (300, 2); '600' -> (600, 0); '1/86400' (daily) and '-' -> (None, None)."""
    if not tc:
        return None, None
    m = _TC_RE.match(tc.strip())
    if not m:
        return None, None
    return int(m.group(1)), int(m.group(2) or 0)


def player_color(white_name: str, black_name: str, me: str) -> Color:
    me_l = me.lower()
    if white_name.lower() == me_l:
        return "white"
    if black_name.lower() == me_l:
        return "black"
    raise ValueError(f"{me!r} is neither {white_name!r} nor {black_name!r}")


def result_for(color: Color, result_tag: str) -> Result:
    if result_tag == "1/2-1/2":
        return "draw"
    if result_tag == "1-0":
        return "win" if color == "white" else "loss"
    if result_tag == "0-1":
        return "win" if color == "black" else "loss"
    return "unknown"


def pgn_datetime(headers: dict[str, str]) -> datetime | None:
    """Best-effort UTC timestamp from PGN tags (UTCDate/UTCTime preferred, else Date)."""
    date = headers.get("UTCDate") or headers.get("Date")
    time_ = headers.get("UTCTime") or headers.get("StartTime") or "00:00:00"
    if not date or "?" in date:
        return None
    try:
        return datetime.strptime(f"{date} {time_}", "%Y.%m.%d %H:%M:%S").replace(tzinfo=timezone.utc)
    except ValueError:
        try:
            return datetime.strptime(date, "%Y.%m.%d").replace(tzinfo=timezone.utc)
        except ValueError:
            return None


def int_or_none(v) -> int | None:
    try:
        return int(v)
    except (TypeError, ValueError):
        return None
