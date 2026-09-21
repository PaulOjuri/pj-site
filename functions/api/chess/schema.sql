-- D1 schema for the chess coach write-back store. Apply with:
--   npx wrangler d1 execute chess-coach --remote --file functions/api/chess/schema.sql
CREATE TABLE IF NOT EXISTS drill_results (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  at TEXT NOT NULL,
  card_id TEXT NOT NULL,
  kind TEXT NOT NULL,            -- leak_position | puzzle | calculation | endgame | repertoire_line
  grade INTEGER NOT NULL,        -- 1 again, 2 hard, 3 good, 4 easy
  correct INTEGER,
  elapsed_ms INTEGER,
  session_id TEXT,
  detail TEXT,                   -- JSON: answer given, engine result for endgames, etc.
  synced INTEGER NOT NULL DEFAULT 0
);
CREATE TABLE IF NOT EXISTS session_done (
  session_id TEXT PRIMARY KEY,
  done INTEGER NOT NULL,
  at TEXT NOT NULL,
  note TEXT,
  synced INTEGER NOT NULL DEFAULT 0
);
CREATE TABLE IF NOT EXISTS otb_games (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  at TEXT NOT NULL,
  pgn TEXT NOT NULL,
  meta TEXT NOT NULL,            -- JSON: event, date, round, opponent, rating, time_control, result, note
  synced INTEGER NOT NULL DEFAULT 0
);
