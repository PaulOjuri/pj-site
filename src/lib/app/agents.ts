/**
 * The agent network: the roster the agents report, reduced with their event log into what the Agents
 * tab draws.
 *
 * The reducer is here, pure and with no Workers or browser APIs in it, for two reasons: the endpoint
 * (`functions/api/app/agents.ts`) does the SQL and nothing else, and the rules below — what counts as
 * running, which tone a node carries — are the part worth a test, not the SQL
 * (`tests/unit/agents.test.ts`).
 *
 * Imported by both the app and the Functions, like `kinds.ts`.
 */
import type { Tone } from './kinds'

/** One agent as agent-network's roster event describes it (its src/events.ts `RosterAgent`). */
export interface RosterAgent {
  name: string
  description: string
  model: string
  tools: string[]
  repo: string | null
  canWrite: boolean
  /** Who it answers to. null for the orchestrator, which answers to Paul. */
  parent: string | null
}

/** One row of the `events` table, as the endpoint selects it. */
export interface AgentEventRow {
  run_id: string
  ts: string
  agent: string
  type: string
  summary: string
  cost_usd: number | null
}

/** An open inbox issue, cut down to what a node needs to know about it. */
export interface AgentIssue {
  number: number
  question: string
  kind: 'research' | 'decision' | 'unknown'
  decided: boolean
}

/** The same, before it is grouped: the inbox's `project` label is the agent's name. */
export interface AgentIssueInput extends AgentIssue {
  agent: string
}

export type AgentOutcome = 'ok' | 'failed' | 'budget'
/** What the node says it is doing. `quiet` is an agent that has never run. */
export type AgentState = AgentOutcome | 'running' | 'quiet'

export interface AgentRun {
  run_id: string
  started_at: string
  /** null while it is still going. */
  ended_at: string | null
  outcome: AgentOutcome | null
  cost_usd: number | null
  /** What it was asked, or why it ended if nothing recorded the asking. */
  label: string
  tool_calls: number
  blocked: number
}

export interface AgentNode extends RosterAgent {
  /** The first sentence of the description: what fits on the card. */
  role: string
  /** 0 for the orchestrator, 1 for a specialist, 2 for a sub-agent. */
  depth: number
  children: string[]
  state: AgentState
  tone: Tone
  running: boolean
  /** When the last *finished* run ended. A run in flight does not move it. */
  last_run_at: string | null
  last_outcome: AgentOutcome | null
  last_cost_usd: number | null
  blocked_7d: number
  /** Newest first, at most five. */
  runs: AgentRun[]
  issues: AgentIssue[]
}

export interface AgentsResponse {
  agents: AgentNode[]
  /** When the roster was last reported, so the screen can say how old the map is. */
  roster_at: string | null
  /** Set when the inbox could not be read; the map is still worth showing without it. */
  inbox_error?: string
}

/** A run with no finished event and nothing in it for this long is treated as over, not as running. */
export const RUNNING_WINDOW_MS = 10 * 60 * 1000
const WEEK_MS = 7 * 24 * 60 * 60 * 1000
const RUNS_SHOWN = 5
const MAX_DEPTH = 6

const ENDED = new Set(['run_finished', 'run_failed'])

/**
 * `error_max_budget_usd` is what the SDK calls hitting `maxBudgetUsd`, and agent-network passes the
 * subtype straight into the event's summary. A run that stopped because it ran out of money is not the
 * same kind of news as one that broke, so it gets its own outcome.
 */
export function outcomeOf(type: string, summary: string): AgentOutcome {
  if (type === 'run_finished') return 'ok'
  return /budget/i.test(summary) ? 'budget' : 'failed'
}

/** The first sentence, for the one line a card has room for. */
export function firstSentence(text: string, max = 150): string {
  const clean = text.replace(/\s+/g, ' ').trim()
  const stop = clean.search(/\.(\s|$)/)
  const sentence = stop > 0 ? clean.slice(0, stop + 1) : clean
  if (sentence.length <= max) return sentence
  return sentence.slice(0, max - 1).replace(/[\s,;:]+\S*$/, '') + '…'
}

/**
 * The tone a node carries, in one place because it is the whole legend:
 *
 *   amber  it is running right now        — the only state that changes while you look at it
 *   red    its last run failed or ran out of budget — something is broken
 *   gold   it has an open decision in the inbox     — it is waiting on Paul
 *   green  its last run was fine
 *   grey   it has never run
 *
 * In that order: a fault outranks a queue, and anything live outranks both.
 */
export function toneOfAgent(state: AgentState, openDecisions: number): Tone {
  if (state === 'running') return 'warn'
  if (state === 'failed' || state === 'budget') return 'danger'
  if (openDecisions > 0) return 'accent'
  if (state === 'ok') return 'ok'
  return 'muted'
}

/** Open, undecided decisions: the ones that make a node gold. */
export function openDecisions(issues: AgentIssue[]): number {
  return issues.filter((i) => i.kind === 'decision' && !i.decided).length
}

interface Building {
  run_id: string
  first: string
  last: string
  ended_at: string | null
  outcome: AgentOutcome | null
  cost_usd: number | null
  label: string
  endLabel: string
  tool_calls: number
  blocked: number
}

/** Every run this agent appears in, newest first. */
function runsFor(events: AgentEventRow[]): Building[] {
  const byRun = new Map<string, Building>()
  for (const e of events) {
    let run = byRun.get(e.run_id)
    if (!run) {
      run = {
        run_id: e.run_id,
        first: e.ts,
        last: e.ts,
        ended_at: null,
        outcome: null,
        cost_usd: null,
        label: '',
        endLabel: '',
        tool_calls: 0,
        blocked: 0,
      }
      byRun.set(e.run_id, run)
    }
    if (e.ts < run.first) run.first = e.ts
    if (e.ts > run.last) run.last = e.ts
    if (e.type === 'run_started' && !run.label) run.label = e.summary
    if (e.type === 'tool_call') run.tool_calls++
    if (e.type === 'tool_blocked') run.blocked++
    // The last ending wins: a sub-agent can be closed out by the tracker after its own event.
    if (ENDED.has(e.type) && (!run.ended_at || e.ts >= run.ended_at)) {
      run.ended_at = e.ts
      run.outcome = outcomeOf(e.type, e.summary)
      run.cost_usd = e.cost_usd
      run.endLabel = e.summary
    }
  }
  return [...byRun.values()].sort((a, b) => (a.last < b.last ? 1 : a.last > b.last ? -1 : 0))
}

function toRun(b: Building): AgentRun {
  return {
    run_id: b.run_id,
    started_at: b.first,
    ended_at: b.ended_at,
    outcome: b.outcome,
    cost_usd: b.cost_usd,
    label: b.label || b.endLabel || 'a run with nothing recorded in it',
    tool_calls: b.tool_calls,
    blocked: b.blocked,
  }
}

/**
 * The roster plus the event log plus the inbox, as the graph the app draws.
 *
 * Order is drawing order: each root, then its children, depth-first, so the screen can render the list
 * straight through and indent by `depth`. The roster decides who exists — an agent that still has
 * events but has been taken out of the roster is not in the answer.
 */
export function reduceNetwork(input: {
  roster: RosterAgent[]
  events: AgentEventRow[]
  issues?: AgentIssueInput[]
  now?: number
}): AgentNode[] {
  const now = input.now ?? Date.now()
  const known = new Map(input.roster.map((a) => [a.name, a]))

  const eventsBy = new Map<string, AgentEventRow[]>()
  for (const e of input.events) {
    if (!known.has(e.agent)) continue
    const list = eventsBy.get(e.agent)
    if (list) list.push(e)
    else eventsBy.set(e.agent, [e])
  }

  const issuesBy = new Map<string, AgentIssue[]>()
  for (const { agent, ...issue } of input.issues ?? []) {
    if (!known.has(agent)) continue
    const list = issuesBy.get(agent)
    if (list) list.push(issue)
    else issuesBy.set(agent, [issue])
  }

  const nodes = new Map<string, AgentNode>()
  for (const agent of input.roster) {
    const runs = runsFor(eventsBy.get(agent.name) ?? [])
    const live = runs.find((r) => !r.ended_at && now - Date.parse(r.last) < RUNNING_WINDOW_MS)
    const lastDone = runs.find((r) => r.ended_at)
    const issues = issuesBy.get(agent.name) ?? []
    const state: AgentState = live ? 'running' : (lastDone?.outcome ?? 'quiet')
    nodes.set(agent.name, {
      ...agent,
      role: firstSentence(agent.description),
      depth: 0,
      children: [],
      state,
      tone: toneOfAgent(state, openDecisions(issues)),
      running: Boolean(live),
      last_run_at: lastDone?.ended_at ?? null,
      last_outcome: lastDone?.outcome ?? null,
      last_cost_usd: lastDone?.cost_usd ?? null,
      blocked_7d: (eventsBy.get(agent.name) ?? []).filter(
        (e) => e.type === 'tool_blocked' && now - Date.parse(e.ts) < WEEK_MS,
      ).length,
      runs: runs.slice(0, RUNS_SHOWN).map(toRun),
      issues,
    })
  }

  // Children, in the roster's own order, under a parent that exists.
  for (const node of nodes.values()) {
    const parent = node.parent ? nodes.get(node.parent) : undefined
    if (parent && parent !== node) parent.children.push(node.name)
  }

  const ordered: AgentNode[] = []
  const seen = new Set<string>()
  const walk = (name: string, depth: number) => {
    const node = nodes.get(name)
    // A parent that points at a child of its own, or a chain that loops, stops here rather than
    // hanging the request: the roster is machine-written, but it is still input.
    if (!node || seen.has(name) || depth > MAX_DEPTH) return
    seen.add(name)
    node.depth = depth
    ordered.push(node)
    for (const child of node.children) walk(child, depth + 1)
  }
  for (const agent of input.roster) {
    if (!agent.parent || !nodes.has(agent.parent)) walk(agent.name, 0)
  }
  // Anything left is in a loop; show it rather than dropping it.
  for (const agent of input.roster) walk(agent.name, 0)

  return ordered
}
