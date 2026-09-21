"""Drill asset generation (spec §8.5): themed puzzle sets from the local Lichess puzzle DB,
own-game positions, endgame drills from failed conversions, calculation sets, annotation tasks.
"""
from __future__ import annotations

import csv
import json
import logging
import random
import sqlite3
import subprocess
from datetime import datetime
from pathlib import Path

import chess

from ..config import DATA_DIR
from ..db import Store

log = logging.getLogger(__name__)
PUZZLE_CSV = DATA_DIR / "puzzles" / "lichess_db_puzzle.csv.zst"
PUZZLE_DB = DATA_DIR / "puzzles" / "puzzles.db"

# Our leak tags -> Lichess puzzle themes.
THEMES_FOR_TAG = {
    "fork": ["fork"], "knight_fork": ["fork"], "royal_fork": ["fork"], "queen_fork": ["fork"], "pawn_fork": ["fork"],
    "skewer": ["skewer"], "discovered_attack": ["discoveredAttack"], "discovered_check": ["discoveredAttack"],
    "double_check": ["doubleCheck"], "sacrifice": ["sacrifice"], "promotion": ["promotion", "advancedPawn"],
    "mate_in_n": ["mateIn2", "mateIn3"], "pin": ["pin"], "hanging_piece": ["hangingPiece"], "trapped_piece": ["trappedPiece"],
    "deflection": ["deflection"], "zwischenzug": ["intermezzo"], "back_rank": ["backRankMate"],
    "endgame_errors": ["endgame"], "conversion_fail_win": ["advantage", "endgame"],
    "positional": ["quietMove"], "positional_drift": ["quietMove"], "fast_critical_errors": ["crushing"],
    "time_trouble_errors": ["short"], "opening_errors": ["opening"],
}


def index_puzzles(*, rating_lo: int = 1000, rating_hi: int = 2800, min_popularity: int = 50) -> int:
    """One-off: stream the CSV into an indexed SQLite file (gitignored). Returns row count."""
    if PUZZLE_DB.exists():
        PUZZLE_DB.unlink()
    db = sqlite3.connect(PUZZLE_DB)
    db.executescript("""
      CREATE TABLE puzzles (id TEXT PRIMARY KEY, fen TEXT, moves TEXT, rating INTEGER, rd INTEGER, popularity INTEGER,
                            plays INTEGER, themes TEXT, url TEXT, opening TEXT);
      PRAGMA journal_mode=OFF; PRAGMA synchronous=OFF;
    """)
    proc = subprocess.Popen(["zstd", "-dc", str(PUZZLE_CSV)], stdout=subprocess.PIPE, text=True)
    reader = csv.DictReader(proc.stdout)
    batch, n = [], 0
    for r in reader:
        try:
            rating, pop = int(r["Rating"]), int(r["Popularity"])
        except ValueError:
            continue
        if not (rating_lo <= rating <= rating_hi) or pop < min_popularity:
            continue
        batch.append((r["PuzzleId"], r["FEN"], r["Moves"], rating, int(r["RatingDeviation"] or 0), pop,
                      int(r["NbPlays"] or 0), " " + r["Themes"] + " ", r["GameUrl"], r.get("OpeningTags", "")))
        if len(batch) >= 20000:
            db.executemany("INSERT OR IGNORE INTO puzzles VALUES (?,?,?,?,?,?,?,?,?,?)", batch)
            n += len(batch); batch = []
    if batch:
        db.executemany("INSERT OR IGNORE INTO puzzles VALUES (?,?,?,?,?,?,?,?,?,?)", batch)
        n += len(batch)
    db.execute("CREATE INDEX idx_rating ON puzzles(rating)")
    db.commit(); db.close()
    proc.stdout.close(); proc.wait()
    return n


def puzzle_set(themes: list[str], *, rating: int, band: int = 100, n: int = 20, seed: int = 0,
               exclude: set[str] | None = None) -> list[dict]:
    """n puzzles matching any of `themes` within rating±band, deterministic for a seed."""
    if not PUZZLE_DB.exists():
        return []
    db = sqlite3.connect(PUZZLE_DB)
    db.row_factory = sqlite3.Row
    rows = db.execute("SELECT * FROM puzzles WHERE rating BETWEEN ? AND ? ORDER BY plays DESC LIMIT 60000",
                      (rating - band, rating + band)).fetchall()
    db.close()
    exclude = exclude or set()
    hits = [r for r in rows if r["id"] not in exclude and any(f" {t} " in r["themes"] for t in themes)]
    rng = random.Random(seed)
    rng.shuffle(hits)
    out = []
    for r in hits[:n]:
        board = chess.Board(r["fen"])
        moves = r["moves"].split()
        board.push_uci(moves[0])
        out.append({"id": r["id"], "fen": board.fen(), "solution": moves[1:], "rating": r["rating"],
                    "themes": r["themes"].split(), "url": f"https://lichess.org/training/{r['id']}"})
    return out


def own_game_positions(store: Store, tag: str, *, n: int = 12) -> list[dict]:
    """The position one ply before each of the player's errors carrying this tag, as puzzles."""
    motif, _, attribution = tag.partition(":")
    q = ("SELECT h.game_id, h.ply, h.fen, h.played, h.best, h.win_lost, h.line, g.url, g.played_at, g.player_color "
         "FROM motif_hits h JOIN games g ON g.id=h.game_id WHERE h.motif=? " +
         ("AND h.attribution=? " if attribution else "") + "ORDER BY h.win_lost DESC LIMIT ?")
    params = [motif] + ([attribution] if attribution else []) + [n]
    out = []
    for r in store.conn.execute(q, params):
        # For own_tactic_missed the puzzle is the position itself (find the best move).
        # For opponent_tactic_missed the position is after the played move: find the refutation.
        line = json.loads(r["line"])
        out.append({"id": f"own:{r['game_id']}:{r['ply']}:{motif}", "fen": r["fen"], "solution": line[:4],
                    "prompt": ("Find the strongest continuation." if attribution == "own_tactic_missed"
                               else "You just played this move in the game. What did it allow?"),
                    "game_id": r["game_id"], "ply": r["ply"], "url": r["url"], "played_at": r["played_at"],
                    "win_lost": r["win_lost"], "tag": tag})
    return out


def endgame_drills(store: Store, *, n: int = 8) -> list[dict]:
    """Endgame entries that should have gone better: winnable (>= +1.5) but not won, or holdable
    (>= -1.5) but lost. Played out against the engine from the entry position."""
    out = []
    for r in store.conn.execute(
            "SELECT g.id, g.url, g.played_at, g.player_color, g.result, f.data FROM games g JOIN game_features f ON f.game_id=g.id "
            "WHERE g.variant='standard' ORDER BY g.played_at DESC LIMIT 3000"):
        f = json.loads(r["data"])
        eg = f.get("endgame")
        if not eg:
            continue
        ev = eg["eval_at_entry"]
        if ev >= 150 and r["result"] != "win":
            goal = "win"
        elif ev >= -150 and r["result"] == "loss":
            goal = "hold"
        else:
            continue
        out.append({"id": f"eg:{r['id']}:{eg['entry_ply']}", "game_id": r["id"], "ply": eg["entry_ply"],
                    "signature": eg["signature"], "eval_at_entry": ev, "result": r["result"], "goal": goal,
                    "url": r["url"], "played_at": r["played_at"], "color": r["player_color"]})
        if len(out) >= n:
            break
    for d in out:
        a = store.get_analysis(d["game_id"])
        if a:
            moves = json.loads(a["moves"])
            d["fen"] = moves[d["ply"]]["fen_before"]
    return [d for d in out if d.get("fen")]


def calculation_set(store: Store, *, n: int = 20, seed: int = 0) -> list[dict]:
    """`is_only_move` positions from the player's own games, for no-board-movement calculation."""
    out = []
    for r in store.conn.execute("SELECT g.id, g.url, g.player_color, a.moves FROM game_analysis a JOIN games g ON g.id=a.game_id "
                                "WHERE g.variant='standard' ORDER BY g.played_at DESC LIMIT 1500"):
        for m in json.loads(r["moves"]):
            if m["color"] == r["player_color"] and m.get("is_only_move") and m.get("pv_cps"):
                out.append({"id": f"calc:{r['id']}:{m['ply']}", "fen": m["fen_before"], "solution": m["best_pv"][:6],
                            "game_id": r["id"], "ply": m["ply"], "url": r["url"], "found_in_game": m["is_best"],
                            "gap_cp": m["pv_cps"][0] - m["pv_cps"][1] if len(m["pv_cps"]) > 1 else None})
    rng = random.Random(seed)
    rng.shuffle(out)
    return out[:n]


def annotation_task(store: Store) -> dict | None:
    """The most recent long game (rapid or slower) as the unassisted-annotation assignment."""
    r = store.conn.execute("SELECT g.id, g.url, g.played_at, g.speed, g.result, g.white_name, g.black_name FROM games g "
                           "JOIN game_analysis a ON a.game_id=g.id WHERE g.variant='standard' AND g.speed IN "
                           "('rapid','classical') ORDER BY g.played_at DESC LIMIT 1").fetchone()
    if not r:
        return None
    return {"game_id": r["id"], "url": r["url"], "played_at": r["played_at"], "speed": r["speed"], "result": r["result"],
            "white": r["white_name"], "black": r["black_name"]}
