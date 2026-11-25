'use client'
import { OFFLINE_MESSAGE } from '@/lib/app/api'
import { kindSpec } from '@/lib/app/kinds'
import { KindMark, QuietMark } from './icons'

/** The small shared pieces every tab uses. */

/**
 * What a tab shows while it is fetching: the shape of what is coming, not a spinner on an empty
 * screen. The list it stands in for is three cards tall, which is roughly what every tab loads, so the
 * layout barely moves when the real thing arrives.
 */
export function Spinner({ label = 'Loading', rows = 3 }: { label?: string; rows?: number }) {
  return (
    <div className="app-skeletons" role="status" aria-busy="true">
      <span className="app-sr">{label}</span>
      {Array.from({ length: rows }, (_, i) => (
        <div className="app-skeleton-card" key={i} style={{ animationDelay: `${i * 90}ms` }} aria-hidden="true">
          <span className="sk sk-badge" />
          <span className="sk-lines">
            <span className="sk sk-title" />
            <span className="sk sk-meta" />
            <span className="sk sk-body" />
          </span>
        </div>
      ))}
    </div>
  )
}

/**
 * Something went wrong, said once. A dropped connection is not a fault — the phone goes through
 * tunnels — so it gets the quiet card instead of the red one, wherever in the app it surfaced.
 */
export function ErrorNote({ error, onRetry }: { error: string; onRetry?: () => void }) {
  if (error === OFFLINE_MESSAGE) {
    return (
      <div className="app-empty" role="status">
        <QuietMark />
        <p>No connection. This is what was already on the phone.</p>
        {onRetry && (
          <button className="app-btn small" onClick={onRetry}>
            Try again
          </button>
        )}
      </div>
    )
  }
  return (
    <div className="app-error" role="alert">
      <span className="app-error-mark" aria-hidden="true">
        !
      </span>
      <span className="app-error-text">{error}</span>
      {onRetry && (
        <button className="app-btn small quiet" onClick={onRetry}>
          Try again
        </button>
      )}
    </div>
  )
}

export function Empty({ children }: { children: React.ReactNode }) {
  return (
    <div className="app-empty">
      <QuietMark />
      <p>{children}</p>
    </div>
  )
}

/**
 * The kind's mark, in its tone. One registry entry decides how every card is marked, and the tone it
 * carries also colours the card's rail and its node on the Feed's timeline.
 */
export function KindBadge({ kind }: { kind: string }) {
  const spec = kindSpec(kind)
  return (
    <span className={`app-badge tone-${spec.tone}`} title={spec.label} aria-label={spec.label} role="img">
      <KindMark kind={kind} />
    </span>
  )
}

/** The tone a kind carries, for the card that holds it. */
export function toneOf(kind: string | null | undefined): string {
  return kindSpec(kind).tone
}

/** "4 min ago", "yesterday", or the date once it stops being useful. */
export function when(iso: string): string {
  const then = Date.parse(iso)
  if (Number.isNaN(then)) return ''
  const minutes = Math.round((Date.now() - then) / 60_000)
  if (minutes < 1) return 'just now'
  if (minutes < 60) return `${minutes} min ago`
  const hours = Math.round(minutes / 60)
  if (hours < 24) return `${hours} h ago`
  const days = Math.round(hours / 24)
  if (days === 1) return 'yesterday'
  if (days < 7) return `${days} days ago`
  return new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Europe/Brussels',
    day: 'numeric',
    month: 'short',
  }).format(then)
}

/**
 * A card's second line. The parts are separated by a drawn dot rather than by spacing alone, so the
 * line reads as one sentence of facts instead of a row of shouting labels.
 */
export function Meta({ parts }: { parts: Array<string | null | undefined> }) {
  const shown = parts.filter((p): p is string => Boolean(p))
  if (!shown.length) return null
  return (
    <div className="app-meta">
      {shown.map((part, i) => (
        <span key={i}>{part}</span>
      ))}
    </div>
  )
}

/** A heading above a group of cards, with the count sitting quietly at the end of its rule. */
export function SectionTitle({ children, count }: { children: React.ReactNode; count?: number }) {
  return (
    <h3 className="app-section-title">
      <span>{children}</span>
      {count !== undefined && count > 0 && <span className="app-section-count">{count}</span>}
    </h3>
  )
}
