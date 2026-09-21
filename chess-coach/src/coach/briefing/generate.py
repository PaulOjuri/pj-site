"""Weekly natural-language briefing from the evidence pack (spec §11).

Rules enforced here, not by prompt alone:
  - structured output validated against a schema; every claim carries a reference
    (leak_tag and/or game_id+ply) that must exist in the evidence pack, or the response is
    rejected and retried once with the validation errors; a second failure means no briefing.
  - the deterministic plan is the source of truth; the briefing explains, it never decides.
  - if the API is unavailable the plan still generates; the site shows no briefing.
Model: claude-opus-5 with adaptive thinking. Cost is a few cents per week.
"""
from __future__ import annotations

import hashlib
import json
import logging
import os
from datetime import datetime, timezone

from pydantic import BaseModel, Field, ValidationError

from ..config import ROOT
from ..db import Store

log = logging.getLogger(__name__)
MODEL = "claude-opus-5"

SYSTEM = """You are the written voice of a deterministic chess-training pipeline for one adult player \
(FIDE 1795, target: a FIDE title). You receive an evidence pack computed by the pipeline. You may only \
state things the pack supports. Do not use general chess knowledge to add advice, diagnoses or claims \
about the player that are not in the pack. If the pack says "not enough data", say so; never call a \
change an improvement without the sample size behind it. The weekly plan in the pack is already \
decided; explain it and motivate it, do not change or second-guess it.

Every claim must reference its evidence: set leak_tag for statements about a weakness, and game_id plus \
ply when you point at a specific position (positions are listed in the pack; use their exact game_id \
and ply). Statements about the schedule reference session ids in session_id. Purely logistical \
statements (dates, deadlines) may carry no reference.

Voice: direct, specific, second person, no motivational filler, no exclamation marks, no emojis. \
British spelling. Numbers with their sample sizes. Short sentences."""


class Claim(BaseModel):
    text: str = Field(description="One or two sentences.")
    leak_tag: str | None = None
    game_id: str | None = None
    ply: int | None = None
    session_id: str | None = None


class Briefing(BaseModel):
    headline: str = Field(description="One sentence, the single most important thing this week.")
    situation: list[Claim] = Field(description="2-4 claims about where things stand.")
    focus: list[Claim] = Field(description="2-4 claims on why these targets, each pointing at evidence positions.")
    progress: list[Claim] = Field(description="1-3 claims about the last cycle; honest, with sample sizes.")
    week_ahead: list[Claim] = Field(description="2-5 claims about the sessions, each with a session_id.")
    caveats: list[str] = Field(description="What the data cannot say yet.")


def _load_key() -> str | None:
    if os.environ.get("ANTHROPIC_API_KEY"):
        return os.environ["ANTHROPIC_API_KEY"]
    for env in (ROOT / ".env", ROOT.parent / ".env.local"):
        if env.exists():
            for line in env.read_text().splitlines():
                if line.startswith("ANTHROPIC_API_KEY="):
                    return line.split("=", 1)[1].strip().strip('"')
    return None


def verify(b: Briefing, pack: dict) -> list[str]:
    """Return a list of traceability violations; empty means the briefing is accepted."""
    leak_tags = {l["leak_tag"] for l in pack["leaks"]} | {t["leak_tag"] for t in pack["targets"]}
    positions = {(p["game_id"], p["ply"]) for p in pack["positions"]}
    games = {p["game_id"] for p in pack["positions"]}
    sessions = {s["id"] for s in pack["sessions"]}
    errors = []
    for section in ("situation", "focus", "progress", "week_ahead"):
        for i, c in enumerate(getattr(b, section)):
            where = f"{section}[{i}]"
            if c.leak_tag and c.leak_tag not in leak_tags:
                errors.append(f"{where}: unknown leak_tag {c.leak_tag!r}")
            if c.game_id and c.game_id not in games:
                errors.append(f"{where}: game_id {c.game_id!r} is not in the evidence pack")
            if c.game_id and c.ply is not None and (c.game_id, c.ply) not in positions:
                errors.append(f"{where}: ply {c.ply} for {c.game_id!r} is not an evidence position")
            if c.session_id and c.session_id not in sessions:
                errors.append(f"{where}: unknown session_id {c.session_id!r}")
            if section == "focus" and not (c.leak_tag or c.game_id):
                errors.append(f"{where}: focus claims must reference a leak_tag or a position")
            if section == "week_ahead" and not c.session_id:
                errors.append(f"{where}: week_ahead claims must reference a session_id")
    if not b.focus:
        errors.append("focus is empty")
    return errors


def generate(pack: dict, *, client=None, max_attempts: int = 2) -> tuple[Briefing | None, dict]:
    """Returns (briefing or None, meta). Never raises for API problems; logs them."""
    meta = {"model": MODEL, "attempts": 0, "errors": [], "usage": None, "evidence_hash": hashlib.sha1(
        json.dumps(pack, sort_keys=True).encode()).hexdigest()[:12]}
    try:
        import anthropic
    except ImportError:
        meta["errors"].append("anthropic sdk not installed")
        return None, meta
    if client is None:
        key = _load_key()
        if not key:
            meta["errors"].append("no ANTHROPIC_API_KEY")
            return None, meta
        client = anthropic.Anthropic(api_key=key)
    messages = [{"role": "user", "content": "Evidence pack (JSON):\n" + json.dumps(pack, indent=1)
                 + "\n\nWrite this week's briefing as the schema requires."}]
    for attempt in range(max_attempts):
        meta["attempts"] = attempt + 1
        try:
            resp = client.messages.parse(
                model=MODEL, max_tokens=8000, system=SYSTEM, messages=messages, output_format=Briefing,
                thinking={"type": "adaptive"}, output_config={"effort": "medium"},
            )
        except anthropic.RateLimitError as e:
            meta["errors"].append(f"rate limited: {e}")
            return None, meta
        except anthropic.APIStatusError as e:
            meta["errors"].append(f"api error {e.status_code}: {e.message}")
            return None, meta
        except anthropic.APIConnectionError as e:
            meta["errors"].append(f"connection: {e}")
            return None, meta
        meta["usage"] = {"input": resp.usage.input_tokens, "output": resp.usage.output_tokens}
        if resp.stop_reason == "refusal":
            meta["errors"].append("refusal")
            return None, meta
        b = resp.parsed_output
        if b is None:
            meta["errors"].append("no parsed output")
            return None, meta
        try:
            errs = verify(b, pack)
        except ValidationError as e:
            errs = [str(e)]
        if not errs:
            return b, meta
        meta["errors"].append({"attempt": attempt + 1, "violations": errs})
        log.warning("briefing rejected (attempt %d): %s", attempt + 1, errs)
        text = next((blk.text for blk in resp.content if blk.type == "text"), "")
        messages += [{"role": "assistant", "content": text},
                     {"role": "user", "content": "Rejected. Fix these traceability problems and return the full briefing again:\n- "
                      + "\n- ".join(errs)}]
    return None, meta


SCHEMA = """
CREATE TABLE IF NOT EXISTS briefings (
  week_start TEXT PRIMARY KEY, generated_at TEXT NOT NULL, model TEXT NOT NULL, evidence_hash TEXT NOT NULL,
  data TEXT NOT NULL, meta TEXT NOT NULL
);
"""


def save(store: Store, week_start: str, b: Briefing | None, meta: dict) -> None:
    store.conn.executescript(SCHEMA)
    if b is None:
        return
    store.conn.execute("INSERT OR REPLACE INTO briefings (week_start, generated_at, model, evidence_hash, data, meta) VALUES (?,?,?,?,?,?)",
                       (week_start, datetime.now(timezone.utc).isoformat(), meta["model"], meta["evidence_hash"],
                        b.model_dump_json(), json.dumps(meta)))
    store.conn.commit()


def latest(store: Store, week_start: str) -> dict | None:
    store.conn.executescript(SCHEMA)
    r = store.conn.execute("SELECT * FROM briefings WHERE week_start=?", (week_start,)).fetchone()
    if not r:
        return None
    return {"week_start": r["week_start"], "generated_at": r["generated_at"], "model": r["model"],
            "evidence_hash": r["evidence_hash"], **json.loads(r["data"])}
