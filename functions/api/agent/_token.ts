// The gate for every /api/agent/* endpoint: the AGENT_APP_TOKEN bearer token and nothing else.
// Cloudflare Access protects /app and /api/app/*; these endpoints are called by the agents on Paul's
// Mac, which has no browser session, so they use their own token and are never behind Access.
import type { AppEnv } from '../../_lib/env'
import { tokenOk, unauthorised } from '../../_lib/token'
import { BadInput, errorResponse, json } from '../../_lib/validate'

export { json }
export type { AppEnv }

type Handler = (ctx: { request: Request; env: AppEnv; params: Record<string, string | string[]> }) => Promise<Response>

export function tokenGuarded(handler: Handler): PagesFunction<AppEnv> {
  return async ({ request, env, params }) => {
    if (!tokenOk(request, env.AGENT_APP_TOKEN)) return unauthorised()
    try {
      return await handler({ request, env, params: params as Record<string, string | string[]> })
    } catch (err) {
      if (!(err instanceof BadInput)) console.error('agent endpoint failed', String(err))
      return errorResponse(err)
    }
  }
}

export function one(params: Record<string, string | string[]>, name: string): string {
  const value = params[name]
  return Array.isArray(value) ? (value[0] ?? '') : (value ?? '')
}
