from datetime import datetime, timedelta, timezone

from coach.planning import fsrs as F

NOW = datetime(2026, 9, 21, 9, 0, tzinfo=timezone.utc)


def test_first_review_intervals_grow_with_grade():
    s_again = F.review(None, F.AGAIN, NOW)
    s_good = F.review(None, F.GOOD, NOW)
    s_easy = F.review(None, F.EASY, NOW)
    assert s_again.due < s_good.due < s_easy.due
    assert s_again.lapses == 1 and s_good.lapses == 0
    assert (s_again.due - NOW) <= timedelta(minutes=10)


def test_good_reviews_extend_stability_and_failure_shrinks_it():
    st = F.review(None, F.GOOD, NOW)
    later = st.due
    st2 = F.review(st, F.GOOD, later)
    assert st2.stability > st.stability and st2.due > later
    st3 = F.review(st2, F.AGAIN, st2.due)
    assert st3.stability < st2.stability and st3.lapses == 1


def test_retrievability_decays():
    assert F.retrievability(10, 0) == 1.0
    assert F.retrievability(10, 10) < F.retrievability(10, 1)
    assert abs(F.retrievability(10, 10) - 0.9) < 0.01


def test_persistence_roundtrip(store):
    assert F.upsert_card(store, "c1", "leak_position", {"fen": "x"}, NOW)
    assert not F.upsert_card(store, "c1", "leak_position", {"fen": "x"}, NOW)
    assert [c["id"] for c in F.due_cards(store, NOW)] == ["c1"]
    st = F.record_review(store, "c1", F.GOOD, NOW)
    assert F.due_cards(store, NOW) == []
    assert F.due_cards(store, st.due + timedelta(seconds=1))[0]["id"] == "c1"
    for i in range(3):
        F.record_review(store, "c1", F.AGAIN, NOW + timedelta(days=i + 1))
    assert F.escalations(store)[0]["id"] == "c1"
    assert store.conn.execute("SELECT COUNT(*) FROM reviews").fetchone()[0] == 4
