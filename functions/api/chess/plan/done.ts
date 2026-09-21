import { authorised, json, type ChessEnv } from '../_auth'

export const onRequestPost: PagesFunction<ChessEnv> = async ({ request, env }) => {
  if (!authorised(request, env)) return json({ error: 'unauthorised' }, 401)
  let body: { session_id?: string; done?: boolean; note?: string }
  try { body = await request.json() } catch { return json({ error: 'invalid json' }, 400) }
  if (!body.session_id || typeof body.done !== 'boolean') return json({ error: 'session_id and done required' }, 400)
  await env.CHESS_DB.prepare(
    'INSERT INTO session_done (session_id, done, at, note, synced) VALUES (?,?,?,?,0) ON CONFLICT(session_id) DO UPDATE SET done=excluded.done, at=excluded.at, note=excluded.note, synced=0',
  ).bind(body.session_id, Number(body.done), new Date().toISOString(), body.note ?? null).run()
  return json({ ok: true })
}

export const onRequestGet: PagesFunction<ChessEnv> = async ({ env }) => {
  // Public read: which sessions are done (no secrets in here).
  const rows = await env.CHESS_DB.prepare('SELECT session_id, done, at FROM session_done').all()
  return json({ sessions: rows.results })
}
