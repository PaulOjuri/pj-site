// GET  /api/app/reminders  upcoming and done, in Brussels time
// POST /api/app/reminders  create one from the app's form
import { guarded, json } from './_guard'
import { readJson } from '../../_lib/validate'
import { createReminder, readReminderInput, toView, type ReminderRow } from '../../_lib/reminders'

export const onRequestGet = guarded(async ({ env }) => {
  const upcoming = await env.AGENTS_DB.prepare(
    "SELECT * FROM app_reminders WHERE state IN ('pending','firing') ORDER BY notify_at LIMIT 100",
  ).all<ReminderRow>()
  const past = await env.AGENTS_DB.prepare(
    "SELECT * FROM app_reminders WHERE state IN ('fired','done','cancelled') ORDER BY due_at DESC LIMIT 50",
  ).all<ReminderRow>()
  return json({
    upcoming: (upcoming.results ?? []).map(toView),
    done: (past.results ?? []).map(toView),
  })
})

export const onRequestPost = guarded(async ({ request, env }) => {
  const input = readReminderInput(await readJson(request), 'app')
  const reminder = await createReminder(env.AGENTS_DB, input)
  return json({ ok: true, reminder }, 201)
})
