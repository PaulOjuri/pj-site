"""Evidence pack for the weekly briefing (spec §11). Only what the pipeline computed; nothing
private (session/tilt, hour of day, notes). Every item the model may cite carries an id.
"""
from __future__ import annotations

import json
from datetime import datetime, timezone

import chess

from ..db import Store


def _san(fen: str, uci: str | None) -> str | None:
    """Moves are given to the model in SAN so it never has to convert notation itself."""
    if not uci:
        return None
    try:
        b = chess.Board(fen)
        return b.san(chess.Move.from_uci(uci))
    except (ValueError, AssertionError):
        return uci


def build(store: Store, plan: dict, leaks: dict, title: dict | None) -> dict:
    valid = [l for l in leaks["leaks"] if l["validated"]][:8]
    target_tags = {t["tag"] for t in plan["targets"]}
    positions = []
    for l in valid:
        if l["tag"] not in target_tags:
            continue
        for e in l["evidence"][:3]:
            if e.get("fen"):
                positions.append({"leak_tag": l["tag"], "game_id": e["game_id"], "ply": e["ply"], "fen": e["fen"],
                                  "move_number": e["ply"] // 2 + 1, "played": _san(e["fen"], e.get("played")),
                                  "best": _san(e["fen"], e.get("best")), "win_pct_lost": e["win_lost"],
                                  "date": e["played_at"][:10], "speed": e["speed"], "detail": e.get("detail")})
    # last two evaluated cycles
    cycles = []
    for row in store.conn.execute("SELECT data FROM plans WHERE evaluated_at IS NOT NULL ORDER BY week_start DESC LIMIT 2"):
        p = json.loads(row["data"])
        for t in p["targets"]:
            o = t["success"].get("outcome")
            if o:
                cycles.append({"week_start": p["week_start"], "leak_tag": t["tag"], "verdict": o["verdict"],
                               "baseline": t["success"]["baseline"], "target": t["success"]["target"],
                               "measured": o["measured"], "games": o["games"]})
    # form over the last 4 weeks vs the previous 4, rapid+ only
    def window(days_from, days_to):
        r = store.conn.execute(
            "SELECT COUNT(*) n, AVG(CASE g.player_color WHEN 'white' THEN a.accuracy_white ELSE a.accuracy_black END) acc, "
            "SUM(CASE g.result WHEN 'win' THEN 1 ELSE 0 END)*1.0/MAX(COUNT(*),1) score "
            "FROM games g JOIN game_analysis a ON a.game_id=g.id WHERE g.variant='standard' AND g.speed IN ('rapid','classical') "
            "AND g.played_at >= datetime('now', ?) AND g.played_at < datetime('now', ?)", (f"-{days_from} days", f"-{days_to} days")).fetchone()
        return {"games": r["n"], "accuracy": round(r["acc"], 1) if r["acc"] else None, "win_rate": round(r["score"], 2) if r["n"] else None}
    form = {"last_28_days": window(28, 0), "previous_28_days": window(56, 28)}
    sessions_done = {r["session_id"]: bool(r["done"]) for r in store.conn.execute("SELECT session_id, done FROM session_done")} \
        if store.conn.execute("SELECT 1 FROM sqlite_master WHERE name='session_done'").fetchone() else {}
    return {
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "week": {"index": plan["week_index"], "start": plan["week_start"], "phase": plan["phase"]["name"], "deload": plan["deload"],
                 "taper": plan["taper"], "hours": plan["hours_planned"]},
        "targets": [{"leak_tag": t["tag"], "description": t["description"], "status": t["status"], "role": t["role"], "n": t["n"],
                     "frequency_per_100": t["frequency_per_100"], "severity": t["severity"], "kind": t["kind"],
                     "success_metric": {k: v for k, v in t["success"].items() if k in ("metric", "baseline", "target", "window", "min_games")}}
                    for t in plan["targets"]],
        "leaks": [{"leak_tag": l["tag"], "description": l["description"], "status": l["status"], "n": l["n"],
                   "frequency_per_100": l["frequency_per_100"], "rate_ci": l["rate_ci"], "severity": l["severity"],
                   "trend": l["trend"]} for l in valid],
        "positions": positions,
        "sessions": [{"id": s["id"], "day": s["day"], "type": s["type"], "title": s["title"], "duration_min": s["duration_min"],
                      "done": sessions_done.get(s["id"])} for s in plan["sessions"]],
        "last_cycles": cycles,
        "form_rapid_classical": form,
        "title": ({"fide_standard": title["fide"]["standard"], "standard_inactive": title["fide"]["standard_inactive"],
                   "rated_games_12m": title["fide"]["rated_games_12m_on_record"],
                   "wacc_days_to_registration": title["routes"]["wacc_u2000"]["days_to_registration"],
                   "wacc_eligible": title["routes"]["wacc_u2000"]["eligible_now"],
                   "p_reach_2200_scenario": title["monte_carlo"]["scenario"]["p_reach"].get("2200"),
                   "p_reach_2000_scenario": title["monte_carlo"]["scenario"]["p_reach"].get("2000")} if title else None),
        "pool": {"games": leaks["pool_games"], "weighted": leaks["pool_weighted"], "by_speed": leaks["pool_by_speed"]},
        "warnings": plan["warnings"],
    }
