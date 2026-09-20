"""Lichess ingester (spec §6.2). NDJSON stream, incremental via `since`, one request at a time.

A personal token (env LICHESS_TOKEN) is optional for game export and raises the throughput
cap; it is required later for the puzzle dashboard. On 429 the client waits >=60s.
"""
from __future__ import annotations

import json
import logging
import os
from datetime import datetime, timezone

from ..db import Store
from ..models import Game, Side, classify_speed
from .http import SerialClient
from .normalise import int_or_none, parse_pgn, player_color

log = logging.getLogger(__name__)
BASE = "https://lichess.org"

_DRAW_STATUSES = {"draw", "stalemate"}
_SPEED_MAP = {"ultraBullet": "ultrabullet", "bullet": "bullet", "blitz": "blitz",
              "rapid": "rapid", "classical": "classical", "correspondence": "correspondence"}


def _side(p: dict) -> Side:
    user = p.get("user") or {}
    name = user.get("name") or ("Stockfish" if "aiLevel" in p else "Anonymous")
    return Side(name=name, rating=int_or_none(p.get("rating")), title=user.get("title"))


def to_game(raw: dict, me: str) -> Game | None:
    pgn = raw.get("pgn")
    if not pgn:
        return None
    try:
        parsed = parse_pgn(pgn)
    except ValueError:
        log.warning("skipping unparseable game %s", raw.get("id"))
        return None
    players = raw.get("players", {})
    white, black = _side(players.get("white", {})), _side(players.get("black", {}))
    try:
        color = player_color(white.name, black.name, me)
    except ValueError:
        return None
    clock = raw.get("clock") or {}
    base, inc = clock.get("initial"), clock.get("increment")
    speed = _SPEED_MAP.get(raw.get("speed", ""), None) or classify_speed(base, inc)
    winner = raw.get("winner")
    status = raw.get("status")
    if winner == color:
        result = "win"
    elif winner in ("white", "black"):
        result = "loss"
    elif status in _DRAW_STATUSES or parsed.result_tag == "1/2-1/2":
        result = "draw"
    else:
        result = "unknown"
    me_rating = (white if color == "white" else black).rating
    opp_rating = (black if color == "white" else white).rating
    opening = raw.get("opening") or {}
    variant = raw.get("variant", "standard")
    return Game(
        id=f"lichess:{raw['id']}",
        source="lichess",
        source_id=raw["id"],
        url=f"{BASE}/{raw['id']}",
        played_at=datetime.fromtimestamp(raw["createdAt"] / 1000, tz=timezone.utc),
        time_control_raw=parsed.headers.get("TimeControl"),
        base_seconds=base,
        increment_seconds=inc,
        speed=speed,
        rated=bool(raw.get("rated")),
        variant=variant,
        white=white,
        black=black,
        player_color=color,
        opponent_rating=opp_rating,
        rating_diff=(me_rating - opp_rating) if me_rating is not None and opp_rating is not None else None,
        result=result,
        termination=status,
        eco=opening.get("eco"),
        opening_name=opening.get("name"),
        opening_ply=opening.get("ply"),
        pgn=pgn,
        movetext=parsed.movetext,
        final_fen=parsed.final_fen,
        ply_count=parsed.ply_count,
        clock_times=parsed.clock_times,
        event=parsed.headers.get("Event"),
        extra={"perf": raw.get("perf"), "source": raw.get("source"), "created_at_ms": raw["createdAt"]},
    )


class LichessIngester:
    STATE_KEY = "lichess.max_created_at"

    def __init__(self, client: SerialClient, store: Store, username: str, token: str | None = None):
        self.client = client
        self.store = store
        self.username = username
        self.token = token if token is not None else os.environ.get("LICHESS_TOKEN")

    def _headers(self) -> dict:
        h = {"Accept": "application/x-ndjson"}
        if self.token:
            h["Authorization"] = f"Bearer {self.token}"
        return h

    def ingest(self, *, max_games: int | None = None, full: bool = False) -> dict:
        """Stream games newer than the stored cursor. `full=True` ignores the cursor."""
        stats = {"requests": 1, "streamed": 0, "inserted": 0, "exists": 0, "duplicate": 0, "skipped": 0}
        params: dict = {
            "pgnInJson": "true", "clocks": "true", "opening": "true", "evals": "false",
            "sort": "dateAsc",
        }
        cursor = None if full else self.store.get_state(self.STATE_KEY)
        if cursor:
            params["since"] = int(cursor) + 1
        if max_games:
            params["max"] = max_games
        max_seen = int(cursor) if cursor else 0
        url = f"{BASE}/api/games/user/{self.username}"
        batch = 0
        for line in self.client.stream_lines(url, params=params, headers=self._headers()):
            raw = json.loads(line)
            stats["streamed"] += 1
            g = to_game(raw, self.username)
            if g is None:
                stats["skipped"] += 1
            else:
                stats[self.store.insert_game(g)] += 1
            max_seen = max(max_seen, int(raw["createdAt"]))
            batch += 1
            if batch % 500 == 0:
                # Commit and advance the cursor periodically so a dropped stream resumes.
                self.store.conn.commit()
                self.store.set_state(self.STATE_KEY, str(max_seen))
                log.info("lichess: %d streamed", stats["streamed"])
        self.store.conn.commit()
        if max_seen:
            self.store.set_state(self.STATE_KEY, str(max_seen))
        self.store.set_state("lichess.last_run", datetime.now(timezone.utc).isoformat())
        return stats
