interface WorkFrontmatter {
  title: string
  tagline: string
  category: string
  year: string
  role: string
  client?: string
  stack: string[]
  status: 'live' | 'shipped' | 'archived'
  liveUrl?: string
  productPageUrl?: string
  coverImage?: string
  accentColor?: string
  order: number
  featured: boolean
}

interface WorkHeroProps {
  frontmatter: WorkFrontmatter
  slug: string
}

export function WorkHero({ frontmatter, slug: _slug }: WorkHeroProps) {
  const accent = frontmatter.accentColor ?? 'var(--accent)'

  return (
    <section
      style={{
        background: 'var(--bg)',
        borderBottom: '1px solid var(--line)',
        padding: 'clamp(5rem, 10vw, 10rem) 0 clamp(3rem, 6vw, 6rem)',
      }}
    >
      <div className="container-site">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '56ch' }}>
          <p
            className="font-mono"
            style={{ fontSize: '0.8rem', letterSpacing: '0.15em', color: 'var(--text-faint)' }}
          >
            {frontmatter.category} — {frontmatter.year}
          </p>
          <h1
            style={{
              fontSize: 'clamp(2.5rem, 6vw, 5rem)',
              fontWeight: 400,
              lineHeight: 0.95,
              letterSpacing: '-0.025em',
              color: 'var(--text)',
            }}
          >
            {frontmatter.title}
          </h1>
          <p
            style={{
              fontSize: 'clamp(1rem, 1.5vw, 1.25rem)',
              color: 'var(--text-muted)',
              lineHeight: 1.65,
              marginTop: '0.5rem',
            }}
          >
            {frontmatter.tagline}
          </p>

          {/* Meta row */}
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '2rem',
              marginTop: '1.5rem',
              paddingTop: '1.5rem',
              borderTop: '1px solid var(--line)',
            }}
          >
            <div>
              <p
                className="font-mono"
                style={{ fontSize: '0.75rem', letterSpacing: '0.12em', color: 'var(--text-faint)', marginBottom: '0.35rem' }}
              >
                ROLE
              </p>
              <p style={{ fontSize: '0.875rem', color: 'var(--text)' }}>{frontmatter.role}</p>
            </div>
            {frontmatter.client && (
              <div>
                <p
                  className="font-mono"
                  style={{ fontSize: '0.75rem', letterSpacing: '0.12em', color: 'var(--text-faint)', marginBottom: '0.35rem' }}
                >
                  CLIENT
                </p>
                <p style={{ fontSize: '0.875rem', color: 'var(--text)' }}>{frontmatter.client}</p>
              </div>
            )}
            <div>
              <p
                className="font-mono"
                style={{ fontSize: '0.75rem', letterSpacing: '0.12em', color: 'var(--text-faint)', marginBottom: '0.35rem' }}
              >
                STATUS
              </p>
              <p style={{ fontSize: '0.875rem', color: accent, textTransform: 'capitalize' }}>
                {frontmatter.status}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
