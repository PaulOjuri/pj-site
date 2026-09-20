import type { Metadata } from 'next'
import { hubPosts } from '@/content/luxciti/hub-posts'
import { HubFilter } from '@/components/luxciti/HubFilter'

export const metadata: Metadata = {
  title: 'The Nigerian Wedding Hub',
  description:
    'Your guide to Nigerian wedding culture — Yoruba, Igbo, Hausa, Edo traditions, gele styles, aso ebi, Eru Iyawo, and everything in between. Written with genuine knowledge and cultural respect.',
}

export default function HubPage() {
  return (
    <>
      {/* ── Masthead ── */}
      <div
        style={{
          paddingTop: '9rem',
          paddingBottom: '4rem',
          textAlign: 'center',
          backgroundColor: 'var(--lc-sand)',
          padding: '9rem 2rem 5rem',
          borderBottom: '1px solid var(--lc-gold-light)',
        }}
      >
        <p className="lc-eyebrow" style={{ marginBottom: '1rem' }}>
          Luxciti · Knowledge
        </p>
        <h1
          className="lc-serif"
          style={{
            fontSize: 'clamp(2.5rem, 6vw, 5.5rem)',
            fontWeight: 300,
            lineHeight: 1.05,
          }}
        >
          The Nigerian
          <br />
          <em>Wedding Hub</em>
        </h1>
        <p
          style={{
            fontFamily: 'var(--lc-font-sans)',
            fontWeight: 300,
            fontSize: '0.9rem',
            lineHeight: 1.7,
            color: 'var(--lc-mocha)',
            maxWidth: '44rem',
            margin: '1.5rem auto 0',
          }}
        >
          Authoritative guides to Nigerian wedding culture, ceremony traditions, styling,
          and everything that makes these celebrations extraordinary. Written by people
          who know the culture from the inside.
        </p>
      </div>

      {/* ── Filter + Grid ── */}
      <section
        style={{
          padding: 'clamp(3rem, 6vw, 5rem) 2rem',
          maxWidth: '88rem',
          margin: '0 auto',
        }}
      >
        <HubFilter posts={hubPosts} />
      </section>
    </>
  )
}
