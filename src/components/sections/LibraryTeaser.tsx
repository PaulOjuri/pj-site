'use client'
import { motion, useReducedMotion } from 'framer-motion'
import { library } from '@/lib/library'

const EASE = [0.22, 1, 0.36, 1] as const

export function LibraryTeaser() {
  const reduced = useReducedMotion()
  const totalBooks = library.reduce((n, c) => n + c.books.length, 0)

  const picks = library.slice(0, 5).map((cat) => ({
    category: cat.label,
    book: cat.books[0],
  }))

  const reveal = (delay = 0) => ({
    initial: reduced ? { opacity: 0 } : { opacity: 0, y: 24 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: '-10%' as const },
    transition: { duration: 0.7, ease: EASE, delay },
  })

  return (
    <section
      aria-label="Library"
      className="section-pad"
      style={{ background: 'var(--bg)' }}
    >
      <div className="container-site">
        <motion.div
          {...reveal()}
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 340px), 1fr))',
            gap: 'clamp(3rem, 6vw, 6rem)',
            alignItems: 'start',
          }}
        >
          {/* Left */}
          <div>
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
              Library
            </p>
            <h2
              className="font-display"
              style={{
                fontSize: 'clamp(2rem, 4vw, 3.5rem)',
                lineHeight: 1.1,
                letterSpacing: '-0.02em',
                color: 'var(--text)',
                marginBottom: '1.5rem',
              }}
            >
              {totalBooks} books.
              <br />
              {library.length} shelves.
            </h2>
            <p
              style={{
                color: 'var(--text-muted)',
                fontSize: 'clamp(1.05rem, 1.2vw, 1.2rem)',
                lineHeight: 1.75,
                maxWidth: '44ch',
                marginBottom: '2.5rem',
                fontWeight: 300,
              }}
            >
              Books I&apos;ve read, am reading, or keep around because they changed how I think about something. No ratings. If it&apos;s here, it was worth the time.
            </p>
            <a
              href="/library"
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
              Browse the Library &rarr;
            </a>
          </div>

          {/* Right -- shelf preview */}
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {picks.map((pick, i) => (
              <motion.div
                key={pick.category}
                {...reveal(i * 0.05)}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '110px 1fr',
                  gap: 'clamp(1rem, 2vw, 2rem)',
                  alignItems: 'start',
                  paddingBlock: '1.1rem',
                  borderBottom: '1px solid var(--line)',
                }}
              >
                <span
                  className="font-mono"
                  style={{
                    fontSize: '0.75rem',
                    letterSpacing: '0.08em',
                    color: 'var(--text-faint)',
                    paddingTop: '0.15rem',
                    textTransform: 'uppercase',
                  }}
                >
                  {pick.category}
                </span>
                <div>
                  <p style={{ fontSize: '1rem', color: 'var(--text)', marginBottom: '0.2rem', fontWeight: 400 }}>
                    {pick.book.title}
                  </p>
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-faint)', fontWeight: 300 }}>
                    {pick.book.author}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}
