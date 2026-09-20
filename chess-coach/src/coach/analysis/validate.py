"""Tagger validation against the Lichess puzzle database (spec §13).

Puzzle rows: PuzzleId,FEN,Moves,Rating,RatingDeviation,Popularity,NbPlays,Themes,GameUrl,OpeningTags
FEN is the position *before* the opponent's move; Moves[0] is that move, Moves[1:] the solution.
We run `detect_motifs` on the solution line and compare against the curated themes.

Precision here is a lower bound: Lichess labels are not exhaustive, so a correct tag the
curators did not apply counts as a false positive. Recall is the more trustworthy number.
"""
from __future__ import annotations

import csv
import json
import random
import subprocess
from collections import defaultdict
from datetime import date
from pathlib import Path

import chess

from ..config import DATA_DIR, ROOT
from .motifs import IMPLEMENTED, TAGGER_VERSION, detect_motifs

PUZZLES = DATA_DIR / "puzzles" / "lichess_db_puzzle.csv.zst"
REPORT_DIR = ROOT / "reports"

# Lichess theme -> set of our motifs that count as a match.
THEME_MAP: dict[str, set[str]] = {
    "fork": {"fork"},
    "pin": {"pin"},
    "skewer": {"skewer"},
    "discoveredAttack": {"discovered_attack", "discovered_check"},
    "doubleCheck": {"double_check"},
    "backRankMate": {"back_rank"},
    "smotheredMate": {"smothered_mate"},
    "hangingPiece": {"hanging_piece"},
    "trappedPiece": {"trapped_piece"},
    "sacrifice": {"sacrifice"},
    "deflection": {"deflection"},
    "capturingDefender": {"removal_of_defender"},
    "clearance": {"clearance"},
    "intermezzo": {"zwischenzug"},
    "promotion": {"promotion"},
    "underPromotion": {"underpromotion"},
    "mate": {"mate_in_n"},
    "xRayAttack": {"x_ray"},
}
PRECISION_FLOOR = 0.7
# Sub-tags inherit their parent's eligibility (they are refinements of the same detection).
SUBTYPES = {"fork": {"knight_fork", "pawn_fork", "queen_fork", "royal_fork"}}


def _with_subtypes(motifs: set[str]) -> set[str]:
    out = set(motifs)
    for parent, subs in SUBTYPES.items():
        if parent in motifs:
            out |= subs
    return out


def iter_puzzles(path: Path = PUZZLES):
    proc = subprocess.Popen(["zstd", "-dc", str(path)], stdout=subprocess.PIPE, text=True)
    reader = csv.DictReader(proc.stdout)
    try:
        yield from reader
    finally:
        proc.stdout.close()
        proc.wait()


def sample(n: int, *, rating_lo: int, rating_hi: int, min_popularity: int, seed: int) -> list[dict]:
    """Reservoir sample of puzzles in the rating band, deterministic for a given seed."""
    rng = random.Random(seed)
    out: list[dict] = []
    seen = 0
    for row in iter_puzzles():
        try:
            r, pop = int(row["Rating"]), int(row["Popularity"])
        except ValueError:
            continue
        if not (rating_lo <= r <= rating_hi) or pop < min_popularity:
            continue
        seen += 1
        if len(out) < n:
            out.append(row)
        else:
            j = rng.randrange(seen)
            if j < n:
                out[j] = row
    return out


def run(n: int = 3000, rating_lo: int = 1400, rating_hi: int = 2200, min_popularity: int = 50,
        seed: int = 260703) -> dict:
    puzzles = sample(n, rating_lo=rating_lo, rating_hi=rating_hi, min_popularity=min_popularity, seed=seed)
    tp = defaultdict(int); fp = defaultdict(int); fn = defaultdict(int)
    tag_counts = defaultdict(int)
    for p in puzzles:
        board = chess.Board(p["FEN"])
        moves = p["Moves"].split()
        board.push_uci(moves[0])
        tags, _ = detect_motifs(board, moves[1:])
        themes = set(p["Themes"].split())
        for t in tags:
            tag_counts[t] += 1
        for theme, ours in THEME_MAP.items():
            has = theme in themes
            got = bool(tags & ours)
            if has and got:
                tp[theme] += 1
            elif got and not has:
                fp[theme] += 1
            elif has and not got:
                fn[theme] += 1
    rows = []
    for theme in THEME_MAP:
        t, f_p, f_n = tp[theme], fp[theme], fn[theme]
        prec = t / (t + f_p) if (t + f_p) else None
        rec = t / (t + f_n) if (t + f_n) else None
        rows.append({"theme": theme, "motifs": sorted(THEME_MAP[theme]), "support": t + f_n, "tagged": t + f_p,
                     "tp": t, "fp": f_p, "fn": f_n,
                     "precision": round(prec, 3) if prec is not None else None,
                     "recall": round(rec, 3) if rec is not None else None,
                     "scoring_eligible": prec is not None and prec >= PRECISION_FLOOR and (t + f_n) >= 20})
    return {
        "date": date.today().isoformat(), "tagger_version": TAGGER_VERSION, "n": len(puzzles),
        "rating_band": [rating_lo, rating_hi], "min_popularity": min_popularity, "seed": seed,
        "precision_floor": PRECISION_FLOOR, "themes": rows,
        "tag_counts": dict(sorted(tag_counts.items())),
        "eligible_motifs": sorted(_with_subtypes({m for r in rows if r["scoring_eligible"] for m in r["motifs"]})),
        "unimplemented": sorted(IMPLEMENTED - {m for v in THEME_MAP.values() for m in v}),
    }


def write_report(result: dict) -> tuple[Path, Path]:
    REPORT_DIR.mkdir(exist_ok=True)
    js = REPORT_DIR / "tagger_validation.json"
    md = REPORT_DIR / "tagger_validation.md"
    js.write_text(json.dumps(result, indent=1))
    lines = [
        f"# Motif tagger validation — {result['date']}",
        "",
        f"Tagger v{result['tagger_version']}, {result['n']} Lichess puzzles sampled (rating "
        f"{result['rating_band'][0]}–{result['rating_band'][1]}, popularity ≥ {result['min_popularity']}, seed {result['seed']}).",
        "Precision is a lower bound (Lichess labels are not exhaustive). A motif is eligible for leak "
        f"scoring only when precision ≥ {result['precision_floor']} on ≥ 20 labelled puzzles.",
        "",
        "| Lichess theme | our motif(s) | support | tagged | precision | recall | eligible |",
        "|---|---|---:|---:|---:|---:|:-:|",
    ]
    for r in result["themes"]:
        p = "—" if r["precision"] is None else f"{r['precision']:.2f}"
        rc = "—" if r["recall"] is None else f"{r['recall']:.2f}"
        lines.append(f"| {r['theme']} | {', '.join(r['motifs'])} | {r['support']} | {r['tagged']} | {p} | {rc} | "
                     f"{'yes' if r['scoring_eligible'] else 'no'} |")
    lines += ["", f"**Eligible for leak scoring:** {', '.join(result['eligible_motifs']) or 'none'}", "",
              "Motifs without a Lichess counterpart (validated only by unit tests, excluded from scoring): "
              + ", ".join(result["unimplemented"])]
    md.write_text("\n".join(lines) + "\n")
    return md, js
