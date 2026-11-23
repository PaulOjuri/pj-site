/**
 * POST /api/agent/notify — the agents' way of reaching Paul's phone.
 *
 *   { "title": "…", "body": "…", "url": "/app#inbox/12", "priority": "high", "kind": "decision" }
 *   Authorization: Bearer <AGENT_APP_TOKEN>
 *
 * Stores the card in the feed and pushes it to every subscription. Rate-limited twice: a burst cap so a
 * loop in an agent can't empty the push quota in a minute, and an hourly cap.
 */
import { json, tokenGuarded } from './_token'
import { notify } from '../../_lib/notify'
import { deepLink, oneOf, optionalText, readJson, slug, text } from '../../_lib/validate'
import { rateLimit, tooManyRequests } from '../../_lib/rate'
import { KIND_IDS, PRIORITIES } from '../../../src/lib/app/kinds'

export const onRequestPost = tokenGuarded(async ({ request, env }) => {
  const minute = await rateLimit(env.AGENTS_DB, 'notify:minute', { limit: 10, windowSeconds: 60 })
  if (!minute.ok) return tooManyRequests(minute)
  const hour = await rateLimit(env.AGENTS_DB, 'notify:hour', { limit: 60, windowSeconds: 3600 })
  if (!hour.ok) return tooManyRequests(hour)

  const body = await readJson(request, 16_000)
  const card = {
    title: text(body.title, 'title', { max: 120 }),
    body: optionalText(body.body, 'body', { max: 400 }),
    url: deepLink(body.url),
    priority: oneOf(body.priority, 'priority', PRIORITIES, 'normal'),
    // An unknown kind is kept rather than refused: the app falls back to a generic card, so a new kind
    // can ship on the agent side first (docs/AGENT-APP.md § Adding a card kind).
    kind: oneOf(body.kind, 'kind', [...KIND_IDS, 'other'], 'note'),
    project: slug(body.project, 'project'),
    source: 'agent',
  }

  const { id, push } = await notify(env, card)
  return json({ ok: true, id, pushed: push.sent, subscriptions: push.subscriptions, removed: push.removed }, 201)
})
