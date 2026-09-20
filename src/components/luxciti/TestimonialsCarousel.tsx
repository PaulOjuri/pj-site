'use client'

import { useEffect, useRef, useState } from 'react'
import type { Testimonial } from '@/content/luxciti/testimonials'

interface TestimonialsCarouselProps {
  testimonials: Testimonial[]
}

export function TestimonialsCarousel({ testimonials }: TestimonialsCarouselProps) {
  const [active, setActive] = useState(0)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  function startTimer() {
    timerRef.current = setInterval(() => {
      setActive((prev) => (prev + 1) % testimonials.length)
    }, 6000)
  }

  useEffect(() => {
    startTimer()
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [testimonials.length])

  function goTo(index: number) {
    if (timerRef.current) clearInterval(timerRef.current)
    setActive(index)
    startTimer()
  }

  const t = testimonials[active]

  return (
    <div style={{ textAlign: 'center', maxWidth: '56rem', margin: '0 auto' }}>
      <div
        key={active}
        style={{
          animation: 'lc-fade-in 0.7s ease forwards',
        }}
      >
        <p
          className="lc-serif"
          style={{
            fontStyle: 'italic',
            fontSize: 'clamp(1.1rem, 2vw, 1.5rem)',
            fontWeight: 300,
            lineHeight: 1.65,
            color: 'var(--lc-charcoal)',
            marginBottom: '2rem',
          }}
        >
          &ldquo;{t.body}&rdquo;
        </p>

        <div>
          <p
            className="lc-eyebrow"
            style={{ marginBottom: '0.25rem' }}
          >
            {t.name}
          </p>
          <p
            style={{
              fontFamily: 'var(--lc-font-sans)',
              fontWeight: 200,
              fontSize: '0.75rem',
              color: 'var(--lc-ink-45)',
              letterSpacing: '0.1em',
            }}
          >
            {t.eventType} · {t.date}
          </p>
        </div>
      </div>

      {/* Dots */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '0.75rem',
          marginTop: '2.5rem',
        }}
      >
        {testimonials.map((_, i) => (
          <button
            key={i}
            aria-label={`View testimonial ${i + 1}`}
            onClick={() => goTo(i)}
            style={{
              width: i === active ? '2rem' : '0.4rem',
              height: '0.4rem',
              borderRadius: '999px',
              border: 'none',
              cursor: 'pointer',
              transition: 'all 250ms cubic-bezier(0.22, 1, 0.36, 1)',
              background:
                i === active
                  ? 'var(--lc-gold)'
                  : 'var(--lc-gold-hair)',
              opacity: i === active ? 1 : 0.6,
            }}
          />
        ))}
      </div>

      <style>{`
        @keyframes lc-fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}
