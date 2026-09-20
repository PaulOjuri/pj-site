import type { Metadata } from 'next'
import Link from 'next/link'
import { SiteFooter } from '@/components/sections/SiteFooter'
import { library } from '@/lib/library'
import { BookShelf } from '@/components/sections/BookShelf'

export const metadata: Metadata = {
  title: 'Library',
  description: "Books I've read, am reading, or keep on the shelf because they earned the space.",
}

export default function LibraryPage() {
  const totalBooks = library.reduce((n, c) => n + c.books.length, 0)

  return (
    <>
      {/* Header */}
      <section
        style={{
          paddingTop: 'clamp(10rem, 20vw, 16rem)',
          paddingBottom: 'clamp(3rem, 6vw, 5rem)',
          borderBottom: '1px solid var(--line)',
        }}
      >
        <div
          className="container-page"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))',
            gap: 'clamp(2rem, 4vw, 4rem)',
          }}
        >
          <div>
            <p className="label-caps" style={{ color: 'var(--accent)', marginBottom: '1.5rem' }}>Library</p>
            <h1
              className="font-display"
              style={{
                fontSize: 'clamp(2.5rem, 6vw, 5.5rem)',
                letterSpacing: '-0.03em',
                lineHeight: 1.05,
                color: 'var(--text)',
              }}
            >
              {totalBooks} books,{' '}
              <em style={{ fontStyle: 'italic', color: 'var(--accent)' }}>{library.length} shelves.</em>
            </h1>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', gap: '1.5rem' }}>
            <p style={{ fontSize: 'clamp(1rem, 1.3vw, 1.2rem)', lineHeight: 1.7, color: 'var(--text-muted)', fontWeight: 300 }}>
              Books I&apos;ve read, am reading, or keep around because they changed
              how I think about something. No ratings. If it&apos;s here, it was
              worth the time.
            </p>
            <Link
              href="/library/walk"
              className="label-caps"
              style={{
                color: 'var(--bg)',
                background: 'var(--accent)',
                padding: '10px 20px',
                width: 'fit-content',
                transition: 'background 300ms',
              }}
            >
              Walk in &rarr;
            </Link>

            <nav aria-label="Jump to category">
              <ul style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
                {library.map((cat) => (
                  <li key={cat.id}>
                    <a
                      href={`#${cat.id}`}
                      className="label-caps"
                      style={{
                        color: 'var(--text-muted)',
                        transition: 'color 200ms',
                        textDecoration: 'underline',
                        textUnderlineOffset: '3px',
                        textDecorationColor: 'var(--line-strong)',
                      }}
                    >
                      {cat.label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </div>
      </section>

      {/* Shelves */}
      <section className="container-page" style={{ paddingBlock: 'clamp(4rem, 8vw, 6rem)' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(4rem, 8vw, 6rem)' }}>
          {library.map((category, idx) => (
            <BookShelf key={category.id} category={category} index={idx} />
          ))}
        </div>
      </section>

      {/* Footer note */}
      <section className="container-page" style={{ paddingBottom: '3rem', borderTop: '1px solid var(--line)', paddingTop: '2rem' }}>
        <p className="label-caps" style={{ color: 'var(--text-faint)' }}>
          Updated as I finish things.
        </p>
      </section>

      <SiteFooter />
    </>
  )
}
