#!/bin/zsh
# Installs (or reinstalls) the four launchd agents. Re-run after editing launchd/*.plist.
set -e
DIR="$(cd "$(dirname "$0")/../launchd" && pwd)"
for f in "$DIR"/com.paulojuri.chess-*.plist; do
  label="$(basename "$f" .plist)"
  cp "$f" ~/Library/LaunchAgents/
  launchctl bootout "gui/$(id -u)/$label" 2>/dev/null || true
  launchctl bootstrap "gui/$(id -u)" ~/Library/LaunchAgents/"$label".plist
  echo "loaded $label"
done
launchctl list | grep com.paulojuri.chess
