-- D1 schema for the agent network's event log. Apply with:
--   npx wrangler d1 execute agent-network --remote --file functions/api/agents/schema.sql
-- Written by POST /api/agents/ingest; read by /agents (step 5). One row per event from agent-network's src/events.ts.
CREATE TABLE IF NOT EXISTS events (
  id TEXT PRIMARY KEY,           -- uuid from the sender; makes retries idempotent
  run_id TEXT NOT NULL,          -- groups one run (a briefing, a single-agent run)
  ts TEXT NOT NULL,              -- ISO time on Paul's Mac when it happened
  agent TEXT NOT NULL,           -- orchestrator | unalone | alfera | ...
  type TEXT NOT NULL,            -- run_started | tool_call | tool_blocked | delegated | run_finished | run_failed
  summary TEXT NOT NULL,         -- one readable line
  target TEXT,                   -- for delegated: which agent got the task
  cost_usd REAL,                 -- on the main agent's final run_finished / run_failed
  received_at TEXT NOT NULL      -- ISO time the site stored it
);
CREATE INDEX IF NOT EXISTS events_ts ON events (ts);
CREATE INDEX IF NOT EXISTS events_run ON events (run_id, ts);
