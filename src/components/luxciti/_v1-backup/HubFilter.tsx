'use client'

import { useState } from 'react'
import type { HubPost } from '@/content/luxciti/hub-posts'
import Link from 'next/link'

const tribes = ['All', 'Yoruba', 'Igbo', 'Hausa', 'Edo', 'More']
const categories = [
  'Bridal Outfits',
  'Groom Attire',
  'Gele Styles',
  'Fila',
  'Jewellery',
  'Shoes & Bags',
  'Aso Ebi',
  'Dance Steps',
  'Eru Iyawo',
  'Ceremony Traditions',
]

interface HubFilterProps {
  posts: HubPost[]
}

export function HubFilter({ posts }: HubFilterProps) {
  const [activeTribe, setActiveTribe] = useState('All')
  const [activeCategory, setActiveCategory] = useState<string | null>(null)

  const filtered = posts.filter((p) => {
    const tribeMatch = activeTribe === 'All' || activeTribe === 'More' || p.tribe === activeTribe
    const catMatch = !activeCategory || p.category === activeCategory
    return tribeMatch && catMatch
  })

  return (
    <div>
      {/* Tribe filter */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '0.5rem',
          justifyContent: 'center',
          marginBottom: '2rem',
        }}
      >
        {tribes.map((tribe) => (
          <button
            key={tribe}
            onClick={() => setActiveTribe(tribe)}
            style={{
              background: activeTribe === tribe ? 'var(--lc-gold)' : 'transparent',
              border: '1px solid var(--lc-gold-light)',
              fontFamily: 'var(--lc-font-sans)',
              fontWeight: 300,
              fontSize: '0.7rem',
              letterSpacing: '0.25em',
              textTransform: 'uppercase',
              color: activeTribe === tribe ? 'var(--lc-ivory)' : 'var(--lc-espresso)',
              padding: '0.5rem 1.25rem',
              cursor: 'pointer',
              transition: 'all 300ms cubic-bezier(0.22, 1, 0.36, 1)',
            }}
          >
            {tribe}
          </button>
        ))}
      </div>

      {/* Category strip */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '0.5rem',
          justifyContent: 'center',
          marginBottom: '3.5rem',
        }}
      >
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(activeCategory === cat ? null : cat)}
            style={{
              background: 'transparent',
              border: 'none',
              fontFamily: 'var(--lc-font-sans)',
              fontWeight: 300,
              fontSize: '0.7rem',
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              color: activeCategory === cat ? 'var(--lc-gold-deep)' : 'var(--lc-mocha)',
              cursor: 'pointer',
              padding: '0.25rem 0',
              borderBottom: activeCategory === cat ? '1px solid var(--lc-gold)' : '1px solid transparent',
              transition: 'all 200ms',
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Posts grid */}
      {filtered.length === 0 ? (
        <p
          style={{
            textAlign: 'center',
            color: 'var(--lc-mocha)',
            fontFamily: 'var(--lc-font-sans)',
            fontWeight: 300,
            fontSize: '0.9rem',
            padding: '3rem 0',
          }}
        >
          No posts match this filter yet.
        </p>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: '2rem',
          }}
        >
          {filtered.map((post, i) => (
            <Link
              key={post.id}
              href={`/luxciti/hub/${post.slug}`}
              style={{ textDecoration: 'none', color: 'inherit' }}
            >
              <article
                style={{
                  backgroundColor: i === 0 ? 'var(--lc-cream)' : 'var(--lc-ivory)',
                  padding: '2rem',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.75rem',
                  transition: 'box-shadow 300ms',
                  gridColumn: i === 0 ? 'span 2' : 'span 1',
                }}
                className="hub-card"
              >
                <p className="lc-eyebrow">{post.tribe} · {post.category}</p>
                <h3
                  className="lc-serif"
                  style={{
                    fontSize: i === 0 ? 'clamp(1.4rem, 2.5vw, 2rem)' : '1.2rem',
                    fontWeight: 400,
                    lineHeight: 1.3,
                  }}
                >
                  {post.title}
                </h3>
                <p
                  style={{
                    fontFamily: 'var(--lc-font-sans)',
                    fontWeight: 300,
                    fontSize: '0.85rem',
                    lineHeight: 1.65,
                    color: 'var(--lc-mocha)',
                    flex: 1,
                  }}
                >
                  {post.excerpt}
                </p>
                <p
                  style={{
                    fontFamily: 'var(--lc-font-sans)',
                    fontWeight: 200,
                    fontSize: '0.7rem',
                    letterSpacing: '0.15em',
                    color: 'var(--lc-gold-deep)',
                    textTransform: 'uppercase',
                  }}
                >
                  {post.readTime} min read
                </p>
              </article>
            </Link>
          ))}
        </div>
      )}

      <style>{`
        .hub-card:hover {
          box-shadow: 0 8px 32px rgba(67,59,48,0.1);
        }
        @media (max-width: 600px) {
          .hub-card { grid-column: span 1 !important; }
        }
      `}</style>
    </div>
  )
}
