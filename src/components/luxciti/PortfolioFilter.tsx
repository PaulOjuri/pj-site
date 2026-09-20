'use client'

import { useState } from 'react'
import { PlaceholderImage } from './PlaceholderImage'

const categories = [
  'All',
  'Engagements & Weddings',
  'Birthdays',
  "Girls' Trips",
  'Corporate',
  'Community',
]

interface PortfolioItem {
  id: string
  category: string
  caption: string
  aspectRatio: string
}

const portfolioItems: PortfolioItem[] = [
  { id: '1', category: 'Engagements & Weddings', caption: 'TRADITIONAL CEREMONY — ORSETT HALL, ESSEX', aspectRatio: '4/5' },
  { id: '2', category: 'Engagements & Weddings', caption: 'WHITE WEDDING — MANOR HOUSE, SURREY', aspectRatio: '1/1' },
  { id: '3', category: 'Birthdays', caption: 'LUXURY BIRTHDAY GALA — THE SAVOY, LONDON', aspectRatio: '4/5' },
  { id: '4', category: 'Engagements & Weddings', caption: 'IGBO INTRODUCTION — CANARY WHARF HOTEL', aspectRatio: '3/2' },
  { id: '5', category: "Girls' Trips", caption: "LUXURY WEEKEND — LAKE COMO, ITALY", aspectRatio: '4/5' },
  { id: '6', category: 'Corporate', caption: 'GALA DINNER — GUILDHALL, LONDON', aspectRatio: '3/2' },
  { id: '7', category: 'Engagements & Weddings', caption: 'YORUBA ENGAGEMENT — HILTON WESTFIELD', aspectRatio: '4/5' },
  { id: '8', category: 'Community', caption: 'AFRO-BRITISH CULTURAL CELEBRATION — HACKNEY', aspectRatio: '1/1' },
  { id: '9', category: 'Birthdays', caption: '50TH BIRTHDAY — ROYAL GARDEN HOTEL', aspectRatio: '4/5' },
  { id: '10', category: 'Engagements & Weddings', caption: 'HAUSA-FULA NIKAH — MARYLEBONE REGISTRY', aspectRatio: '3/2' },
  { id: '11', category: "Girls' Trips", caption: "HEN WEEKEND — MARBELLA, SPAIN", aspectRatio: '4/5' },
  { id: '12', category: 'Corporate', caption: 'BRAND ACTIVATION — SHOREDITCH, LONDON', aspectRatio: '1/1' },
]

export function PortfolioFilter() {
  const [active, setActive] = useState('All')

  const filtered = active === 'All' ? portfolioItems : portfolioItems.filter((i) => i.category === active)

  return (
    <div>
      {/* Filter */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '0.5rem',
          justifyContent: 'center',
          marginBottom: '3rem',
        }}
      >
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActive(cat)}
            style={{
              background: active === cat ? 'var(--lc-gold)' : 'transparent',
              border: '1px solid var(--lc-gold)',
              fontFamily: 'var(--lc-font-sans)',
              fontWeight: 300,
              fontSize: '0.7rem',
              letterSpacing: '0.25em',
              textTransform: 'uppercase',
              color: active === cat ? 'var(--lc-charcoal)' : 'var(--lc-charcoal)',
              padding: '0.5rem 1.25rem',
              cursor: 'pointer',
              transition: 'all 250ms cubic-bezier(0.22, 1, 0.36, 1)',
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Masonry grid */}
      <div
        style={{
          columns: 'auto 280px',
          gap: '1rem',
        }}
      >
        {filtered.map((item) => (
          <div
            key={item.id}
            style={{
              breakInside: 'avoid',
              marginBottom: '1rem',
            }}
          >
            <PlaceholderImage
              aspectRatio={item.aspectRatio}
              caption={item.caption}
            />
          </div>
        ))}
      </div>
    </div>
  )
}
