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
if ! mkdir "$LOCK" 2>/dev/null; then
  echo "$(date -u +%FT%TZ) $MODE: another run holds the lock, skipping" >> "$LOG"; exit 0
fi
trap 'rmdir "$LOCK" 2>/dev/null' EXIT
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
