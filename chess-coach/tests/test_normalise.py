from datetime import datetime, timezone

from coach.ingest.normalise import parse_pgn, parse_time_control, result_for
from coach.models import Game, Side, classify_speed, make_dedup_key


def test_classify_speed_lichess_buckets():
    assert classify_speed(15, 0) == "ultrabullet"
    assert classify_speed(60, 0) == "bullet"
    assert classify_speed(120, 1) == "bullet"      # 160s estimated
    assert classify_speed(180, 0) == "blitz"
    assert classify_speed(300, 2) == "blitz"
    assert classify_speed(600, 0) == "rapid"
    assert classify_speed(900, 10) == "rapid"      # 1300s
    assert classify_speed(1800, 0) == "classical"
    assert classify_speed(5400, 30) == "classical"
    assert classify_speed(None, None, source_hint="daily") == "correspondence"
    assert classify_speed(None, None, source_hint="rapid") == "rapid"


def test_parse_time_control():
    assert parse_time_control("300+2") == (300, 2)
    assert parse_time_control("600") == (600, 0)
    assert parse_time_control("1/86400") == (None, None)
    assert parse_time_control("-") == (None, None)
    assert parse_time_control(None) == (None, None)


def test_parse_pgn_clocks_and_movetext():
    pgn = '[Event "x"]\n[Result "1-0"]\n\n1. e4 {[%clk 0:04:59.9]} e5 {[%clk 0:04:58]} 2. Nf3 1-0'
    p = parse_pgn(pgn)
    assert p.movetext == "e4 e5 Nf3"
    assert p.ply_count == 3
    assert p.clock_times[:2] == [299.9, 298.0]
    assert p.clock_times[2] != p.clock_times[2]  # NaN where no clock comment
    assert p.final_fen.startswith("rnbqkbnr/pppp1ppp/8/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R b")


def test_parse_pgn_without_clocks_gives_none():
    p = parse_pgn('[Result "*"]\n\n1. d4 d5 *')
    assert p.clock_times is None


def test_result_for():
    assert result_for("white", "1-0") == "win"
    assert result_for("black", "1-0") == "loss"
    assert result_for("black", "0-1") == "win"
    assert result_for("white", "1/2-1/2") == "draw"
    assert result_for("white", "*") == "unknown"


def test_dedup_key_depends_on_moves_and_date_only():
    d1 = datetime(2025, 1, 1, 10, 0, tzinfo=timezone.utc)
    d2 = datetime(2025, 1, 1, 23, 59, tzinfo=timezone.utc)
    d3 = datetime(2025, 1, 2, tzinfo=timezone.utc)
    assert make_dedup_key("e4 e5", d1) == make_dedup_key("e4 e5 ", d2)
    assert make_dedup_key("e4 e5", d1) != make_dedup_key("e4 e5", d3)
    assert make_dedup_key("e4 e5", d1) != make_dedup_key("e4 c5", d1)


def test_game_model_fills_dedup_key():
    g = Game(id="otb:x", source="otb", source_id="x", played_at=datetime(2025, 1, 1, tzinfo=timezone.utc),
             speed="classical", white=Side(name="a"), black=Side(name="b"), player_color="white",
             result="win", pgn="1. e4 *", movetext="e4", final_fen="f", ply_count=1)
    assert g.dedup_key == make_dedup_key("e4", g.played_at)
