"""Session context and tilt detection (spec §7.6). Private by default (§12).

Error rate = (mistakes + blunders) per 100 player moves. Compared:
  after a loss vs after a non-loss (tilt), with a 95% CI on the difference (two-proportion)
  by game index within a session (sessions split on gaps > 60 min)
  by hour of day (player's timezone)
"""
from __future__ import annotations

import json
import math
from collections import defaultdict
from datetime import datetime
from zoneinfo import ZoneInfo

from ..db import Store

SESSION_GAP_MIN = 60


def _rate(errors: int, moves: int) -> float | None:
    return errors / moves * 100 if moves else None


def _diff_ci(e1, m1, e2, m2, z=1.96):
    if not m1 or not m2:
        return None
    p1, p2 = e1 / m1, e2 / m2
    se = math.sqrt(p1 * (1 - p1) / m1 + p2 * (1 - p2) / m2)
    d = p1 - p2
    return {"diff_per_100": round(d * 100, 2), "ci_low": round((d - z * se) * 100, 2),
            "ci_high": round((d + z * se) * 100, 2), "significant": (d - z * se) > 0 or (d + z * se) < 0}


def run(store: Store, *, tz: str = "Europe/Brussels", speeds: tuple[str, ...] = ("blitz", "rapid", "classical")) -> dict:
    rows = store.conn.execute(
        "SELECT g.id, g.played_at, g.speed, g.source, g.result, g.opponent_rating, f.data FROM games g "
        "JOIN game_features f ON f.game_id=g.id WHERE g.variant='standard' ORDER BY g.played_at").fetchall()
    zone = ZoneInfo(tz)
    games = []
    for r in rows:
        if r["speed"] not in speeds:
            continue
        f = json.loads(r["data"])
        err = f["errors"]["mistake"] + f["errors"]["blunder"]
        games.append({"id": r["id"], "t": datetime.fromisoformat(r["played_at"]), "speed": r["speed"],
                      "result": r["result"], "errors": err, "moves": f["n_player_moves"]})
    if not games:
        return {"games": 0}

    # sessions
    sessions = []
    cur = []
    for g in games:
        if cur and (g["t"] - cur[-1]["t"]).total_seconds() > SESSION_GAP_MIN * 60:
            sessions.append(cur); cur = []
        cur.append(g)
    if cur:
        sessions.append(cur)

    after_loss = {"errors": 0, "moves": 0, "games": 0}
    after_other = {"errors": 0, "moves": 0, "games": 0}
    by_index = defaultdict(lambda: {"errors": 0, "moves": 0, "games": 0})
    by_hour = defaultdict(lambda: {"errors": 0, "moves": 0, "games": 0})
    lengths = []
    for s in sessions:
        lengths.append(len(s))
        for i, g in enumerate(s):
            bucket = min(i, 9)
            by_index[bucket]["errors"] += g["errors"]; by_index[bucket]["moves"] += g["moves"]; by_index[bucket]["games"] += 1
            if i > 0:
                tgt = after_loss if s[i - 1]["result"] == "loss" else after_other
                tgt["errors"] += g["errors"]; tgt["moves"] += g["moves"]; tgt["games"] += 1
            h = g["t"].astimezone(zone).hour
            by_hour[h]["errors"] += g["errors"]; by_hour[h]["moves"] += g["moves"]; by_hour[h]["games"] += 1

    tilt = _diff_ci(after_loss["errors"], after_loss["moves"], after_other["errors"], after_other["moves"])
    return {
        "games": len(games), "sessions": len(sessions),
        "session_length": {"mean": round(sum(lengths) / len(lengths), 1), "max": max(lengths),
                           "share_over_10": round(sum(1 for l in lengths if l > 10) / len(lengths), 3)},
        "tilt": {
            "after_loss": {**after_loss, "rate": _rate(after_loss["errors"], after_loss["moves"])},
            "after_other": {**after_other, "rate": _rate(after_other["errors"], after_other["moves"])},
            "difference": tilt,
        },
        "by_game_index": {str(k): {**v, "rate": _rate(v["errors"], v["moves"])} for k, v in sorted(by_index.items())},
        "by_hour": {str(k): {**v, "rate": _rate(v["errors"], v["moves"])} for k, v in sorted(by_hour.items())},
    }
