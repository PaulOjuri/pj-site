/**
 * PATCH  /api/app/reminders/:id   edit, snooze, mark done, or put back
 * DELETE /api/app/reminders/:id   remove it
 *
 * The snooze and done actions on the notification itself land here, from public/app/sw.js. A snooze
 * clears `claimed_at` and puts the row back to pending, which is what lets the Worker fire it again.
 */
import { guarded, json, one } from '../_guard'
import { BadInput, integer, oneOf, readJson } from '../../../_lib/validate'
import {
  getReminder,
  notifyAtFor,
  readReminderInput,
  toView,
  type ReminderState,
} from '../../../_lib/reminders'

const STATES: readonly ReminderState[] = ['pending', 'done', 'cancelled']

export const onRequestPatch = guarded(async ({ request, env, params }) => {
  const id = one(params, 'id')
  const existing = await getReminder(env.AGENTS_DB, id)
  if (!existing) return json({ error: 'no such reminder' }, 404)

  const body = await readJson(request)
  const now = new Date()
  const nowIso = now.toISOString()

  // 1. Snooze: push it forward from now, and let it fire again.
  if (body.snooze_minutes != null) {
    const minutes = integer(body.snooze_minutes, 'snooze_minutes', { min: 1, max: 24 * 60 })
    const dueAt = new Date(now.getTime() + minutes * 60_000).toISOString()
    await env.AGENTS_DB.prepare(
      `UPDATE app_reminders
          SET due_at=?2, notify_at=?2, state='pending', claimed_at=NULL, fired_at=NULL,
              snooze_count=snooze_count+1, updated_at=?3
        WHERE id=?1`,
    )
      .bind(id, dueAt, nowIso)
      .run()
    const updated = await getReminder(env.AGENTS_DB, id)
    return json({ ok: true, reminder: updated ? toView(updated) : null, snoozed_minutes: minutes })
  }

  // 2. Just a state change: done, cancelled, or back to pending.
  if (body.state != null && body.what == null) {
    const state = oneOf(body.state, 'state', STATES)
    await env.AGENTS_DB.prepare(
      `UPDATE app_reminders
          SET state=?2, done_at=CASE WHEN ?2 IN ('done','cancelled') THEN ?3 ELSE NULL END,
              claimed_at=CASE WHEN ?2='pending' THEN NULL ELSE claimed_at END, updated_at=?3
        WHERE id=?1`,
    )
      .bind(id, state, nowIso)
      .run()
    const updated = await getReminder(env.AGENTS_DB, id)
    return json({ ok: true, reminder: updated ? toView(updated) : null })
  }

  // 3. A full edit from the form.
  if (body.what == null) throw new BadInput('nothing to change: send what/date/time, state, or snooze_minutes')
  const input = readReminderInput(body, existing.source)
  const notifyAt = notifyAtFor(input.dueAt, input.leadMinutes)
  await env.AGENTS_DB.prepare(
    `UPDATE app_reminders
        SET what=?2, due_at=?3, notify_at=?4, lead_minutes=?5, repeat=?6, project=?7,
            state=CASE WHEN state IN ('done','cancelled') THEN state ELSE 'pending' END,
            claimed_at=NULL, fired_at=NULL, updated_at=?8
      WHERE id=?1`,
  )
    .bind(id, input.what, input.dueAt, notifyAt, input.leadMinutes, input.repeat, input.project ?? null, nowIso)
    .run()
  const updated = await getReminder(env.AGENTS_DB, id)
  return json({ ok: true, reminder: updated ? toView(updated) : null })
})

export const onRequestDelete = guarded(async ({ env, params }) => {
  const result = await env.AGENTS_DB.prepare('DELETE FROM app_reminders WHERE id=?1').bind(one(params, 'id')).run()
  if (!result.meta?.changes) return json({ error: 'no such reminder' }, 404)
  return json({ ok: true })
})
