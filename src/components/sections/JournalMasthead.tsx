'use client'

interface JournalEntry {
  slug: string
  frontmatter: {
    title: string
    date: string
    excerpt?: string
    tags?: string[]
    readingTime?: string | number
  }
}

interface JournalMastheadProps {
  posts: JournalEntry[]
  allTags: string[]
  issueNumber: number
}

export function JournalMasthead({ posts, allTags: _allTags, issueNumber }: JournalMastheadProps) {
  return (
    <section style={{ padding: 'clamp(4rem, 8vw, 8rem) 0' }}>
      <div className="container-site">
        <p
          className="font-mono"
          style={{
            fontSize: '0.8rem',
            letterSpacing: '0.15em',
            color: 'var(--text-faint)',
            marginBottom: '1.5rem',
          }}
        >
          JOURNAL — ISSUE {issueNumber}
        </p>
        <h1
          style={{
            fontSize: 'clamp(2rem, 5vw, 4rem)',
            fontWeight: 400,
            lineHeight: 1.05,
            letterSpacing: '-0.02em',
            color: 'var(--text)',
            marginBottom: 'clamp(3rem, 6vw, 5rem)',
          }}
        >
          Writing on product,{' '}
          <em style={{ color: 'var(--text-muted)', fontStyle: 'normal' }}>
            design, and building.
          </em>
        </h1>

        <ul style={{ display: 'flex', flexDirection: 'column', gap: '0', listStyle: 'none' }}>
          {posts.map((post, i) => (
            <li
              key={post.slug}
              style={{
                borderTop: i === 0 ? '1px solid var(--line)' : undefined,
                borderBottom: '1px solid var(--line)',
              }}
            >
              <a
                href={`/journal/${post.slug}`}
                style={{
                  display: 'flex',
                  alignItems: 'baseline',
                  justifyContent: 'space-between',
                  gap: '2rem',
                  padding: '1.5rem 0',
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
                <h2 style={{ fontSize: '1.05rem', fontWeight: 400, lineHeight: 1.3 }}>
                  {post.frontmatter.title}
                </h2>
                <span
                  className="font-mono"
                  style={{
                    fontSize: '0.8rem',
                    letterSpacing: '0.1em',
                    color: 'var(--text-faint)',
                    whiteSpace: 'nowrap',
                    flexShrink: 0,
                  }}
                >
                  {post.frontmatter.date}
                </span>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
