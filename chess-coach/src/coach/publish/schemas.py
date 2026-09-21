"""Pydantic schemas for published artifacts. Every artifact is validated before it is written (§13)."""
from __future__ import annotations

from pydantic import BaseModel, Field


class FideRatings(BaseModel):
    standard: int | None
    rapid: int | None
    blitz: int | None
    standard_inactive: bool
    blitz_inactive: bool
    title: str | None
    as_of: str
    source: str


class OnlineRating(BaseModel):
    rating: int | None = None
    games: int | None = None
    record: dict | None = None


class RecentGame(BaseModel):
    id: str
    played_at: str
    speed: str
    source: str
    result: str
    color: str
    opponent_rating: int | None
    accuracy: float | None
    blunders: int
    url: str | None


class Summary(BaseModel):
    generated_at: str
    player: dict
    fide: FideRatings
    online: dict[str, dict]
    pool: dict
    recent_form: list[RecentGame]
    focus: list[dict]
    activity: dict
    warnings: list[str] = Field(default_factory=list)


class GameIndexRow(BaseModel):
    id: str
    played_at: str
    speed: str
    source: str
    result: str
    color: str
    opponent: str
    opponent_rating: int | None
    accuracy: float | None
    acpl: float | None
    blunders: int
    mistakes: int
    inaccuracies: int
    eco: str | None
    opening: str | None
    url: str | None
    published: bool          # whether games/{id}.json exists


class GameIndex(BaseModel):
    generated_at: str
    count: int
    games: list[GameIndexRow]


class MoveOut(BaseModel):
    p: int                    # ply
    s: str                    # san
    u: str                    # uci
    f: str                    # fen after the move
    eb: int                   # eval before (mover pov, cp)
    ea: int
    wl: float                 # win% lost
    c: str                    # classification
    b: str | None             # best move uci
    pv: list[str] = Field(default_factory=list)
    t: float | None = None    # time spent
    k: float | None = None    # clock after
    om: bool | None = None    # only move
    cx: int | None = None     # complexity
    cr: bool | None = None    # critical


class GameOut(BaseModel):
    id: str
    meta: dict
    analysis: dict
    moves: list[MoveOut]
    motifs: list[dict]
    features: dict


class Leaks(BaseModel):
    generated_at: str
    pool_games: int
    pool_weighted: float
    pool_by_speed: dict
    rules: dict
    leaks: list[dict]
