/**
 * The reminders Worker.
 *
 * Cloudflare Pages has no cron, so the two things that have to happen on a clock live in a Worker next
 * to the Pages project, bound to the same `agent-network` D1 database:
 *
 *   * * * * *     fire reminders that are due
 *   *\/10 * * * *  poll the agent inbox for new decisions
 *
 * Firing is safe to overlap: claimDue() takes rows with a single UPDATE … RETURNING, so a run that is
 * still going when the next minute starts cannot fire the same reminder twice (functions/_lib/reminders.ts).
 *
 * New decision issues are pushed from here rather than from the Mac, because the Mac is asleep most of
 * the day and claude.ai can add a recommendation to an issue at any hour. ask_paul also pushes the moment
 * it files one; app_inbox_seen is what stops the two of them notifying about the same issue twice.
 */
import type { AppEnv } from '../../../functions/_lib/env'
import { claimDue, completeFiring, toView } from '../../../functions/_lib/reminders'
import { addFeedItem, pushToAll, vapidFrom } from '../../../functions/_lib/notify'
import { brusselsLabel } from '../../../functions/_lib/time'
import { listInbox } from '../../../functions/_lib/github'

export type Env = AppEnv

const CRON_REMINDERS = '* * * * *'
const CRON_INBOX = '*/10 * * * *'

const worker = {
  /** Nothing is served: this Worker exists for its schedule. Pages serves the app itself. */
  async fetch(): Promise<Response> {
    return new Response('reminders worker: scheduled only', { status: 404 })
  },

  async scheduled(event: ScheduledController, env: Env, ctx: ExecutionContext): Promise<void> {
    // Both crons fire together every tenth minute, as two separate invocations.
    if (event.cron === CRON_INBOX) ctx.waitUntil(pollInbox(env))
    else if (event.cron === CRON_REMINDERS || !event.cron) ctx.waitUntil(fireDueReminders(env))
  },
}

export default worker

/** Fire everything due now. One push per reminder, then the next occurrence if it repeats. */
export async function fireDueReminders(env: Env): Promise<{ fired: number; repeated: number }> {
  if (!vapidFrom(env)) {
    console.warn('reminders: VAPID keys are not set, nothing can be pushed')
    return { fired: 0, repeated: 0 }
  }
  const due = await claimDue(env.AGENTS_DB)
  let repeated = 0
  for (const row of due) {
    const view = toView(row)
    const early = row.lead_minutes > 0
    const card = {
      kind: 'reminder',
      title: row.what,
      body: early ? `In ${row.lead_minutes} min — due ${view.due_label}` : `Due now · ${brusselsLabel(row.due_at)}`,
      url: `/app#reminders/${row.id}`,
      priority: 'high' as const,
      project: row.project ?? undefined,
      source: 'reminder',
      // Same topic as the row, so a snoozed reminder replaces its own undelivered notification.
      topic: row.id.replace(/-/g, '').slice(0, 32),
    }
    const feedId = await addFeedItem(env.AGENTS_DB, card)
    await pushToAll(env, card, feedId)
    const next = await completeFiring(env.AGENTS_DB, row)
    if (next) repeated++
  }
  if (due.length) console.log(`reminders: fired ${due.length}, queued ${repeated} repeat(s)`)
  return { fired: due.length, repeated }
}

/**
 * Push once for each open decision issue nobody has been told about yet. Research issues are claude.ai's
 * job and never push; they just appear in the Inbox tab.
 */
export async function pollInbox(env: Env): Promise<{ notified: number }> {
  if (!env.GITHUB_INBOX_TOKEN) return { notified: 0 }
  let notified = 0
  try {
    const issues = await listInbox(env, 25)
    for (const issue of issues) {
      if (issue.kind !== 'decision' || issue.decided) continue
      const now = new Date().toISOString()
      // INSERT … ON CONFLICT DO NOTHING: only the run that inserts the row sends the push.
      const claimed = await env.AGENTS_DB.prepare(
        `INSERT INTO app_inbox_seen (issue_number, kind, title, notified_at) VALUES (?1,?2,?3,?4)
         ON CONFLICT(issue_number) DO NOTHING RETURNING issue_number`,
      )
        .bind(issue.number, issue.kind, issue.title.slice(0, 200), now)
        .first<{ issue_number: number }>()
      if (!claimed) continue

      const card = {
        kind: 'decision',
        title: `Decision needed: ${issue.question}`.slice(0, 120),
        body: issue.recommendation
          ? `claude.ai suggests: ${issue.recommendation.replace(/\s+/g, ' ').slice(0, 200)}`
          : `#${issue.number} · ${issue.project}`,
        url: `/app#inbox/${issue.number}`,
        priority: 'high' as const,
        project: issue.project,
        source: 'inbox',
      }
      const feedId = await addFeedItem(env.AGENTS_DB, card)
      await pushToAll(env, card, feedId)
      notified++
    }
  } catch (err) {
    // A GitHub outage must not stop the reminder schedule; the next poll tries again.
    console.warn(`inbox poll failed: ${String(err).slice(0, 200)}`)
  }
  if (notified) console.log(`inbox: notified about ${notified} new decision(s)`)
  return { notified }
}
