/**
 * POST /api/agent/reminders — the agents can put something in Paul's reminders.
 *
 *   { "what": "Send Alfera the v2 invoice", "date": "2026-12-01", "time": "09:00", "repeat": "none" }
 * or
 *   { "what": "…", "due_at": "2026-12-01T08:00:00Z", "lead_minutes": 30 }
 *
 * `date` and `time` are Brussels wall clock; `due_at` is an instant. Either way it is stored in UTC.
 */
import { json, tokenGuarded } from './_token'
import { readJson } from '../../_lib/validate'
import { createReminder, readReminderInput } from '../../_lib/reminders'
import { rateLimit, tooManyRequests } from '../../_lib/rate'

export const onRequestPost = tokenGuarded(async ({ request, env }) => {
  const limit = await rateLimit(env.AGENTS_DB, 'agent-reminders:hour', { limit: 60, windowSeconds: 3600 })
  if (!limit.ok) return tooManyRequests(limit)

  const input = readReminderInput(await readJson(request, 16_000), 'agent')
  const reminder = await createReminder(env.AGENTS_DB, input)
  return json({ ok: true, reminder }, 201)
})
