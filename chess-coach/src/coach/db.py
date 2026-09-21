"""SQLite store. One file, WAL mode, schema created on open.

Tables:
  games       canonical games (spec §6.5), unique on id, dedup_key indexed
  http_cache  per-URL ETag / Last-Modified / body cache for conditional requests
  sync_state  key/value cursor store (e.g. lichess max createdAt)
"""
from __future__ import annotations

import json
import sqlite3
from contextlib import contextmanager
from datetime import datetime, timezone
from pathlib import Path

from .models import Game

SCHEMA = """
CREATE TABLE IF NOT EXISTS games (
  id TEXT PRIMARY KEY,
  source TEXT NOT NULL,
  source_id TEXT NOT NULL,
  url TEXT,
  played_at TEXT NOT NULL,
  time_control_raw TEXT,
  base_seconds INTEGER,
  increment_seconds INTEGER,
  speed TEXT NOT NULL,
  rated INTEGER NOT NULL DEFAULT 0,
  fide_rated INTEGER NOT NULL DEFAULT 0,
  variant TEXT NOT NULL DEFAULT 'standard',
  white_name TEXT NOT NULL, white_rating INTEGER, white_title TEXT,
  black_name TEXT NOT NULL, black_rating INTEGER, black_title TEXT,
  player_color TEXT NOT NULL,
  opponent_rating INTEGER,
  rating_diff INTEGER,
  result TEXT NOT NULL,
  termination TEXT,
  eco TEXT, opening_name TEXT, opening_ply INTEGER,
  pgn TEXT NOT NULL,
  movetext TEXT NOT NULL,
  final_fen TEXT NOT NULL,
  ply_count INTEGER NOT NULL,
  clock_times TEXT,
  event TEXT, round TEXT, note TEXT,
  source_accuracy_white REAL, source_accuracy_black REAL,
  dedup_key TEXT NOT NULL,
  analysis_version TEXT,
  extra TEXT NOT NULL DEFAULT '{}',
  ingested_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_games_dedup ON games(dedup_key);
CREATE INDEX IF NOT EXISTS idx_games_played ON games(played_at);
CREATE INDEX IF NOT EXISTS idx_games_source_speed ON games(source, speed);

CREATE TABLE IF NOT EXISTS http_cache (
  url TEXT PRIMARY KEY,
  etag TEXT,
  last_modified TEXT,
  status INTEGER,
  body_path TEXT,
  final INTEGER NOT NULL DEFAULT 0,   -- 1 = immutable resource, never request again
  gone INTEGER NOT NULL DEFAULT 0,    -- 1 = server returned 410, never request again
  fetched_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS game_analysis (
  game_id TEXT PRIMARY KEY REFERENCES games(id),
  analysis_version TEXT NOT NULL,
  nodes INTEGER NOT NULL,
  accuracy_white REAL, accuracy_black REAL,
  acpl_white REAL, acpl_black REAL,
  counts TEXT NOT NULL,          -- {"white": {"blunder": n, ...}, "black": {...}}
  moves TEXT NOT NULL,           -- JSON list of MoveRecord
  analysed_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS evals (
  fen TEXT NOT NULL,
  nodes INTEGER NOT NULL,
  multipv INTEGER NOT NULL,
  engine TEXT NOT NULL,
  data TEXT NOT NULL,
  PRIMARY KEY (fen, nodes, multipv, engine)
);

CREATE TABLE IF NOT EXISTS game_features (
  game_id TEXT PRIMARY KEY REFERENCES games(id),
  tagger_version TEXT NOT NULL,
  data TEXT NOT NULL,
  computed_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS motif_hits (
  game_id TEXT NOT NULL REFERENCES games(id),
  ply INTEGER NOT NULL,
  motif TEXT NOT NULL,
  attribution TEXT NOT NULL,
  fen TEXT NOT NULL,
  line TEXT NOT NULL,
  detail TEXT,
  win_lost REAL NOT NULL,
  classification TEXT NOT NULL,
  played TEXT, best TEXT, phase TEXT,
  PRIMARY KEY (game_id, ply, motif, attribution)
);
CREATE INDEX IF NOT EXISTS idx_hits_motif ON motif_hits(motif, attribution);

CREATE TABLE IF NOT EXISTS tb_games (
  game_id TEXT PRIMARY KEY REFERENCES games(id),
  moves_in_tb INTEGER NOT NULL,
  preserved INTEGER NOT NULL,
  accuracy REAL,
  data TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS sync_state (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
"""

GAME_COLUMNS = [
    "id", "source", "source_id", "url", "played_at", "time_control_raw", "base_seconds",
    "increment_seconds", "speed", "rated", "fide_rated", "variant",
    "white_name", "white_rating", "white_title", "black_name", "black_rating", "black_title",
    "player_color", "opponent_rating", "rating_diff", "result", "termination",
    "eco", "opening_name", "opening_ply", "pgn", "movetext", "final_fen", "ply_count",
    "clock_times", "event", "round", "note", "source_accuracy_white", "source_accuracy_black",
    "dedup_key", "analysis_version", "extra", "ingested_at",
]


def _now() -> str:
    return datetime.now(timezone.utc).isoformat()


class Store:
    def __init__(self, path: Path | str):
        self.path = Path(path)
        self.path.parent.mkdir(parents=True, exist_ok=True)
        self.conn = sqlite3.connect(self.path, timeout=60)
        self.conn.row_factory = sqlite3.Row
        self.conn.execute("PRAGMA journal_mode=WAL")
        self.conn.executescript(SCHEMA)

    def close(self) -> None:
        self.conn.close()

    @contextmanager
    def tx(self):
        try:
            yield self.conn
            self.conn.commit()
        except Exception:
            self.conn.rollback()
            raise

    # --- games -----------------------------------------------------------

    def has_game(self, game_id: str) -> bool:
        return self.conn.execute("SELECT 1 FROM games WHERE id=?", (game_id,)).fetchone() is not None

    def find_by_dedup(self, dedup_key: str) -> list[sqlite3.Row]:
        return self.conn.execute("SELECT id, source FROM games WHERE dedup_key=?", (dedup_key,)).fetchall()

    def insert_game(self, g: Game) -> str:
        """Insert a game. Returns 'inserted', 'exists' or 'duplicate'.

        Dedup rule: the same (source, source_id) is always skipped. A dedup_key collision
        is treated as a duplicate only when either side is an OTB game, because a manually
        entered OTB game is the case the spec calls out; two short online games with the same
        moves on the same day are legitimately distinct games with distinct source ids.
        """
        if self.has_game(g.id):
            return "exists"
        clash = self.find_by_dedup(g.dedup_key)
        if clash and (g.source == "otb" or any(r["source"] == "otb" for r in clash)):
            return "duplicate"
        row = {
            "id": g.id, "source": g.source, "source_id": g.source_id, "url": g.url,
            "played_at": g.played_at.isoformat(), "time_control_raw": g.time_control_raw,
            "base_seconds": g.base_seconds, "increment_seconds": g.increment_seconds,
            "speed": g.speed, "rated": int(g.rated), "fide_rated": int(g.fide_rated), "variant": g.variant,
            "white_name": g.white.name, "white_rating": g.white.rating, "white_title": g.white.title,
            "black_name": g.black.name, "black_rating": g.black.rating, "black_title": g.black.title,
            "player_color": g.player_color, "opponent_rating": g.opponent_rating, "rating_diff": g.rating_diff,
            "result": g.result, "termination": g.termination,
            "eco": g.eco, "opening_name": g.opening_name, "opening_ply": g.opening_ply,
            "pgn": g.pgn, "movetext": g.movetext, "final_fen": g.final_fen, "ply_count": g.ply_count,
            "clock_times": json.dumps(g.clock_times) if g.clock_times is not None else None,
            "event": g.event, "round": g.round, "note": g.note,
            "source_accuracy_white": g.source_accuracy_white, "source_accuracy_black": g.source_accuracy_black,
            "dedup_key": g.dedup_key, "analysis_version": g.analysis_version,
            "extra": json.dumps(g.extra), "ingested_at": _now(),
        }
        cols = ", ".join(GAME_COLUMNS)
        qs = ", ".join("?" for _ in GAME_COLUMNS)
        self.conn.execute(f"INSERT INTO games ({cols}) VALUES ({qs})", [row[c] for c in GAME_COLUMNS])
        return "inserted"

    def count_games(self, **where) -> int:
        clause = " AND ".join(f"{k}=?" for k in where) or "1=1"
        return self.conn.execute(f"SELECT COUNT(*) FROM games WHERE {clause}", list(where.values())).fetchone()[0]

    def summary(self) -> list[sqlite3.Row]:
        return self.conn.execute(
            "SELECT source, speed, variant, COUNT(*) n, MIN(played_at) first, MAX(played_at) last "
            "FROM games GROUP BY source, speed, variant ORDER BY source, n DESC"
        ).fetchall()

    # --- analysis ----------------------------------------------------------

    def games_needing_analysis(self, version: str, *, sources=None, speeds=None, since=None,
                               limit=None, standard_only=True) -> list[sqlite3.Row]:
        """Games whose stored analysis_version differs from `version`, highest weight first."""
        clauses = ["(g.analysis_version IS NULL OR g.analysis_version != ?)"]
        params: list = [version]
        if standard_only:
            clauses.append("g.variant='standard'")
        if sources:
            clauses.append(f"g.source IN ({','.join('?' * len(sources))})")
            params += list(sources)
        if speeds:
            clauses.append(f"g.speed IN ({','.join('?' * len(speeds))})")
            params += list(speeds)
        if since:
            clauses.append("g.played_at >= ?")
            params.append(since)
        order = ("CASE g.source WHEN 'otb' THEN 0 ELSE 1 END, "
                 "CASE g.speed WHEN 'classical' THEN 0 WHEN 'rapid' THEN 1 WHEN 'correspondence' THEN 2 "
                 "WHEN 'blitz' THEN 3 WHEN 'bullet' THEN 4 ELSE 5 END, g.played_at DESC")
        cols = ("g.id, g.source, g.speed, g.base_seconds, g.increment_seconds, g.player_color, "
                "g.movetext, g.clock_times, g.played_at, g.analysis_version")
        sql = f"SELECT {cols} FROM games g WHERE {' AND '.join(clauses)} ORDER BY {order}"
        if limit:
            sql += f" LIMIT {int(limit)}"
        return self.conn.execute(sql, params).fetchall()

    def save_analysis(self, game_id: str, version: str, nodes: int, *, accuracy_white, accuracy_black,
                      acpl_white, acpl_black, counts: dict, moves_json: str) -> None:
        self.conn.execute(
            "INSERT INTO game_analysis (game_id, analysis_version, nodes, accuracy_white, accuracy_black, "
            "acpl_white, acpl_black, counts, moves, analysed_at) VALUES (?,?,?,?,?,?,?,?,?,?) "
            "ON CONFLICT(game_id) DO UPDATE SET analysis_version=excluded.analysis_version, nodes=excluded.nodes, "
            "accuracy_white=excluded.accuracy_white, accuracy_black=excluded.accuracy_black, "
            "acpl_white=excluded.acpl_white, acpl_black=excluded.acpl_black, counts=excluded.counts, "
            "moves=excluded.moves, analysed_at=excluded.analysed_at",
            (game_id, version, nodes, accuracy_white, accuracy_black, acpl_white, acpl_black,
             json.dumps(counts), moves_json, _now()),
        )
        self.conn.execute("UPDATE games SET analysis_version=? WHERE id=?", (version, game_id))

    def get_analysis(self, game_id: str) -> sqlite3.Row | None:
        return self.conn.execute("SELECT * FROM game_analysis WHERE game_id=?", (game_id,)).fetchone()

    def evals_get(self, fens: list[str], nodes: int, engine: str) -> dict[tuple[str, int], dict]:
        out: dict[tuple[str, int], dict] = {}
        for i in range(0, len(fens), 400):
            chunk = fens[i:i + 400]
            rows = self.conn.execute(
                f"SELECT fen, multipv, data FROM evals WHERE nodes=? AND engine=? AND fen IN ({','.join('?' * len(chunk))})",
                [nodes, engine, *chunk]).fetchall()
            for r in rows:
                out[(r["fen"], r["multipv"])] = json.loads(r["data"])
        return out

    def evals_put(self, engine: str, items: list[tuple[str, int, int, dict]]) -> None:
        self.conn.executemany(
            "INSERT OR REPLACE INTO evals (fen, nodes, multipv, engine, data) VALUES (?,?,?,?,?)",
            [(fen, nodes, mpv, engine, json.dumps(d, separators=(",", ":"))) for fen, nodes, mpv, d in items])

    # --- features ----------------------------------------------------------

    def games_for_features(self, tagger_version: str, *, force=False, limit=None):
        sql = ("SELECT g.*, a.moves AS a_moves FROM games g JOIN game_analysis a ON a.game_id=g.id "
               "LEFT JOIN game_features f ON f.game_id=g.id "
               "WHERE g.variant='standard'" + ("" if force else " AND (f.game_id IS NULL OR f.tagger_version != ?)") +
               " ORDER BY g.played_at DESC" + (f" LIMIT {int(limit)}" if limit else ""))
        params = [] if force else [tagger_version]
        # Materialise: writing while a read cursor is open on the same connection cannot wait
        # on the busy handler when another process has advanced the WAL (snapshot upgrade).
        rows = self.conn.execute(sql, params).fetchall()
        return [(r, {"moves": r["a_moves"]}) for r in rows]

    def save_features(self, game_id: str, tagger_version: str, data: str, hits: list[dict]) -> None:
        self.conn.execute(
            "INSERT INTO game_features (game_id, tagger_version, data, computed_at) VALUES (?,?,?,?) "
            "ON CONFLICT(game_id) DO UPDATE SET tagger_version=excluded.tagger_version, data=excluded.data, "
            "computed_at=excluded.computed_at", (game_id, tagger_version, data, _now()))
        self.conn.execute("DELETE FROM motif_hits WHERE game_id=?", (game_id,))
        self.conn.executemany(
            "INSERT OR REPLACE INTO motif_hits (game_id, ply, motif, attribution, fen, line, detail, win_lost, "
            "classification, played, best, phase) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)",
            [(h["game_id"], h["ply"], h["motif"], h["attribution"], h["fen"], json.dumps(h["line"]), h["detail"],
              h["win_lost"], h["classification"], h["played"], h["best"], h["phase"]) for h in hits])

    # --- http cache --------------------------------------------------------

    def cache_get(self, url: str) -> sqlite3.Row | None:
        return self.conn.execute("SELECT * FROM http_cache WHERE url=?", (url,)).fetchone()

    def cache_put(self, url: str, *, etag: str | None, last_modified: str | None, status: int,
                  body_path: str | None, final: bool = False, gone: bool = False) -> None:
        self.conn.execute(
            "INSERT INTO http_cache (url, etag, last_modified, status, body_path, final, gone, fetched_at) "
            "VALUES (?,?,?,?,?,?,?,?) ON CONFLICT(url) DO UPDATE SET etag=excluded.etag, "
            "last_modified=excluded.last_modified, status=excluded.status, body_path=excluded.body_path, "
            "final=excluded.final, gone=excluded.gone, fetched_at=excluded.fetched_at",
            (url, etag, last_modified, status, body_path, int(final), int(gone), _now()),
        )
        self.conn.commit()

    def cache_touch(self, url: str) -> None:
        self.conn.execute("UPDATE http_cache SET fetched_at=? WHERE url=?", (_now(), url))
        self.conn.commit()

    # --- sync state --------------------------------------------------------

    def get_state(self, key: str, default: str | None = None) -> str | None:
        row = self.conn.execute("SELECT value FROM sync_state WHERE key=?", (key,)).fetchone()
        return row["value"] if row else default

    def set_state(self, key: str, value: str) -> None:
        self.conn.execute(
            "INSERT INTO sync_state (key, value, updated_at) VALUES (?,?,?) "
            "ON CONFLICT(key) DO UPDATE SET value=excluded.value, updated_at=excluded.updated_at",
            (key, value, _now()),
        )
        self.conn.commit()
