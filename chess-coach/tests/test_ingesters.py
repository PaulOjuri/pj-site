import json
from datetime import datetime, timezone

import httpx

from coach.ingest.chesscom import ChessComIngester, to_game as cc_to_game
from coach.ingest.http import SerialClient
from coach.ingest.lichess import LichessIngester, to_game as li_to_game
from coach.ingest.otb import OtbIngester

ME_CC = "darkknightxvi"
ME_LI = "segunojuri"


def test_chesscom_to_game_fields(chesscom_month):
    games = [cc_to_game(g, ME_CC) for g in chesscom_month["games"]]
    assert all(g is not None for g in games)
    blitz, bullet, rapid = games
    assert (blitz.speed, bullet.speed, rapid.speed) == ("blitz", "bullet", "rapid")
    assert blitz.base_seconds == 180 and blitz.increment_seconds == 0
    assert blitz.player_color == "white" and blitz.result == "win" and blitz.termination == "timeout"
    assert bullet.result == "draw" and bullet.termination == "repetition"
    assert rapid.result == "win" and rapid.termination == "checkmated"
    assert blitz.variant == "standard" and blitz.rated
    assert blitz.clock_times and len(blitz.clock_times) == blitz.ply_count
    assert blitz.played_at.tzinfo is timezone.utc
    assert blitz.id.startswith("chesscom:") and blitz.url.startswith("https://www.chess.com/game/")
    assert blitz.rating_diff == blitz.white.rating - blitz.black.rating


def test_chesscom_variant_kept_but_flagged(chesscom_month):
    raw = dict(chesscom_month["games"][0], rules="chess960")
    assert cc_to_game(raw, ME_CC).variant == "chess960"


def test_chesscom_daily_is_correspondence(chesscom_month):
    raw = dict(chesscom_month["games"][0], time_class="daily", time_control="1/86400")
    g = cc_to_game(raw, ME_CC)
    assert g.speed == "correspondence" and g.base_seconds is None


def _cc_transport(chesscom_month, months, current_status=200):
    calls = []

    def handler(req: httpx.Request):
        calls.append(req)
        url = str(req.url)
        if url.endswith("/games/archives"):
            return httpx.Response(200, json={"archives": months})
        if url.endswith("2026/09") and "If-None-Match" in req.headers and current_status == 304:
            return httpx.Response(304)
        return httpx.Response(200, headers={"ETag": f'"{url[-7:]}"'}, json=chesscom_month)

    return httpx.MockTransport(handler), calls


def test_chesscom_incremental_sync(store, raw_dir, chesscom_month, monkeypatch):
    # Freeze "now" to Sep 2026 so 2026/08 is final and 2026/09 is the live month.
    import coach.ingest.chesscom as mod

    class FakeDT(datetime):
        @classmethod
        def now(cls, tz=None):
            return datetime(2026, 9, 20, tzinfo=tz)
    monkeypatch.setattr(mod, "datetime", FakeDT)

    base = "https://api.chess.com/pub/player/darkknightxvi/games/"
    months = [base + "2026/08", base + "2026/09"]
    transport, calls = _cc_transport(chesscom_month, months)
    client = SerialClient(store, "ua", raw_dir=raw_dir, sleep=lambda s: None, transport=transport)
    st = ChessComIngester(client, store, ME_CC).ingest()
    assert st["inserted"] == 3 and st["exists"] == 3   # same fixture for both months; ids collide
    assert len(calls) == 3   # archives + 2 months

    # Second run: 2026/08 served from disk (final), 2026/09 answered 304.
    transport2, calls2 = _cc_transport(chesscom_month, months, current_status=304)
    client2 = SerialClient(store, "ua", raw_dir=raw_dir, sleep=lambda s: None, transport=transport2)
    st2 = ChessComIngester(client2, store, ME_CC).ingest()
    assert [c.url.path[-7:] for c in calls2] == ["rchives", "2026/09"]
    assert st2["not_modified"] == 1 and st2["inserted"] == 0
    assert store.count_games() == 3


def test_lichess_to_game_fields(lichess_ndjson):
    raws = [json.loads(l) for l in lichess_ndjson.splitlines() if l]
    g = li_to_game(raws[0], ME_LI)
    assert g.id == "lichess:YEhah53N" and g.speed == "bullet"
    assert g.base_seconds == 60 and g.increment_seconds == 0
    assert g.player_color == "white" and g.result == "loss" and g.termination == "outoftime"
    assert g.eco == "D37" and g.opening_ply == 7
    assert g.clock_times and len(g.clock_times) == g.ply_count
    assert g.played_at == datetime.fromtimestamp(raws[0]["createdAt"] / 1000, tz=timezone.utc)


def test_lichess_incremental_cursor(store, raw_dir, lichess_ndjson):
    calls = []

    def handler(req):
        calls.append(req)
        return httpx.Response(200, content=lichess_ndjson.encode())

    client = SerialClient(store, "ua", raw_dir=raw_dir, sleep=lambda s: None,
                          transport=httpx.MockTransport(handler))
    ing = LichessIngester(client, store, ME_LI, token="")
    st = ing.ingest()
    assert st["inserted"] == 2
    assert "since" not in calls[0].url.params
    assert calls[0].headers["Accept"] == "application/x-ndjson"
    max_created = max(json.loads(l)["createdAt"] for l in lichess_ndjson.splitlines() if l)
    assert store.get_state(LichessIngester.STATE_KEY) == str(max_created)

    st2 = ing.ingest()
    assert calls[1].url.params["since"] == str(max_created + 1)
    assert st2["inserted"] == 0 and st2["exists"] == 2


def test_lichess_token_sent_when_present(store, raw_dir, lichess_ndjson):
    calls = []
    client = SerialClient(store, "ua", raw_dir=raw_dir, sleep=lambda s: None,
                          transport=httpx.MockTransport(lambda r: (calls.append(r), httpx.Response(200, content=b""))[1]))
    LichessIngester(client, store, ME_LI, token="tok").ingest()
    assert calls[0].headers["Authorization"] == "Bearer tok"


def test_otb_folder_ingest(store, tmp_path, otb_pgn):
    folder = tmp_path / "otb"
    folder.mkdir()
    (folder / "test_open.pgn").write_text(otb_pgn)
    (folder / "test_open.yaml").write_text("note: felt sharp\nfide_rated: true\n")
    st = OtbIngester(store, ["Paul Ojuri", "Ojuri, Paul"], folder).ingest()
    assert st == {"files": 1, "games": 2, "inserted": 2, "exists": 0, "duplicate": 0, "skipped": 0}
    row = store.conn.execute("SELECT * FROM games WHERE source='otb' ORDER BY played_at").fetchall()
    assert row[0]["player_color"] == "white" and row[0]["result"] == "win"
    assert row[1]["player_color"] == "black" and row[1]["result"] == "win"
    assert row[0]["fide_rated"] == 1 and row[0]["speed"] == "classical" and row[0]["note"] == "felt sharp"
    assert row[0]["rating_diff"] == 1795 - 1900

    # Dropping the same file under another name must not create duplicates.
    (folder / "again.pgn").write_text(otb_pgn)
    st2 = OtbIngester(store, ["Ojuri, Paul"], folder).ingest()
    assert st2["inserted"] == 0 and st2["exists"] == 4 and store.count_games() == 2
