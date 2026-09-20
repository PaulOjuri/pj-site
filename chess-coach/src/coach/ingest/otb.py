"""OTB games from data/otb/*.pgn (spec §6.4). Ground truth: fide_rated=True, max weight.

Each file may hold several games. Metadata comes from PGN tags; a sidecar
`<file>.yaml` may override or add: event, round, time_control, note, fide_rated.
The /chess/log web form writes into this folder in the same shape.
"""
from __future__ import annotations

import hashlib
import logging
from pathlib import Path

import chess.pgn
import yaml

from ..config import DATA_DIR
from ..db import Store
from ..models import Game, Side, classify_speed
from .normalise import int_or_none, parse_pgn, parse_time_control, pgn_datetime, player_color, result_for

log = logging.getLogger(__name__)


def _split_games(text: str) -> list[str]:
    """Split a multi-game PGN file into per-game strings using python-chess's reader."""
    import io
    out = []
    stream = io.StringIO(text)
    while True:
        offset = stream.tell()
        game = chess.pgn.read_game(stream)
        if game is None:
            break
        end = stream.tell()
        stream.seek(offset)
        out.append(stream.read(end - offset).strip())
        stream.seek(end)
    return out


def to_game(pgn: str, me_names: list[str], meta: dict | None = None) -> Game | None:
    meta = meta or {}
    parsed = parse_pgn(pgn)
    h = parsed.headers
    wname, bname = h.get("White", "?"), h.get("Black", "?")
    color = None
    for me in me_names:
        try:
            color = player_color(wname, bname, me)
            break
        except ValueError:
            continue
    if color is None:
        log.warning("OTB game %s vs %s: player not identified (config names: %s)", wname, bname, me_names)
        return None
    played_at = pgn_datetime(h)
    if played_at is None:
        log.warning("OTB game %s vs %s has no usable Date tag; skipping", wname, bname)
        return None
    tc = meta.get("time_control") or h.get("TimeControl")
    base, inc = parse_time_control(tc)
    speed = classify_speed(base, inc) if base else "classical"
    white = Side(name=wname, rating=int_or_none(h.get("WhiteElo")), title=h.get("WhiteTitle"))
    black = Side(name=bname, rating=int_or_none(h.get("BlackElo")), title=h.get("BlackTitle"))
    me_rating = (white if color == "white" else black).rating
    opp_rating = (black if color == "white" else white).rating
    source_id = hashlib.sha1(f"{parsed.movetext}|{played_at.date()}|{wname}|{bname}".encode()).hexdigest()[:12]
    return Game(
        id=f"otb:{source_id}",
        source="otb",
        source_id=source_id,
        played_at=played_at,
        time_control_raw=tc,
        base_seconds=base,
        increment_seconds=inc,
        speed=speed,
        rated=True,
        fide_rated=bool(meta.get("fide_rated", True)),
        white=white,
        black=black,
        player_color=color,
        opponent_rating=opp_rating,
        rating_diff=(me_rating - opp_rating) if me_rating is not None and opp_rating is not None else None,
        result=result_for(color, parsed.result_tag),
        termination=h.get("Termination"),
        eco=h.get("ECO"),
        opening_name=h.get("Opening"),
        pgn=pgn,
        movetext=parsed.movetext,
        final_fen=parsed.final_fen,
        ply_count=parsed.ply_count,
        clock_times=parsed.clock_times,
        event=meta.get("event") or h.get("Event"),
        round=str(meta.get("round") or h.get("Round") or "") or None,
        note=meta.get("note"),
        extra={"site": h.get("Site")},
    )


class OtbIngester:
    def __init__(self, store: Store, me_names: list[str], folder: Path | None = None):
        self.store = store
        self.me_names = me_names
        self.folder = folder or (DATA_DIR / "otb")

    def ingest(self) -> dict:
        stats = {"files": 0, "games": 0, "inserted": 0, "exists": 0, "duplicate": 0, "skipped": 0}
        self.folder.mkdir(parents=True, exist_ok=True)
        for pgn_file in sorted(self.folder.glob("*.pgn")):
            stats["files"] += 1
            sidecar = pgn_file.with_suffix(".yaml")
            meta = yaml.safe_load(sidecar.read_text()) if sidecar.exists() else {}
            for pgn in _split_games(pgn_file.read_text()):
                stats["games"] += 1
                g = to_game(pgn, self.me_names, meta or {})
                if g is None:
                    stats["skipped"] += 1
                    continue
                with self.store.tx():
                    stats[self.store.insert_game(g)] += 1
        return stats
