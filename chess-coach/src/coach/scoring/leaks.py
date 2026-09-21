"""Leak scoring (spec §8.1).

    frequency(t)  = Σ occurrences×w / Σ games×w × 100        (occurrences per 100 weighted games)
    severity(t)   = mean win% lost per occurrence
    recency(t)    = weighted mean of exp(-ln2 · age_days / 60) over occurrences, in (0, 1]
    leak_score(t) = frequency × severity × recency

Source weights (§7.7) already encode the format; OTB counts fully, bullet barely.
Every leak carries n, n_effective, a Wilson interval on the per-game rate, a status
(confirmed ≥12 / provisional 5–11 / watch <5), a 60-day trend, and evidence links.
Only motifs that passed tagger validation (reports/tagger_validation.json) are ranked.
"""
from __future__ import annotations

import json
import math
from collections import defaultdict
from datetime import datetime, timedelta, timezone

from ..analysis.budget import weight_for
from ..config import ROOT
from ..db import Store

HALF_LIFE_DAYS = 60.0
CONFIRMED_N = 12
PROVISIONAL_N = 5
TREND_WINDOW_DAYS = 60
TREND_MIN_N = 5
EVIDENCE_PER_LEAK = 8

DESCRIPTIONS = {
    "positional_drift": "Slow eval slides over several quiet moves with no single big error",
    "conversion_fail_win": "Reached a clearly winning position (≥ +2) and did not win",
    "time_trouble_errors": "Errors made with under 30 seconds on the clock",
    "fast_critical_errors": "Errors in critical positions after thinking under 5 seconds",
    "endgame_errors": "Mistakes and blunders once the game reached an endgame",
    "opening_errors": "Mistakes and blunders inside the first 10 moves",
    "positional:blunder_committed": "Mistakes and blunders with no tactical shape (judgement, not calculation)",
}


def eligible_motifs() -> set[str]:
    path = ROOT / "reports" / "tagger_validation.json"
    if not path.exists():
        return set()
    return set(json.loads(path.read_text()).get("eligible_motifs", []))


def wilson(k: float, n: float, z: float = 1.96) -> tuple[float, float]:
    if n <= 0:
        return 0.0, 0.0
    p = k / n
    denom = 1 + z * z / n
    centre = p + z * z / (2 * n)
    half = z * math.sqrt(p * (1 - p) / n + z * z / (4 * n * n))
    return max(0.0, (centre - half) / denom), min(1.0, (centre + half) / denom)


def decay(age_days: float) -> float:
    return math.exp(-math.log(2) * max(0.0, age_days) / HALF_LIFE_DAYS)


def describe(tag: str) -> str:
    if tag in DESCRIPTIONS:
        return DESCRIPTIONS[tag]
    motif, _, attr = tag.partition(":")
    name = motif.replace("_", " ")
    if attr == "own_tactic_missed":
        return f"Missed your own {name} (calculation / board vision)"
    if attr == "opponent_tactic_missed":
        return f"Allowed the opponent a {name} (blunder-check / prophylaxis)"
    return name


def collect(store: Store, *, now: datetime | None = None) -> dict:
    """Gather weighted occurrences per tag and the weighted game pool."""
    now = now or datetime.now(timezone.utc)
    games = {}
    for g in store.conn.execute(
            "SELECT g.id, g.source, g.speed, g.base_seconds, g.played_at, g.url, g.result, g.player_color, "
            "g.white_name, g.black_name, g.opponent_rating, f.data "
            "FROM games g JOIN game_features f ON f.game_id=g.id WHERE g.variant='standard'"):
        w = weight_for(g["source"], g["speed"], g["base_seconds"])
        played = datetime.fromisoformat(g["played_at"])
        games[g["id"]] = {"w": w, "played_at": played, "age": (now - played).days, "url": g["url"],
                          "features": json.loads(g["data"]), "speed": g["speed"], "source": g["source"],
                          "opponent": g["black_name"] if g["player_color"] == "white" else g["white_name"],
                          "opponent_rating": g["opponent_rating"], "result": g["result"]}
    occ: dict[str, list[dict]] = defaultdict(list)

    def add(tag, gid, ply, win_lost, fen=None, extra=None):
        g = games[gid]
        occ[tag].append({"game_id": gid, "ply": ply, "win_lost": float(win_lost), "w": g["w"], "age": g["age"],
                         "played_at": g["played_at"].isoformat(), "url": g["url"], "fen": fen, "speed": g["speed"],
                         **(extra or {})})

    for h in store.conn.execute("SELECT * FROM motif_hits"):
        if h["game_id"] not in games:
            continue
        add(f"{h['motif']}:{h['attribution']}", h["game_id"], h["ply"], h["win_lost"], h["fen"],
            {"played": h["played"], "best": h["best"], "line": json.loads(h["line"]), "detail": h["detail"],
             "classification": h["classification"], "phase": h["phase"]})

    for gid, g in games.items():
        f = g["features"]
        for d in f.get("drift", []):
            add("positional_drift", gid, d["from_ply"], d["total_win_lost"], d["fen"], {"to_ply": d["to_ply"]})
        c = f.get("conversion") or {}
        if c.get("failed_to_win"):
            add("conversion_fail_win", gid, 0, 50.0, None, {"max_eval": c["max_eval"]})
        for bucket, d in (f.get("time_pressure") or {}).items():
            if bucket in ("<10s", "10-30s"):
                for _ in range(d["errors"]):
                    add("time_trouble_errors", gid, -1, d["win_lost"] / max(1, d["errors"]))
        crit = (f.get("speed_vs_complexity") or {}).get("critical")
        if crit:
            for _ in range(crit["fast_errors"]):
                add("fast_critical_errors", gid, -1, 20.0)
    for h in store.conn.execute("SELECT game_id, ply, win_lost, phase, fen FROM motif_hits "
                                "WHERE classification IN ('mistake','blunder') GROUP BY game_id, ply"):
        if h["game_id"] not in games:
            continue
        if h["phase"] == "endgame":
            add("endgame_errors", h["game_id"], h["ply"], h["win_lost"], h["fen"])
        elif h["phase"] == "opening":
            add("opening_errors", h["game_id"], h["ply"], h["win_lost"], h["fen"])
    return {"games": games, "occurrences": occ, "now": now}


def score(collected: dict) -> list[dict]:
    games, occ, now = collected["games"], collected["occurrences"], collected["now"]
    pool_w = sum(g["w"] for g in games.values())
    pool_n = len(games)
    eligible = eligible_motifs()
    cutoff_recent = now - timedelta(days=TREND_WINDOW_DAYS)
    cutoff_prev = now - timedelta(days=2 * TREND_WINDOW_DAYS)
    leaks = []
    for tag, items in occ.items():
        motif = tag.split(":")[0]
        validated = motif in eligible or tag in DESCRIPTIONS
        n = len(items)
        n_eff = sum(i["w"] for i in items)
        games_hit = {i["game_id"] for i in items}
        games_hit_w = sum(games[g]["w"] for g in games_hit)
        frequency = (n_eff / pool_w * 100) if pool_w else 0.0
        severity = sum(i["win_lost"] for i in items) / n if n else 0.0
        recency = (sum(i["w"] * decay(i["age"]) for i in items) / n_eff) if n_eff else 0.0
        leak_score = frequency * severity * recency
        lo, hi = wilson(games_hit_w, pool_w)
        status = "confirmed" if n >= CONFIRMED_N else "provisional" if n >= PROVISIONAL_N else "watch"

        def window_rate(start, end):
            gs = [g for g in games.values() if start <= g["played_at"] < end]
            gw = sum(g["w"] for g in gs)
            its = [i for i in items if start <= datetime.fromisoformat(i["played_at"]) < end]
            return (sum(i["w"] for i in its) / gw * 100 if gw else None), len(its)
        recent, n_recent = window_rate(cutoff_recent, now + timedelta(days=1))
        prev, n_prev = window_rate(cutoff_prev, cutoff_recent)
        if recent is None or prev is None or n_recent < TREND_MIN_N or n_prev < TREND_MIN_N:
            trend = {"state": "not_enough_data", "recent": recent, "previous": prev, "n_recent": n_recent, "n_previous": n_prev}
        else:
            change = (recent - prev) / prev * 100 if prev else None
            state = "flat" if change is None or abs(change) < 15 else ("worse" if change > 0 else "better")
            trend = {"state": state, "recent": round(recent, 2), "previous": round(prev, 2),
                     "change_pct": round(change, 1) if change is not None else None,
                     "n_recent": n_recent, "n_previous": n_prev}
        evidence = sorted(items, key=lambda i: i["win_lost"] * i["w"], reverse=True)[:EVIDENCE_PER_LEAK]
        leaks.append({
            "tag": tag, "description": describe(tag), "validated": validated,
            "n": n, "n_effective": round(n_eff, 2), "games_with": len(games_hit),
            "frequency_per_100": round(frequency, 2), "rate_ci": [round(lo * 100, 2), round(hi * 100, 2)],
            "severity": round(severity, 2), "recency": round(recency, 3), "leak_score": round(leak_score, 2),
            "status": status, "trend": trend,
            "evidence": [{k: v for k, v in e.items() if k not in ("w", "age")} for e in evidence],
        })
    leaks.sort(key=lambda l: (l["validated"], l["leak_score"]), reverse=True)
    return leaks


def run(store: Store, *, now: datetime | None = None) -> dict:
    col = collect(store, now=now)
    leaks = score(col)
    pool = col["games"]
    by_speed = defaultdict(int)
    for g in pool.values():
        by_speed[g["speed"]] += 1
    out = {"computed_at": (now or datetime.now(timezone.utc)).isoformat(), "pool_games": len(pool),
           "pool_weighted": round(sum(g["w"] for g in pool.values()), 1), "pool_by_speed": dict(by_speed),
           "leaks": leaks}
    store.set_state("leaks.latest", json.dumps(out))
    return out
