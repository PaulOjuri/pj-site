from datetime import date

from coach.titles import elo
from coach.titles.routes import wacc_eligibility


def test_expected_score_table_points_and_cap():
    assert abs(elo.expected_score(1800, 1800) - 0.5) < 1e-9
    assert abs(elo.expected_score(2000, 1800) - 0.76) < 0.01      # FIDE table: +200 -> 0.76
    assert elo.expected_score(2500, 1800) == elo.expected_score(2200, 1800)   # 400 cap


def test_k_factor_rules():
    assert elo.k_factor(1795, 10) == 40
    assert elo.k_factor(1795, 30) == 20
    assert elo.k_factor(2350, 100) == 20
    assert elo.k_factor(2410, 100) == 10
    assert elo.k_factor(2390, 100, reached_2400=True) == 10
    assert elo.k_factor(2250, 100, age_at_year_end=17) == 40
    assert elo.k_factor(2310, 100, age_at_year_end=17) == 20


def test_rating_change_and_kn_cap():
    # 9 games, all draws against equal opposition: no change
    assert elo.rating_change(1800, [(1800, 0.5)] * 9, 20) == 0
    # 40 games at K=40 exceeds 700: K reduced to 17
    big = elo.rating_change(1800, [(1800, 1.0)] * 40, 40)
    assert abs(big - 17 * 40 * 0.5) < 1e-6


def test_gain_for_performance_is_positive_and_sane():
    g = elo.gain_for_performance(1795, 9, 1850, 200)
    assert 30 < g < 70


def test_monte_carlo_is_reproducible_and_bounded():
    ev = [elo.Event("a", date(2026, 11, 5), 9, 1850), elo.Event("b", date(2027, 3, 1), 9, 1900)]
    perf = elo.Performance(offset_mean=0, offset_sd=80)
    a = elo.monte_carlo(1795, 30, ev, perf, horizon=date(2028, 1, 1), runs=500)
    b = elo.monte_carlo(1795, 30, ev, perf, horizon=date(2028, 1, 1), runs=500)
    assert a == b
    assert a["final"]["p10"] <= a["final"]["p50"] <= a["final"]["p90"]
    assert 0 <= a["p_reach"]["2200"] <= a["p_reach"]["2000"] <= 1


def test_wacc_eligibility_windows():
    today = date(2026, 9, 21)
    ok = wacc_eligibility([("202609", 1795)], None, today)
    assert ok["eligible_now"] and ok["days_to_registration"] == 18
    breach = wacc_eligibility([("202601", 2005), ("202609", 1795)], None, today)
    assert not breach["eligible_now"] and breach["rating_breaches"] == [("202601", 2005)]
    old = wacc_eligibility([("202409", 2050), ("202609", 1795)], None, today)
    assert old["eligible_now"]              # outside the lookback year
    titled = wacc_eligibility([("202609", 1795)], "FM", today)
    assert not titled["eligible_now"]
