'use client'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { api, ApiError } from '@/lib/app/api'
import type { ChatThread } from '@/lib/app/types'
import { BackIcon, PlusIcon, SendIcon } from './icons'
import { Empty, ErrorNote, ErrorNote as Note, Spinner, when } from './ui'

/**
 * Chat. A message is stored as `pending` and answered by `npm run chat` on the Mac, so the thread shows
 * "waiting for your Mac" until the reply lands. There is no model in the browser: the agents, their
 * budget caps and their guard all stay on the Mac.
 */

interface Props {
  focus: string | null
  onFocus: (id: string | null) => void
  reloadToken: number
}

export function ChatTab({ focus, onFocus, reloadToken }: Props) {
  const [threads, setThreads] = useState<ChatThread[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [draft, setDraft] = useState('')
  const [busy, setBusy] = useState(false)
  const endRef = useRef<HTMLDivElement>(null)

  const load = useCallback(async () => {
    setError(null)
    try {
      const data = await api.chat()
      setThreads(data.threads)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'could not load the chat')
    }
  }, [])

  useEffect(() => {
    // Loading on mount: a static export has no server component to preload this, and the
    // state lands after an await rather than during the render pass.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load()
  }, [load, reloadToken])

  // "#chat/new" is a conversation that has no id yet: the composer, with nothing above it.
  const isNew = focus === 'new'
  const thread = useMemo(() => threads?.find((t) => t.thread_id === focus) ?? null, [threads, focus])
  const waiting = thread?.pending ?? false

  // While an answer is outstanding, look again every 15 seconds; the push arrives too, but the app may
  // already be open with the thread on screen.
  useEffect(() => {
    if (!waiting) return
    const timer = setInterval(() => void load(), 15_000)
    return () => clearInterval(timer)
  }, [waiting, load])

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: 'end' })
  }, [thread?.messages.length])

  async function send() {
    const message = draft.trim()
    if (!message || busy) return
    setBusy(true)
    setError(null)
    try {
      const result = await api.send(message, isNew || !focus ? undefined : focus)
      setDraft('')
      await load()
      if (result.thread_id !== focus) onFocus(result.thread_id)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'could not send that')
    } finally {
      setBusy(false)
    }
  }

  if (!threads && !error) return <Spinner label="Loading chat" />

  if (!focus) {
    return (
      <>
        {error && <ErrorNote error={error} onRetry={load} />}
        <button className="app-btn primary block" onClick={() => onFocus('new')}>
          <PlusIcon />
          New conversation
        </button>
        {(threads ?? []).length === 0 && <Empty>No conversations yet.</Empty>}
        {(threads ?? []).map((t) => {
          const last = t.messages[t.messages.length - 1]
          return (
            <article key={t.thread_id} className="app-card" data-tone={t.pending ? 'warn' : 'ok'}>
              <h2 className="app-card-title">
                <button onClick={() => onFocus(t.thread_id)}>{t.messages[0]?.body.slice(0, 90) || 'Conversation'}</button>
              </h2>
              <div className="app-meta">
                <span>
                  {t.messages.length} message{t.messages.length === 1 ? '' : 's'}
                </span>
                <span>{when(t.last_at)}</span>
                {t.pending && <span style={{ color: 'var(--tone-warn)' }}>waiting for your Mac</span>}
                {!t.pending && last?.role === 'agent' && <span>{last.agent}</span>}
              </div>
            </article>
          )
        })}
      </>
    )
  }

  const messages = thread?.messages ?? []
  return (
    <>
      <div className="app-row">
        <button className="app-btn small quiet" onClick={() => onFocus(null)}>
          <BackIcon />
          Conversations
        </button>
      </div>
      {error && <Note error={error} />}

      <div className="app-chat">
        {messages.length === 0 && (
          <p className="app-note">
            Ask the orchestrator anything you would ask it on the Mac. It answers through the same agents, with the
            same budget caps.
          </p>
        )}
        {messages.map((message) => (
          <div key={message.id} className={`app-bubble from-${message.role}`}>
            {message.body}
            <div className="app-bubble-meta">
              {message.role === 'paul' ? 'you' : message.agent || 'agent'} · {when(message.created_at)}
              {message.role === 'paul' && message.status === 'pending' && ' · waiting for your Mac'}
              {message.role === 'paul' && message.status === 'failed' && ' · the run did not finish'}
            </div>
          </div>
        ))}
        {waiting && (
          <div className="app-typing" role="status" aria-label="Waiting for your Mac">
            <i /> <i /> <i />
          </div>
        )}
        <div ref={endRef} />
      </div>

      <div className="app-composer">
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="What is Alfera waiting on?"
          maxLength={4000}
          aria-label="Message"
          onKeyDown={(e) => {
            // Enter sends on a desktop keyboard; Shift+Enter and the phone keyboard still add a line.
            if (e.key === 'Enter' && !e.shiftKey && !('ontouchstart' in window)) {
              e.preventDefault()
              void send()
            }
          }}
        />
        <button
          className="app-btn primary"
          aria-label="Send"
          disabled={busy || !draft.trim()}
          onClick={() => void send()}
        >
          {busy ? <span className="app-spinner-dot" /> : <SendIcon />}
        </button>
      </div>
    </>
  )
}
