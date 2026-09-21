import { authorised, json, type ChessEnv } from '../_auth'

export const onRequestPost: PagesFunction<ChessEnv> = async ({ request, env }) => {
  if (!authorised(request, env)) return json({ error: 'unauthorised' }, 401)
  let body: { pgn?: string; meta?: Record<string, unknown> }
  try { body = await request.json() } catch { return json({ error: 'invalid json' }, 400) }
  if (!body.pgn || body.pgn.length < 20 || body.pgn.length > 100_000) return json({ error: 'pgn required' }, 400)
  await env.CHESS_DB.prepare('INSERT INTO otb_games (at, pgn, meta) VALUES (?,?,?)')
    .bind(new Date().toISOString(), body.pgn, JSON.stringify(body.meta ?? {})).run()
  return json({ ok: true })
}
