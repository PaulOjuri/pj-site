// Shared bits for the agent network's endpoints. The agents run on Paul's Mac (repo PaulOjuri/agent-network) and
// post their events here; /agents (step 5, behind Cloudflare Access) draws them.

export interface AgentsEnv {
  AGENTS_DB: D1Database
  AGENTS_INGEST_TOKEN: string
}

export const EVENT_TYPES = new Set([
  'run_started',
  'tool_call',
  'tool_blocked',
  'delegated',
  'run_finished',
  'run_failed',
])

/** One agent as the roster event describes it (agent-network's src/events.ts `RosterAgent`). */
export interface RosterAgent {
  name: string
  description: string
  model: string
  tools: string[]
  repo: string | null
  canWrite: boolean
  parent: string | null
}

/** One roster event, stored whole: the newest row is the network as it last reported itself. */
export interface StoredRoster {
  id: string
  run_id: string
  ts: string
  agents: RosterAgent[]
}

export interface StoredEvent {
  id: string
  run_id: string
  ts: string
  agent: string
  type: string
  summary: string
  target: string | null
  cost_usd: number | null
}

export const MAX_BATCH = 500
/** A roster event goes to `agent_roster`, not to `events`: it is a description, not something that happened. */
export const ROSTER_TYPE = 'roster'
const MAX_ROSTER = 40
const MAX_TOOLS = 60
const MAX_DESCRIPTION = 4000
const REPO = /^[\w.-]{1,100}\/[\w.-]{1,100}$/
const MODEL = /^[\w.:[\]-]{1,60}$/
const TOOL = /^[\w#:-]{1,80}$/
const ID = /^[\w-]{1,64}$/
const AGENT = /^[a-z0-9][a-z0-9-]{0,39}$/
const MAX_SUMMARY = 1000

export function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json', 'cache-control': 'no-store' },
  })
}

/** Bearer token check, compared in constant time. */
export function authorised(request: Request, token: string | undefined): boolean {
  const h = request.headers.get('authorization') || ''
  const given = h.startsWith('Bearer ') ? h.slice(7) : ''
  if (!token || given.length !== token.length) return false
  let diff = 0
  for (let i = 0; i < token.length; i++) diff |= token.charCodeAt(i) ^ given.charCodeAt(i)
  return diff === 0
}

/** Validates one event as sent by agent-network's src/events.ts. Returns the row to store, or why it was rejected. */
export function toRow(raw: unknown): StoredEvent | string {
  if (!raw || typeof raw !== 'object') return 'not an object'
  const e = raw as Record<string, unknown>
  if (typeof e.id !== 'string' || !ID.test(e.id)) return 'bad id'
  if (typeof e.runId !== 'string' || !ID.test(e.runId)) return 'bad runId'
  if (typeof e.ts !== 'string' || e.ts.length > 40 || Number.isNaN(Date.parse(e.ts))) return 'bad ts'
  if (typeof e.agent !== 'string' || !AGENT.test(e.agent)) return 'bad agent'
  if (typeof e.type !== 'string' || !EVENT_TYPES.has(e.type)) return 'bad type'
  if (typeof e.summary !== 'string') return 'bad summary'
  if (e.target != null && (typeof e.target !== 'string' || !AGENT.test(e.target))) return 'bad target'
  if (e.costUsd != null && (typeof e.costUsd !== 'number' || !Number.isFinite(e.costUsd) || e.costUsd < 0 || e.costUsd > 1000))
    return 'bad costUsd'
  return {
    id: e.id,
    run_id: e.runId,
    ts: new Date(e.ts).toISOString(),
    agent: e.agent,
    type: e.type,
    summary: e.summary.length > MAX_SUMMARY ? e.summary.slice(0, MAX_SUMMARY - 1) + '…' : e.summary,
    target: (e.target as string | undefined) ?? null,
    cost_usd: (e.costUsd as number | undefined) ?? null,
  }
}

/** True for the one event type that describes the network instead of recording something it did. */
export function isRoster(raw: unknown): boolean {
  return Boolean(raw) && typeof raw === 'object' && (raw as { type?: unknown }).type === ROSTER_TYPE
}

function toRosterAgent(raw: unknown): RosterAgent | string {
  if (!raw || typeof raw !== 'object') return 'agent is not an object'
  const a = raw as Record<string, unknown>
  if (typeof a.name !== 'string' || !AGENT.test(a.name)) return 'bad agent name'
  if (typeof a.description !== 'string' || !a.description.trim()) return `${a.name}: bad description`
  if (typeof a.model !== 'string' || !MODEL.test(a.model)) return `${a.name}: bad model`
  if (!Array.isArray(a.tools) || a.tools.length > MAX_TOOLS) return `${a.name}: bad tools`
  if (!a.tools.every((t) => typeof t === 'string' && TOOL.test(t))) return `${a.name}: bad tool name`
  if (a.repo != null && (typeof a.repo !== 'string' || !REPO.test(a.repo))) return `${a.name}: bad repo`
  if (typeof a.canWrite !== 'boolean') return `${a.name}: bad canWrite`
  if (a.parent != null && (typeof a.parent !== 'string' || !AGENT.test(a.parent))) return `${a.name}: bad parent`
  return {
    name: a.name,
    description:
      a.description.length > MAX_DESCRIPTION ? a.description.slice(0, MAX_DESCRIPTION - 1) + '\u2026' : a.description,
    model: a.model,
    tools: a.tools as string[],
    repo: (a.repo as string | undefined) ?? null,
    canWrite: a.canWrite,
    parent: (a.parent as string | undefined) ?? null,
  }
}

/**
 * Validates one roster event. Every field is checked and capped like any other input: the agents are
 * trusted to run on Paul's Mac, not trusted to be correct, and their names and repos end up on screen.
 */
export function toRoster(raw: unknown): StoredRoster | string {
  if (!raw || typeof raw !== 'object') return 'not an object'
  const e = raw as Record<string, unknown>
  if (typeof e.id !== 'string' || !ID.test(e.id)) return 'bad id'
  if (typeof e.runId !== 'string' || !ID.test(e.runId)) return 'bad runId'
  if (typeof e.ts !== 'string' || e.ts.length > 40 || Number.isNaN(Date.parse(e.ts))) return 'bad ts'
  if (!Array.isArray(e.roster) || e.roster.length === 0) return 'roster[] required'
  if (e.roster.length > MAX_ROSTER) return `at most ${MAX_ROSTER} agents`
  const agents: RosterAgent[] = []
  for (const entry of e.roster) {
    const agent = toRosterAgent(entry)
    if (typeof agent === 'string') return agent
    agents.push(agent)
  }
  if (new Set(agents.map((a) => a.name)).size !== agents.length) return 'two agents with the same name'
  return { id: e.id, run_id: e.runId, ts: new Date(e.ts).toISOString(), agents }
}
