'use client'
import { motion, useReducedMotion } from 'framer-motion'

const EASE = [0.22, 1, 0.36, 1] as const

interface Essay {
  date: string
  title: string
  excerpt: string
  readTime: string
  tags: string[]
  href?: string
}

const ESSAYS: Essay[] = [
  {
    date: 'Feb 2025',
    title: 'The product engineer is not a myth',
    excerpt: "Everyone says they want someone who can do both. Here's what that person actually looks like.",
    readTime: '6 min',
    tags: ['product', 'engineering', 'career'],
    href: '/journal/the-product-engineer',
  },
  {
    date: 'Mar 2025',
    title: 'On building in public without burning out',
    excerpt: "Building in public is a forcing function and a trap. Here's how to get the first without the second.",
    readTime: '5 min',
    tags: ['indie', 'building'],
    href: '/journal/building-in-public',
  },
  {
    date: 'Apr 2025',
    title: 'Why privacy is a design problem',
    excerpt: "Privacy tools have a user experience problem. Until we fix that, we'll keep building things nobody uses.",
    readTime: '7 min',
    tags: ['privacy', 'design', 'product'],
    href: '/journal/why-privacy-is-a-design-problem',
  },
  {
    date: 'Apr 2026',
    title: 'The AI that forgets you',
    excerpt: 'On memory, context, and why the most useful AI might be the one that knows when to forget.',
    readTime: '8 min',
    tags: ['ai', 'privacy'],
    href: '/journal/the-ai-that-forgets-you',
  },
  {
    date: 'Apr 2026',
    title: 'The cookie banner comedy',
    excerpt: 'We built an entire industry to make you click "Accept All." Nobody asked for this.',
    readTime: '8 min',
    tags: ['privacy', 'ux'],
    href: '/journal/the-cookie-banner-comedy',
  },
  {
    date: 'Apr 2026',
    title: "Your browser is a stock exchange",
    excerpt: 'Real-time bidding explained simply, and why knowing about it should make you angry.',
    readTime: '9 min',
    tags: ['privacy', 'ad-tech'],
    href: '/journal/your-browser-is-a-stock-exchange',
  },
]

export function Essays() {
  const reduced = useReducedMotion()

  const reveal = (delay = 0) => ({
    initial: reduced ? { opacity: 0 } : { opacity: 0, y: 16 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: '-5%' as const },
    transition: { duration: 0.5, ease: EASE, delay },
  })

  return (
    <section
      id="essays"
      aria-label="Writing"
      className="section-pad"
      style={{ background: 'var(--bg-elevated)', borderTop: '1px solid var(--line)' }}
    >
      <div className="container-site">
        {/* Header */}
        <motion.div {...reveal()} style={{ marginBottom: 'clamp(3rem, 6vw, 5rem)' }}>
          <p
            className="font-mono"
            style={{
              fontSize: '0.8rem',
              letterSpacing: '0.15em',
              color: 'var(--accent)',
              marginBottom: '1.5rem',
              textTransform: 'uppercase',
            }}
          >
            Journal
          </p>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1.5rem' }}>
            <h2
              className="font-display"
              style={{
                fontSize: 'clamp(2rem, 4vw, 3.5rem)',
                lineHeight: 1.1,
                letterSpacing: '-0.02em',
                color: 'var(--text)',
              }}
            >
              Thinking out loud.
            </h2>
            <p
              style={{
                fontSize: '1rem',
                color: 'var(--text-faint)',
                maxWidth: '34ch',
                lineHeight: 1.6,
                fontWeight: 300,
              }}
            >
              On product, privacy, and building things that actually work.
            </p>
          </div>
        </motion.div>

        {/* Essay list */}
        <div style={{ borderTop: '1px solid var(--line)' }}>
          {ESSAYS.map((essay, i) => {
            const inner = (
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '90px 1fr auto',
                  gap: 'clamp(1rem, 2.5vw, 2.5rem)',
                  alignItems: 'center',
                  paddingBlock: '1.5rem',
                }}
              >
                <span
                  className="font-mono"
                  style={{ fontSize: '0.75rem', letterSpacing: '0.08em', color: 'var(--text-faint)', textTransform: 'uppercase' }}
                >
                  {essay.date}
                </span>
                <div>
                  <p
                    className="essay-title"
                    style={{
                      fontSize: 'clamp(1.05rem, 1.2vw, 1.2rem)',
                      color: 'var(--text)',
                      marginBottom: '0.3rem',
                      lineHeight: 1.3,
                      transition: 'color 200ms',
                      fontWeight: 400,
                    }}
                  >
                    {essay.title}
                  </p>
                  <p style={{ fontSize: '0.95rem', color: 'var(--text-muted)', lineHeight: 1.5, fontWeight: 300, maxWidth: '56ch' }}>
                    {essay.excerpt}
                  </p>
                </div>
                <span className="font-mono" style={{ fontSize: '0.75rem', color: 'var(--text-faint)', whiteSpace: 'nowrap' }}>
                  {essay.readTime}
                </span>
              </div>
            )

            return (
              <motion.div
                key={essay.title}
                {...reveal(i * 0.04)}
                style={{ borderBottom: '1px solid var(--line)' }}
              >
                {essay.href ? (
                  <a
                    href={essay.href}
                    style={{ display: 'block', textDecoration: 'none', color: 'inherit' }}
                    onMouseEnter={(e) => {
                      const t = e.currentTarget.querySelector<HTMLElement>('.essay-title')
                      if (t) t.style.color = 'var(--accent)'
                    }}
                    onMouseLeave={(e) => {
                      const t = e.currentTarget.querySelector<HTMLElement>('.essay-title')
                      if (t) t.style.color = 'var(--text)'
                    }}
                  >
                    {inner}
                  </a>
                ) : (
                  inner
                )}
              </motion.div>
            )
          })}
        </div>

        {/* Journal link */}
        <div style={{ marginTop: 'clamp(2rem, 4vw, 3rem)', paddingTop: '1.5rem' }} className="hairline">
          <a
            href="/journal"
            className="font-mono"
            style={{
              fontSize: '0.8rem',
              letterSpacing: '0.1em',
              color: 'var(--accent)',
              textTransform: 'uppercase',
              transition: 'color 200ms',
            }}
            onMouseEnter={(e) => { ;(e.currentTarget as HTMLAnchorElement).style.color = 'var(--accent-hover)' }}
            onMouseLeave={(e) => { ;(e.currentTarget as HTMLAnchorElement).style.color = 'var(--accent)' }}
          >
            Visit the Journal &rarr;
          </a>
        </div>
      </div>
    </section>
  )
}
