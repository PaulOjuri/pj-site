'use client'

import { useEffect, useRef } from 'react'
import Link from 'next/link'
import { gsap } from 'gsap'

const lines = [
  'Elegantly Planned.',
  'Beautifully Executed.',
  'Unforgettably Yours.',
]

export function HeroTagline() {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduced || !containerRef.current) return

    const ctx = gsap.context(() => {
      const spans = containerRef.current?.querySelectorAll('.hero-line')
      if (!spans) return

      gsap.fromTo(
        spans,
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 1.2,
          stagger: 0.25,
          ease: 'power3.out',
          delay: 0.3,
        }
      )

      const eyebrow = containerRef.current?.querySelector('.hero-eyebrow')
      if (eyebrow) {
        gsap.fromTo(eyebrow, { opacity: 0 }, { opacity: 1, duration: 0.8, delay: 0.1 })
      }

      const cta = containerRef.current?.querySelector('.hero-cta')
      if (cta) {
        gsap.fromTo(cta, { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.9, ease: 'power2.out', delay: 1.3 })
      }
    }, containerRef)

    return () => ctx.revert()
  }, [])

  return (
    <div
      ref={containerRef}
      style={{
        position: 'relative',
        zIndex: 2,
        textAlign: 'center',
        padding: '0 1.5rem',
      }}
    >
      <p
        className="lc-eyebrow hero-eyebrow"
        style={{ color: 'var(--lc-gold-light)', marginBottom: '2rem', opacity: 0 }}
      >
        Luxciti Luxury Events · London
      </p>

      <h1
        className="lc-serif"
        style={{
          fontSize: 'clamp(2.8rem, 6vw, 6rem)',
          fontWeight: 300,
          fontStyle: 'italic',
          lineHeight: 1.15,
          color: 'var(--lc-ivory)',
          marginBottom: '3rem',
        }}
      >
        {lines.map((line, i) => (
          <span
            key={i}
            className="hero-line"
            style={{
              display: 'block',
              opacity: 0,
            }}
          >
            {line}
          </span>
        ))}
      </h1>

      <div className="hero-cta" style={{ opacity: 0 }}>
        <Link href="/luxciti/enquire" className="lc-btn">
          <span>Begin Your Experience</span>
        </Link>
      </div>
    </div>
  )
}
