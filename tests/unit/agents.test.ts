import { test, expect } from '@playwright/test'
import {
  firstSentence,
  openDecisions,
  outcomeOf,
  reduceNetwork,
  toneOfAgent,
  RUNNING_WINDOW_MS,
  type AgentEventRow,
  type AgentIssueInput,
  type RosterAgent,
} from '../../src/lib/app/agents'
import { isRoster, toRoster } from '../../functions/api/agents/_shared'
import { onRequestGet } from '../../functions/api/app/agents'
import type { AppEnv } from '../../functions/_lib/env'

/**
 * The Agents tab's reducer: the roster the agents report, plus their event log, plus the inbox, turned
 * into the graph the app draws. This is where the rules live that a screenshot cannot check — what
 * counts as running, which tone a node carries, how a run's outcome is read — so they are checked here
 * rather than through the browser.
 *
 * The last test is the endpoint's gate: /api/app/agents must be as shut as every other /api/app route.
 */

const NOW = Date.parse('2026-11-26T12:00:00Z')
const ago = (ms: number) => new Date(NOW - ms).toISOString()
const MIN = 60_000

const roster: RosterAgent[] = [
  {
    name: 'orchestrator',
    description: "The orchestrator of Paul's agent network. It delegates and never does the work itself.",
    model: 'sonnet',
    tools: ['Agent', 'mcp__inbox__ask_paul'],
    repo: 'PaulOjuri/agent-network',
    canWrite: false,
    parent: null,
  },
  {
    name: 'unalone',
    description: 'Status reporter for Unalone. Use for any question about the pilot.',
    model: 'sonnet',
    tools: ['Read', 'Grep', 'Glob', 'Bash'],
    repo: 'PaulOjuri/unalone',
    canWrite: false,
    parent: 'orchestrator',
  },
  {
    name: 'alfera',
    description: 'Account manager and build lead for Alfera Technik. Use for anything about the client.',
    model: 'sonnet',
    tools: ['Read', 'Write', 'Edit'],
    repo: 'PaulOjuri/alfera',
    canWrite: true,
    parent: 'orchestrator',
  },
  {
    name: 'founder-proxy',
    description: "Unalone's founder proxy. It recommends only and never decides.",
    model: 'fable',
    tools: ['Read', 'Grep', 'Glob'],
    repo: 'PaulOjuri/unalone',
    canWrite: false,
    parent: 'unalone',
  },
]

const events: AgentEventRow[] = [
  // An orchestrator run that finished half an hour ago, with the cost on its last event.
  { run_id: 'r1', ts: ago(40 * MIN), agent: 'orchestrator', type: 'run_started', summary: 'this week’s briefing', cost_usd: null },
  { run_id: 'r1', ts: ago(39 * MIN), agent: 'orchestrator', type: 'delegated', summary: 'asked unalone', cost_usd: null },
  { run_id: 'r1', ts: ago(30 * MIN), agent: 'orchestrator', type: 'run_finished', summary: 'done', cost_usd: 0.42 },
  // unalone in that run: finished, then blocked twice in an older one.
  { run_id: 'r1', ts: ago(39 * MIN), agent: 'unalone', type: 'run_started', summary: 'report on the pilot', cost_usd: null },
  { run_id: 'r1', ts: ago(38 * MIN), agent: 'unalone', type: 'tool_call', summary: 'read BOARD.md', cost_usd: null },
  { run_id: 'r1', ts: ago(31 * MIN), agent: 'unalone', type: 'run_finished', summary: 'report returned', cost_usd: null },
  { run_id: 'r0', ts: ago(3 * 24 * 60 * MIN), agent: 'unalone', type: 'tool_blocked', summary: 'Bash blocked: pipes', cost_usd: null },
  { run_id: 'r0', ts: ago(3 * 24 * 60 * MIN), agent: 'unalone', type: 'tool_blocked', summary: 'Bash blocked: pipes', cost_usd: null },
  { run_id: 'old', ts: ago(20 * 24 * 60 * MIN), agent: 'unalone', type: 'tool_blocked', summary: 'Bash blocked: ls', cost_usd: null },
  // alfera is going right now: started two minutes ago, nothing has finished it.
  { run_id: 'r2', ts: ago(2 * MIN), agent: 'alfera', type: 'run_started', summary: 'update the client file', cost_usd: null },
  { run_id: 'r2', ts: ago(1 * MIN), agent: 'alfera', type: 'tool_call', summary: 'read CLIENT.md', cost_usd: null },
  // ...and its previous run ran out of budget.
  { run_id: 'r1', ts: ago(39 * MIN), agent: 'alfera', type: 'run_started', summary: 'scope Alf', cost_usd: null },
  { run_id: 'r1', ts: ago(33 * MIN), agent: 'alfera', type: 'run_failed', summary: 'error_max_budget_usd', cost_usd: 1.0 },
]

const issues: AgentIssueInput[] = [
  { agent: 'unalone', number: 12, question: 'Which launch date?', kind: 'decision', decided: false },
  { agent: 'unalone', number: 13, question: 'What do EU hosts charge?', kind: 'research', decided: false },
  { agent: 'orchestrator', number: 14, question: 'Already settled', kind: 'decision', decided: true },
]

const reduce = () => reduceNetwork({ roster, events, issues, now: NOW })
const find = (name: string) => {
  const node = reduce().find((a) => a.name === name)
  if (!node) throw new Error(`${name} is not in the graph`)
  return node
}

test('the graph comes back in drawing order: a parent, then what answers to it', () => {
  expect(reduce().map((a) => `${a.depth}:${a.name}`)).toEqual([
    '0:orchestrator',
    '1:unalone',
    '2:founder-proxy',
    '1:alfera',
  ])
})

test('children are listed on their parent, not guessed from the indent', () => {
  expect(find('orchestrator').children).toEqual(['unalone', 'alfera'])
  expect(find('unalone').children).toEqual(['founder-proxy'])
  expect(find('founder-proxy').children).toEqual([])
})

test('the last finished run gives the time, the outcome and the cost', () => {
  const orchestrator = find('orchestrator')
  expect(orchestrator.last_outcome).toBe('ok')
  expect(orchestrator.last_run_at).toBe(ago(30 * MIN))
  expect(orchestrator.last_cost_usd).toBeCloseTo(0.42)
  expect(orchestrator.state).toBe('ok')
  expect(orchestrator.tone).toBe('ok')
})

test('a run with no finished event is running now, and does not move the last outcome', () => {
  const alfera = find('alfera')
  expect(alfera.running).toBe(true)
  expect(alfera.state).toBe('running')
  expect(alfera.tone).toBe('warn')
  // The run before it ran out of budget, which is its own outcome, not a plain failure.
  expect(alfera.last_outcome).toBe('budget')
  expect(alfera.last_cost_usd).toBeCloseTo(1)
})

test('a run nothing has finished for ten minutes is over, not running', () => {
  const stale = reduceNetwork({
    roster,
    events: [{ run_id: 'r9', ts: ago(RUNNING_WINDOW_MS + MIN), agent: 'alfera', type: 'run_started', summary: 'x', cost_usd: null }],
    now: NOW,
  }).find((a) => a.name === 'alfera')
  expect(stale?.running).toBe(false)
  // Nothing ever finished, so there is no outcome to show either.
  expect(stale?.state).toBe('quiet')
  expect(stale?.tone).toBe('muted')
})

test('blocked calls are counted over seven days and no further', () => {
  expect(find('unalone').blocked_7d).toBe(2)
})

test('an open decision turns a node gold; a decided one does not', () => {
  expect(find('unalone').tone).toBe('accent')
  expect(openDecisions(find('unalone').issues)).toBe(1)
  // The orchestrator's only issue is already decided, so it keeps its green.
  expect(find('orchestrator').tone).toBe('ok')
})

test('a fault outranks a queue: a failed run is red even with a decision waiting', () => {
  const failed = reduceNetwork({
    roster,
    events: [
      { run_id: 'r1', ts: ago(5 * MIN), agent: 'unalone', type: 'run_started', summary: 'x', cost_usd: null },
      { run_id: 'r1', ts: ago(4 * MIN), agent: 'unalone', type: 'run_failed', summary: 'ended without a result', cost_usd: 0.1 },
    ],
    issues,
    now: NOW,
  }).find((a) => a.name === 'unalone')
  expect(failed?.state).toBe('failed')
  expect(failed?.tone).toBe('danger')
})

test('an agent with no events at all is quiet, not broken', () => {
  const proxy = find('founder-proxy')
  expect(proxy.state).toBe('quiet')
  expect(proxy.tone).toBe('muted')
  expect(proxy.runs).toEqual([])
  expect(proxy.last_run_at).toBeNull()
})

test('at most five runs, newest first, each with what it did', () => {
  const many: AgentEventRow[] = []
  for (let i = 0; i < 8; i++) {
    many.push({ run_id: `m${i}`, ts: ago((i + 1) * 60 * MIN), agent: 'unalone', type: 'run_started', summary: `run ${i}`, cost_usd: null })
    many.push({ run_id: `m${i}`, ts: ago((i + 1) * 60 * MIN - MIN), agent: 'unalone', type: 'tool_call', summary: 'read', cost_usd: null })
    many.push({ run_id: `m${i}`, ts: ago((i + 1) * 60 * MIN - 2 * MIN), agent: 'unalone', type: 'run_finished', summary: 'done', cost_usd: 0.1 })
  }
  const node = reduceNetwork({ roster, events: many, now: NOW }).find((a) => a.name === 'unalone')
  expect(node?.runs).toHaveLength(5)
  expect(node?.runs.map((r) => r.label)).toEqual(['run 0', 'run 1', 'run 2', 'run 3', 'run 4'])
  expect(node?.runs[0].tool_calls).toBe(1)
  expect(node?.runs[0].outcome).toBe('ok')
})

test('the roster decides who exists: an agent with events but no roster entry is left out', () => {
  const graph = reduceNetwork({
    roster: roster.filter((a) => a.name !== 'alfera'),
    events,
    issues,
    now: NOW,
  })
  expect(graph.map((a) => a.name)).not.toContain('alfera')
})

test('a parent that is not in the roster leaves its child at the top rather than losing it', () => {
  const graph = reduceNetwork({ roster: [roster[3]], events: [], now: NOW })
  expect(graph.map((a) => `${a.depth}:${a.name}`)).toEqual(['0:founder-proxy'])
})

test('a loop in the roster is drawn once, not forever', () => {
  const graph = reduceNetwork({
    roster: [
      { ...roster[1], parent: 'alfera' },
      { ...roster[2], parent: 'unalone' },
    ],
    events: [],
    now: NOW,
  })
  expect(graph.map((a) => a.name).sort()).toEqual(['alfera', 'unalone'])
})

test('the role is the first sentence, and the sheet keeps the whole description', () => {
  const unalone = find('unalone')
  expect(unalone.role).toBe('Status reporter for Unalone.')
  expect(unalone.description).toContain('Use for any question')
  expect(firstSentence('No full stop here at all')).toBe('No full stop here at all')
  expect(firstSentence('A'.repeat(200))).toHaveLength(150)
})

test('the outcome of a run is read from its last event', () => {
  expect(outcomeOf('run_finished', 'done')).toBe('ok')
  expect(outcomeOf('run_failed', 'error_max_budget_usd')).toBe('budget')
  expect(outcomeOf('run_failed', 'error_during_execution')).toBe('failed')
})

test('the legend, stated once', () => {
  expect(toneOfAgent('running', 3)).toBe('warn')
  expect(toneOfAgent('failed', 3)).toBe('danger')
  expect(toneOfAgent('budget', 0)).toBe('danger')
  expect(toneOfAgent('ok', 1)).toBe('accent')
  expect(toneOfAgent('ok', 0)).toBe('ok')
  expect(toneOfAgent('quiet', 0)).toBe('muted')
})

/* ── The roster event on its way in ── */

test('a roster event is told apart from an ordinary one and validated field by field', () => {
  const good = {
    id: 'e1',
    runId: 'r1',
    ts: '2026-11-26T11:00:00.000Z',
    agent: 'network',
    type: 'roster',
    summary: '4 agents',
    roster,
  }
  expect(isRoster(good)).toBe(true)
  expect(isRoster({ ...good, type: 'run_started' })).toBe(false)
  const stored = toRoster(good)
  if (typeof stored === 'string') throw new Error(stored)
  expect(stored.agents).toHaveLength(4)
  expect(stored.agents[2].canWrite).toBe(true)

  expect(toRoster({ ...good, roster: [] })).toBe('roster[] required')
  expect(toRoster({ ...good, roster: [{ ...roster[0], name: 'Not A Slug' }] })).toBe('bad agent name')
  expect(toRoster({ ...good, roster: [{ ...roster[0], canWrite: 'yes' }] })).toContain('bad canWrite')
  expect(toRoster({ ...good, roster: [{ ...roster[0], repo: 'https://example.com/x' }] })).toContain('bad repo')
  expect(toRoster({ ...good, roster: [{ ...roster[0], tools: ['rm -rf /'] }] })).toContain('bad tool name')
  expect(toRoster({ ...good, roster: [roster[0], roster[0]] })).toBe('two agents with the same name')
})

/* ── The gate ── */

test('GET /api/app/agents is refused with 401 when there is no Access token', async () => {
  const env = {
    ACCESS_TEAM_DOMAIN: 'paulojuri.cloudflareaccess.com',
    ACCESS_AUD: 'a'.repeat(64),
    // No database and no GitHub token: the gate has to answer before anything else is touched.
  } as AppEnv
  const context = {
    request: new Request('https://paulojuri.com/api/app/agents'),
    env,
    params: {},
  } as unknown as Parameters<typeof onRequestGet>[0]

  const response = await onRequestGet(context)
  expect(response.status).toBe(401)
  expect(await response.json()).toMatchObject({ error: 'forbidden' })
})

test('a forged Access token does not get in either', async () => {
  const env = { ACCESS_TEAM_DOMAIN: 'paulojuri.cloudflareaccess.com', ACCESS_AUD: 'a'.repeat(64) } as AppEnv
  const context = {
    request: new Request('https://paulojuri.com/api/app/agents', {
      headers: { 'Cf-Access-Jwt-Assertion': 'not.a.token' },
    }),
    env,
    params: {},
  } as unknown as Parameters<typeof onRequestGet>[0]
  const response = await onRequestGet(context)
  expect(response.status).toBe(403)
})
