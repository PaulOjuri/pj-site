'use client'
import { kindSpec } from '@/lib/app/kinds'

/** The small shared pieces every tab uses. Deliberately plain: the app should feel instant. */

export function Spinner({ label = 'Loading' }: { label?: string }) {
  return (
    <div className="app-empty" role="status">
      <span className="app-spinner" aria-hidden="true" style={{ display: 'inline-block', marginRight: '0.5rem' }} />
      {label}
    </div>
  )
}

export function ErrorNote({ error, onRetry }: { error: string; onRetry?: () => void }) {
  return (
    <div className="app-error" role="alert">
      {error}
      {onRetry && (
        <>
          {' '}
          <button className="app-btn small quiet" onClick={onRetry}>
            Try again
          </button>
        </>
      )}
    </div>
  )
}

export function Empty({ children }: { children: React.ReactNode }) {
  return <p className="app-empty">{children}</p>
}

/** The kind's glyph, coloured by its tone. One registry entry decides how every card is marked. */
export function KindBadge({ kind }: { kind: string }) {
  const spec = kindSpec(kind)
  return (
    <span className={`app-badge tone-${spec.tone}`} title={spec.label} aria-label={spec.label}>
      {spec.glyph}
    </span>
  )
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
