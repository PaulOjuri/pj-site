"""Property tests for leak scoring (spec §13): monotone in frequency and severity; recency never raises a score."""
from datetime import datetime, timedelta, timezone

from coach.scoring import leaks as L

NOW = datetime(2026, 9, 20, tzinfo=timezone.utc)


def synth(n_games=100, occurrences=(), w=0.4):
    games = {}
    for i in range(n_games):
        played = NOW - timedelta(days=i % 120)
        games[f"g{i}"] = {"w": w, "played_at": played, "age": (NOW - played).days, "url": None, "features": {},
                          "speed": "rapid", "source": "chesscom", "opponent": "x", "opponent_rating": 1800, "result": "loss"}
    occ = {"fork:own_tactic_missed": []}
    for gid, win_lost, age in occurrences:
        occ["fork:own_tactic_missed"].append({"game_id": gid, "ply": 10, "win_lost": win_lost, "w": w, "age": age,
                                              "played_at": (NOW - timedelta(days=age)).isoformat(), "url": None, "fen": None})
    return {"games": games, "occurrences": occ, "now": NOW}


def score_of(col):
    return L.score(col)[0]["leak_score"]


def test_more_occurrences_never_lower_score():
    a = synth(occurrences=[(f"g{i}", 30.0, 10) for i in range(5)])
    b = synth(occurrences=[(f"g{i}", 30.0, 10) for i in range(10)])
    assert score_of(b) > score_of(a)


def test_higher_severity_never_lower_score():
    a = synth(occurrences=[(f"g{i}", 20.0, 10) for i in range(8)])
    b = synth(occurrences=[(f"g{i}", 40.0, 10) for i in range(8)])
    assert score_of(b) > score_of(a)


def test_recency_decay_never_increases_score():
    fresh = synth(occurrences=[(f"g{i}", 30.0, 0) for i in range(8)])
    old = synth(occurrences=[(f"g{i}", 30.0, 120) for i in range(8)])
    assert score_of(old) < score_of(fresh)
    assert L.decay(0) == 1.0 and abs(L.decay(60) - 0.5) < 1e-9 and L.decay(1000) < 0.001


def test_status_thresholds_and_ci():
    watch = L.score(synth(occurrences=[(f"g{i}", 30.0, 1) for i in range(4)]))[0]
    prov = L.score(synth(occurrences=[(f"g{i}", 30.0, 1) for i in range(5)]))[0]
    conf = L.score(synth(occurrences=[(f"g{i}", 30.0, 1) for i in range(12)]))[0]
    assert (watch["status"], prov["status"], conf["status"]) == ("watch", "provisional", "confirmed")
    lo, hi = conf["rate_ci"]
    assert lo <= conf["games_with"] / 100 * 100 <= hi and lo < hi


def test_trend_requires_data_in_both_windows():
    only_recent = L.score(synth(occurrences=[(f"g{i}", 30.0, 5) for i in range(8)]))[0]
    assert only_recent["trend"]["state"] == "not_enough_data"
    both = L.score(synth(occurrences=[(f"g{i}", 30.0, 5) for i in range(6)] + [(f"g{i}", 30.0, 80) for i in range(6, 18)]))[0]
    assert both["trend"]["state"] in ("better", "worse", "flat")
    assert both["trend"]["n_recent"] == 6 and both["trend"]["n_previous"] == 12


def test_wilson_bounds():
    lo, hi = L.wilson(0, 10)
    assert lo == 0.0 and 0 < hi < 0.4
    lo, hi = L.wilson(10, 10)
    assert 0.6 < lo < 1.0 and hi == 1.0
