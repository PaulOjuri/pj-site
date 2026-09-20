import chess

from coach.analysis.motifs import detect_motifs, see, tag_player_error


def motifs(fen, pv):
    tags, _ = detect_motifs(chess.Board(fen), pv)
    return tags


def test_see_free_capture_and_bad_capture():
    b = chess.Board("4k3/8/8/3q4/8/8/6B1/4K3 w - - 0 1")
    assert see(b, chess.Move.from_uci("g2d5")) == 9
    b = chess.Board("4k3/8/2p5/3p4/4B3/8/8/4K3 w - - 0 1")     # Bxd5 cxd5: loses 3 for 1
    assert see(b, chess.Move.from_uci("e4d5")) == -2


def test_hanging_piece():
    assert "hanging_piece" in motifs("4k3/8/8/3q4/8/8/6B1/4K3 w - - 0 1", ["g2d5"])


def test_knight_royal_fork():
    tags = motifs("r3k3/8/8/3N4/8/8/8/4K3 w - - 0 1", ["d5c7", "e8d8", "c7a8"])
    assert {"fork", "knight_fork", "royal_fork"} <= tags


def test_back_rank_mate():
    tags = motifs("6k1/5ppp/8/8/8/8/8/4R1K1 w - - 0 1", ["e1e8"])
    assert {"mate_in_n", "back_rank"} <= tags


def test_smothered_mate():
    tags = motifs("6rk/6pp/7N/8/8/8/8/6K1 w - - 0 1", ["h6f7"])
    assert {"mate_in_n", "smothered_mate"} <= tags


def test_skewer_king_in_front_of_queen():
    tags = motifs("q7/8/8/k7/8/8/4K3/7R w - - 0 1", ["h1a1", "a5b6", "a1a8"])
    assert "skewer" in tags


def test_absolute_pin_wins_queen():
    # Queen on e5 pinned to king on e8 by the rook arriving on e1: rook then wins it.
    tags = motifs("4k3/8/8/4q3/8/8/3K4/R7 w - - 0 1", ["a1e1", "e8d7", "e1e5"])
    assert {"pin", "absolute_pin"} <= tags


def test_discovered_check_wins_queen():
    tags = motifs("4k3/1q6/8/8/4N3/8/8/4RK2 w - - 0 1", ["e4c5", "e8d8", "c5b7"])
    assert "discovered_check" in tags


def test_sacrifice_then_mate():
    # Classic: Qxh7+ sacrifice would be one; use a rook sac leading to back-rank mate.
    # White: Rd1, Re1, Kg1; Black: Kg8, Ra8, pawns f7 g7 h7, Rd8 defending the back rank.
    tags = motifs("r2r2k1/5ppp/8/8/8/8/8/3RR1K1 w - - 0 1", ["d1d8", "a8d8", "e1e8", "d8e8"])
    # Rxd8 Rxd8 Re8+ Rxe8: that is not mate; ensure no false mate tag
    assert "mate_in_n" not in tags


def test_quiet_line_has_no_motif():
    assert motifs(chess.STARTING_FEN, ["e2e4", "e7e5", "g1f3", "b8c6"]) == set()


def test_attribution_own_vs_opponent():
    # Ply 0: player (white) plays a quiet move instead of the winning fork.
    recs = [
        {"color": "white", "classification": "blunder", "fen_before": "r3k3/8/8/3N4/8/8/8/4K3 w - - 0 1",
         "best_pv": ["d5c7", "e8d8", "c7a8"], "uci": "e1d1"},
        {"color": "black", "classification": "best", "fen_before": "r3k3/8/8/3N4/8/8/8/3K4 b - - 1 1",
         "best_pv": ["a8a1"], "uci": "a8a1"},
    ]
    hits = tag_player_error(recs, 0, "white")
    own = {h.motif for h in hits if h.attribution == "own_tactic_missed"}
    assert {"fork", "knight_fork", "royal_fork"} <= own
    assert not [h for h in hits if h.attribution == "blunder_committed"]
    # Opponent's line Ra1 does not win material -> no opponent_tactic tags.
    assert not [h for h in hits if h.attribution == "opponent_tactic_missed"]


def test_attribution_positional_when_no_shape():
    recs = [
        {"color": "white", "classification": "mistake", "fen_before": chess.STARTING_FEN,
         "best_pv": ["e2e4", "e7e5"], "uci": "a2a3"},
        {"color": "black", "classification": "good", "fen_before": "rnbqkbnr/pppppppp/8/8/8/P7/1PPPPPPP/RNBQKBNR b KQkq - 0 1",
         "best_pv": ["e7e5", "e2e4"], "uci": "e7e5"},
    ]
    hits = tag_player_error(recs, 0, "white")
    assert [h.motif for h in hits] == ["positional"] and hits[0].attribution == "blunder_committed"


def test_non_error_or_opponent_ply_is_ignored():
    recs = [{"color": "black", "classification": "blunder", "fen_before": chess.STARTING_FEN, "best_pv": [], "uci": "e2e4"}]
    assert tag_player_error(recs, 0, "white") == []
