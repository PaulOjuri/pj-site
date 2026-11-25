/**
 * GET /api/agent/messages?status=pending — what Paul has asked in Chat and nobody has answered.
 *
 * `npm run chat` on the Mac polls this, answers through the orchestrator, and posts each reply to
 * /api/agent/messages/:id/reply.
 *
 * With `&claim=1` the messages are claimed as they are handed over: a claim lasts 10 minutes, so a chat
 * run that takes longer than the launchd interval can't have its messages answered twice.
 */
import { json, tokenGuarded } from './_token'
import { integer, oneOf } from '../../_lib/validate'

const CLAIM_MINUTES = 10

interface MessageRow {
  id: string
  thread_id: string
  role: string
  body: string
  status: string
  created_at: string
  claimed_at: string | null
}

export const onRequestGet = tokenGuarded(async ({ request, env }) => {
  const url = new URL(request.url)
  const status = oneOf(url.searchParams.get('status'), 'status', ['pending', 'answered', 'failed'], 'pending')
  const limit = integer(url.searchParams.get('limit'), 'limit', { min: 1, max: 50, fallback: 10 })
  const claim = url.searchParams.get('claim') === '1'
  const now = new Date()
  const nowIso = now.toISOString()
  const claimableBefore = new Date(now.getTime() - CLAIM_MINUTES * 60_000).toISOString()

  const rows = claim
    ? await env.AGENTS_DB.prepare(
        `UPDATE app_messages SET claimed_at=?1
          WHERE id IN (
            SELECT id FROM app_messages
             WHERE role='paul' AND status=?2 AND (claimed_at IS NULL OR claimed_at < ?3)
             ORDER BY created_at LIMIT ?4
          )
          RETURNING *`,
      )
        .bind(nowIso, status, claimableBefore, limit)
        .all<MessageRow>()
    : await env.AGENTS_DB.prepare(
        "SELECT * FROM app_messages WHERE role='paul' AND status=?1 ORDER BY created_at LIMIT ?2",
      )
        .bind(status, limit)
        .all<MessageRow>()

  const messages = rows.results ?? []

  // The thread so far, so the agents answer in context rather than one line at a time.
  const threads: Record<string, MessageRow[]> = {}
  for (const threadId of new Set(messages.map((m) => m.thread_id))) {
    const history = await env.AGENTS_DB.prepare(
      'SELECT * FROM app_messages WHERE thread_id=?1 ORDER BY created_at LIMIT 50',
    )
      .bind(threadId)
      .all<MessageRow>()
    threads[threadId] = history.results ?? []
  }

  return json({ messages, threads, claimed: claim })
})
