import { authorised, json, type ChessEnv } from '../_auth'

export const onRequestPost: PagesFunction<ChessEnv> = async ({ request, env }) => {
  if (!authorised(request, env)) return json({ error: 'unauthorised' }, 401)
  let body: { card_id?: string; kind?: string; grade?: number; correct?: boolean; elapsed_ms?: number; session_id?: string; detail?: unknown }
  try { body = await request.json() } catch { return json({ error: 'invalid json' }, 400) }
  if (!body.card_id || !body.kind || !body.grade || body.grade < 1 || body.grade > 4) return json({ error: 'card_id, kind, grade(1-4) required' }, 400)
  await env.CHESS_DB.prepare(
    'INSERT INTO drill_results (at, card_id, kind, grade, correct, elapsed_ms, session_id, detail) VALUES (?,?,?,?,?,?,?,?)',
  ).bind(new Date().toISOString(), body.card_id, body.kind, body.grade, body.correct == null ? null : Number(body.correct),
    body.elapsed_ms ?? null, body.session_id ?? null, body.detail == null ? null : JSON.stringify(body.detail)).run()
  return json({ ok: true })
}
