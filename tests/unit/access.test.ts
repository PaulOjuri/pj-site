import { test, expect } from '@playwright/test'
import { devBypass, requireAccess, teamOrigin, verifyAccessJwt } from '../../functions/_lib/access'
import type { AppEnv } from '../../functions/_lib/env'
import { bytesToB64url, utf8 } from '../../functions/_lib/bytes'

/**
 * The Access check, which is what stands between the open internet and Paul's inbox if Cloudflare Access
 * is ever misconfigured, bypassed, or pointed at the wrong application. The header alone proves nothing:
 * anyone can send one. These tests sign real tokens with a throwaway RSA key and serve them through a
 * stubbed JWKS endpoint.
 */

const TEAM = 'paulojuri.cloudflareaccess.com'
const AUD = 'a'.repeat(64)
const OWNER = 'owner@example.com'

const env = (over: Partial<AppEnv> = {}): AppEnv =>
  ({
    ACCESS_TEAM_DOMAIN: TEAM,
    ACCESS_AUD: AUD,
    APP_OWNER_EMAIL: OWNER,
    ...over,
  }) as AppEnv

/** Built once, lazily: Playwright's runner has no top-level await. */
/** The Workers type for a JWK has no `kid`; Access's certs endpoint serves one. */
type CertJwk = JsonWebKey & { kid?: string; alg?: string }

interface Signing {
  keys: CryptoKeyPair
  otherKeys: CryptoKeyPair
  jwk: CertJwk
}
let signing: Signing | null = null
const rsa = { name: 'RSASSA-PKCS1-v1_5', modulusLength: 2048, publicExponent: new Uint8Array([1, 0, 1]), hash: 'SHA-256' }

async function setup(): Promise<Signing> {
  if (signing) return signing
  const keys = (await crypto.subtle.generateKey(rsa, true, ['sign', 'verify'])) as CryptoKeyPair
  const otherKeys = (await crypto.subtle.generateKey(rsa, true, ['sign', 'verify'])) as CryptoKeyPair
  const exported = (await crypto.subtle.exportKey('jwk', keys.publicKey)) as JsonWebKey
  const jwk: CertJwk = { ...exported, kid: 'test-key', alg: 'RS256' }
  signing = { keys, otherKeys, jwk }
  return signing
}

// Serve the team's certs from memory; any other request fails loudly, so no test can reach the network.
const realFetch = globalThis.fetch
test.beforeAll(async () => {
  const { jwk } = await setup()
  globalThis.fetch = (async (input: RequestInfo | URL) => {
    const url = String(input instanceof Request ? input.url : input)
    if (url === `https://${TEAM}/cdn-cgi/access/certs`) {
      return new Response(JSON.stringify({ keys: [jwk] }), { headers: { 'content-type': 'application/json' } })
    }
    throw new Error(`unexpected fetch: ${url}`)
  }) as typeof fetch
})
test.afterAll(() => {
  globalThis.fetch = realFetch
})

const now = () => Math.floor(Date.now() / 1000)

async function sign(
  payload: Record<string, unknown>,
  options: { other?: boolean; header?: Record<string, unknown> } = {},
): Promise<string> {
  const { keys, otherKeys } = await setup()
  const header = bytesToB64url(utf8(JSON.stringify({ alg: 'RS256', kid: 'test-key', ...options.header })))
  const body = bytesToB64url(utf8(JSON.stringify(payload)))
  const signature = await crypto.subtle.sign(
    'RSASSA-PKCS1-v1_5',
    options.other ? otherKeys.privateKey : keys.privateKey,
    utf8(`${header}.${body}`),
  )
  return `${header}.${body}.${bytesToB64url(new Uint8Array(signature))}`
}

const good = (over: Record<string, unknown> = {}) => ({
  iss: `https://${TEAM}`,
  aud: [AUD],
  exp: now() + 3600,
  iat: now() - 10,
  email: OWNER,
  sub: 'user-1',
  ...over,
})

const withToken = (token: string) =>
  new Request('https://paulojuri.com/api/app/config', { headers: { 'Cf-Access-Jwt-Assertion': token } })

test('a team name is normalised to the certs origin', () => {
  expect(teamOrigin('paulojuri')).toBe('https://paulojuri.cloudflareaccess.com')
  expect(teamOrigin('paulojuri.cloudflareaccess.com')).toBe('https://paulojuri.cloudflareaccess.com')
  expect(teamOrigin('https://paulojuri.cloudflareaccess.com/')).toBe('https://paulojuri.cloudflareaccess.com')
})

test('a properly signed token for this application is accepted', async () => {
  const identity = await verifyAccessJwt(await sign(good()), env())
  expect(identity).toEqual({ email: OWNER, sub: 'user-1' })
})

test('a token signed by someone else is refused', async () => {
  expect(await verifyAccessJwt(await sign(good(), { other: true }), env())).toBe('bad signature')
})

test('a token for another Access application is refused', async () => {
  expect(await verifyAccessJwt(await sign(good({ aud: ['b'.repeat(64)] })), env())).toBe('wrong audience')
})

test('a token from another team is refused', async () => {
  expect(await verifyAccessJwt(await sign(good({ iss: 'https://someone-else.cloudflareaccess.com' })), env())).toBe(
    'wrong issuer',
  )
})

test('an expired token is refused', async () => {
  expect(await verifyAccessJwt(await sign(good({ exp: now() - 120 })), env())).toBe('expired')
})

test('a token for a different person is refused', async () => {
  expect(await verifyAccessJwt(await sign(good({ email: 'someone@else.com' })), env())).toBe('not the owner')
})

test('an unsigned token (alg: none) is refused', async () => {
  const header = bytesToB64url(utf8(JSON.stringify({ alg: 'none' })))
  const body = bytesToB64url(utf8(JSON.stringify(good())))
  expect(await verifyAccessJwt(`${header}.${body}.`, env())).toBe('unsupported alg none')
})

test('rubbish in the header is refused, not thrown', async () => {
  expect(await verifyAccessJwt('not-a-token', env())).toBe('malformed token')
  expect(await verifyAccessJwt('a.b.c', env())).toBe('unreadable token')
})

test('requireAccess refuses a request with no token at all', async () => {
  const response = await requireAccess(new Request('https://paulojuri.com/api/app/config'), env())
  expect(response).toBeInstanceOf(Response)
  expect((response as Response).status).toBe(401)
})

test('requireAccess refuses a forged token with 403', async () => {
  const forged = await sign(good(), { other: true })
  const response = await requireAccess(withToken(forged), env())
  expect((response as Response).status).toBe(403)
})

test('requireAccess lets the owner through', async () => {
  const identity = await requireAccess(withToken(await sign(good())), env())
  expect(identity).toEqual({ email: OWNER, sub: 'user-1' })
})

test('the dev bypass only works when Access is not configured at all', () => {
  expect(devBypass(env({ APP_ACCESS_DEV_BYPASS: '1' }))).toBe(false) // team domain is set: never bypassed
  expect(devBypass(env({ APP_ACCESS_DEV_BYPASS: '1', ACCESS_TEAM_DOMAIN: '' }))).toBe(true)
  expect(devBypass(env({ ACCESS_TEAM_DOMAIN: '' }))).toBe(false)
  expect(devBypass(env({ APP_ACCESS_DEV_BYPASS: 'yes', ACCESS_TEAM_DOMAIN: '' }))).toBe(false)
})

test('a deployed site with Access configured cannot be opened by the bypass flag', async () => {
  const response = await requireAccess(
    new Request('https://paulojuri.com/api/app/config'),
    env({ APP_ACCESS_DEV_BYPASS: '1' }),
  )
  expect((response as Response).status).toBe(401)
})
