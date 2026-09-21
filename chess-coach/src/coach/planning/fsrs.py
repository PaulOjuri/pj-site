"""FSRS scheduler (spec §8.6). Cards are repertoire lines or leak positions.

Implements the FSRS-4.5 update rules with the published default parameters. State per card:
stability S (days until recall probability drops to 90%), difficulty D in [1, 10], reps,
lapses, due. Reviews are graded 1 (again), 2 (hard), 3 (good), 4 (easy). All review history
is stored so the parameters can be re-fitted later.
"""
from __future__ import annotations

import json
import math
from dataclasses import dataclass
from datetime import datetime, timedelta, timezone

from ..db import Store

W = [0.4072, 1.1829, 3.1262, 15.4722, 7.2102, 0.5316, 1.0651, 0.0234, 1.616, 0.1544, 1.0824,
     1.9813, 0.0953, 0.2975, 2.2042, 0.2407, 2.9466]
DECAY = -0.5
FACTOR = 19 / 81
REQUEST_RETENTION = 0.9
AGAIN, HARD, GOOD, EASY = 1, 2, 3, 4


def retrievability(stability: float, elapsed_days: float) -> float:
    return (1 + FACTOR * elapsed_days / stability) ** DECAY


def interval_for(stability: float) -> int:
    return max(1, round(stability / FACTOR * (REQUEST_RETENTION ** (1 / DECAY) - 1)))


def init_difficulty(grade: int) -> float:
    return min(10.0, max(1.0, W[4] - math.exp(W[5] * (grade - 1)) + 1))


def init_stability(grade: int) -> float:
    return max(0.1, W[grade - 1])


def next_difficulty(d: float, grade: int) -> float:
    nd = d - W[6] * (grade - 3)
    # mean reversion toward the "good" initial difficulty
    nd = W[7] * init_difficulty(GOOD) + (1 - W[7]) * nd
    return min(10.0, max(1.0, nd))


def next_stability_recall(d: float, s: float, r: float, grade: int) -> float:
    hard_penalty = W[15] if grade == HARD else 1.0
    easy_bonus = W[16] if grade == EASY else 1.0
    return s * (1 + math.exp(W[8]) * (11 - d) * s ** (-W[9]) * (math.exp(W[10] * (1 - r)) - 1) * hard_penalty * easy_bonus)


def next_stability_forget(d: float, s: float, r: float) -> float:
    return min(s, W[11] * d ** (-W[12]) * ((s + 1) ** W[13] - 1) * math.exp(W[14] * (1 - r)))


@dataclass
class CardState:
    stability: float
    difficulty: float
    reps: int
    lapses: int
    last_review: datetime | None
    due: datetime


def review(state: CardState | None, grade: int, now: datetime) -> CardState:
    if state is None or state.last_review is None:
        s, d = init_stability(grade), init_difficulty(grade)
        reps, lapses = 1, (1 if grade == AGAIN else 0)
    else:
        elapsed = max(0.0, (now - state.last_review).total_seconds() / 86400)
        r = retrievability(state.stability, elapsed)
        d = next_difficulty(state.difficulty, grade)
        if grade == AGAIN:
            s = next_stability_forget(state.difficulty, state.stability, r)
            lapses = state.lapses + 1
        else:
            s = next_stability_recall(state.difficulty, state.stability, r, grade)
            lapses = state.lapses
        reps = state.reps + 1
    if grade == AGAIN:
        due = now + timedelta(minutes=10)      # relearn today; spec: reschedule aggressively on failure
    else:
        due = now + timedelta(days=interval_for(s))
    return CardState(stability=s, difficulty=d, reps=reps, lapses=lapses, last_review=now, due=due)


# --- persistence --------------------------------------------------------------------------

SCHEMA = """
CREATE TABLE IF NOT EXISTS cards (
  id TEXT PRIMARY KEY,
  kind TEXT NOT NULL,             -- repertoire_line | leak_position | endgame_position
  payload TEXT NOT NULL,          -- JSON: fen, moves/solution, prompt, source game/ply, leak tag
  stability REAL, difficulty REAL,
  reps INTEGER NOT NULL DEFAULT 0, lapses INTEGER NOT NULL DEFAULT 0,
  last_review TEXT, due TEXT NOT NULL,
  created_at TEXT NOT NULL, retired INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS idx_cards_due ON cards(due, retired);
CREATE TABLE IF NOT EXISTS reviews (
  card_id TEXT NOT NULL, reviewed_at TEXT NOT NULL, grade INTEGER NOT NULL,
  elapsed_days REAL, stability_after REAL, difficulty_after REAL, source TEXT,
  PRIMARY KEY (card_id, reviewed_at)
);
"""


def ensure_schema(store: Store) -> None:
    store.conn.executescript(SCHEMA)


def upsert_card(store: Store, card_id: str, kind: str, payload: dict, now: datetime) -> bool:
    """Create the card if new (due now). Returns True if created."""
    ensure_schema(store)
    if store.conn.execute("SELECT 1 FROM cards WHERE id=?", (card_id,)).fetchone():
        return False
    store.conn.execute("INSERT INTO cards (id, kind, payload, due, created_at) VALUES (?,?,?,?,?)",
                       (card_id, kind, json.dumps(payload), now.isoformat(), now.isoformat()))
    return True


def load_state(row) -> CardState | None:
    if row["last_review"] is None:
        return None
    return CardState(stability=row["stability"], difficulty=row["difficulty"], reps=row["reps"], lapses=row["lapses"],
                     last_review=datetime.fromisoformat(row["last_review"]), due=datetime.fromisoformat(row["due"]))


def record_review(store: Store, card_id: str, grade: int, now: datetime, source: str = "train") -> CardState:
    ensure_schema(store)
    row = store.conn.execute("SELECT * FROM cards WHERE id=?", (card_id,)).fetchone()
    if row is None:
        raise KeyError(card_id)
    state = load_state(row)
    elapsed = None if state is None else (now - state.last_review).total_seconds() / 86400
    new = review(state, grade, now)
    store.conn.execute(
        "UPDATE cards SET stability=?, difficulty=?, reps=?, lapses=?, last_review=?, due=? WHERE id=?",
        (new.stability, new.difficulty, new.reps, new.lapses, now.isoformat(), new.due.isoformat(), card_id))
    store.conn.execute(
        "INSERT OR REPLACE INTO reviews (card_id, reviewed_at, grade, elapsed_days, stability_after, difficulty_after, source) "
        "VALUES (?,?,?,?,?,?,?)", (card_id, now.isoformat(), grade, elapsed, new.stability, new.difficulty, source))
    return new


def due_cards(store: Store, now: datetime, *, kind: str | None = None, limit: int = 50) -> list[dict]:
    ensure_schema(store)
    sql = "SELECT * FROM cards WHERE retired=0 AND due <= ?" + (" AND kind=?" if kind else "") + " ORDER BY due LIMIT ?"
    params = [now.isoformat()] + ([kind] if kind else []) + [limit]
    return [{"id": r["id"], "kind": r["kind"], "payload": json.loads(r["payload"]), "due": r["due"], "reps": r["reps"],
             "lapses": r["lapses"], "stability": r["stability"]} for r in store.conn.execute(sql, params)]


def escalations(store: Store, *, min_lapses: int = 3) -> list[dict]:
    """Cards failed repeatedly: the plan should turn them into explicit study, not more drilling."""
    ensure_schema(store)
    return [{"id": r["id"], "kind": r["kind"], "payload": json.loads(r["payload"]), "lapses": r["lapses"]}
            for r in store.conn.execute("SELECT * FROM cards WHERE retired=0 AND lapses >= ? ORDER BY lapses DESC", (min_lapses,))]
