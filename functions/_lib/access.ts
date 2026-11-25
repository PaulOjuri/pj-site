/**
 * Cloudflare Access, checked here as well as at the edge.
 *
 * Access is configured to let only Paul's email reach /app and /api/app/*, and it puts a signed JWT on
 * every request it allows. Trusting the header's presence would be enough only if nothing could ever
 * reach these Functions except through Access, so this verifies the token's signature against the team's
 * public keys, its issuer, its audience and its expiry, and (optionally) the email inside it.
 *
 * Keys: https://<team>.cloudflareaccess.com/cdn-cgi/access/certs, cached for an hour per isolate.
 */
import type { AppEnv } from './env'
import { b64urlToBytes, timingSafeEqual, utf8 } from './bytes'

export const ACCESS_HEADER = 'Cf-Access-Jwt-Assertion'
const CLOCK_SKEW_SECONDS = 60
const JWKS_TTL_MS = 60 * 60 * 1000

interface Jwk extends JsonWebKey {
  kid?: string
  alg?: string
}

const jwksCache = new Map<string, { at: number; keys: Jwk[] }>()

export function teamOrigin(teamDomain: string): string {
  const host = teamDomain.trim().replace(/^https?:\/\//, '').replace(/\/+$/, '')
  return `https://${host.includes('.') ? host : `${host}.cloudflareaccess.com`}`
}

async function jwks(origin: string): Promise<Jwk[]> {
  const cached = jwksCache.get(origin)
  if (cached && Date.now() - cached.at < JWKS_TTL_MS) return cached.keys
  const res = await fetch(`${origin}/cdn-cgi/access/certs`, { headers: { accept: 'application/json' } })
  if (!res.ok) throw new Error(`access certs: HTTP ${res.status}`)
  const body = (await res.json()) as { keys?: Jwk[] }
  const keys = body.keys ?? []
  if (!keys.length) throw new Error('access certs: no keys')
  jwksCache.set(origin, { at: Date.now(), keys })
  return keys
}

// Taken from the calls themselves, because the DOM and the Workers runtime name these types differently.
type ImportAlgorithm = Parameters<typeof crypto.subtle.importKey>[2]
type VerifyAlgorithm = Parameters<typeof crypto.subtle.verify>[0]

const ALGS: Record<string, { import: ImportAlgorithm; verify: VerifyAlgorithm }> = {
  RS256: {
    import: { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    verify: { name: 'RSASSA-PKCS1-v1_5' },
  },
  ES256: {
    import: { name: 'ECDSA', namedCurve: 'P-256' },
    verify: { name: 'ECDSA', hash: 'SHA-256' },
  },
}

export interface Identity {
  email: string
  sub: string
}

/** Verify one Access JWT. Returns the identity, or the reason it was refused. */
export async function verifyAccessJwt(token: string, env: AppEnv): Promise<Identity | string> {
  const parts = token.split('.')
  if (parts.length !== 3) return 'malformed token'
  const [rawHeader, rawPayload, rawSignature] = parts

  let header: { alg?: string; kid?: string }
  let payload: { iss?: string; aud?: string | string[]; exp?: number; iat?: number; nbf?: number; email?: string; sub?: string }
  try {
    header = JSON.parse(new TextDecoder().decode(b64urlToBytes(rawHeader)))
    payload = JSON.parse(new TextDecoder().decode(b64urlToBytes(rawPayload)))
  } catch {
    return 'unreadable token'
  }

  const alg = ALGS[header.alg ?? '']
  if (!alg) return `unsupported alg ${header.alg}`

  const origin = teamOrigin(env.ACCESS_TEAM_DOMAIN)
  if (payload.iss !== origin) return 'wrong issuer'

  const audiences = Array.isArray(payload.aud) ? payload.aud : payload.aud ? [payload.aud] : []
  if (!env.ACCESS_AUD || !audiences.some((a) => timingSafeEqual(a, env.ACCESS_AUD))) return 'wrong audience'

  const now = Math.floor(Date.now() / 1000)
  if (typeof payload.exp !== 'number' || payload.exp + CLOCK_SKEW_SECONDS < now) return 'expired'
  if (typeof payload.nbf === 'number' && payload.nbf - CLOCK_SKEW_SECONDS > now) return 'not yet valid'
  if (typeof payload.iat === 'number' && payload.iat - CLOCK_SKEW_SECONDS > now) return 'issued in the future'

  const candidates = (await jwks(origin)).filter((k) => !header.kid || !k.kid || k.kid === header.kid)
  const signature = b64urlToBytes(rawSignature)
  const signed = utf8(`${rawHeader}.${rawPayload}`)
  let verified = false
  for (const jwk of candidates) {
    try {
      const key = await crypto.subtle.importKey('jwk', jwk, alg.import, false, ['verify'])
      if (await crypto.subtle.verify(alg.verify, key, signature, signed)) {
        verified = true
        break
      }
    } catch {
      // a key of another type in the set; try the next one
    }
  }
  if (!verified) return 'bad signature'

  const email = (payload.email ?? '').toLowerCase()
  const expected = env.APP_OWNER_EMAIL?.trim().toLowerCase()
  if (expected && !timingSafeEqual(email, expected)) return 'not the owner'

  return { email, sub: payload.sub ?? '' }
}

/** True only when Access is not configured at all and .dev.vars asked for a bypass. */
export function devBypass(env: AppEnv): boolean {
  return env.APP_ACCESS_DEV_BYPASS === '1' && !env.ACCESS_TEAM_DOMAIN
}

/**
 * The gate for every /api/app/* endpoint: the identity, or a Response to return as-is.
 * `Cf-Access-Jwt-Assertion` alone is never enough; the signature has to check out.
 */
export async function requireAccess(request: Request, env: AppEnv): Promise<Identity | Response> {
  const deny = (reason: string, status = 403) =>
    new Response(JSON.stringify({ error: 'forbidden', reason }), {
      status,
      headers: { 'content-type': 'application/json', 'cache-control': 'no-store' },
    })

  const token = request.headers.get(ACCESS_HEADER) || getCookie(request, 'CF_Authorization')
  if (!token) {
    if (devBypass(env)) return { email: 'dev@localhost', sub: 'dev' }
    return deny('no Cloudflare Access token on this request', 401)
  }
  if (!env.ACCESS_TEAM_DOMAIN || !env.ACCESS_AUD) return deny('Access is not configured on this deployment', 500)
  const result = await verifyAccessJwt(token, env)
  return typeof result === 'string' ? deny(result) : result
}

export function getCookie(request: Request, name: string): string | null {
  const header = request.headers.get('cookie')
  if (!header) return null
  for (const part of header.split(';')) {
    const [k, ...rest] = part.trim().split('=')
    if (k === name) return rest.join('=')
  }
  return null
}
