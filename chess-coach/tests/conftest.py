import json
from pathlib import Path

import pytest

from coach.db import Store

FIXTURES = Path(__file__).parent / "fixtures"


@pytest.fixture
def store(tmp_path):
    s = Store(tmp_path / "coach.db")
    yield s
    s.close()


@pytest.fixture
def raw_dir(tmp_path):
    return tmp_path / "raw"


@pytest.fixture
def chesscom_month():
    return json.loads((FIXTURES / "chesscom_month.json").read_text())


@pytest.fixture
def lichess_ndjson():
    return (FIXTURES / "lichess_games.ndjson").read_text()


@pytest.fixture
def otb_pgn():
    return (FIXTURES / "otb_sample.pgn").read_text()
