// Every /api/app/* endpoint starts here: Cloudflare Access (verified, not just believed) and one place
// that turns a thrown BadInput into a 422 instead of a 500.
import { requireAccess, type Identity } from '../../_lib/access'
import type { AppEnv } from '../../_lib/env'
import { BadInput, errorResponse, json } from '../../_lib/validate'

export { json }
export type { AppEnv }

type Handler = (ctx: { request: Request; env: AppEnv; params: Record<string, string | string[]>; identity: Identity }) => Promise<Response>

export function guarded(handler: Handler): PagesFunction<AppEnv> {
  return async ({ request, env, params }) => {
    const identity = await requireAccess(request, env)
    if (identity instanceof Response) return identity
    try {
      return await handler({ request, env, params: params as Record<string, string | string[]>, identity })
    } catch (err) {
      // Bad input is an answer, not an incident; only real failures are worth a log line.
      if (!(err instanceof BadInput)) console.error('app endpoint failed', String(err))
      return errorResponse(err)
    }
  }
}

/** The single path parameter of a [id] / [number] route. */
export function one(params: Record<string, string | string[]>, name: string): string {
  const value = params[name]
  return Array.isArray(value) ? (value[0] ?? '') : (value ?? '')
}
