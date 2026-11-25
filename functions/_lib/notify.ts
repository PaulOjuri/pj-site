/**
 * One way in for everything that reaches Paul's phone: write the card to the feed, then push it to
 * every subscription. Used by the agent notify endpoint, the reminders Worker, the chat reply endpoint
 * and the inbox poll, so the feed is always a complete record of what was pushed and why.
 *
 * Shared with workers/reminders, which imports it from here rather than keeping a second copy.
 */
import type { AppEnv } from './env'
import { kindSpec, urgencyFor, type Priority } from '../../src/lib/app/kinds'
import { sendPush, type VapidConfig } from './push'

export interface Card {
  kind: string
  title: string
  body?: string
  /** A path on this site, e.g. /app#inbox/12. Checked by validate.deepLink before it gets here. */
  url?: string
  priority?: Priority
  project?: string
  /** Who created it: agent | reminder | chat | inbox | app. */
  source: string
  /** Replace an undelivered notification instead of stacking another one (reminders use the row id). */
  topic?: string
}

export interface PushOutcome {
  subscriptions: number
  sent: number
  failed: number
  removed: number
}

const MAX_TITLE = 120
const MAX_BODY = 400
const clip = (s: string, n: number) => (s.length > n ? `${s.slice(0, n - 1)}…` : s)

export function vapidFrom(env: AppEnv): VapidConfig | null {
  if (!env.VAPID_PUBLIC_KEY || !env.VAPID_PRIVATE_KEY) return null
  return {
    publicKey: env.VAPID_PUBLIC_KEY,
    privateKey: env.VAPID_PRIVATE_KEY,
    subject: env.VAPID_SUBJECT || 'https://paulojuri.com',
  }
}

/** Store the card. Returns its id, which is also the notification's tag. */
export async function addFeedItem(db: D1Database, card: Card, id = crypto.randomUUID()): Promise<string> {
  const now = new Date().toISOString()
  await db
    .prepare(
      `INSERT INTO app_feed (id, ts, kind, project, title, body, url, priority, source, created_at)
       VALUES (?1,?2,?3,?4,?5,?6,?7,?8,?9,?10)`,
    )
    .bind(
      id,
      now,
      card.kind,
      card.project ?? null,
      clip(card.title, MAX_TITLE),
      card.body ? clip(card.body, MAX_BODY) : null,
      card.url ?? null,
      card.priority ?? 'normal',
      card.source,
      now,
    )
    .run()
  return id
}

interface SubRow {
  id: string
  endpoint: string
  p256dh: string
  auth: string
}

/**
 * Push one card to every subscription. A subscription the push service calls gone (404/410) is deleted;
 * any other failure is recorded on the row and left alone, because it is usually the service, not us.
 */
export async function pushToAll(env: AppEnv, card: Card, feedId: string): Promise<PushOutcome> {
  const vapid = vapidFrom(env)
  const subs = await env.AGENTS_DB.prepare('SELECT id, endpoint, p256dh, auth FROM app_subscriptions').all<SubRow>()
  const rows = subs.results ?? []
  const outcome: PushOutcome = { subscriptions: rows.length, sent: 0, failed: 0, removed: 0 }
  if (!vapid || rows.length === 0) return outcome

  const spec = kindSpec(card.kind)
  const payload = JSON.stringify({
    id: feedId,
    kind: card.kind,
    title: clip(card.title, MAX_TITLE),
    body: card.body ? clip(card.body, MAX_BODY) : '',
    url: card.url ?? '/app',
    priority: card.priority ?? 'normal',
    actions: spec.actions ?? [],
  })

  const now = new Date().toISOString()
  for (const row of rows) {
    const result = await sendPush(row, payload, vapid, {
      urgency: urgencyFor(card.priority ?? 'normal'),
      topic: card.topic,
    })
    if (result.ok) {
      outcome.sent++
      await env.AGENTS_DB.prepare('UPDATE app_subscriptions SET last_ok_at=?2, last_error=NULL, fail_count=0 WHERE id=?1')
        .bind(row.id, now)
        .run()
    } else if (result.gone) {
      // 404/410 means this endpoint will never work again: the app was uninstalled or the browser rotated it.
      outcome.removed++
      await env.AGENTS_DB.prepare('DELETE FROM app_subscriptions WHERE id=?1').bind(row.id).run()
    } else {
      outcome.failed++
      await env.AGENTS_DB.prepare(
        'UPDATE app_subscriptions SET last_error=?2, fail_count=fail_count+1 WHERE id=?1',
      )
        .bind(row.id, `${result.status}: ${result.error ?? ''}`.slice(0, 200))
        .run()
    }
  }
  return outcome
}

/** The usual path: store it, then push it. */
export async function notify(env: AppEnv, card: Card): Promise<{ id: string; push: PushOutcome }> {
  const id = await addFeedItem(env.AGENTS_DB, card)
  const push = await pushToAll(env, card, id)
  return { id, push }
}
