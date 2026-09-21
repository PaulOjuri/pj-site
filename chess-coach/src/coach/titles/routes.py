"""Title routes (spec §2). Regulations verified 2026-09-21 from primary sources and kept in
data/reference/: FIDE Handbook B.01 (titles: CM >= 2200, FM >= 2300 published rating; direct
titles table 1.23: World Amateur U2300/U2000 gold -> FM, silver & bronze -> CM; U1700 gold -> CM),
WACC 2026 Regulations PDF (Klang, Malaysia, 4-13 Nov 2026; registration deadline 9 Oct 2026;
U2000: no published standard rating >= 2000 for one year before 4 Nov 2026, no title above CM;
9-round Swiss, 90+30; fee 140 EUR).
"""
from __future__ import annotations

from datetime import date, timedelta

CM_RATING = 2200
FM_RATING = 2300

WACC_2026 = {
    "name": "FIDE World Amateur Chess Championships 2026",
    "city": "Klang, Selangor", "country": "MYS",
    "start": date(2026, 11, 4), "first_round": date(2026, 11, 5), "end": date(2026, 11, 13),
    "registration_deadline": date(2026, 10, 9),
    "rounds": 9, "time_control": "90+30", "fee_eur": 140,
    "sections": {
        "U2300": {"limit": 2300, "lookback_from": "registration_deadline", "max_title": "FM", "gold": "FM", "silver_bronze": "CM"},
        "U2000": {"limit": 2000, "lookback_from": "start", "max_title": "CM", "gold": "FM", "silver_bronze": "CM"},
        "U1700": {"limit": 1700, "lookback_from": "start", "max_title": "CM", "gold": "CM", "silver_bronze": None},
    },
    "source": "https://www.fide.com/wp-content/uploads/WACC_2026_Regulations.pdf",
    "titles_source": "https://handbook.fide.com/chapter/B01DirectTitles2025",
}


def wacc_eligibility(rating_history: list[tuple[str, int | None]], title: str | None, today: date, section: str = "U2000") -> dict:
    """rating_history: [(period 'YYYYMM', standard rating)] covering the lookback year."""
    sec = WACC_2026["sections"][section]
    ref = WACC_2026[sec["lookback_from"]]
    lookback_start = ref - timedelta(days=365)
    breaches = [(p, r) for p, r in rating_history if r is not None and r >= sec["limit"]
                and date(int(p[:4]), int(p[4:]), 1) >= lookback_start]
    title_ok = title is None or title in ("CM", "WCM") if sec["max_title"] == "CM" else title not in ("IM", "GM", "WIM", "WGM")
    days_to_reg = (WACC_2026["registration_deadline"] - today).days
    return {
        "section": section, "eligible_now": not breaches and title_ok, "rating_breaches": breaches, "title_ok": title_ok,
        "lookback_window": [lookback_start.isoformat(), ref.isoformat()],
        "registration_deadline": WACC_2026["registration_deadline"].isoformat(), "days_to_registration": days_to_reg,
        "days_to_start": (WACC_2026["start"] - today).days,
        "titles": {"gold": sec["gold"], "silver_bronze": sec["silver_bronze"]},
        "note": ("Crossing 2000 on a published list after the registration deadline moves you up to U2300 (reg. 3.3d); "
                 "a published rating >= 2000 inside the lookback year makes you ineligible for U2000."),
    }


def rating_routes(standard: int | None, mc: dict | None) -> list[dict]:
    routes = []
    for title, thr in (("CM", CM_RATING), ("FM", FM_RATING)):
        gap = (thr - standard) if standard else None
        routes.append({"route": f"rating_{title}", "title": title, "threshold": thr, "current": standard, "gap": gap,
                       "p_reach_by_horizon": (mc or {}).get("p_reach", {}).get(str(thr)),
                       "note": f"{title} requires a published rating of {thr}; no norms needed (B.01 §1.3)."})
    return routes
