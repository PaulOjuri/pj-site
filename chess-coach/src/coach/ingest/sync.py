"""Pull drill results, session completions and OTB game logs from the site's D1 store
(`/api/chess/sync`), apply them locally, then acknowledge. Token from env CHESS_TOKEN.
"""
from __future__ import annotations

import json
import logging
import os
import re
from datetime import datetime, timezone
from pathlib import Path

import httpx
import yaml

from ..config import DATA_DIR
from ..db import Store
from ..planning import fsrs

log = logging.getLogger(__name__)
OTB_DIR = DATA_DIR / "otb"


def _load_env() -> None:
    env = DATA_DIR.parent / ".env"
    if env.exists():
        for line in env.read_text().splitlines():
            if "=" in line and not line.startswith("#"):
                k, v = line.split("=", 1)
                os.environ.setdefault(k.strip(), v.strip())


def run(store: Store, *, api: str | None = None, token: str | None = None) -> dict:
    _load_env()
    api = api or os.environ.get("CHESS_API", "https://paulojuri.com/api/chess")
    token = token or os.environ.get("CHESS_TOKEN")
    if not token:
        raise RuntimeError("CHESS_TOKEN not set (chess-coach/.env or env var)")
    headers = {"Authorization": f"Bearer {token}", "User-Agent": "chess-coach sync"}
    stats = {"drills": 0, "reviews_applied": 0, "sessions": 0, "otb_games": 0}
    with httpx.Client(timeout=60, headers=headers) as client:
        r = client.get(f"{api}/sync")
        r.raise_for_status()
        data = r.json()
        fsrs.ensure_schema(store)
        store.conn.executescript("""
          CREATE TABLE IF NOT EXISTS drill_log (
            remote_id INTEGER PRIMARY KEY, at TEXT NOT NULL, card_id TEXT NOT NULL, kind TEXT NOT NULL, grade INTEGER NOT NULL,
            correct INTEGER, elapsed_ms INTEGER, session_id TEXT, detail TEXT);
          CREATE TABLE IF NOT EXISTS session_done (session_id TEXT PRIMARY KEY, done INTEGER NOT NULL, at TEXT NOT NULL, note TEXT);
        """)
        max_drill = max_game = 0
        max_session_at = None
        with store.tx():
            for d in data.get("drills", []):
                store.conn.execute(
                    "INSERT OR IGNORE INTO drill_log (remote_id, at, card_id, kind, grade, correct, elapsed_ms, session_id, detail) "
                    "VALUES (?,?,?,?,?,?,?,?,?)", (d["id"], d["at"], d["card_id"], d["kind"], d["grade"], d["correct"],
                                                   d["elapsed_ms"], d["session_id"], d["detail"]))
                stats["drills"] += 1
                max_drill = max(max_drill, d["id"])
                if store.conn.execute("SELECT 1 FROM cards WHERE id=?", (d["card_id"],)).fetchone():
                    fsrs.record_review(store, d["card_id"], int(d["grade"]), datetime.fromisoformat(d["at"].replace("Z", "+00:00")),
                                       source="site")
                    stats["reviews_applied"] += 1
            for s_ in data.get("sessions", []):
                store.conn.execute("INSERT OR REPLACE INTO session_done (session_id, done, at, note) VALUES (?,?,?,?)",
                                   (s_["session_id"], s_["done"], s_["at"], s_.get("note")))
                stats["sessions"] += 1
                max_session_at = max(max_session_at or s_["at"], s_["at"])
            OTB_DIR.mkdir(parents=True, exist_ok=True)
            for g in data.get("otb_games", []):
                meta = json.loads(g["meta"] or "{}")
                stamp = re.sub(r"[^0-9T]", "", g["at"])[:15]
                name = f"log_{stamp}_{g['id']}"
                (OTB_DIR / f"{name}.pgn").write_text(g["pgn"])
                (OTB_DIR / f"{name}.yaml").write_text(yaml.safe_dump(meta))
                stats["otb_games"] += 1
                max_game = max(max_game, g["id"])
        params = {}
        if max_drill:
            params["ack_drills"] = max_drill
        if max_game:
            params["ack_games"] = max_game
        if max_session_at:
            params["ack_sessions"] = max_session_at
        if params:
            client.get(f"{api}/sync", params=params).raise_for_status()
    return stats
