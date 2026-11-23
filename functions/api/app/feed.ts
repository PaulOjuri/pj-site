/**
 * GET /api/app/feed: the timeline. Two sources in one list:
 *   - app_feed: everything that was pushed (agent notifications, reminders, chat replies, inbox notices)
 *   - events:   the agents' own run events from step 4, so a run shows up next to what it produced
 *
 * Only the events worth a line are included (runs, delegations and blocked tools); the tool-by-tool
 * detail stays in the `events` table. This is the /agents page README step 5 asked for, inside the app.
 *
 * Filters: ?project=<slug>&kind=<slug>&limit=&before=<iso>
 */
import { guarded, json } from './_guard'
import { slug, integer, isoInstant } from '../../_lib/validate'

const EVENT_KINDS = "CASE WHEN type IN ('run_failed','tool_blocked') THEN 'alert' ELSE 'run' END"
const EVENT_TYPES = "('run_started','run_finished','run_failed','delegated','tool_blocked')"

interface Row {
  id: string
  ts: string
  kind: string
  project: string | null
  title: string
  body: string | null
  url: string | null
  priority: string
  source: string
  read_at: string | null
}

export const onRequestGet = guarded(async ({ request, env }) => {
  const url = new URL(request.url)
  const project = slug(url.searchParams.get('project'), 'project')
  const kind = slug(url.searchParams.get('kind'), 'kind')
  const limit = integer(url.searchParams.get('limit'), 'limit', { min: 1, max: 200, fallback: 60 })
  const before = url.searchParams.get('before') ? isoInstant(url.searchParams.get('before'), 'before') : null

  // One statement, so the two sources are paged together instead of interleaved in JavaScript.
  const sql = `
    SELECT id, ts, kind, project, title, body, url, priority, source, read_at
      FROM app_feed
     WHERE (?1 IS NULL OR project = ?1)
       AND (?2 IS NULL OR kind = ?2)
       AND (?3 IS NULL OR ts < ?3)
    UNION ALL
    SELECT id, ts, ${EVENT_KINDS} AS kind, agent AS project, summary AS title,
           NULL AS body, NULL AS url, 'normal' AS priority, 'events' AS source, NULL AS read_at
      FROM events
     WHERE type IN ${EVENT_TYPES}
       AND (?1 IS NULL OR agent = ?1)
       AND (?2 IS NULL OR ${EVENT_KINDS} = ?2)
       AND (?3 IS NULL OR ts < ?3)
     ORDER BY ts DESC
     LIMIT ?4`
  const rows = await env.AGENTS_DB.prepare(sql).bind(project ?? null, kind ?? null, before, limit).all<Row>()

  const projects = await env.AGENTS_DB.prepare(
    `SELECT project AS name FROM app_feed WHERE project IS NOT NULL
     UNION SELECT agent AS name FROM events ORDER BY name`,
  ).all<{ name: string }>()

  const unread = await env.AGENTS_DB.prepare(
    'SELECT COUNT(*) AS n FROM app_feed WHERE read_at IS NULL',
  ).first<{ n: number }>()

  return json({
    items: rows.results ?? [],
    projects: (projects.results ?? []).map((p) => p.name),
    unread: unread?.n ?? 0,
  })
})
