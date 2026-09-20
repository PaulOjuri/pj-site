import math

from coach.analysis.metrics import (capped_cpl, classify, complexity, game_accuracy, is_only_move,
                                    move_accuracy, score_to_cp, time_spent, win_pct)


def test_win_pct_matches_lichess_reference_points():
    assert win_pct(0) == 50.0
    assert math.isclose(win_pct(100), 59.1, abs_tol=0.1)
    assert math.isclose(win_pct(-100), 40.9, abs_tol=0.1)
    assert math.isclose(win_pct(1000), 97.5, abs_tol=0.1)
    assert win_pct(5000) == win_pct(1000)   # clamped


def test_move_accuracy_reference_points():
    assert math.isclose(move_accuracy(0), 100.0, abs_tol=0.01)
    assert math.isclose(move_accuracy(10), 63.4, abs_tol=0.2)
    assert move_accuracy(200) == 0.0


def test_classification_thresholds_use_win_pct_not_cp():
    assert classify(9.9, False) == "good"
    assert classify(10, False) == "inaccuracy"
    assert classify(20, False) == "mistake"
    assert classify(30, False) == "blunder"
    assert classify(50, True) == "best"


def test_mate_scores_and_cpl_cap():
    assert score_to_cp(None, 3) > 1000 and score_to_cp(None, -3) < -1000
    assert score_to_cp(None, 1) > score_to_cp(None, 5)
    assert capped_cpl(800, -800) == 1000
    assert capped_cpl(-50, 20) == 0


def test_only_move_and_complexity():
    assert is_only_move([300, 150, -20])
    assert not is_only_move([300, 250, -20])
    assert not is_only_move([300])
    assert complexity([50, 20, -100]) == 2
    assert complexity([]) == 0


def test_time_spent_uses_same_mover_previous_clock_plus_increment():
    clocks = [298.0, 299.0, 290.0, 295.0]   # 300+2
    assert time_spent(clocks, 0, 300, 2) == 4.0      # 300 - 298 + 2
    assert time_spent(clocks, 1, 300, 2) == 3.0
    assert time_spent(clocks, 2, 300, 2) == 10.0     # 298 - 290 + 2
    assert time_spent(clocks, 3, 300, 2) == 6.0
    assert time_spent(None, 0, 300, 2) is None
    assert time_spent([float("nan"), 1.0], 0, 300, 0) is None


def test_game_accuracy_bounds_and_split():
    wins = [50, 55, 52, 80, 30, 35]
    accs = [95.0, 60.0, 90.0, 20.0, 85.0]
    out = game_accuracy(wins, accs, lambda i: "white" if i % 2 == 0 else "black")
    assert 0 <= out["white"] <= 100 and 0 <= out["black"] <= 100
    assert out["white"] > out["black"]
    assert game_accuracy([50], [], lambda i: "white") == {"white": None, "black": None}
