import Link from 'next/link'
import { slugify } from '@/lib/chess/data'

export function fmtDate(iso: string): string {
  return iso.slice(0, 10)
}

export function ResultBadge({ result }: { result: string }) {
  const label = result === 'win' ? 'W' : result === 'loss' ? 'L' : result === 'draw' ? 'D' : '?'
  return <span className={`font-mono result-${result}`} aria-label={result}>{label}</span>
}

export function GameLink({ id, published, children }: { id: string; published: boolean; children: React.ReactNode }) {
  return published ? <Link href={`/chess/games/${slugify(id)}`}>{children}</Link> : <span>{children}</span>
}

export function StatusPill({ status }: { status: string }) {
  return <span className={`status status-${status}`}>{status}</span>
}

export function speedLabel(s: string): string {
  return s === 'ultrabullet' ? 'ultra' : s
}
