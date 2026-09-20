'use client'

interface NavPost {
  slug: string
  frontmatter: {
    title: string
  }
}

interface JournalPostNavProps {
  prev?: NavPost | null
  next?: NavPost | null
}

export function JournalPostNav({ prev, next }: JournalPostNavProps) {
  if (!prev && !next) return null

  return (
    <nav
      aria-label="Post navigation"
      style={{
        display: 'grid',
        gridTemplateColumns: prev && next ? '1fr 1fr' : '1fr',
        borderTop: '1px solid var(--line)',
      }}
    >
      {prev && (
        <a
          href={`/journal/${prev.slug}`}
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '0.5rem',
            padding: 'clamp(1.5rem, 3vw, 2.5rem)',
            color: 'var(--text)',
            transition: 'color 200ms',
            borderRight: next ? '1px solid var(--line)' : undefined,
          }}
          onMouseEnter={(e) => {
            ;(e.currentTarget as HTMLAnchorElement).style.color = 'var(--accent)'
          }}
          onMouseLeave={(e) => {
            ;(e.currentTarget as HTMLAnchorElement).style.color = 'var(--text)'
          }}
        >
          <span
            className="font-mono"
            style={{ fontSize: '0.8rem', letterSpacing: '0.1em', color: 'var(--text-faint)' }}
          >
            ← PREVIOUS
          </span>
          <span style={{ fontSize: '0.95rem', lineHeight: 1.3 }}>{prev.frontmatter.title}</span>
        </a>
      )}
      {next && (
        <a
          href={`/journal/${next.slug}`}
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '0.5rem',
            padding: 'clamp(1.5rem, 3vw, 2.5rem)',
            textAlign: 'right',
            color: 'var(--text)',
            transition: 'color 200ms',
          }}
          onMouseEnter={(e) => {
            ;(e.currentTarget as HTMLAnchorElement).style.color = 'var(--accent)'
          }}
          onMouseLeave={(e) => {
            ;(e.currentTarget as HTMLAnchorElement).style.color = 'var(--text)'
          }}
        >
          <span
            className="font-mono"
            style={{ fontSize: '0.8rem', letterSpacing: '0.1em', color: 'var(--text-faint)' }}
          >
            NEXT →
          </span>
          <span style={{ fontSize: '0.95rem', lineHeight: 1.3 }}>{next.frontmatter.title}</span>
        </a>
      )}
    </nav>
  )
}
