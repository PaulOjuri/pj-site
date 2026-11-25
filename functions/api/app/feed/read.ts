// POST /api/app/feed/read: mark feed items as read, which is what clears the Feed tab's dot.
// {"ids": ["…"]} for specific cards, or {"all": true} for everything.
import { guarded, json } from '../_guard'
import { readJson, text, BadInput } from '../../../_lib/validate'

export const onRequestPost = guarded(async ({ request, env }) => {
  const body = await readJson(request)
  const now = new Date().toISOString()
  if (body.all === true) {
    const result = await env.AGENTS_DB.prepare('UPDATE app_feed SET read_at=?1 WHERE read_at IS NULL').bind(now).run()
    return json({ ok: true, marked: result.meta?.changes ?? 0 })
  }
  const ids = Array.isArray(body.ids) ? body.ids : []
  if (!ids.length || ids.length > 200) throw new BadInput('ids must be 1-200 feed item ids, or pass all: true')
  const checked = ids.map((id) => text(id, 'ids[]', { max: 64 }))
  const stmt = env.AGENTS_DB.prepare('UPDATE app_feed SET read_at=?2 WHERE id=?1 AND read_at IS NULL')
  const results = await env.AGENTS_DB.batch(checked.map((id) => stmt.bind(id, now)))
  return json({ ok: true, marked: results.reduce((n, r) => n + (r.meta?.changes ?? 0), 0) })
})
