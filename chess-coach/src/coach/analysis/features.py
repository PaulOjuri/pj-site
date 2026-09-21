"""Per-game feature extraction over stored engine analysis (spec §7.3–7.6, minus tablebases).

Pure CPU over `game_analysis.moves`; no engine. Produces:
  motif_hits      one row per (error ply, motif, attribution) for the player's errors
  game_features   JSON per game: drift ranges, endgame entry, conversion, time-pressure stats
"""
from __future__ import annotations

import json
from dataclasses import asdict, dataclass, field

import chess

from ..db import Store
from .motifs import TAGGER_VERSION, tag_player_error

DRIFT_MIN_PLIES = 3          # consecutive own moves
DRIFT_MIN_TOTAL = 12.0       # total win% lost across the run
CONVERSION_CP = 200
ENDGAME_MATERIAL = 13        # total non-pawn material (both sides) at or below which it's an endgame

CLOCK_BUCKETS = [(0, 10, "<10s"), (10, 30, "10-30s"), (30, 60, "30-60s"), (60, 180, "1-3m"), (180, 10 ** 9, ">3m")]


def clock_bucket(seconds: float | None) -> str | None:
    if seconds is None:
        return None
    for lo, hi, name in CLOCK_BUCKETS:
        if lo <= seconds < hi:
            return name
    return None


def material_signature(board: chess.Board) -> tuple[str, int]:
    """Canonical endgame signature like 'R+P_vs_R', plus total non-pawn material."""
    def side(color):
        parts = []
        for pt, sym in ((chess.QUEEN, "Q"), (chess.ROOK, "R"), (chess.BISHOP, "B"), (chess.KNIGHT, "N")):
            n = len(board.pieces(pt, color))
            parts += [sym] * n
        p = len(board.pieces(chess.PAWN, color))
        s = "".join(parts) or "K"
        if p:
            s += f"+{p}P" if p > 1 else "+P"
        return s
    vals = {chess.QUEEN: 9, chess.ROOK: 5, chess.BISHOP: 3, chess.KNIGHT: 3}
    total = sum(vals[pt] * len(board.pieces(pt, c)) for pt in vals for c in (chess.WHITE, chess.BLACK))
    w, b = side(chess.WHITE), side(chess.BLACK)
    return f"{w}_vs_{b}", total


def _phase(ply: int, total_material: int) -> str:
    if total_material <= ENDGAME_MATERIAL:
        return "endgame"
    if ply < 20:
        return "opening"
    return "middlegame"


@dataclass
class GameFeatures:
    game_id: str
    player_color: str
    n_player_moves: int
    errors: dict                         # counts by classification, player only
    drift: list[dict] = field(default_factory=list)
    endgame: dict | None = None          # {entry_ply, signature, eval_at_entry, result}
    conversion: dict | None = None       # {max_eval, min_eval, failed_to_win, failed_to_hold}
    time_pressure: dict = field(default_factory=dict)   # bucket -> {moves, errors}
    speed_vs_complexity: dict = field(default_factory=dict)
    error_plies: list[int] = field(default_factory=list)
    first_error_ply: int | None = None


def extract(game_row, analysis_row) -> tuple[GameFeatures, list[dict]]:
    moves = json.loads(analysis_row["moves"])
    color = game_row["player_color"]
    mine = [m for m in moves if m["color"] == color]
    errors = {"inaccuracy": 0, "mistake": 0, "blunder": 0}
    error_plies = []
    for m in mine:
        if m["classification"] in errors:
            errors[m["classification"]] += 1
            error_plies.append(m["ply"])

    # --- motif hits ---------------------------------------------------------------
    hits = []
    for m in mine:
        if m["classification"] not in ("mistake", "blunder"):
            continue
        for h in tag_player_error(moves, m["ply"], color):
            hits.append({"game_id": game_row["id"], "ply": h.ply, "motif": h.motif, "attribution": h.attribution,
                         "fen": h.fen, "line": h.line, "detail": h.detail, "win_lost": m["win_lost"],
                         "classification": m["classification"], "played": m["uci"], "best": m["best_move"],
                         "phase": None})

    # --- positional drift: runs of >=3 own moves each losing >0 but <10 win%, totalling >=12 ---
    drift = []
    run: list[dict] = []
    def flush():
        if len(run) >= DRIFT_MIN_PLIES:
            total = sum(r["win_lost"] for r in run)
            if total >= DRIFT_MIN_TOTAL:
                drift.append({"from_ply": run[0]["ply"], "to_ply": run[-1]["ply"], "total_win_lost": round(total, 1),
                              "fen": run[0]["fen_before"]})
    for m in mine:
        if 0 < m["win_lost"] < 10:
            run.append(m)
        else:
            flush(); run = []
    flush()

    # --- endgame entry + conversion ----------------------------------------------------
    endgame = None
    board = chess.Board()
    phases = {}
    for m in moves:
        sig, total = material_signature(board)
        phases[m["ply"]] = _phase(m["ply"], total)
        if endgame is None and total <= ENDGAME_MATERIAL and m["ply"] >= 20:
            pov = m["eval_before"] if m["color"] == color else -m["eval_before"]
            endgame = {"entry_ply": m["ply"], "signature": sig, "eval_at_entry": pov, "result": game_row["result"]}
        board.push_uci(m["uci"])
    for h in hits:
        h["phase"] = phases.get(h["ply"])

    pov_evals = [(m["eval_before"] if m["color"] == color else -m["eval_before"]) for m in moves]
    conversion = None
    if pov_evals:
        mx, mn = max(pov_evals), min(pov_evals)
        conversion = {"max_eval": mx, "min_eval": mn,
                      "failed_to_win": mx >= CONVERSION_CP and game_row["result"] != "win",
                      "saved_lost": mn <= -CONVERSION_CP and game_row["result"] != "loss",   # swindle rate, a positive stat
                      "reached_winning": mx >= CONVERSION_CP, "reached_losing": mn <= -CONVERSION_CP}

    # --- time pressure and speed vs complexity --------------------------------------------
    tp: dict[str, dict] = {}
    for m in mine:
        b = clock_bucket(m.get("clock_after"))
        if b is None:
            continue
        d = tp.setdefault(b, {"moves": 0, "errors": 0, "win_lost": 0.0})
        d["moves"] += 1
        d["win_lost"] += m["win_lost"]
        if m["classification"] in errors:
            d["errors"] += 1
    svc: dict[str, dict] = {}
    for m in mine:
        if m.get("time_spent") is None or m.get("is_critical") is None:
            continue
        key = "critical" if m["is_critical"] else "routine"
        d = svc.setdefault(key, {"moves": 0, "time": 0.0, "errors": 0, "fast_errors": 0})
        d["moves"] += 1
        d["time"] += m["time_spent"]
        if m["classification"] in errors:
            d["errors"] += 1
            if m["time_spent"] < 5:
                d["fast_errors"] += 1

    gf = GameFeatures(game_id=game_row["id"], player_color=color, n_player_moves=len(mine), errors=errors,
                      drift=drift, endgame=endgame, conversion=conversion, time_pressure=tp,
                      speed_vs_complexity=svc, error_plies=error_plies,
                      first_error_ply=error_plies[0] if error_plies else None)
    return gf, hits


def run(store: Store, *, limit: int | None = None, force: bool = False) -> dict:
    rows = store.games_for_features(TAGGER_VERSION, force=force, limit=limit)
    stats = {"games": 0, "hits": 0}
    for g, a in rows:
        gf, hits = extract(g, a)
        with store.tx():
            store.save_features(g["id"], TAGGER_VERSION, json.dumps(asdict(gf)), hits)
        stats["games"] += 1
        stats["hits"] += len(hits)
    return stats
