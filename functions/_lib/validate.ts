/**
 * Input validation for the agent app's endpoints.
 *
 * The site's Functions validate by hand (see functions/api/agents/_shared.ts `toRow`), so this follows
 * that rather than adding a schema library to every Function bundle: one small module, every field
 * length-capped, exercised in tests/unit/validate.test.ts.
 *
 * Everything that comes in is untrusted: the agents' notify calls, Paul's own forms, and GitHub text.
 */

export class BadInput extends Error {}

const fail = (message: string): never => {
  throw new BadInput(message)
}

export function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json', 'cache-control': 'no-store' },
  })
}

/** Turn a BadInput into 422, anything else into 500. */
export function errorResponse(err: unknown): Response {
  if (err instanceof BadInput) return json({ error: err.message }, 422)
  return json({ error: 'server error' }, 500)
}

/** Parse a JSON body, with a hard size cap so a Function can't be made to buffer megabytes. */
export async function readJson(request: Request, maxBytes = 64_000): Promise<Record<string, unknown>> {
  const declared = Number(request.headers.get('content-length') || 0)
  if (declared > maxBytes) fail('body too large')
  const raw = await request.text()
  if (raw.length > maxBytes) fail('body too large')
  if (!raw.trim()) return {}
  let parsed: unknown
  try {
    parsed = JSON.parse(raw)
  } catch {
    fail('invalid json')
  }
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) fail('body must be a json object')
  return parsed as Record<string, unknown>
}

export function text(value: unknown, field: string, opts: { min?: number; max: number }): string {
  if (typeof value !== 'string') fail(`${field} must be a string`)
  const v = (value as string).replace(/\u0000/g, '').trim()
  if (v.length < (opts.min ?? 1)) fail(`${field} is required`)
  if (v.length > opts.max) fail(`${field} must be at most ${opts.max} characters`)
  return v
}

export function optionalText(value: unknown, field: string, opts: { max: number }): string | undefined {
  if (value == null || value === '') return undefined
  return text(value, field, { min: 1, max: opts.max })
}

export function oneOf<T extends string>(value: unknown, field: string, allowed: readonly T[], fallback?: T): T {
  if (value == null || value === '') {
    if (fallback !== undefined) return fallback
    fail(`${field} is required`)
  }
  if (typeof value !== 'string' || !allowed.includes(value as T)) fail(`${field} must be one of: ${allowed.join(', ')}`)
  return value as T
}

export function integer(value: unknown, field: string, opts: { min: number; max: number; fallback?: number }): number {
  if (value == null || value === '') {
    if (opts.fallback !== undefined) return opts.fallback
    fail(`${field} is required`)
  }
  const n = typeof value === 'number' ? value : Number(value)
  if (!Number.isInteger(n)) fail(`${field} must be a whole number`)
  if (n < opts.min || n > opts.max) fail(`${field} must be between ${opts.min} and ${opts.max}`)
  return n
}

/**
 * A deep link. Only a path on this site is allowed, so a notification can never be made to open
 * somewhere else, and `javascript:` can never reach a click handler.
 */
export function deepLink(value: unknown, field = 'url'): string | undefined {
  if (value == null || value === '') return undefined
  const v = text(value, field, { max: 300 })
  if (!v.startsWith('/') || v.startsWith('//')) fail(`${field} must be a path on this site, e.g. /app#inbox/12`)
  if (/[\s<>"'\\]/.test(v)) fail(`${field} contains characters that are not allowed`)
  return v
}

const DATE = /^\d{4}-\d{2}-\d{2}$/
const TIME = /^\d{2}:\d{2}$/

export function dateString(value: unknown, field = 'date'): string {
  const v = text(value, field, { max: 10 })
  if (!DATE.test(v) || Number.isNaN(Date.parse(`${v}T00:00:00Z`))) fail(`${field} must look like 2026-11-30`)
  return v
}

export function timeString(value: unknown, field = 'time'): string {
  const v = text(value, field, { max: 5 })
  if (!TIME.test(v)) fail(`${field} must look like 08:30`)
  const [h, m] = v.split(':').map(Number)
  if (h > 23 || m > 59) fail(`${field} must be a real time of day`)
  return v
}

export function isoInstant(value: unknown, field: string): string {
  const v = text(value, field, { max: 40 })
  const t = Date.parse(v)
  if (Number.isNaN(t)) fail(`${field} must be an ISO timestamp`)
  return new Date(t).toISOString()
}

/** Projects and kinds end up in URLs and SQL filters, so keep them to a plain slug. */
/** base64url with no padding, which is how every Web Push key is sent. */
const B64URL = /^[A-Za-z0-9_-]+$/
export function base64url(value: unknown, field: string, expectedBytes: number): string {
  const v = text(value, field, { max: 400 })
  if (!B64URL.test(v)) fail(`${field} must be base64url`)
  // 4 base64 characters carry 3 bytes; the last group may be short by one or two.
  const bytes = Math.floor((v.length * 3) / 4)
  if (bytes !== expectedBytes) fail(`${field} must be a ${expectedBytes}-byte value`)
  return v
}

const SLUG = /^[a-z0-9][a-z0-9-]{0,39}$/
export function slug(value: unknown, field: string, fallback?: string): string | undefined {
  if (value == null || value === '') return fallback
  const v = text(value, field, { max: 40 }).toLowerCase()
  if (!SLUG.test(v)) fail(`${field} must be lowercase letters, numbers and dashes`)
  return v
}
