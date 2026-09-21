"""Online profile snapshots: chess.com stats and Lichess perfs, stored in sync_state."""
from __future__ import annotations

import json
from datetime import datetime, timezone

from ..db import Store
from .http import SerialClient


def fetch_chesscom(client: SerialClient, store: Store, username: str) -> dict:
    f = client.get(f"https://api.chess.com/pub/player/{username}/stats")
    stats = json.loads(f.body)
    out = {"username": username, "fetched_at": datetime.now(timezone.utc).isoformat(), "ratings": {}}
    for key in ("chess_bullet", "chess_blitz", "chess_rapid", "chess_daily"):
        if key in stats:
            s = stats[key]
            out["ratings"][key.removeprefix("chess_")] = {
                "rating": s.get("last", {}).get("rating"), "rd": s.get("last", {}).get("rd"),
                "best": s.get("best", {}).get("rating"), "record": s.get("record"),
            }
    store.set_state("profile.chesscom", json.dumps(out))
    return out


def fetch_lichess(client: SerialClient, store: Store, username: str) -> dict:
    f = client.get(f"https://lichess.org/api/user/{username}")
    u = json.loads(f.body)
    out = {"username": u.get("username", username), "fetched_at": datetime.now(timezone.utc).isoformat(),
           "ratings": {k: {"rating": v.get("rating"), "rd": v.get("rd"), "games": v.get("games"), "prov": v.get("prov", False)}
                       for k, v in (u.get("perfs") or {}).items() if "rating" in v}}
    store.set_state("profile.lichess", json.dumps(out))
    return out
