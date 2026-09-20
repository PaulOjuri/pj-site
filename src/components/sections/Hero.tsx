'use client'
import { motion, useReducedMotion } from 'framer-motion'

const EASE = [0.22, 1, 0.36, 1] as const

export function Hero() {
  const reduced = useReducedMotion()

  const fade = (delay: number) => ({
    initial: reduced ? { opacity: 0 } : { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 1, ease: EASE, delay },
  })

  return (
    <section
      aria-label="Hero"
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Subtle gradient overlay */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(ellipse at 30% 50%, rgba(201, 168, 76, 0.03) 0%, transparent 60%)',
          pointerEvents: 'none',
        }}
      />

      <div className="container-site" style={{ position: 'relative', zIndex: 1 }}>
        {/* Eyebrow */}
        <motion.p
          {...fade(0.2)}
          className="font-mono"
          style={{
            fontSize: '0.8rem',
            letterSpacing: '0.12em',
            color: 'var(--accent)',
            marginBottom: 'clamp(2rem, 4vw, 4rem)',
            textTransform: 'uppercase',
          }}
        >
          Product Engineer &amp; Designer
        </motion.p>

        {/* Headline */}
        <motion.h1
          {...fade(0.4)}
          className="font-display"
          style={{
            fontSize: 'clamp(3.5rem, 10vw, 9rem)',
            lineHeight: 0.95,
            letterSpacing: '-0.03em',
            color: 'var(--text)',
            maxWidth: '14ch',
            marginBottom: 'clamp(2rem, 4vw, 3.5rem)',
          }}
        >
          I build things
          <br />
          people{' '}
          <em style={{ fontStyle: 'italic', color: 'var(--accent)' }}>want</em>
          <br />
          to use.
        </motion.h1>

        {/* Subtext */}
        <motion.p
          {...fade(0.7)}
          style={{
            fontSize: 'clamp(1.1rem, 1.4vw, 1.3rem)',
            color: 'var(--text-muted)',
            maxWidth: '52ch',
            lineHeight: 1.7,
            fontWeight: 300,
            marginBottom: '3rem',
          }}
        >
          Six years shipping across fintech, healthtech, and consumer software.
          From the first wireframe to production infrastructure.
        </motion.p>

        {/* CTA links */}
        <motion.div
          {...fade(0.9)}
          style={{ display: 'flex', gap: '2rem', alignItems: 'center', flexWrap: 'wrap' }}
        >
          <a
            href="#work"
            className="font-mono"
            style={{
              fontSize: '0.8rem',
              letterSpacing: '0.1em',
              color: 'var(--bg)',
              background: 'var(--accent)',
              padding: '12px 28px',
              textTransform: 'uppercase',
              transition: 'background 300ms',
            }}
            onMouseEnter={(e) => {
              ;(e.currentTarget as HTMLAnchorElement).style.background = 'var(--accent-hover)'
            }}
            onMouseLeave={(e) => {
              ;(e.currentTarget as HTMLAnchorElement).style.background = 'var(--accent)'
            }}
          >
            View Work
          </a>
          <a
            href="#contact"
            className="font-mono"
            style={{
              fontSize: '0.8rem',
              letterSpacing: '0.1em',
              color: 'var(--text-muted)',
              textTransform: 'uppercase',
              transition: 'color 300ms',
            }}
            onMouseEnter={(e) => {
              ;(e.currentTarget as HTMLAnchorElement).style.color = 'var(--accent)'
            }}
            onMouseLeave={(e) => {
              ;(e.currentTarget as HTMLAnchorElement).style.color = 'var(--text-muted)'
            }}
          >
            Get in Touch
          </a>
        </motion.div>
      </div>

      {/* Bottom line */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          borderTop: '1px solid var(--line)',
        }}
      />
    </section>
  )
}
