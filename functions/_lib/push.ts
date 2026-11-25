/**
 * Web Push, WebCrypto only, so it runs on Cloudflare Workers.
 *
 * Node's `web-push` can't run here (it wants node:crypto's ECDH and a real TCP stack), so this is the
 * payload encryption of RFC 8291 (aes128gcm, RFC 8188 records) and the VAPID authorisation of RFC 8292,
 * written against SubtleCrypto.
 *
 *   RFC 8291 §3.1   key derivation: ECDH, then HKDF-SHA256 twice
 *   RFC 8188 §2.1   the record: salt | rs | idlen | keyid | ciphertext
 *   RFC 8292 §2     Authorization: vapid t=<JWT>, k=<public key>
 *
 * The derivation, step by step, with `ua` the subscriber and `as` this server:
 *
 *   ecdh_secret = ECDH(as_private, ua_public)
 *   PRK_key     = HMAC-SHA256(auth_secret, ecdh_secret)
 *   key_info    = "WebPush: info" | 0x00 | ua_public | as_public
 *   IKM         = HMAC-SHA256(PRK_key, key_info | 0x01)
 *   PRK         = HMAC-SHA256(salt, IKM)
 *   CEK         = HMAC-SHA256(PRK, "Content-Encoding: aes128gcm" | 0x00 | 0x01)[0..16]
 *   NONCE       = HMAC-SHA256(PRK, "Content-Encoding: nonce"     | 0x00 | 0x01)[0..12]
 *
 * Tested against the worked example in RFC 8291 §5 (tests/unit/push.test.ts).
 */
import { b64urlToBytes, bytesToB64url, concat, uint32be, utf8 } from './bytes'

export interface SubscriptionKeys {
  /** base64url, the subscriber's uncompressed P-256 public key (65 bytes). */
  p256dh: string
  /** base64url, the subscriber's auth secret (16 bytes). */
  auth: string
}

export interface VapidConfig {
  publicKey: string // base64url, 65 bytes uncompressed
  privateKey: string // base64url, the 32-byte scalar
  subject: string // mailto: or https: URL identifying the sender
}

const P256 = { name: 'ECDH', namedCurve: 'P-256' } as const
const ECDSA = { name: 'ECDSA', namedCurve: 'P-256' } as const
/** One record, big enough for any payload we send. Must be >= plaintext + 17 (RFC 8188 §4.3). */
export const RECORD_SIZE = 4096
/** Push services reject bodies over 4096 bytes; the plaintext has to leave room for padding and the tag. */
export const MAX_PAYLOAD_BYTES = 3800

/**
 * The peer's key for an ECDH deriveBits call. Workers' generated types spell the field `$public`
 * while every runtime, Workers included, reads `public`, so the object is built correctly once here
 * and cast rather than written differently in two places.
 */
const ecdhWith = (publicKey: CryptoKey) =>
  ({ name: 'ECDH', public: publicKey }) as unknown as Parameters<typeof crypto.subtle.deriveBits>[0]

async function hmac(key: Uint8Array, data: Uint8Array): Promise<Uint8Array> {
  const k = await crypto.subtle.importKey('raw', key, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'])
  return new Uint8Array(await crypto.subtle.sign('HMAC', k, data))
}

/** HKDF-SHA256 for one output block (every value here is 32 bytes or fewer). */
async function hkdf(salt: Uint8Array, ikm: Uint8Array, info: Uint8Array, length: number): Promise<Uint8Array> {
  const prk = await hmac(salt, ikm)
  const okm = await hmac(prk, concat(info, new Uint8Array([1])))
  return okm.subarray(0, length)
}

/**
 * The uncompressed point 0x04|X|Y as a JWK, so a raw private scalar can be imported with it.
 * WebCrypto has no "raw" import for private keys, and both VAPID and the RFC 8291 test vector hand
 * out exactly that: 32 private bytes plus the 65 public ones.
 */
function jwkFromRaw(publicKey: Uint8Array, privateKey?: Uint8Array): JsonWebKey {
  if (publicKey.length !== 65 || publicKey[0] !== 0x04) throw new Error('public key must be 65 uncompressed bytes')
  return {
    kty: 'EC',
    crv: 'P-256',
    x: bytesToB64url(publicKey.subarray(1, 33)),
    y: bytesToB64url(publicKey.subarray(33, 65)),
    ...(privateKey ? { d: bytesToB64url(privateKey) } : {}),
    ext: true,
  }
}

export interface ServerKeys {
  privateKey: CryptoKey
  publicKeyBytes: Uint8Array
}

/** A fresh ephemeral ECDH key pair for one message, as RFC 8291 requires. */
export async function newServerKeys(): Promise<ServerKeys> {
  // generateKey is typed as key-or-pair; for ECDH it is always a pair.
  const pair = (await crypto.subtle.generateKey(P256, true, ['deriveBits'])) as CryptoKeyPair
  // exportKey is typed as bytes-or-JWK; 'raw' is always bytes.
  const raw = new Uint8Array((await crypto.subtle.exportKey('raw', pair.publicKey)) as ArrayBuffer)
  return { privateKey: pair.privateKey, publicKeyBytes: raw }
}

/** The same thing from fixed bytes, which is how the RFC 8291 test vector is reproduced. */
export async function serverKeysFrom(privateKeyB64url: string, publicKeyB64url: string): Promise<ServerKeys> {
  const publicKeyBytes = b64urlToBytes(publicKeyB64url)
  const privateKey = await crypto.subtle.importKey(
    'jwk',
    jwkFromRaw(publicKeyBytes, b64urlToBytes(privateKeyB64url)),
    P256,
    false,
    ['deriveBits'],
  )
  return { privateKey, publicKeyBytes }
}

/**
 * Encrypt one push message. Returns the aes128gcm body to POST to the endpoint:
 * `salt(16) | rs(4) | idlen(1) | as_public(65) | ciphertext`.
 */
export async function encryptPayload(
  payload: string | Uint8Array,
  keys: SubscriptionKeys,
  opts: { salt?: Uint8Array; serverKeys?: ServerKeys; recordSize?: number } = {},
): Promise<Uint8Array> {
  const plaintext = typeof payload === 'string' ? utf8(payload) : payload
  if (plaintext.length > MAX_PAYLOAD_BYTES) throw new Error(`payload too large (${plaintext.length} bytes)`)

  const uaPublicBytes = b64urlToBytes(keys.p256dh)
  const authSecret = b64urlToBytes(keys.auth)
  const salt = opts.salt ?? crypto.getRandomValues(new Uint8Array(16))
  const recordSize = opts.recordSize ?? RECORD_SIZE
  const server = opts.serverKeys ?? (await newServerKeys())

  const uaPublic = await crypto.subtle.importKey('raw', uaPublicBytes, P256, false, [])
  const ecdhSecret = new Uint8Array(await crypto.subtle.deriveBits(ecdhWith(uaPublic), server.privateKey, 256))

  // RFC 8291 §3.1: the subscriber's auth secret salts the first HKDF, and both public keys go in the info.
  const keyInfo = concat(utf8('WebPush: info'), new Uint8Array([0]), uaPublicBytes, server.publicKeyBytes)
  const ikm = await hkdf(authSecret, ecdhSecret, keyInfo, 32)

  const cek = await hkdf(salt, ikm, utf8('Content-Encoding: aes128gcm\0'), 16)
  const nonce = await hkdf(salt, ikm, utf8('Content-Encoding: nonce\0'), 12)

  // One record, so the padding delimiter is 0x02 (RFC 8188 §2: last record).
  const padded = concat(plaintext, new Uint8Array([2]))
  const aesKey = await crypto.subtle.importKey('raw', cek, 'AES-GCM', false, ['encrypt'])
  const ciphertext = new Uint8Array(
    await crypto.subtle.encrypt({ name: 'AES-GCM', iv: nonce, tagLength: 128 }, aesKey, padded),
  )

  return concat(salt, uint32be(recordSize), new Uint8Array([server.publicKeyBytes.length]), server.publicKeyBytes, ciphertext)
}

/** RFC 8292: a short-lived ES256 JWT for the push service's origin, plus the VAPID public key. */
export async function vapidHeaders(endpoint: string, vapid: VapidConfig, nowSeconds?: number): Promise<HeadersInit> {
  const aud = new URL(endpoint).origin
  const now = nowSeconds ?? Math.floor(Date.now() / 1000)
  const header = bytesToB64url(utf8(JSON.stringify({ typ: 'JWT', alg: 'ES256' })))
  const body = bytesToB64url(utf8(JSON.stringify({ aud, exp: now + 12 * 60 * 60, sub: vapid.subject })))
  const signingInput = utf8(`${header}.${body}`)

  const key = await crypto.subtle.importKey(
    'jwk',
    jwkFromRaw(b64urlToBytes(vapid.publicKey), b64urlToBytes(vapid.privateKey)),
    ECDSA,
    false,
    ['sign'],
  )
  const signature = new Uint8Array(await crypto.subtle.sign({ name: 'ECDSA', hash: 'SHA-256' }, key, signingInput))
  return { authorization: `vapid t=${header}.${body}.${bytesToB64url(signature)}, k=${vapid.publicKey}` }
}

export interface PushResult {
  ok: boolean
  status: number
  /** True when the push service says this subscription is gone for good (404/410): delete the row. */
  gone: boolean
  error?: string
}

/**
 * Send one message. Never throws: a dead push service must not take an endpoint down with it.
 * `urgency` maps our priorities onto RFC 8030 §5.3, and `topic` lets a push service replace an
 * undelivered message of the same topic rather than stack another one up.
 */
export async function sendPush(
  subscription: { endpoint: string } & SubscriptionKeys,
  payload: string,
  vapid: VapidConfig,
  opts: { ttlSeconds?: number; urgency?: 'very-low' | 'low' | 'normal' | 'high'; topic?: string } = {},
): Promise<PushResult> {
  try {
    const body = await encryptPayload(payload, subscription)
    const headers: Record<string, string> = {
      ...((await vapidHeaders(subscription.endpoint, vapid)) as Record<string, string>),
      'content-encoding': 'aes128gcm',
      'content-type': 'application/octet-stream',
      ttl: String(opts.ttlSeconds ?? 60 * 60 * 24),
      urgency: opts.urgency ?? 'normal',
    }
    if (opts.topic) headers.topic = opts.topic
    const res = await fetch(subscription.endpoint, { method: 'POST', headers, body })
    if (res.ok) return { ok: true, status: res.status, gone: false }
    const text = await res.text().catch(() => '')
    return {
      ok: false,
      status: res.status,
      gone: res.status === 404 || res.status === 410,
      error: text.slice(0, 200) || `HTTP ${res.status}`,
    }
  } catch (err) {
    return { ok: false, status: 0, gone: false, error: String(err).slice(0, 200) }
  }
}
