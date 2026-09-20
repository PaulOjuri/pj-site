"""Chess.com Published-Data API ingester (spec §6.1).

Serial requests only. Historical months are immutable and fetched exactly once; the
current month is re-fetched with If-None-Match so an unchanged month costs one 304.
"""
from __future__ import annotations

import json
import logging
from datetime import datetime, timezone

import chess

from ..db import Store
from ..models import Game, Side, classify_speed
from .http import Gone, SerialClient
from .normalise import int_or_none, parse_pgn, parse_time_control, player_color

log = logging.getLogger(__name__)
BASE = "https://api.chess.com/pub"

# Which side's result code says how the game ended; win codes are symmetric.
_TERMINATIONS = {
    "checkmated", "timeout", "resigned", "agreed", "repetition", "stalemate",
    "insufficient", "50move", "abandoned", "timevsinsufficient", "win",
}


def _termination(white: dict, black: dict) -> str | None:
    w, b = white.get("result"), black.get("result")
    if w == "win":
        return b
    if b == "win":
        return w
    return w or b   # draws carry the same code on both sides


def _speed_from(game: dict, base: int | None, inc: int | None) -> str:
    return classify_speed(base, inc, source_hint=game.get("time_class"))


def to_game(raw: dict, me: str) -> Game | None:
    """Convert one chess.com game object to the canonical model. Returns None if unusable."""
    pgn = raw.get("pgn")
    if not pgn:
        return None
    try:
        parsed = parse_pgn(pgn)
    except ValueError:
        log.warning("skipping unparseable game %s", raw.get("url"))
        return None
    white, black = raw.get("white", {}), raw.get("black", {})
    wname, bname = white.get("username", "?"), black.get("username", "?")
    try:
        color = player_color(wname, bname, me)
    except ValueError:
        return None
    base, inc = parse_time_control(raw.get("time_control"))
    if raw.get("time_class") == "daily":
        base, inc = None, None
    me_rating = int_or_none((white if color == "white" else black).get("rating"))
    opp_rating = int_or_none((black if color == "white" else white).get("rating"))
    my_result = (white if color == "white" else black).get("result")
    if my_result == "win":
        result = "win"
    elif my_result in ("agreed", "repetition", "stalemate", "insufficient", "50move", "timevsinsufficient"):
        result = "draw"
    elif my_result in _TERMINATIONS:
        result = "loss"
    else:
        result = "unknown"
    acc = raw.get("accuracies") or {}
    source_id = str(raw.get("uuid") or raw.get("url", "").rsplit("/", 1)[-1])
    rules = raw.get("rules", "chess")
    variant = "standard" if rules == "chess" else rules
    # Games resumed from a custom position keep rules=chess but a non-standard initial_setup.
    # Lichess calls these fromPosition; do the same so they are excluded from leak scoring.
    initial = raw.get("initial_setup")
    if variant == "standard" and initial and not initial.startswith(chess.STARTING_FEN.split(" ")[0]):
        variant = "fromPosition"
    return Game(
        id=f"chesscom:{source_id}",
        source="chesscom",
        source_id=source_id,
        url=raw.get("url"),
        played_at=datetime.fromtimestamp(raw["end_time"], tz=timezone.utc),
        time_control_raw=raw.get("time_control"),
        base_seconds=base,
        increment_seconds=inc,
        speed=_speed_from(raw, base, inc),
        rated=bool(raw.get("rated")),
        variant=variant,
        white=Side(name=wname, rating=int_or_none(white.get("rating"))),
        black=Side(name=bname, rating=int_or_none(black.get("rating"))),
        player_color=color,
        opponent_rating=opp_rating,
        rating_diff=(me_rating - opp_rating) if me_rating is not None and opp_rating is not None else None,
        result=result,
        termination=_termination(white, black),
        eco=parsed.headers.get("ECO"),
        opening_name=(raw.get("eco") or "").rsplit("/", 1)[-1].replace("-", " ") or None,
        opening_ply=None,
        pgn=pgn,
        movetext=parsed.movetext,
        final_fen=parsed.final_fen,
        ply_count=parsed.ply_count,
        clock_times=parsed.clock_times,
        event=parsed.headers.get("Event"),
        source_accuracy_white=acc.get("white"),
        source_accuracy_black=acc.get("black"),
        extra={"time_class": raw.get("time_class"), "tournament": raw.get("tournament"),
               "initial_fen": initial if variant == "fromPosition" else None},
    )


class ChessComIngester:
    def __init__(self, client: SerialClient, store: Store, username: str):
        self.client = client
        self.store = store
        self.username = username.lower()

    def archives(self) -> list[str]:
        f = self.client.get(f"{BASE}/player/{self.username}/games/archives")
        return json.loads(f.body)["archives"]

    def ingest(self, *, since: str | None = None, limit_months: int | None = None) -> dict:
        """Walk monthly archives oldest→newest. `since` is 'YYYY/MM' to skip older months."""
        stats = {"months": 0, "requests": 0, "not_modified": 0, "inserted": 0, "exists": 0, "duplicate": 0, "skipped": 0}
        now = datetime.now(timezone.utc)
        current = f"{now.year:04d}/{now.month:02d}"
        months = self.archives()
        stats["requests"] += 1
        if since:
            months = [m for m in months if m[-7:] >= since]
        if limit_months:
            months = months[-limit_months:]
        for url in months:
            ym = url[-7:]
            is_final = ym < current
            try:
                f = self.client.get(url, final=is_final)
            except Gone:
                log.warning("archive %s is gone (410); skipping forever", ym)
                continue
            stats["months"] += 1
            if not f.from_cache:
                stats["requests"] += 1
            if f.not_modified:
                stats["not_modified"] += 1
            if f.from_cache or f.not_modified:
                # Nothing new on the wire; still walk the games so a rebuilt DB backfills.
                pass
            games = json.loads(f.body).get("games", [])
            with self.store.tx():
                for raw in games:
                    g = to_game(raw, self.username)
                    if g is None:
                        stats["skipped"] += 1
                        continue
                    stats[self.store.insert_game(g)] += 1
            log.info("chess.com %s: %d games (%s)", ym, len(games),
                     "cached" if f.from_cache else "304" if f.not_modified else "fetched")
        self.store.set_state("chesscom.last_run", now.isoformat())
        return stats
