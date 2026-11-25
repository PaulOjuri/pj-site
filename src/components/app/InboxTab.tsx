'use client'
import { useCallback, useEffect, useState } from 'react'
import { api, ApiError } from '@/lib/app/api'
import { plainSummary } from '@/lib/app/markdown'
import type { InboxIssue } from '@/lib/app/types'
import { BackIcon } from './icons'
import { Markdown } from './Markdown'
import { Empty, ErrorNote, KindBadge, Meta, SectionTitle, Spinner, toneOf, when } from './ui'

/**
 * Inbox: the open `agent-inbox` issues in PaulOjuri/agent-network.
 *
 * A decision card has a Decide button, which posts Paul's words and then adds the `decided` label; the
 * agents pick it up on their next run. Research cards show what claude.ai found. Nothing here closes an
 * issue or takes a label off, which is why the agents' own delivery flow still works.
 */

interface Props {
  focus: string | null
  onFocus: (id: string | null) => void
  reloadToken: number
}

export function InboxTab({ focus, onFocus, reloadToken }: Props) {
  const [issues, setIssues] = useState<InboxIssue[] | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Nothing is set before the first await, so starting this from an effect does not cascade a render.
  const load = useCallback(async () => {
    try {
      const data = await api.inbox()
      setIssues(data.issues)
      setError(data.error ?? null)
    } catch (err) {
      setIssues([])
      setError(err instanceof ApiError ? err.message : 'could not read the inbox')
    }
  }, [])

  useEffect(() => {
    // Loading on mount: a static export has no server component to preload this, and the
    // state lands after an await rather than during the render pass.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load()
  }, [load, reloadToken])

  if (focus) {
    return <IssueDetail number={Number(focus)} onBack={() => onFocus(null)} onChanged={load} />
  }

  if (!issues && !error) return <Spinner label="Reading GitHub" />

  const open = issues ?? []
  return (
    <>
      {error && <ErrorNote error={error} onRetry={load} />}
      {open.length === 0 && !error && <Empty>Nothing waiting on you. The agents will file what they can&apos;t settle.</Empty>}
      {open.map((issue) => {
        const kind = issue.kind === 'unknown' ? 'note' : issue.kind
        return (
          <article key={issue.number} className="app-card" data-tone={toneOf(kind)}>
            <div className="app-card-head">
              <KindBadge kind={kind} />
              <div className="app-card-grow">
                <h2 className="app-card-title">
                  <button onClick={() => onFocus(String(issue.number))}>{issue.question}</button>
                </h2>
                <Meta
                  parts={[
                    `#${issue.number}`,
                    issue.project,
                    issue.decided
                      ? 'decided'
                      : issue.kind === 'decision'
                        ? 'needs you'
                        : issue.answered
                          ? 'answered'
                          : 'waiting',
                    when(issue.updatedAt),
                  ]}
                />
              </div>
            </div>
            {issue.recommendation && (
              <p>
                <span className="lede">claude.ai: </span>
                {plainSummary(issue.recommendation, 180)}
              </p>
            )}
            <div className="app-row end">
              <button className="app-btn small" onClick={() => onFocus(String(issue.number))}>
                {issue.kind === 'decision' && !issue.decided ? 'Decide' : 'Open'}
              </button>
            </div>
          </article>
        )
      })}
    </>
  )
}

function IssueDetail({
  number,
  onBack,
  onChanged,
}: {
  number: number
  onBack: () => void
  onChanged: () => void
}) {
  const [issue, setIssue] = useState<InboxIssue | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [draft, setDraft] = useState('')
  const [busy, setBusy] = useState(false)
  const [confirmDecide, setConfirmDecide] = useState(false)

  const load = useCallback(async () => {
    setError(null)
    try {
      const data = await api.issue(number)
      setIssue(data.issue)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'could not read the issue')
    }
  }, [number])

  useEffect(() => {
    // Loading on mount: a static export has no server component to preload this, and the
    // state lands after an await rather than during the render pass.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load()
  }, [load])

  async function post(decide: boolean) {
    if (!draft.trim() || busy) return
    setBusy(true)
    setError(null)
    try {
      const data = await api.comment(number, draft.trim(), decide)
      setIssue(data.issue)
      setDraft('')
      setConfirmDecide(false)
      onChanged()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'could not post that')
    } finally {
      setBusy(false)
    }
  }

  if (!issue) {
    return (
      <>
        <BackRow onBack={onBack} />
        {error ? <ErrorNote error={error} onRetry={load} /> : <Spinner label={`Reading #${number}`} />}
      </>
    )
  }

  const isOpenDecision = issue.kind === 'decision' && !issue.decided

  return (
    <>
      <BackRow onBack={onBack} />
      <article className="app-card" data-tone={toneOf(issue.kind === 'unknown' ? 'note' : issue.kind)}>
        <div className="app-card-head">
          <KindBadge kind={issue.kind === 'unknown' ? 'note' : issue.kind} />
          <div className="app-card-grow">
            <h2 className="app-card-title">{issue.question}</h2>
            <Meta parts={[`#${issue.number}`, issue.project, issue.decided ? 'decided' : issue.kind, when(issue.createdAt)]} />
          </div>
        </div>
        <Markdown source={issue.body} maxBlocks={60} />
        <a className="app-btn small quiet" href={issue.url} target="_blank" rel="noopener noreferrer">
          Open on GitHub
        </a>
      </article>

      {issue.recommendation && (
        <section className="app-card">
          <SectionTitle>claude.ai&apos;s recommendation</SectionTitle>
          <Markdown source={issue.recommendation} maxBlocks={60} />
          <p className="app-fine">Research, not an instruction. Verify anything that matters.</p>
        </section>
      )}

      {issue.comments.filter((c) => c.from !== 'claude-ai').length > 0 && (
        <section className="app-card">
          <SectionTitle>What you said earlier</SectionTitle>
          {issue.comments
            .filter((c) => c.from !== 'claude-ai')
            .map((comment) => (
              <div key={comment.id}>
                <Markdown source={comment.body} maxBlocks={30} />
                <div className="app-bubble-meta">
                  {comment.author} · {when(comment.at)}
                </div>
              </div>
            ))}
        </section>
      )}

      <section className="app-card">
        <div className="app-field">
          <label htmlFor="inbox-comment">{isOpenDecision ? 'Your decision' : 'Comment'}</label>
          <textarea
            id="inbox-comment"
            value={draft}
            onChange={(e) => {
              setDraft(e.target.value)
              setConfirmDecide(false)
            }}
            placeholder={isOpenDecision ? 'Go with option 2, because…' : 'Add a note for the agents…'}
            maxLength={8000}
          />
        </div>
        {error && <ErrorNote error={error} />}
        <div className="app-row end">
          <button className="app-btn small" disabled={busy || !draft.trim()} onClick={() => void post(false)}>
            Comment
          </button>
          {isOpenDecision && (
            <button
              className="app-btn small primary"
              disabled={busy || !draft.trim()}
              onClick={() => (confirmDecide ? void post(true) : setConfirmDecide(true))}
            >
              {busy ? 'Posting…' : confirmDecide ? 'Confirm: this is decided' : 'Decide'}
            </button>
          )}
        </div>
        {isOpenDecision && (
          <p className="app-fine">
            Deciding posts your words and adds the <code>decided</code> label. The agents take it from there on their
            next run.
          </p>
        )}
      </section>
    </>
  )
}

function BackRow({ onBack }: { onBack: () => void }) {
  return (
    <div className="app-row">
      <button className="app-btn small quiet" onClick={onBack}>
        <BackIcon />
        Inbox
      </button>
    </div>
  )
}
