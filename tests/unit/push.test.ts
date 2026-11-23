import { test, expect } from '@playwright/test'
import { b64urlToBytes, bytesToB64url, concat, utf8 } from '../../functions/_lib/bytes'
import { encryptPayload, sendPush, serverKeysFrom, vapidHeaders } from '../../functions/_lib/push'

/**
 * The worked example in RFC 8291 §5. Every input is fixed (both key pairs, the auth secret and the
 * salt), so a correct implementation has to produce exactly this body.
 */
const VECTOR = {
  plaintext: 'When I grow up, I want to be a watermelon',
  uaPrivate: 'q1dXpw3UpT5VOmu_cf_v6ih07Aems3njxI-JWgLcM94',
  uaPublic: 'BCVxsr7N_eNgVRqvHtD0zTZsEc6-VV-JvLexhqUzORcxaOzi6-AYWXvTBHm4bjyPjs7Vd8pZGH6SRpkNtoIAiw4',
  authSecret: 'BTBZMqHH6r4Tts7J_aSIgg',
  asPrivate: 'yfWPiYE-n46HLnH0KqZOF1fJJU3MYrct3AELtAQ-oRw',
  asPublic: 'BP4z9KsN6nGRTbVYI_c7VJSPQTBtkgcy27mlmlMoZIIgDll6e3vCYLocInmYWAmS6TlzAC8wEqKK6PBru3jl7A8',
  salt: 'DGv6ra1nlYgDCS1FRnbzlw',
  body:
    'DGv6ra1nlYgDCS1FRnbzlwAAEABBBP4z9KsN6nGRTbVYI_c7VJSPQTBtkgcy27mlmlMoZIIgDll6e3vCYLocInmYWAmS6Tl' +
    'zAC8wEqKK6PBru3jl7A_yl95bQpu6cVPTpK4Mqgkf1CXztLVBSt2Ks3oZwbuwXPXLWyouBWLVWGNWQexSgSxsj_Qulcy4a-fN',
}

test('encrypts the RFC 8291 §5 example byte for byte', async () => {
  const body = await encryptPayload(
    VECTOR.plaintext,
    { p256dh: VECTOR.uaPublic, auth: VECTOR.authSecret },
    {
      salt: b64urlToBytes(VECTOR.salt),
      serverKeys: await serverKeysFrom(VECTOR.asPrivate, VECTOR.asPublic),
    },
  )
  expect(bytesToB64url(body)).toBe(VECTOR.body)
})

test('the header block is salt | rs=4096 | idlen=65 | sender key', async () => {
  const body = await encryptPayload('hi', { p256dh: VECTOR.uaPublic, auth: VECTOR.authSecret })
  expect(body.length).toBeGreaterThan(86)
  expect([...body.subarray(16, 20)]).toEqual([0, 0, 0x10, 0]) // record size 4096, big endian
  expect(body[20]).toBe(65)
  expect(body[21]).toBe(0x04) // uncompressed point
})

/** Decrypt the way a browser would, to prove the whole record round-trips and not just the vector. */
async function decrypt(body: Uint8Array, uaPrivate: CryptoKey, uaPublicBytes: Uint8Array, authSecret: Uint8Array) {
  const salt = body.subarray(0, 16)
  const idlen = body[20]
  const asPublicBytes = body.subarray(21, 21 + idlen)
  const ciphertext = body.subarray(21 + idlen)
  const hmac = async (key: Uint8Array, data: Uint8Array) => {
    const k = await crypto.subtle.importKey('raw', key, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'])
    return new Uint8Array(await crypto.subtle.sign('HMAC', k, data))
  }
  const hkdf = async (s: Uint8Array, ikm: Uint8Array, info: Uint8Array, len: number) =>
    (await hmac(await hmac(s, ikm), concat(info, new Uint8Array([1])))).subarray(0, len)

  const asPublic = await crypto.subtle.importKey('raw', asPublicBytes, { name: 'ECDH', namedCurve: 'P-256' }, false, [])
  // The Workers type for deriveBits spells the peer key `$public`; the runtime takes `public`.
  const ecdh = { name: 'ECDH', public: asPublic } as unknown as Parameters<typeof crypto.subtle.deriveBits>[0]
  const shared = new Uint8Array(await crypto.subtle.deriveBits(ecdh, uaPrivate, 256))
  const keyInfo = concat(utf8('WebPush: info'), new Uint8Array([0]), uaPublicBytes, asPublicBytes)
  const ikm = await hkdf(authSecret, shared, keyInfo, 32)
  const cek = await hkdf(salt, ikm, utf8('Content-Encoding: aes128gcm\0'), 16)
  const nonce = await hkdf(salt, ikm, utf8('Content-Encoding: nonce\0'), 12)
  const key = await crypto.subtle.importKey('raw', cek, 'AES-GCM', false, ['decrypt'])
  const padded = new Uint8Array(
    await crypto.subtle.decrypt({ name: 'AES-GCM', iv: nonce, tagLength: 128 }, key, ciphertext),
  )
  expect(padded[padded.length - 1]).toBe(2) // the last-record delimiter
  return new TextDecoder().decode(padded.subarray(0, padded.length - 1))
}

test('a message encrypted for a fresh subscription decrypts back', async () => {
  const ua = (await crypto.subtle.generateKey({ name: 'ECDH', namedCurve: 'P-256' }, true, [
    'deriveBits',
  ])) as CryptoKeyPair
  const uaPublicBytes = new Uint8Array((await crypto.subtle.exportKey('raw', ua.publicKey)) as ArrayBuffer)
  const authSecret = crypto.getRandomValues(new Uint8Array(16))
  const message = JSON.stringify({ title: 'Decision needed', body: 'Alfera v2 launch date', url: '/app#inbox/12' })

  const body = await encryptPayload(message, {
    p256dh: bytesToB64url(uaPublicBytes),
    auth: bytesToB64url(authSecret),
  })
  expect(await decrypt(body, ua.privateKey, uaPublicBytes, authSecret)).toBe(message)
})

test('each message gets its own salt and sender key', async () => {
  const keys = { p256dh: VECTOR.uaPublic, auth: VECTOR.authSecret }
  const [a, b] = [await encryptPayload('x', keys), await encryptPayload('x', keys)]
  expect(bytesToB64url(a.subarray(0, 16))).not.toBe(bytesToB64url(b.subarray(0, 16)))
  expect(bytesToB64url(a.subarray(21, 86))).not.toBe(bytesToB64url(b.subarray(21, 86)))
})

test('refuses a payload a push service would reject', async () => {
  await expect(
    encryptPayload('x'.repeat(4000), { p256dh: VECTOR.uaPublic, auth: VECTOR.authSecret }),
  ).rejects.toThrow(/too large/)
})

test('the VAPID header is a verifiable ES256 JWT for the endpoint origin', async () => {
  const vapid = { publicKey: VECTOR.asPublic, privateKey: VECTOR.asPrivate, subject: 'mailto:paul@paulojuri.com' }
  const headers = (await vapidHeaders('https://web.push.apple.com/abc123', vapid, 1_700_000_000)) as Record<string, string>
  const [, token] = headers.authorization.match(/^vapid t=([^,]+), k=(.+)$/) ?? []
  const key = headers.authorization.split('k=')[1]
  expect(key).toBe(VECTOR.asPublic)

  const [h, p, sig] = token.split('.')
  expect(JSON.parse(new TextDecoder().decode(b64urlToBytes(h)))).toEqual({ typ: 'JWT', alg: 'ES256' })
  const payload = JSON.parse(new TextDecoder().decode(b64urlToBytes(p)))
  expect(payload.aud).toBe('https://web.push.apple.com')
  expect(payload.sub).toBe('mailto:paul@paulojuri.com')
  expect(payload.exp).toBe(1_700_000_000 + 12 * 60 * 60)

  const pub = b64urlToBytes(VECTOR.asPublic)
  const verifyKey = await crypto.subtle.importKey(
    'jwk',
    {
      kty: 'EC',
      crv: 'P-256',
      x: bytesToB64url(pub.subarray(1, 33)),
      y: bytesToB64url(pub.subarray(33, 65)),
      ext: true,
    },
    { name: 'ECDSA', namedCurve: 'P-256' },
    false,
    ['verify'],
  )
  const ok = await crypto.subtle.verify(
    { name: 'ECDSA', hash: 'SHA-256' },
    verifyKey,
    b64urlToBytes(sig),
    utf8(`${h}.${p}`),
  )
  expect(ok).toBe(true)
})

/* ── sendPush: what the app does with each answer from a push service ───────── */

const SUBSCRIPTION = {
  endpoint: 'https://fcm.googleapis.com/fcm/send/abc',
  p256dh: VECTOR.uaPublic,
  auth: VECTOR.authSecret,
}
const VAPID = { publicKey: VECTOR.asPublic, privateKey: VECTOR.asPrivate, subject: 'mailto:paul@paulojuri.com' }

async function withFetch<T>(reply: (request: Request) => Response, run: () => Promise<T>): Promise<T> {
  const real = globalThis.fetch
  globalThis.fetch = (async (input: RequestInfo | URL, init?: RequestInit) =>
    reply(new Request(String(input instanceof Request ? input.url : input), init))) as typeof fetch
  try {
    return await run()
  } finally {
    globalThis.fetch = real
  }
}

test('a 201 is a delivered message', async () => {
  const result = await withFetch(
    () => new Response(null, { status: 201 }),
    () => sendPush(SUBSCRIPTION, '{"title":"hi"}', VAPID),
  )
  expect(result).toMatchObject({ ok: true, status: 201, gone: false })
})

test('404 and 410 mean the subscription is gone for good', async () => {
  for (const status of [404, 410]) {
    const result = await withFetch(
      () => new Response('unsubscribed', { status }),
      () => sendPush(SUBSCRIPTION, '{}', VAPID),
    )
    expect(result).toMatchObject({ ok: false, status, gone: true })
  }
})

test('a server error is a failure, but the subscription is kept', async () => {
  const result = await withFetch(
    () => new Response('nope', { status: 500 }),
    () => sendPush(SUBSCRIPTION, '{}', VAPID),
  )
  expect(result).toMatchObject({ ok: false, status: 500, gone: false })
})

test('a push service that cannot be reached never throws', async () => {
  const real = globalThis.fetch
  globalThis.fetch = (() => Promise.reject(new Error('connect ECONNREFUSED'))) as typeof fetch
  try {
    const result = await sendPush(SUBSCRIPTION, '{}', VAPID)
    expect(result).toMatchObject({ ok: false, status: 0, gone: false })
    expect(result.error).toContain('ECONNREFUSED')
  } finally {
    globalThis.fetch = real
  }
})

test('the request carries the aes128gcm headers a push service requires', async () => {
  let seen: Request | null = null
  await withFetch(
    (request) => {
      seen = request
      return new Response(null, { status: 201 })
    },
    () => sendPush(SUBSCRIPTION, '{"title":"hi"}', VAPID, { urgency: 'high', ttlSeconds: 120, topic: 'abc' }),
  )
  const request = seen as unknown as Request
  expect(request.headers.get('content-encoding')).toBe('aes128gcm')
  expect(request.headers.get('content-type')).toBe('application/octet-stream')
  expect(request.headers.get('ttl')).toBe('120')
  expect(request.headers.get('urgency')).toBe('high')
  expect(request.headers.get('topic')).toBe('abc')
  expect(request.headers.get('authorization')).toMatch(/^vapid t=[\w-]+\.[\w-]+\.[\w-]+, k=/)
})
