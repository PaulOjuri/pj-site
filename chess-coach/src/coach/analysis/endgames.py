"""Tablebase-exact endgame technique (spec §7.5).

For every player move in a position with <= 7 pieces, probe the Lichess tablebase for the
position before and after the move. `tablebase_accuracy` = share of moves that preserve
the theoretical result. Probes are serial, cached forever by FEN, and capped per run.
"""
from __future__ import annotations

import json
import logging

import chess

from ..db import Store
from ..ingest.http import SerialClient

log = logging.getLogger(__name__)
TB_URL = "https://tablebase.lichess.ovh/standard"
MAX_PIECES = 7
CATEGORY_RANK = {"loss": -2, "maybe-loss": -2, "blessed-loss": -1, "draw": 0, "cursed-win": 1, "maybe-win": 2, "win": 2}


def probe(client: SerialClient, fen: str) -> dict | None:
    f = client.get(TB_URL, params={"fen": fen}, final=True)
    if f.status != 200 or not f.body:
        return None
    return json.loads(f.body)


def _pov(cat: str | None, side_to_move_is_player: bool) -> int | None:
    if cat is None or cat not in CATEGORY_RANK:
        return None
    v = CATEGORY_RANK[cat]
    return v if side_to_move_is_player else -v


def run(store: Store, client: SerialClient, *, max_probes: int = 300) -> dict:
    """Walk analysed games newest-first (slow formats first); probe player's moves in TB range."""
    rows = store.conn.execute(
        "SELECT g.id, g.player_color, a.moves FROM games g JOIN game_analysis a ON a.game_id=g.id "
        "LEFT JOIN tb_games t ON t.game_id=g.id WHERE g.variant='standard' AND t.game_id IS NULL "
        "ORDER BY CASE g.source WHEN 'otb' THEN 0 ELSE 1 END, "
        "CASE g.speed WHEN 'classical' THEN 0 WHEN 'rapid' THEN 1 WHEN 'blitz' THEN 2 ELSE 3 END, g.played_at DESC").fetchall()
    stats = {"games": 0, "moves": 0, "probes": 0, "preserved": 0, "skipped_no_tb": 0}
    for r in rows:
        if stats["probes"] >= max_probes:
            break
        moves = json.loads(r["moves"])
        color = r["player_color"]
        results = []
        complete = True
        board = chess.Board()
        for m in moves:
            fen_before = board.fen()
            board.push_uci(m["uci"])
            if m["color"] != color:
                continue
            if len(chess.Board(fen_before).piece_map()) > MAX_PIECES:
                continue
            if stats["probes"] >= max_probes:
                complete = False
                break
            before = probe(client, fen_before); stats["probes"] += 1
            after = probe(client, board.fen()); stats["probes"] += 1
            if before is None or after is None:
                stats["skipped_no_tb"] += 1
                continue
            v_before = _pov(before.get("category"), True)
            v_after = _pov(after.get("category"), False)   # opponent to move after our move
            if v_before is None or v_after is None:
                continue
            preserved = v_after >= v_before
            best = (before.get("moves") or [{}])[0].get("uci")
            results.append({"ply": m["ply"], "fen": fen_before, "played": m["uci"], "tb_best": best,
                            "before": before.get("category"), "after": after.get("category"),
                            "dtz_before": before.get("dtz"), "preserved": preserved})
            stats["moves"] += 1
            stats["preserved"] += int(preserved)
        if not complete:
            break   # partial game: leave it for the next run
        n = len(results)
        acc = (sum(1 for x in results if x["preserved"]) / n) if n else None
        with store.tx():
            store.conn.execute(
                "INSERT OR REPLACE INTO tb_games (game_id, moves_in_tb, preserved, accuracy, data) VALUES (?,?,?,?,?)",
                (r["id"], n, sum(1 for x in results if x["preserved"]), acc, json.dumps(results)))
        stats["games"] += 1
    return stats
