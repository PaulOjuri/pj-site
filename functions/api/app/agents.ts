/**
 * GET /api/app/agents: the agent network, as a graph the app can draw.
 *
 * Three sources, one answer:
 *   - `agent_roster`: who exists. The newest roster event a run sent, and nothing else — the app holds
 *     no copy of the roster, so an agent added on the Mac appears here after its next run.
 *   - `events`:       what each of them has been doing: its last runs, what they cost, what the guard
 *                     refused, and whether one is going on right now.
 *   - the inbox:      the open questions filed against each agent, so a node can say it is waiting on
 *                     Paul. Best effort: if GitHub is unreachable the map is still worth showing.
 *
 * The reducing is in src/lib/app/agents.ts, which has no Workers APIs in it and is tested on its own.
 */
import { guarded, json } from './_guard'
import { GithubError, listInboxBrief } from '../../_lib/github'
import {
  reduceNetwork,
  type AgentEventRow,
  type AgentIssueInput,
  type AgentsResponse,
  type RosterAgent,
} from '../../../src/lib/app/agents'

/** Enough history for five runs each and a week of blocked calls, without reading the whole log. */
const EVENT_LIMIT = 4000
const HISTORY_DAYS = 30

export const onRequestGet = guarded(async ({ env }) => {
  const latest = await env.AGENTS_DB.prepare(
    'SELECT ts, agents FROM agent_roster ORDER BY ts DESC LIMIT 1',
  ).first<{ ts: string; agents: string }>()

  let roster: RosterAgent[] = []
  if (latest) {
    try {
      const parsed: unknown = JSON.parse(latest.agents)
      if (Array.isArray(parsed)) roster = parsed as RosterAgent[]
    } catch {
      // A row we wrote ourselves from validated input; if it is somehow unreadable, say there is no
      // roster rather than failing the screen.
      console.error('agent_roster holds unreadable json')
    }
  }

  if (!roster.length) {
    const empty: AgentsResponse = { agents: [], roster_at: null }
    return json(empty)
  }

  const since = new Date(Date.now() - HISTORY_DAYS * 86_400_000).toISOString()
  const events = await env.AGENTS_DB.prepare(
    `SELECT run_id, ts, agent, type, summary, cost_usd
       FROM events
      WHERE ts >= ?1
      ORDER BY ts DESC
      LIMIT ?2`,
  )
    .bind(since, EVENT_LIMIT)
    .all<AgentEventRow>()

  let issues: AgentIssueInput[] = []
  let inboxError: string | undefined
  if (!env.GITHUB_INBOX_TOKEN) {
    inboxError = 'GITHUB_INBOX_TOKEN is not set'
  } else {
    try {
      issues = (await listInboxBrief(env)).map((i) => ({
        agent: i.project,
        number: i.number,
        question: i.question,
        kind: i.kind,
        decided: i.decided,
      }))
    } catch (err) {
      inboxError = err instanceof GithubError ? err.message : 'could not read the inbox'
    }
  }

  const body: AgentsResponse = {
    agents: reduceNetwork({ roster, events: events.results ?? [], issues }),
    roster_at: latest?.ts ?? null,
    ...(inboxError ? { inbox_error: inboxError } : {}),
  }
  return json(body)
})
