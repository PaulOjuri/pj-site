/**
 * GET  /api/app/chat   every thread, oldest message first inside each
 * POST /api/app/chat   {body, thread_id?} — stored as pending for the Mac to answer
 *
 * A message sits at `pending` until `npm run chat` on the Mac picks it up through
 * GET /api/agent/messages and answers it, which is why the app shows "waiting for your Mac".
 */
import { guarded, json } from './_guard'
import { optionalText, readJson, text } from '../../_lib/validate'

interface MessageRow {
  id: string
  thread_id: string
  role: 'paul' | 'agent'
  body: string
  status: string
  agent: string | null
  reply_to: string | null
  claimed_at: string | null
  created_at: string
  answered_at: string | null
}

export const onRequestGet = guarded(async ({ env }) => {
  const rows = await env.AGENTS_DB.prepare(
    'SELECT * FROM app_messages ORDER BY created_at DESC LIMIT 300',
  ).all<MessageRow>()

  const threads = new Map<string, MessageRow[]>()
  for (const row of (rows.results ?? []).slice().reverse()) {
    const list = threads.get(row.thread_id) ?? []
    list.push(row)
    threads.set(row.thread_id, list)
  }

  return json({
    threads: [...threads.entries()]
      .map(([thread_id, messages]) => ({
        thread_id,
        messages,
        last_at: messages[messages.length - 1]?.created_at ?? '',
        pending: messages.some((m) => m.role === 'paul' && m.status === 'pending'),
      }))
      .sort((a, b) => Date.parse(b.last_at) - Date.parse(a.last_at)),
  })
})

export const onRequestPost = guarded(async ({ request, env }) => {
  const body = await readJson(request)
  const message = text(body.body, 'body', { min: 1, max: 4000 })
  const threadId = optionalText(body.thread_id, 'thread_id', { max: 64 }) ?? crypto.randomUUID()
  const id = crypto.randomUUID()
  const now = new Date().toISOString()
  await env.AGENTS_DB.prepare(
    `INSERT INTO app_messages (id, thread_id, role, body, status, created_at)
     VALUES (?1,?2,'paul',?3,'pending',?4)`,
  )
    .bind(id, threadId, message, now)
    .run()
  return json({ ok: true, id, thread_id: threadId, created_at: now, status: 'pending' }, 201)
})
