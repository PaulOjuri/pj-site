export interface ChessEnv {
  CHESS_DB: D1Database
  CHESS_TOKEN: string
}

export function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json', 'cache-control': 'no-store' },
  })
}

export function authorised(request: Request, env: ChessEnv): boolean {
  const h = request.headers.get('authorization') || ''
  const token = h.startsWith('Bearer ') ? h.slice(7) : ''
  return Boolean(env.CHESS_TOKEN) && token === env.CHESS_TOKEN
}
