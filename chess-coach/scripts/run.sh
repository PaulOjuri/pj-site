#!/bin/zsh
# Orchestrated run + build + deploy + commit. Usage: scripts/run.sh hourly|nightly|weekly|monthly
# Called by launchd (see launchd/). Safe to run by hand.
set -u
MODE="${1:-hourly}"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"            # chess-coach/
SITE="$(cd "$ROOT/.." && pwd)"                       # pj-site/
LOG="$ROOT/data/logs/run-$MODE.log"
LOCK="$ROOT/data/.run.lock"
mkdir -p "$ROOT/data/logs"
export PATH="/opt/homebrew/bin:/usr/local/bin:$PATH"
cd "$ROOT" || exit 1

# One pipeline at a time. A manual `coach analyse` also counts.
#
# **The lock used to be able to outlive its owner, and did, for seven days.**
# `mkdir` is a fine atomic lock, but it was released only by `trap ... EXIT` --
# and that trap does not fire on SIGKILL, on a reboot, or when launchd kills a
# slow job. A run died at 10:06 on 16 October 2026 and left the directory
# behind; every hourly run from 10:29 that day to 23 October skipped, 126 times.
#
# **And every one of them exited 0**, so `launchctl list` showed success and
# nothing looked wrong. The pipeline had not written to the database in a week.
# Skipping is a legitimate outcome, so it has to stay a success -- which means
# the skip itself has to carry how long it has been skipping.
LOCKPID="$LOCK/pid"

lock_owner_alive() {
  local pid; pid="$(cat "$LOCKPID" 2>/dev/null)" || return 1
  [ -n "$pid" ] || return 1
  kill -0 "$pid" 2>/dev/null || return 1
  # A pid can be reused, so check it is one of ours rather than trusting the
  # number. If we cannot tell, assume alive: refusing to run is recoverable,
  # two pipelines on one database is not.
  ps -o command= -p "$pid" 2>/dev/null | grep -q "run.sh" && return 0
  return 0
}

lock_age_hours() {
  local started; started="$(stat -f %m "$LOCK" 2>/dev/null)" || { echo 0; return; }
  echo $(( ( $(date +%s) - started ) / 3600 ))
}

if ! mkdir "$LOCK" 2>/dev/null; then
  if lock_owner_alive; then
    # The age is in the message on purpose. "Skipping" on its own is what hid
    # seven days of nothing; "skipping, held 167h" is a sentence that reads as
    # a problem.
    echo "$(date -u +%FT%TZ) $MODE: another run holds the lock (pid $(cat "$LOCKPID" 2>/dev/null), held $(lock_age_hours)h), skipping" >> "$LOG"
    exit 0
  fi
  # Nobody is holding it. Say so at a volume somebody will notice, then take it.
  AGE="$(lock_age_hours)"
  echo "$(date -u +%FT%TZ) $MODE: WARNING stale lock, no live owner, held ${AGE}h -- taking it over" >> "$LOG"
  # A killed run leaves its Stockfish children behind -- confirmed by killing
  # one: the parent went, the lock stayed, and eight engines kept running.
  # Taking the lock over without clearing them would put a second set on the
  # same cores, which is how an analysis run starts timing out instead of
  # failing. They are orphans of a run that is gone, so they go.
  if pgrep -x stockfish >/dev/null 2>&1; then
    echo "$(date -u +%FT%TZ) $MODE: WARNING $(pgrep -cx stockfish) orphaned stockfish from the dead run, ending them" >> "$LOG"
    pkill -x stockfish 2>/dev/null
    sleep 1
    pkill -9 -x stockfish 2>/dev/null
  fi
  rm -rf "$LOCK"
  if ! mkdir "$LOCK" 2>/dev/null; then
    echo "$(date -u +%FT%TZ) $MODE: WARNING could not take the lock after clearing it, skipping" >> "$LOG"
    exit 0
  fi
fi
echo $$ > "$LOCKPID"
trap 'rm -rf "$LOCK" 2>/dev/null' EXIT
if pgrep -f "coach analyse" >/dev/null; then
  echo "$(date -u +%FT%TZ) $MODE: manual analysis in progress, skipping" >> "$LOG"; exit 0
fi

echo "$(date -u +%FT%TZ) $MODE: start" >> "$LOG"
OUT="$(caffeinate -i "$ROOT/.venv/bin/coach" run "$MODE" 2>>"$LOG")"
RC=$?
echo "$OUT" >> "$LOG"
CHANGED="$(echo "$OUT" | head -1 | python3 -c 'import json,sys; print(json.load(sys.stdin).get("changed", False))' 2>/dev/null)"

if [ "$CHANGED" = "True" ]; then
  cd "$SITE" || exit 1
  if caffeinate -i npm run build >> "$LOG" 2>&1 && npx wrangler pages deploy out --project-name paulojuri --commit-dirty=true >> "$LOG" 2>&1; then
    echo "$(date -u +%FT%TZ) $MODE: deployed" >> "$LOG"
  else
    echo "$(date -u +%FT%TZ) $MODE: BUILD/DEPLOY FAILED" >> "$LOG"
  fi
  # Version the coach's opinions: artifacts, reports, calendar/repertoire edits.
  git add public/chess/data chess-coach/reports chess-coach/config >> "$LOG" 2>&1
  if ! git diff --cached --quiet; then
    git commit -q -m "chess: $MODE artifacts $(date -u +%F)" >> "$LOG" 2>&1 && git push -q origin main >> "$LOG" 2>&1 \
      && echo "$(date -u +%FT%TZ) $MODE: pushed" >> "$LOG" || echo "$(date -u +%FT%TZ) $MODE: git push failed" >> "$LOG"
  fi
fi
echo "$(date -u +%FT%TZ) $MODE: done rc=$RC changed=$CHANGED" >> "$LOG"
exit $RC
