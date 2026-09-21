import Link from 'next/link'

const LINKS = [
  { href: '/chess', label: 'Overview' },
  { href: '/chess/leaks', label: 'Leaks' },
  { href: '/chess/games', label: 'Games' },
  { href: '/chess/plan', label: 'Plan' },
  { href: '/chess/train', label: 'Train' },
  { href: '/chess/title', label: 'Title' },
]

export function ChessNav({ current }: { current: string }) {
  return (
    <nav className="chess-nav" aria-label="Chess section">
      {LINKS.map((l) => (
        <Link key={l.href} href={l.href} aria-current={current === l.href ? 'page' : undefined}>
          {l.label}
        </Link>
      ))}
    </nav>
  )
}
