'use client'
import { useCallback, useEffect, useState } from 'react'
import { api, ApiError } from '@/lib/app/api'
import { KINDS, kindSpec } from '@/lib/app/kinds'
import type { FeedItem, FeedResponse } from '@/lib/app/types'
import { Empty, ErrorNote, KindBadge, Meta, Spinner, when } from './ui'

/**
 * Feed: one timeline of everything. The agents' run events (the `events` table from step 4) and every
 * card that was pushed (`app_feed`), merged by the endpoint and filterable by project and kind.
 *
 * This is the /agents page step 5 of the agent-network README asked for, inside the app and behind the
 * same Access policy, so there is no separate public-but-protected page to keep.
 */

interface Props {
  onNavigate: (hash: string) => void
  reloadToken: number
}

export function FeedTab({ onNavigate, reloadToken }: Props) {
  const [data, setData] = useState<FeedResponse | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [project, setProject] = useState<string | null>(null)
  const [kind, setKind] = useState<string | null>(null)
  const [extra, setExtra] = useState<FeedItem[]>([])
  const [loadingMore, setLoadingMore] = useState(false)

  const load = useCallback(async () => {
    setError(null)
    setExtra([])
    try {
      setData(await api.feed({ project: project ?? undefined, kind: kind ?? undefined }))
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'could not load the feed')
    }
  }, [project, kind])

  useEffect(() => {
    // Loading on mount: a static export has no server component to preload this, and the
    // state lands after an await rather than during the render pass.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load()
  }, [load, reloadToken])

  const items = [...(data?.items ?? []), ...extra]

  async function loadMore() {
    const last = items[items.length - 1]
    if (!last || loadingMore) return
    setLoadingMore(true)
    try {
      const more = await api.feed({
        project: project ?? undefined,
        kind: kind ?? undefined,
        before: last.ts,
      })
      setExtra((current) => [...current, ...more.items])
    } catch {
      // The button stays; tapping again retries.
    } finally {
      setLoadingMore(false)
    }
  }

  async function markAllRead() {
    try {
      await api.markRead({ all: true })
      await load()
    } catch {
      setError('could not mark the feed as read')
    }
  }

  if (!data && !error) return <Spinner label="Loading the feed" />

  return (
    <>
      {error && <ErrorNote error={error} onRetry={load} />}

      <div className="app-filters" role="group" aria-label="Filter by project">
        <button className="app-pill" aria-pressed={project === null} onClick={() => setProject(null)}>
          all projects
        </button>
        {(data?.projects ?? []).map((name) => (
          <button
            key={name}
            className="app-pill"
            aria-pressed={project === name}
            onClick={() => setProject(project === name ? null : name)}
          >
            {name}
          </button>
        ))}
      </div>

      <div className="app-filters" role="group" aria-label="Filter by kind">
        <button className="app-pill" aria-pressed={kind === null} onClick={() => setKind(null)}>
          all kinds
        </button>
        {Object.keys(KINDS).map((id) => (
          <button
            key={id}
            className="app-pill"
            aria-pressed={kind === id}
            onClick={() => setKind(kind === id ? null : id)}
          >
            {kindSpec(id).label.toLowerCase()}
          </button>
        ))}
      </div>

      {(data?.unread ?? 0) > 0 && (
        <div className="app-row end">
          <button className="app-btn small quiet" onClick={() => void markAllRead()}>
            Mark {data?.unread} read
          </button>
        </div>
      )}

      {items.length === 0 && <Empty>Nothing here yet.</Empty>}

      {items.map((item) => {
        const spec = kindSpec(item.kind)
        const target = item.url?.startsWith('/app#') ? item.url.slice('/app'.length) : null
        return (
          <article key={`${item.source}-${item.id}`} className={`app-card${item.read_at ? '' : ' unread'}`}>
            <div className="app-card-head">
              <KindBadge kind={item.kind} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <h2 className="app-card-title">
                  {target ? <button onClick={() => onNavigate(target)}>{item.title}</button> : item.title}
                </h2>
                <Meta
                  parts={[
                    spec.label,
                    item.project,
                    when(item.ts),
                    item.priority === 'high' ? 'high' : null,
                    item.source === 'events' ? 'run log' : null,
                  ]}
                />
              </div>
            </div>
            {item.body && <p>{item.body}</p>}
          </article>
        )
      })}

      {items.length >= 60 && (
        <button className="app-btn" disabled={loadingMore} onClick={() => void loadMore()}>
          {loadingMore ? 'Loading…' : 'Older'}
        </button>
      )}
    </>
  )
}
