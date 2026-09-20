from datetime import datetime, timezone

from coach.models import Game, Side


def mk(source, sid, movetext="e4 e5", day=1):
    return Game(id=f"{source}:{sid}", source=source, source_id=sid,
                played_at=datetime(2025, 1, day, tzinfo=timezone.utc), speed="blitz",
                white=Side(name="a"), black=Side(name="b"), player_color="white", result="win",
                pgn="1. e4 e5 *", movetext=movetext, final_fen="f", ply_count=2)


def test_insert_and_exists(store):
    assert store.insert_game(mk("chesscom", "1")) == "inserted"
    assert store.insert_game(mk("chesscom", "1")) == "exists"
    assert store.count_games() == 1


def test_identical_online_games_with_different_ids_are_kept(store):
    # Two 1|0 games with the same short move sequence on the same day are distinct games.
    assert store.insert_game(mk("chesscom", "1")) == "inserted"
    assert store.insert_game(mk("chesscom", "2")) == "inserted"
    assert store.count_games() == 2


def test_otb_game_entered_twice_is_deduplicated(store):
    assert store.insert_game(mk("otb", "aaa")) == "inserted"
    assert store.insert_game(mk("otb", "bbb")) == "duplicate"
    assert store.count_games() == 1


def test_otb_dedups_against_online_copy_of_same_game(store):
    assert store.insert_game(mk("lichess", "x")) == "inserted"
    assert store.insert_game(mk("otb", "y")) == "duplicate"


def test_sync_state_roundtrip(store):
    assert store.get_state("k") is None
    store.set_state("k", "1")
    store.set_state("k", "2")
    assert store.get_state("k") == "2"
