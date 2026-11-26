'use client'
import { useCallback, useEffect, useState } from 'react'
import { api, ApiError } from '@/lib/app/api'
import { openDecisions, type AgentNode, type AgentsResponse } from '@/lib/app/agents'
import { AgentMark, BackIcon } from './icons'
import { Empty, ErrorNote, Meta, SectionTitle, Spinner, when } from './ui'

/**
 * Agents: the network as a map, which is the one thing in the app that is a shape rather than a list.
 *
 * The orchestrator at the top, its specialists under it, and a sub-agent under whichever agent it
 * answers to — drawn with the Feed's hairline and nodes, because it is the same idea seen from the
 * side: there, time runs down the gutter; here, delegation does.
 *
 * Nothing here knows who the agents are. The roster comes from the `roster` event every run sends
 * (agent-network's src/roster.ts), so an agent added on the Mac appears here after its next run, and
 * this file never needs editing for it.
 */

interface Props {
  /** An agent's name, from #agents/<name>: its sheet is open. */
  focus: string | null
  onFocus: (name: string | null) => void
  onNavigate: (hash: string) => void
  reloadToken: number
}

export function AgentsTab({ focus, onFocus, onNavigate, reloadToken }: Props) {
  const [data, setData] = useState<AgentsResponse | null>(null)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setError(null)
    try {
      setData(await api.agents())
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'could not read the network')
    }
  }, [])

  useEffect(() => {
    // Loading on mount: a static export has no server component to preload this, and the
    // state lands after an await rather than during the render pass.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load()
  }, [load, reloadToken])

  if (!data && !error) return <Spinner label="Reading the roster" rows={4} />

  const agents = data?.agents ?? []
  const byName = new Map(agents.map((a) => [a.name, a]))
  const roots = agents.filter((a) => a.depth === 0)
  const open = focus ? byName.get(focus) : undefined
  const running = agents.filter((a) => a.running).length

  return (
    <>
      {error && <ErrorNote error={error} onRetry={load} />}
      {data?.inbox_error && !error && (
        <p className="app-fine">
          The inbox could not be read ({data.inbox_error}), so nothing below shows what is waiting on you.
        </p>
      )}

      {!error && agents.length === 0 && (
        <Empty>
          No run has reported the network yet. The agents send their roster when they next run on your Mac.
        </Empty>
      )}

      {agents.length > 0 && (
        <>
          <Meta
            parts={[
              `${agents.length} agent${agents.length === 1 ? '' : 's'}`,
              running ? `${running} running` : null,
              data?.roster_at ? `roster ${when(data.roster_at)}` : null,
            ]}
          />
          <div className="app-tree">
            {roots.map((root) => (
              <Branch key={root.name} node={root} byName={byName} onOpen={onFocus} />
            ))}
          </div>
        </>
      )}

      {open && (
        <AgentSheet
          node={open}
          onClose={() => onFocus(null)}
          onOpenIssue={(number) => onNavigate(`#inbox/${number}`)}
        />
      )}
    </>
  )
}

/** One agent and everything that answers to it. The nesting is the graph. */
function Branch({
  node,
  byName,
  onOpen,
}: {
  node: AgentNode
  byName: Map<string, AgentNode>
  onOpen: (name: string) => void
}) {
  const children = node.children.map((name) => byName.get(name)).filter((c): c is AgentNode => Boolean(c))
  return (
    <div className="app-branch">
      <AgentCard node={node} onOpen={onOpen} />
      {children.length > 0 && (
        <div className="app-subtree">
          {children.map((child) => (
            <Branch key={child.name} node={child} byName={byName} onOpen={onOpen} />
          ))}
        </div>
      )}
    </div>
  )
}

function AgentCard({ node, onOpen }: { node: AgentNode; onOpen: (name: string) => void }) {
  const decisions = openDecisions(node.issues)
  return (
    <article className="app-card app-agent" data-tone={node.tone} data-agent={node.name}>
      {/* The node where this card joins its parent's rail. The orchestrator joins nothing: it keeps the
          card's own tone rail instead. */}
      {node.depth > 0 && <span className="app-node" aria-hidden="true" />}
      <div className="app-card-head">
        <span className={`app-badge tone-${node.tone}`} aria-hidden="true">
          <AgentMark depth={node.depth} />
        </span>
        <div className="app-card-grow">
          <h2 className="app-card-title">
            <button onClick={() => onOpen(node.name)}>{node.name}</button>
          </h2>
          <Meta parts={[node.model, node.canWrite ? `writes notes/${node.name}` : 'read-only']} />
        </div>
      </div>
      <p>{node.role}</p>
      <Meta
        parts={[
          statusLine(node),
          node.blocked_7d > 0 ? `${node.blocked_7d} blocked this week` : null,
          decisions > 0 ? `${decisions} decision${decisions === 1 ? '' : 's'} waiting` : null,
        ]}
      />
    </article>
  )
}

/** The one line that says how the last run went, or that one is going on now. */
function statusLine(node: AgentNode): string {
  if (node.running) return 'running now'
  if (!node.last_run_at) return 'no runs yet'
  const word = node.last_outcome === 'ok' ? 'ok' : node.last_outcome === 'budget' ? 'out of budget' : 'failed'
  const cost = node.last_cost_usd != null ? `, $${node.last_cost_usd.toFixed(2)}` : ''
  return `${word} ${when(node.last_run_at)}${cost}`
}

/**
 * The sheet: everything about one agent, over the map rather than instead of it, so tapping a node
 * never loses your place in the graph. It is routed (#agents/alfera), so it survives a reload and a
 * notification can link straight to it.
 */
function AgentSheet({
  node,
  onClose,
  onOpenIssue,
}: {
  node: AgentNode
  onClose: () => void
  onOpenIssue: (number: number) => void
}) {
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div className="app-sheet-scrim" onClick={onClose}>
      {/* The sheet swallows the tap that would close it; the scrim behind it is the dismiss target. */}
      <section
        className="app-sheet"
        data-tone={node.tone}
        role="dialog"
        aria-modal="true"
        aria-label={node.name}
        onClick={(event) => event.stopPropagation()}
      >
        <header className="app-sheet-head">
          <span className="app-sheet-grip" aria-hidden="true" />
          <h2>{node.name}</h2>
          <button className="app-btn icon" onClick={onClose} aria-label="Close">
            <BackIcon />
          </button>
        </header>

        <div className="app-sheet-body">
          <Meta parts={[statusLine(node), node.canWrite ? `writes notes/${node.name}` : 'read-only']} />
          <p>{node.description}</p>

          <dl className="app-rows">
            <div>
              <dt>Model</dt>
              <dd>{node.model}</dd>
            </div>
            <div>
              <dt>Answers to</dt>
              <dd>{node.parent ?? 'you'}</dd>
            </div>
            <div>
              <dt>Repo</dt>
              <dd>
                {node.repo ? (
                  <a href={`https://github.com/${node.repo}`} target="_blank" rel="noopener noreferrer">
                    {node.repo}
                  </a>
                ) : (
                  'none of its own'
                )}
              </dd>
            </div>
            <div>
              <dt>Tools</dt>
              <dd>{node.tools.length ? node.tools.join(', ') : 'none'}</dd>
            </div>
            <div>
              <dt>Blocked calls</dt>
              <dd>{node.blocked_7d} in the last 7 days</dd>
            </div>
          </dl>

          <SectionTitle count={node.runs.length}>Last runs</SectionTitle>
          {node.runs.length === 0 && <p className="app-fine">Nothing in the log for this agent yet.</p>}
          {node.runs.map((run) => (
            <div className="app-run" key={run.run_id} data-outcome={run.outcome ?? 'running'}>
              <p>{run.label}</p>
              <Meta
                parts={[
                  run.ended_at
                    ? run.outcome === 'ok'
                      ? 'ok'
                      : run.outcome === 'budget'
                        ? 'out of budget'
                        : 'failed'
                    : 'running',
                  when(run.started_at),
                  run.cost_usd != null ? `$${run.cost_usd.toFixed(2)}` : null,
                  run.tool_calls ? `${run.tool_calls} tool calls` : null,
                  run.blocked ? `${run.blocked} blocked` : null,
                ]}
              />
            </div>
          ))}

          <SectionTitle count={node.issues.length}>Waiting on you</SectionTitle>
          {node.issues.length === 0 && <p className="app-fine">Nothing in the inbox for this agent.</p>}
          {node.issues.map((issue) => (
            <button className="app-run as-button" key={issue.number} onClick={() => onOpenIssue(issue.number)}>
              <span className="app-run-title">{issue.question}</span>
              <Meta parts={[`#${issue.number}`, issue.kind, issue.decided ? 'decided' : 'open']} />
            </button>
          ))}
        </div>
      </section>
    </div>
  )
}
