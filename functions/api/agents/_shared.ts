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
