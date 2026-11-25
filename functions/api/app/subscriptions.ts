// POST /api/app/subscriptions   store (or refresh) this device's Web Push subscription
// DELETE /api/app/subscriptions delete it again (Settings → turn notifications off)
//
// The endpoint URL is the identity of a subscription, so re-subscribing the same browser updates the
// row rather than adding a second one.
import { guarded, json } from './_guard'
import { base64url, readJson, text, BadInput } from '../../_lib/validate'

function pushEndpoint(value: unknown): string {
  const endpoint = text(value, 'endpoint', { max: 1000 })
  let url: URL
  try {
    url = new URL(endpoint)
  } catch {
    throw new BadInput('endpoint must be a URL')
  }
  // Push services are always https. The one exception is a stand-in on this machine, which is how
  // the push path is tested end to end without a real push service (tests/app/push.spec.ts).
  const local = url.hostname === '127.0.0.1' || url.hostname === 'localhost'
  if (url.protocol !== 'https:' && !(url.protocol === 'http:' && local)) throw new BadInput('endpoint must be https')
  return url.toString()
}

export const onRequestPost = guarded(async ({ request, env }) => {
  const body = await readJson(request)
  const endpoint = pushEndpoint(body.endpoint)
  const keys = (body.keys ?? {}) as Record<string, unknown>
  const p256dh = base64url(keys.p256dh, 'keys.p256dh', 65) // the subscriber's P-256 public key
  const auth = base64url(keys.auth, 'keys.auth', 16) // the subscriber's auth secret

  const now = new Date().toISOString()
  const userAgent = (request.headers.get('user-agent') || '').slice(0, 200)
  await env.AGENTS_DB.prepare(
    `INSERT INTO app_subscriptions (id, endpoint, p256dh, auth, user_agent, created_at, fail_count)
     VALUES (?1,?2,?3,?4,?5,?6,0)
     ON CONFLICT(endpoint) DO UPDATE SET p256dh=?3, auth=?4, user_agent=?5, last_error=NULL, fail_count=0`,
  )
    .bind(crypto.randomUUID(), endpoint, p256dh, auth, userAgent, now)
    .run()

  const count = await env.AGENTS_DB.prepare('SELECT COUNT(*) AS n FROM app_subscriptions').first<{ n: number }>()
  return json({ ok: true, subscriptions: count?.n ?? 1 })
})

export const onRequestDelete = guarded(async ({ request, env }) => {
  const body = await readJson(request)
  const endpoint = pushEndpoint(body.endpoint)
  const result = await env.AGENTS_DB.prepare('DELETE FROM app_subscriptions WHERE endpoint=?1').bind(endpoint).run()
  return json({ ok: true, removed: result.meta?.changes ?? 0 })
})
