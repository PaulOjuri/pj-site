// Bearer-token auth for /api/agent/*, the only way in for the agents on Paul's Mac.
// Compared in constant time: a timing side channel on a long-lived token is worth closing.
import { timingSafeEqual } from './bytes'

export function bearer(request: Request): string {
  const header = request.headers.get('authorization') || ''
  return header.startsWith('Bearer ') ? header.slice(7).trim() : ''
}

export function tokenOk(request: Request, expected: string | undefined): boolean {
  if (!expected) return false
  return timingSafeEqual(bearer(request), expected)
}

export function unauthorised(): Response {
  return new Response(JSON.stringify({ error: 'unauthorised' }), {
    status: 401,
    headers: { 'content-type': 'application/json', 'cache-control': 'no-store' },
  })
}
