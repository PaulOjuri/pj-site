"""Macro / meso / micro periodisation (spec §9.1)."""
from __future__ import annotations

from datetime import date, datetime, timedelta

MACRO = [
    (0, 3, "foundation", "Fix the activity problem: get FIDE-rated games on the calendar. Baselines. Top two leaks. Narrow the repertoire."),
    (3, 12, "build", "High tournament volume. Systematic endgame curriculum. Calculation as the daily driver."),
    (12, 20, "sharpen", "Preparation against actual opponents. Events chosen for rating gain and title routes."),
    (20, 24, "execute", "Peak for the chosen title event. Fewer experiments, taper volume, raise quality."),
]


def week_start(d: date) -> date:
    return d - timedelta(days=d.weekday())


def program_week(program_start: date, today: date) -> int:
    """1-based week index since program start (Monday-aligned)."""
    return max(1, (week_start(today) - week_start(program_start)).days // 7 + 1)


def macro_phase(program_start: date, today: date) -> dict:
    months = (today.year - program_start.year) * 12 + today.month - program_start.month
    for lo, hi, name, desc in MACRO:
        if lo <= months < hi:
            return {"name": name, "months": f"{lo + 1}–{hi}", "month_index": months + 1, "description": desc}
    return {"name": "beyond", "months": "24+", "month_index": months + 1, "description": "Programme horizon passed; re-plan."}


def is_deload(week_index: int) -> bool:
    return week_index % 4 == 0


def meso_block(week_index: int) -> int:
    """Quarterly block number (13-week blocks)."""
    return (week_index - 1) // 13 + 1


def taper_for(events: list[dict], today: date, days: int = 14) -> dict | None:
    """The nearest registered event starting within `days`, if any."""
    soon = []
    for e in events:
        if not e.get("registered"):
            continue
        start = e["start"] if isinstance(e["start"], date) else date.fromisoformat(str(e["start"]))
        delta = (start - today).days
        if 0 <= delta <= days:
            soon.append((delta, e))
    if not soon:
        return None
    delta, e = min(soon, key=lambda x: x[0])
    return {"name": e["name"], "start": str(e["start"]), "days_until": delta}
