/**
 * Fixed-window rate limiting in D1, so the token endpoints can't be used to drain the push quota or
 * fill the feed. One row per window per bucket; old rows are swept as they are passed.
 */

export interface RateVerdict {
  ok: boolean
  limit: number
  remaining: number
  retryAfterSeconds: number
}

export async function rateLimit(
  db: D1Database,
  name: string,
  opts: { limit: number; windowSeconds: number },
): Promise<RateVerdict> {
  const now = Math.floor(Date.now() / 1000)
  const windowStart = now - (now % opts.windowSeconds)
  const bucket = `${name}:${windowStart}`
  const row = await db
    .prepare(
      `INSERT INTO app_rate (bucket, count, window_start) VALUES (?1, 1, ?2)
       ON CONFLICT(bucket) DO UPDATE SET count = count + 1
       RETURNING count`,
    )
    .bind(bucket, windowStart)
    .first<{ count: number }>()
  const count = row?.count ?? 1
  // Cheap housekeeping: drop windows that can no longer be current.
  if (count === 1) {
    await db
      .prepare('DELETE FROM app_rate WHERE window_start < ?1')
      .bind(windowStart - opts.windowSeconds * 4)
      .run()
  }
  return {
    ok: count <= opts.limit,
    limit: opts.limit,
    remaining: Math.max(0, opts.limit - count),
    retryAfterSeconds: windowStart + opts.windowSeconds - now,
  }
}

export function tooManyRequests(verdict: RateVerdict): Response {
  return new Response(JSON.stringify({ error: 'rate limited', limit: verdict.limit }), {
    status: 429,
    headers: {
      'content-type': 'application/json',
      'cache-control': 'no-store',
      'retry-after': String(verdict.retryAfterSeconds),
    },
  })
}
