-- The agent roster: who is in the network, as the agents themselves report it.
-- Same D1 database as the event log and the app tables (binding AGENTS_DB, database `agent-network`).
--
-- Written by POST /api/agents/ingest when a run sends its `roster` event (agent-network's src/roster.ts);
-- read by GET /api/app/agents, which joins it with `events` to work out what each agent is doing.
--
-- One row per roster event rather than one per agent, so the newest row IS the network: an agent that
-- was removed from the roster disappears with it, and nothing has to be deleted.
--
-- Forward-only. Never edit this file once it has been applied; add migrations/agent-network/0003_*.sql instead.
--
--   npx wrangler d1 execute agent-network --local  --file migrations/agent-network/0002_agent_roster.sql
--   npx wrangler d1 execute agent-network --remote --file migrations/agent-network/0002_agent_roster.sql

CREATE TABLE IF NOT EXISTS agent_roster (
  id          TEXT PRIMARY KEY,   -- the roster event's own uuid, so a retried batch is ignored
  run_id      TEXT NOT NULL,      -- the run that reported it
  ts          TEXT NOT NULL,      -- ISO time on Paul's Mac when the run started
  agents      TEXT NOT NULL,      -- JSON array: {name, description, model, tools[], repo, canWrite, parent}
  received_at TEXT NOT NULL       -- ISO time the site stored it
);

-- The only read there is: the newest roster.
CREATE INDEX IF NOT EXISTS agent_roster_ts ON agent_roster (ts DESC);
