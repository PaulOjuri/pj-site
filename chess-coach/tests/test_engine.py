"""Engine-backed tests. Skipped when no Stockfish binary is available."""
import json

import chess
import pytest

from coach.analysis.engine import Engine, find_stockfish
from coach.analysis.evaluate import Task, analyse, records_to_json

try:
    find_stockfish()
    HAVE_SF = True
except FileNotFoundError:
    HAVE_SF = False

pytestmark = pytest.mark.skipif(not HAVE_SF, reason="stockfish not installed")
NODES = 20_000

# Scholar's mate: 4.Qxf7# is mate; Black's 3...Nf6?? is the blunder that allows it.
SCHOLAR = "e4 e5 Bc4 Nc6 Qh5 Nf6 Qxf7#"
# A quiet, sound game fragment.
QUIET = "e4 e5 Nf3 Nc6 Bb5 a6 Ba4 Nf6 O-O Be7 Re1 b5 Bb3 d6 c3 O-O"


@pytest.fixture(scope="module")
def engine():
    e = Engine()
    yield e
    e.close()


def test_terminal_positions_are_exact(engine):
    b = chess.Board()
    for san in SCHOLAR.split():
        b.push_san(san)
    pe = engine.evaluate(b, NODES)
    assert pe.terminal and pe.cp < -50_000     # side to move (Black) is mated


def test_blunder_is_detected_with_mate_after(engine):
    ga = analyse(Task("t", SCHOLAR, "black", 300, 0, None, NODES, False), engine)
    nf6 = ga.moves[5]
    assert nf6.san == "Nf6" and nf6.color == "black"
    assert nf6.classification == "blunder"
    assert nf6.mate_after == -1 and nf6.win_after < 5
    assert nf6.pv_cps and nf6.complexity is not None     # MultiPV pass ran on the error
    qxf7 = ga.moves[6]
    assert qxf7.is_best and qxf7.classification == "best"
    assert ga.counts["black"]["blunder"] == 1


def test_quiet_game_has_no_blunders_and_high_accuracy(engine):
    ga = analyse(Task("q", QUIET, "white", 600, 0, None, NODES, False), engine)
    assert ga.counts["white"]["blunder"] == 0 and ga.counts["black"]["blunder"] == 0
    assert ga.accuracy_white > 80 and ga.accuracy_black > 80


def test_determinism_same_game_twice_is_byte_identical(engine):
    a = analyse(Task("d", QUIET, "white", 600, 0, None, NODES, True), engine)
    b = analyse(Task("d", QUIET, "white", 600, 0, None, NODES, True), engine)
    assert records_to_json(a.moves) == records_to_json(b.moves)
    assert (a.accuracy_white, a.acpl_black) == (b.accuracy_white, b.acpl_black)


def test_cached_evals_are_used_and_new_ones_reported(engine):
    t1 = Task("c", QUIET, "white", 600, 0, None, NODES, False)
    a = analyse(t1, engine)
    assert len(a.new_evals) == len(QUIET.split()) + 1
    # Feed the cache back in: nothing new should be computed.
    t2 = Task("c", QUIET, "white", 600, 0, None, NODES, False, cached=dict(t1.cached))
    b = analyse(t2, engine)
    assert b.new_evals == []
    assert records_to_json(a.moves) == records_to_json(b.moves)


def test_time_spent_from_clocks(engine):
    clocks = [598.0, 599.0, 590.0, 597.0]
    ga = analyse(Task("k", "e4 e5 Nf3 Nc6", "white", 600, 0, clocks, NODES, False), engine)
    assert [m.time_spent for m in ga.moves] == [2.0, 1.0, 8.0, 2.0]
    assert ga.moves[2].clock_after == 590.0
