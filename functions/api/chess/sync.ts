// Pulled by chess-coach `coach sync` (nightly). Returns unsynced rows and marks them synced
// when the client confirms with ?ack=<max id> on the next call.
import { authorised, json, type ChessEnv } from './_auth'

export const onRequestGet: PagesFunction<ChessEnv> = async ({ request, env }) => {
  if (!authorised(request, env)) return json({ error: 'unauthorised' }, 401)
  const url = new URL(request.url)
  const ackDrills = url.searchParams.get('ack_drills')
  const ackGames = url.searchParams.get('ack_games')
  const ackSessions = url.searchParams.get('ack_sessions')
  if (ackDrills) await env.CHESS_DB.prepare('UPDATE drill_results SET synced=1 WHERE id <= ?').bind(Number(ackDrills)).run()
  if (ackGames) await env.CHESS_DB.prepare('UPDATE otb_games SET synced=1 WHERE id <= ?').bind(Number(ackGames)).run()
  if (ackSessions) await env.CHESS_DB.prepare('UPDATE session_done SET synced=1 WHERE at <= ?').bind(ackSessions).run()
  const drills = await env.CHESS_DB.prepare('SELECT * FROM drill_results WHERE synced=0 ORDER BY id LIMIT 2000').all()
  const games = await env.CHESS_DB.prepare('SELECT * FROM otb_games WHERE synced=0 ORDER BY id').all()
  const sessions = await env.CHESS_DB.prepare('SELECT * FROM session_done WHERE synced=0').all()
  return json({ drills: drills.results, otb_games: games.results, sessions: sessions.results })
}
