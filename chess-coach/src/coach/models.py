"""Canonical game model (spec §6.5). Every source normalises into this."""
from __future__ import annotations

import hashlib
from datetime import datetime
from typing import Literal

from pydantic import BaseModel, Field

Source = Literal["chesscom", "lichess", "otb"]
Speed = Literal["ultrabullet", "bullet", "blitz", "rapid", "classical", "correspondence"]
Color = Literal["white", "black"]
Result = Literal["win", "loss", "draw", "unknown"]


class Side(BaseModel):
    name: str
    rating: int | None = None
    title: str | None = None


class Game(BaseModel):
    id: str                       # f"{source}:{source_id}"
    source: Source
    source_id: str
    url: str | None = None

    played_at: datetime           # UTC
    time_control_raw: str | None = None
    base_seconds: int | None = None
    increment_seconds: int | None = None
    speed: Speed

    rated: bool = False
    fide_rated: bool = False
    variant: str = "standard"     # non-standard games are stored but excluded from leak scoring

    white: Side
    black: Side
    player_color: Color
    opponent_rating: int | None = None
    rating_diff: int | None = None    # player rating - opponent rating

    result: Result
    termination: str | None = None    # source-specific reason: resigned, timeout, stalemate, ...

    eco: str | None = None
    opening_name: str | None = None
    opening_ply: int | None = None

    pgn: str
    movetext: str                     # SAN moves, space-separated, no comments/numbers
    final_fen: str
    ply_count: int
    clock_times: list[float] | None = None   # remaining seconds after each ply, if the source has clocks

    event: str | None = None
    round: str | None = None
    note: str | None = None           # OTB free-text ("how the game felt"), private

    # Accuracy the source computed, kept for the §13 sanity suite. Never used for coaching.
    source_accuracy_white: float | None = None
    source_accuracy_black: float | None = None

    dedup_key: str = ""
    analysis_version: str | None = None
    extra: dict = Field(default_factory=dict)

    def model_post_init(self, __context) -> None:
        if not self.dedup_key:
            self.dedup_key = make_dedup_key(self.movetext, self.played_at)


def make_dedup_key(movetext: str, played_at: datetime) -> str:
    """Hash of the normalised movetext plus the calendar date (spec §6.5)."""
    h = hashlib.sha1()
    h.update(movetext.strip().encode())
    h.update(b"|")
    h.update(played_at.strftime("%Y-%m-%d").encode())
    return h.hexdigest()[:20]


def classify_speed(base: int | None, inc: int | None, source_hint: str | None = None) -> Speed:
    """Map a time control to a speed bucket.

    Uses the Lichess convention (estimated game duration = base + 40*increment) so both
    sources land in the same buckets. `source_hint` is the source's own label, used when
    the time control is missing or non-numeric (daily/correspondence).
    """
    hint = (source_hint or "").lower()
    if hint in ("daily", "correspondence"):
        return "correspondence"
    if base is None:
        return {"ultrabullet": "ultrabullet", "bullet": "bullet", "blitz": "blitz", "rapid": "rapid",
                "classical": "classical"}.get(hint, "blitz")
    est = base + 40 * (inc or 0)
    if est < 30:
        return "ultrabullet"
    if est < 180:
        return "bullet"
    if est < 480:
        return "blitz"
    if est < 1500:
        return "rapid"
    return "classical"
