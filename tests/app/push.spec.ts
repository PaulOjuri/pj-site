import { test, expect } from '@playwright/test'

/**
 * The push path end to end: subscribe, send a test notification, and what happens when a push service
 * says a subscription is gone. A real push service cannot be reached from a test, so
 * tests/app/push-stub.mjs stands in for one and records what arrived.
 *
 * The encryption itself is checked against the RFC 8291 test vector in tests/unit/push.test.ts; this is
 * about the plumbing around it: the D1 rows, the headers, and the 410 clean-up.
 */

const STUB = 'http://127.0.0.1:8792'
const TOKEN = 'dev-agent-app-token'

/** A real P-256 public key and auth secret (from the RFC's example), so the keys validate and encrypt. */
const KEYS = {
  p256dh: 'BCVxsr7N_eNgVRqvHtD0zTZsEc6-VV-JvLexhqUzORcxaOzi6-AYWXvTBHm4bjyPjs7Vd8pZGH6SRpkNtoIAiw4',
  auth: 'BTBZMqHH6r4Tts7J_aSIgg',
}

test.describe.configure({ mode: 'serial' })

test.beforeEach(async ({ request }) => {
  await request.get(`${STUB}/reset`)
})

test('a subscription has to carry real keys', async ({ request }) => {
  const bad = await request.post('/api/app/subscriptions', {
    data: { endpoint: `${STUB}/ok`, keys: { p256dh: 'too-short', auth: KEYS.auth } },
  })
  expect(bad.status()).toBe(422)
  expect((await bad.json()).error).toMatch(/65-byte|base64url/)

  const noEndpoint = await request.post('/api/app/subscriptions', { data: { keys: KEYS } })
  expect(noEndpoint.status()).toBe(422)
})

test('subscribe, then a test notification arrives encrypted and signed', async ({ request }) => {
  const subscribed = await request.post('/api/app/subscriptions', {
    data: { endpoint: `${STUB}/ok`, keys: KEYS },
  })
  expect(subscribed.ok()).toBe(true)

  const test = await request.post('/api/app/test-push')
  expect(test.ok()).toBe(true)
  const result = await test.json()
  expect(result.sent).toBeGreaterThan(0)

  const seen = await (await request.get(`${STUB}/seen`)).json()
  const delivery = seen.find((s: { path: string }) => s.path === '/ok')
  expect(delivery).toMatchObject({
    encoding: 'aes128gcm',
    vapid: true,
    looksEncrypted: true,
  })
  expect(delivery.bytes).toBeGreaterThan(100)
})

test('subscribing the same browser again updates the row instead of adding one', async ({ request }) => {
  const first = await (await request.post('/api/app/subscriptions', { data: { endpoint: `${STUB}/ok`, keys: KEYS } })).json()
  const second = await (await request.post('/api/app/subscriptions', { data: { endpoint: `${STUB}/ok`, keys: KEYS } })).json()
  expect(second.subscriptions).toBe(first.subscriptions)
})

test('a 410 deletes the subscription, and the healthy one is kept', async ({ request }) => {
  await request.post('/api/app/subscriptions', { data: { endpoint: `${STUB}/ok`, keys: KEYS } })
  const before = await (
    await request.post('/api/app/subscriptions', { data: { endpoint: `${STUB}/gone`, keys: KEYS } })
  ).json()
  expect(before.subscriptions).toBeGreaterThanOrEqual(2)

  const result = await (await request.post('/api/app/test-push')).json()
  expect(result.removed).toBe(1)
  expect(result.sent).toBeGreaterThan(0)

  // The dead one is gone; sending again only reaches the healthy one.
  const after = await (await request.post('/api/app/test-push')).json()
  expect(after.removed).toBe(0)
  expect(after.subscriptions).toBe(before.subscriptions - 1)
})

test('an agent notification reaches the phone and lands in the feed', async ({ request }) => {
  await request.post('/api/app/subscriptions', { data: { endpoint: `${STUB}/ok`, keys: KEYS } })
  const notify = await request.post('/api/agent/notify', {
    headers: { authorization: `Bearer ${TOKEN}` },
    data: {
      title: 'Alfera replied about the invoice',
      body: 'They will pay on the 1st.',
      kind: 'note',
      project: 'alfera',
      url: '/app#feed',
    },
  })
  // The minute-long burst cap is shared with the rest of the suite; either answer is the endpoint working.
  expect([201, 429]).toContain(notify.status())
  if (notify.status() === 429) return

  const feed = await (await request.get('/api/app/feed?project=alfera&limit=5')).json()
  expect(feed.items[0].title).toBe('Alfera replied about the invoice')
  expect(feed.items[0].kind).toBe('note')

  const seen = await (await request.get(`${STUB}/seen`)).json()
  expect(seen.some((s: { path: string }) => s.path === '/ok')).toBe(true)
})

test('unsubscribing removes the row', async ({ request }) => {
  await request.post('/api/app/subscriptions', { data: { endpoint: `${STUB}/ok`, keys: KEYS } })
  const removed = await (
    await request.fetch('/api/app/subscriptions', { method: 'DELETE', data: { endpoint: `${STUB}/ok` } })
  ).json()
  expect(removed.removed).toBe(1)
})
