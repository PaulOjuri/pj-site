-- Agent app (paulojuri.com/app): push subscriptions, feed, reminders, chat, rate limits, inbox dedupe.
-- Same D1 database as the step-4 event log (binding AGENTS_DB, database `agent-network`), so the feed can
-- join the agents' own events with the items they push.
--
-- Forward-only. Never edit this file once it has been applied; add migrations/agent-network/0002_*.sql instead.
--
--   npx wrangler d1 execute agent-network --local  --file migrations/agent-network/0001_agent_app.sql
--   npx wrangler d1 execute agent-network --remote --file migrations/agent-network/0001_agent_app.sql

-- Web Push subscriptions, one row per installed browser. Deleted when the push service answers 404/410.
CREATE TABLE IF NOT EXISTS app_subscriptions (
  id          TEXT PRIMARY KEY,   -- uuid
  endpoint    TEXT NOT NULL UNIQUE,
  p256dh      TEXT NOT NULL,      -- base64url, the client's P-256 public key (65 bytes)
  auth        TEXT NOT NULL,      -- base64url, the client's auth secret (16 bytes)
  user_agent  TEXT,
  created_at  TEXT NOT NULL,
  last_ok_at  TEXT,
  last_error  TEXT,
  fail_count  INTEGER NOT NULL DEFAULT 0
);

-- The feed: everything the agents send (POST /api/agent/notify) plus reminder, chat and inbox notices.
-- The agents' tool-by-tool events stay in `events` (0001 of the step-4 schema); the feed is the headline layer.
CREATE TABLE IF NOT EXISTS app_feed (
  id         TEXT PRIMARY KEY,    -- uuid
  ts         TEXT NOT NULL,       -- ISO, when it happened
  kind       TEXT NOT NULL,       -- card kind, see src/lib/app/kinds.ts
  project    TEXT,                -- unalone | alfera | general | ...
  title      TEXT NOT NULL,
  body       TEXT,
  url        TEXT,                -- where the notification deep-links to (a /app#... hash)
  priority   TEXT NOT NULL DEFAULT 'normal',  -- low | normal | high
  source     TEXT NOT NULL,       -- agent | reminder | chat | inbox | app
  read_at    TEXT,
  created_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS app_feed_ts ON app_feed (ts DESC);
CREATE INDEX IF NOT EXISTS app_feed_kind ON app_feed (kind, ts DESC);
CREATE INDEX IF NOT EXISTS app_feed_project ON app_feed (project, ts DESC);

-- Reminders. Times are UTC; the app shows and takes them in Europe/Brussels.
-- notify_at = due_at - lead_minutes, and is what the cron Worker claims on.
CREATE TABLE IF NOT EXISTS app_reminders (
  id            TEXT PRIMARY KEY,
  what          TEXT NOT NULL,
  due_at        TEXT NOT NULL,     -- ISO UTC
  notify_at     TEXT NOT NULL,     -- ISO UTC, when to push
  lead_minutes  INTEGER NOT NULL DEFAULT 0,
  repeat        TEXT NOT NULL DEFAULT 'none',   -- none | daily | weekdays | weekly
  state         TEXT NOT NULL DEFAULT 'pending', -- pending | firing | fired | done | cancelled
  project       TEXT,
  source        TEXT NOT NULL DEFAULT 'app',    -- app | agent
  claimed_at    TEXT,              -- set atomically by the cron Worker; stops a second fire
  fired_at      TEXT,
  done_at       TEXT,
  snooze_count  INTEGER NOT NULL DEFAULT 0,
  created_at    TEXT NOT NULL,
  updated_at    TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS app_reminders_due ON app_reminders (state, notify_at);

-- Chat: one row per message, grouped by thread. Paul's messages start as 'pending'; agent-network answers them.
CREATE TABLE IF NOT EXISTS app_messages (
  id          TEXT PRIMARY KEY,
  thread_id   TEXT NOT NULL,
  role        TEXT NOT NULL,       -- paul | agent
  body        TEXT NOT NULL,
  status      TEXT NOT NULL,       -- paul: pending | answered | failed. agent: delivered
  agent       TEXT,                -- which agent replied
  reply_to    TEXT,                -- the message id this answers
  claimed_at  TEXT,                -- set when `npm run chat` picks the message up
  created_at  TEXT NOT NULL,
  answered_at TEXT
);
CREATE INDEX IF NOT EXISTS app_messages_thread ON app_messages (thread_id, created_at);
CREATE INDEX IF NOT EXISTS app_messages_status ON app_messages (status, created_at);

-- Fixed-window rate limiting for the token endpoints. One row per bucket.
CREATE TABLE IF NOT EXISTS app_rate (
  bucket       TEXT PRIMARY KEY,   -- "<name>:<window start epoch seconds>"
  count        INTEGER NOT NULL,
  window_start INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS app_rate_window ON app_rate (window_start);

-- Which agent-inbox issues have already been pushed, so the cron poll and ask_paul never notify twice.
CREATE TABLE IF NOT EXISTS app_inbox_seen (
  issue_number INTEGER PRIMARY KEY,
  kind         TEXT,
  title        TEXT,
  notified_at  TEXT NOT NULL
);
