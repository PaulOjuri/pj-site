"""Parallel-across-games analysis runner.

Each worker process owns one single-threaded engine, pulls tasks from a queue until it sees
the sentinel, then closes its engine and exits. The main process is the only DB writer.
Explicit processes rather than ProcessPoolExecutor because python-chess runs the engine on a
non-daemon thread that must be closed deliberately, or the worker never exits.
"""
from __future__ import annotations

import json
import logging
import multiprocessing as mp
import os
import time

import chess

from ..db import Store
from .budget import nodes_for, tier
from .engine import Engine, analysis_version
from .evaluate import GameAnalysis, Task, analyse, records_to_json

log = logging.getLogger(__name__)
_SENTINEL = None


def _worker(path: str | None, tasks: mp.Queue, results: mp.Queue) -> None:
    engine = Engine(path)
    try:
        while True:
            task = tasks.get()
            if task is _SENTINEL:
                break
            try:
                results.put(("ok", analyse(task, engine)))
            except Exception as e:  # keep the worker alive; report the failure
                results.put(("err", (task.game_id, repr(e))))
    finally:
        engine.close()


def build_task(row, nodes: int, cached: dict) -> Task:
    return Task(
        game_id=row["id"], movetext=row["movetext"], player_color=row["player_color"],
        base_seconds=row["base_seconds"], increment_seconds=row["increment_seconds"],
        clock_times=json.loads(row["clock_times"]) if row["clock_times"] else None,
        nodes=nodes, full_multipv=tier(row["source"], row["speed"], row["base_seconds"]) in ("otb", "classical"),
        cached=cached,
    )


def _fens_for(movetext: str) -> list[str]:
    b = chess.Board()
    fens = [b.fen()]
    for san in movetext.split():
        b.push_san(san)
        fens.append(b.fen())
    return fens


def run(store: Store, *, workers: int | None = None, engine_path: str | None = None, sources=None,
        speeds=None, since=None, limit=None, nodes_override: int | None = None) -> dict:
    probe = Engine(engine_path)
    engine_version = probe.version
    probe.close()
    workers = workers or max(1, (os.cpu_count() or 2) - 2)

    rows = store.games_needing_analysis("__any__", sources=sources, speeds=speeds, since=since)
    todo = []
    for r in rows:
        n = nodes_override or nodes_for(r["source"], r["speed"], r["base_seconds"])
        v = analysis_version(engine_version, n, 3)
        if r["analysis_version"] != v:
            todo.append((r, n, v))
        if limit and len(todo) >= limit:
            break
    stats = {"games": len(todo), "positions": 0, "cache_hits": 0, "errors": 0, "seconds": 0.0}
    if not todo:
        return stats
    log.info("analysing %d games with %d workers (%s)", len(todo), workers, engine_version)
    t0 = time.monotonic()

    ctx = mp.get_context("spawn")
    tasks: mp.Queue = ctx.Queue()
    results: mp.Queue = ctx.Queue()
    procs = [ctx.Process(target=_worker, args=(engine_path, tasks, results), daemon=True) for _ in range(workers)]
    for p in procs:
        p.start()

    meta: dict[str, tuple[int, str]] = {}
    pending = iter(todo)
    in_flight = 0
    submitted = 0

    def submit_next() -> bool:
        nonlocal in_flight, submitted
        for r, n, v in pending:
            try:
                fens = _fens_for(r["movetext"])
            except (ValueError, chess.IllegalMoveError) as e:
                stats["errors"] += 1
                log.error("cannot replay %s: %s", r["id"], e)
                continue
            cached = store.evals_get(fens, n, engine_version)
            stats["cache_hits"] += len(cached)
            stats["positions"] += len(fens)
            meta[r["id"]] = (n, v)
            tasks.put(build_task(r, n, cached))
            in_flight += 1
            submitted += 1
            return True
        return False

    done = 0
    try:
        # Keep a bounded number of tasks queued so memory stays flat and a failure never
        # leaves a full queue behind (which deadlocks the feeder thread at exit).
        for _ in range(workers * 2):
            if not submit_next():
                break
        while in_flight:
            kind, payload = results.get()
            in_flight -= 1
            done += 1
            if kind == "err":
                gid, err = payload
                stats["errors"] += 1
                log.error("analysis failed for %s: %s", gid, err)
            else:
                ga: GameAnalysis = payload
                n, v = meta[ga.game_id]
                with store.tx():
                    store.evals_put(engine_version, ga.new_evals)
                    store.save_analysis(
                        ga.game_id, v, n, accuracy_white=ga.accuracy_white, accuracy_black=ga.accuracy_black,
                        acpl_white=ga.acpl_white, acpl_black=ga.acpl_black, counts=ga.counts,
                        moves_json=records_to_json(ga.moves))
            if done % 10 == 0:
                log.info("%d/%d games analysed (%.0fs)", done, len(todo), time.monotonic() - t0)
            submit_next()
        log.info("%d/%d games analysed (%.0fs)", done, len(todo), time.monotonic() - t0)
    finally:
        for _ in procs:
            tasks.put(_SENTINEL)
        tasks.close()
        for p in procs:
            p.join(timeout=30)
            if p.is_alive():
                p.terminate()
        tasks.cancel_join_thread()
        results.cancel_join_thread()
    stats["seconds"] = round(time.monotonic() - t0, 1)
    return stats
