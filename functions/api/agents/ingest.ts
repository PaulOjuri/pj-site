// POST /api/agents/ingest: the agents on Paul's Mac send their events here in batches.
// Bearer-token protected (AGENTS_INGEST_TOKEN, a Pages secret). Idempotent: an event id already stored is ignored,
// so the sender can safely retry a batch after a network failure.
// There is deliberately no GET here; reading happens behind Cloudflare Access, in the app.
//
// Two kinds come in on the same batch. An ordinary event is something that happened and goes to `events`;
// a `roster` event describes the network as it stands and goes to `agent_roster`, whole, so the newest row
// is the roster and an agent that has been removed simply isn't in it.
import { authorised, isRoster, json, MAX_BATCH, toRoster, toRow, type AgentsEnv, type StoredEvent, type StoredRoster } from './_shared'

export const onRequestPost: PagesFunction<AgentsEnv> = async ({ request, env }) => {
  if (!authorised(request, env.AGENTS_INGEST_TOKEN)) return json({ error: 'unauthorised' }, 401)
  if (Number(request.headers.get('content-length') || 0) > 1_000_000) return json({ error: 'too large' }, 413)

  let body: { events?: unknown }
  try {
    body = await request.json()
  } catch {
    return json({ error: 'invalid json' }, 400)
  }
  if (!Array.isArray(body.events) || body.events.length === 0) return json({ error: 'events[] required' }, 400)
  if (body.events.length > MAX_BATCH) return json({ error: `at most ${MAX_BATCH} events per batch` }, 413)

  const rows: StoredEvent[] = []
  const rosters: StoredRoster[] = []
  const rejected: Array<{ index: number; reason: string }> = []
  body.events.forEach((raw, index) => {
    if (isRoster(raw)) {
      const roster = toRoster(raw)
      if (typeof roster === 'string') rejected.push({ index, reason: roster })
      else rosters.push(roster)
      return
    }
    const row = toRow(raw)
    if (typeof row === 'string') rejected.push({ index, reason: row })
    else rows.push(row)
  })

  const receivedAt = new Date().toISOString()
  const event = env.AGENTS_DB.prepare(
    'INSERT OR IGNORE INTO events (id, run_id, ts, agent, type, summary, target, cost_usd, received_at) VALUES (?,?,?,?,?,?,?,?,?)',
  )
  const roster = env.AGENTS_DB.prepare(
    'INSERT OR IGNORE INTO agent_roster (id, run_id, ts, agents, received_at) VALUES (?,?,?,?,?)',
  )
  const statements = [
    ...rows.map((r) => event.bind(r.id, r.run_id, r.ts, r.agent, r.type, r.summary, r.target, r.cost_usd, receivedAt)),
    ...rosters.map((r) => roster.bind(r.id, r.run_id, r.ts, JSON.stringify(r.agents), receivedAt)),
  ]
  const results = statements.length ? await env.AGENTS_DB.batch(statements) : []
  const inserted = results.reduce((n, r) => n + (r.meta?.changes ?? 0), 0)

  return json({
    ok: true,
    received: body.events.length,
    inserted,
    duplicates: statements.length - inserted,
    rejected,
  })
}
