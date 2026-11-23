/**
 * POST /api/agent/messages/:id/reply — the Mac's answer to one chat message.
 *
 *   { "body": "…", "agent": "orchestrator" }
 *
 * Stores the reply in the same thread, marks the question answered, and pushes it so the phone buzzes
 * with the answer. `{ "failed": true }` instead marks the question failed, which the app shows rather
 * than leaving it "waiting for your Mac" forever.
 */
import { json, one, tokenGuarded } from '../../_token'
import { optionalText, readJson, text } from '../../../../_lib/validate'
import { notify } from '../../../../_lib/notify'

interface MessageRow {
  id: string
  thread_id: string
  body: string
  status: string
}

export const onRequestPost = tokenGuarded(async ({ request, env, params }) => {
  const id = one(params, 'id')
  const question = await env.AGENTS_DB.prepare("SELECT * FROM app_messages WHERE id=?1 AND role='paul'")
    .bind(id)
    .first<MessageRow>()
  if (!question) return json({ error: 'no such message' }, 404)

  const body = await readJson(request)
  const now = new Date().toISOString()

  if (body.failed === true) {
    const why = optionalText(body.body, 'body', { max: 500 }) ?? 'the run did not finish'
    await env.AGENTS_DB.prepare("UPDATE app_messages SET status='failed', answered_at=?2 WHERE id=?1")
      .bind(id, now)
      .run()
    await notify(env, {
      kind: 'chat',
      title: 'Your Mac could not answer',
      body: why,
      url: `/app#chat/${question.thread_id}`,
      source: 'chat',
      priority: 'low',
    })
    return json({ ok: true, status: 'failed' })
  }

  const reply = text(body.body, 'body', { min: 1, max: 8000 })
  const agent = optionalText(body.agent, 'agent', { max: 40 }) ?? 'orchestrator'
  const replyId = crypto.randomUUID()

  await env.AGENTS_DB.batch([
    env.AGENTS_DB.prepare(
      `INSERT INTO app_messages (id, thread_id, role, body, status, agent, reply_to, created_at)
       VALUES (?1,?2,'agent',?3,'delivered',?4,?5,?6)`,
    ).bind(replyId, question.thread_id, reply, agent, id, now),
    env.AGENTS_DB.prepare("UPDATE app_messages SET status='answered', answered_at=?2 WHERE id=?1").bind(id, now),
  ])

  const { push } = await notify(env, {
    kind: 'chat',
    title: `${agent} replied`,
    body: reply.slice(0, 200),
    url: `/app#chat/${question.thread_id}`,
    source: 'chat',
    priority: 'normal',
    topic: question.thread_id.slice(0, 32),
  })

  return json({ ok: true, id: replyId, thread_id: question.thread_id, pushed: push.sent }, 201)
})
