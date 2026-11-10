// POST /api/agents/ingest: the agents on Paul's Mac send their events here in batches.
// Bearer-token protected (AGENTS_INGEST_TOKEN, a Pages secret). Idempotent: an event id already stored is ignored,
// so the sender can safely retry a batch after a network failure.
// There is deliberately no GET here; reading happens on the Access-protected /agents page (step 5).
import { authorised, json, MAX_BATCH, toRow, type AgentsEnv, type StoredEvent } from './_shared'

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
  const rejected: Array<{ index: number; reason: string }> = []
  body.events.forEach((raw, index) => {
    const row = toRow(raw)
    if (typeof row === 'string') rejected.push({ index, reason: row })
    else rows.push(row)
  })

  const receivedAt = new Date().toISOString()
  const stmt = env.AGENTS_DB.prepare(
    'INSERT OR IGNORE INTO events (id, run_id, ts, agent, type, summary, target, cost_usd, received_at) VALUES (?,?,?,?,?,?,?,?,?)',
  )
  const results = rows.length
    ? await env.AGENTS_DB.batch(
        rows.map((r) => stmt.bind(r.id, r.run_id, r.ts, r.agent, r.type, r.summary, r.target, r.cost_usd, receivedAt)),
      )
    : []
  const inserted = results.reduce((n, r) => n + (r.meta?.changes ?? 0), 0)

  return json({ ok: true, received: body.events.length, inserted, duplicates: rows.length - inserted, rejected })
}
