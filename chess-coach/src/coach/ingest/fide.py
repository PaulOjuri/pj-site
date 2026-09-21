"""FIDE ratings (spec §6.3). Primary: the monthly rating-list downloads (fixed-width text in a
zip), cached once per month per list. Fallback: the profile page, parsed tolerantly.
Stores the latest snapshot in sync_state and appends to fide_history.
"""
from __future__ import annotations

import io
import json
import logging
import re
import zipfile
from datetime import datetime, timezone
from pathlib import Path

import httpx

from ..config import DATA_DIR
from ..db import Store

log = logging.getLogger(__name__)
LISTS = {"standard": "standard_rating_list", "rapid": "rapid_rating_list", "blitz": "blitz_rating_list"}
BASE = "https://ratings.fide.com/download/"
RAW = DATA_DIR / "raw" / "fide"
SCHEMA = """
CREATE TABLE IF NOT EXISTS fide_history (
  period TEXT NOT NULL, kind TEXT NOT NULL, rating INTEGER, games INTEGER, k INTEGER, flag TEXT,
  fetched_at TEXT NOT NULL, PRIMARY KEY (period, kind)
);
"""


def _period_now() -> str:
    return datetime.now(timezone.utc).strftime("%Y%m")


def _download(kind: str, user_agent: str) -> Path:
    RAW.mkdir(parents=True, exist_ok=True)
    path = RAW / f"{LISTS[kind]}_{_period_now()}.zip"
    if path.exists():
        return path
    with httpx.Client(timeout=300, headers={"User-Agent": user_agent}, follow_redirects=True) as c:
        with c.stream("GET", BASE + LISTS[kind] + ".zip") as r:
            r.raise_for_status()
            with open(path, "wb") as f:
                for chunk in r.iter_bytes():
                    f.write(chunk)
    return path


def parse_row(header: str, line: str) -> dict | None:
    """Use header column offsets: rating column is the period label (e.g. 'SEP26')."""
    m = re.search(r"\b([A-Z]{3}\d{2})\b", header)
    if not m:
        return None
    period_label = m.group(1)
    cols = {}
    for name in (period_label, "Gms", "K", "B-day", "Flag"):
        i = header.find(name)
        if i >= 0:
            cols[name] = i
    def field(name, width):
        i = cols.get(name)
        return line[i:i + width].strip() if i is not None else ""
    rating = field(period_label, 5)
    return {"period_label": period_label, "rating": int(rating) if rating.isdigit() else None,
            "games": int(field("Gms", 3) or 0), "k": int(field("K", 3) or 0) if field("K", 3).isdigit() else None,
            "flag": field("Flag", 3) or ""}


def fetch_list(kind: str, fide_id: int, user_agent: str) -> dict | None:
    path = _download(kind, user_agent)
    with zipfile.ZipFile(path) as z:
        name = z.namelist()[0]
        with z.open(name) as f:
            text = io.TextIOWrapper(f, encoding="latin-1")
            header = text.readline()
            prefix = f"{fide_id} "
            for line in text:
                if line.startswith(prefix):
                    row = parse_row(header, line)
                    if row:
                        row["kind"] = kind
                        row["inactive"] = "i" in row["flag"]
                        row["name"] = line[len(prefix):len(prefix) + 60].strip()
                    return row
    return None


def fetch_profile(fide_id: int, user_agent: str) -> dict | None:
    """Fallback: scrape the profile page for std/rapid/blitz numbers and inactive flags."""
    try:
        r = httpx.get(f"https://ratings.fide.com/profile/{fide_id}", headers={"User-Agent": user_agent}, timeout=60)
        r.raise_for_status()
    except httpx.HTTPError as e:
        log.warning("profile fetch failed: %s", e)
        return None
    t = re.sub(r"<[^>]+>", " ", r.text)
    t = re.sub(r"\s+", " ", t)
    out = {}
    for kind, label in (("standard", "std"), ("rapid", "rapid"), ("blitz", "blitz")):
        m = re.search(label + r"\.?\s*(\d{3,4}|Not rated)", t, re.I)
        if m:
            out[kind] = {"rating": int(m.group(1)) if m.group(1).isdigit() else None, "source": "profile"}
    return out or None


def run(store: Store, fide_id: int, user_agent: str) -> dict:
    store.conn.executescript(SCHEMA)
    now = datetime.now(timezone.utc).isoformat()
    snapshot = {"fide_id": fide_id, "fetched_at": now, "source": "rating_lists", "period": _period_now(), "lists": {}}
    ok = False
    for kind in LISTS:
        try:
            row = fetch_list(kind, fide_id, user_agent)
        except Exception as e:  # network, zip, parse: fall through to the profile page
            log.warning("fide %s list failed: %s", kind, e)
            row = None
        if row is None:
            snapshot["lists"][kind] = {"rating": None, "games": 0, "k": None, "flag": "", "inactive": True, "unrated": True}
            continue
        ok = True
        snapshot["lists"][kind] = row
        store.conn.execute("INSERT OR REPLACE INTO fide_history (period, kind, rating, games, k, flag, fetched_at) VALUES (?,?,?,?,?,?,?)",
                           (snapshot["period"], kind, row["rating"], row["games"], row["k"], row["flag"], now))
    if not ok:
        prof = fetch_profile(fide_id, user_agent)
        if prof:
            snapshot["source"] = "profile"
            for kind, v in prof.items():
                snapshot["lists"][kind] = {**snapshot["lists"].get(kind, {}), **v}
    store.set_state("fide.latest", json.dumps(snapshot))
    store.conn.commit()
    return snapshot
