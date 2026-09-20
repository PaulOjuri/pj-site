'use client'
import { motion, useReducedMotion } from 'framer-motion'

const EASE = [0.22, 1, 0.36, 1] as const

const SERVICES = [
  {
    num: '01',
    title: 'Product Engineering',
    description: 'I build your idea into real, working software. You bring the vision, I handle the code and make sure it actually ships.',
    goodFor: 'You have an idea but no product yet.',
  },
  {
    num: '02',
    title: 'Product Design',
    description: 'I figure out how your product should look and feel, then design every screen so it\'s easy to use and nice to look at.',
    goodFor: 'Your app looks rough or feels confusing to use.',
  },
  {
    num: '03',
    title: 'Technical Consulting',
    description: 'Not sure why things are slow, breaking, or hard to build on? I look under the hood, tell you what\'s wrong, and give you a clear plan to fix it.',
    goodFor: 'Something is broken and you\'re not sure why.',
  },
  {
    num: '04',
    title: 'Editorial Web',
    description: 'A custom website built just for you. Not a template, not a drag-and-drop builder. Something that actually reflects who you are.',
    goodFor: 'You need a website that actually stands out.',
  },
]

export function Services() {
  const reduced = useReducedMotion()

  const reveal = (delay = 0) => ({
    initial: reduced ? { opacity: 0 } : { opacity: 0, y: 24 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: '-10%' as const },
    transition: { duration: 0.7, ease: EASE, delay },
  })

  return (
    <section
      id="services"
      aria-label="Services"
      className="section-pad"
      style={{ background: 'var(--bg)' }}
    >
      <div className="container-site">
        {/* Header */}
        <motion.div {...reveal()} style={{ marginBottom: 'clamp(4rem, 8vw, 6rem)' }}>
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
            Services
          </p>
          <h2
            className="font-display"
            style={{
              fontSize: 'clamp(2rem, 4vw, 3.5rem)',
              lineHeight: 1.1,
              letterSpacing: '-0.02em',
              color: 'var(--text)',
              marginBottom: '1rem',
            }}
          >
            A small number of projects at a time.
          </h2>
          <p
            style={{
              fontSize: 'clamp(1.05rem, 1.2vw, 1.2rem)',
              color: 'var(--text-muted)',
              maxWidth: '52ch',
              lineHeight: 1.7,
              fontWeight: 300,
            }}
          >
            From first conversation to launch. No hand-offs to a junior team halfway through.
          </p>
        </motion.div>

        {/* Service cards */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 380px), 1fr))',
            gap: '1px',
            background: 'var(--line)',
          }}
        >
          {SERVICES.map((service, i) => (
            <motion.div
              key={service.num}
              {...reveal(i * 0.08)}
              style={{
                background: 'var(--bg)',
                padding: 'clamp(2rem, 4vw, 3.5rem)',
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem',
              }}
            >
              <span
                className="font-display"
                style={{
                  fontSize: 'clamp(2rem, 3vw, 2.5rem)',
                  color: 'var(--accent)',
                  lineHeight: 1,
                  letterSpacing: '-0.02em',
                  opacity: 0.4,
                }}
              >
                {service.num}
              </span>
              <h3
                className="font-display"
                style={{
                  fontSize: 'clamp(1.2rem, 1.6vw, 1.5rem)',
                  color: 'var(--text)',
                  lineHeight: 1.2,
                  letterSpacing: '-0.01em',
                }}
              >
                {service.title}
              </h3>
              <p
                style={{
                  fontSize: '1rem',
                  color: 'var(--text-muted)',
                  lineHeight: 1.7,
                  fontWeight: 300,
                }}
              >
                {service.description}
              </p>
              <p
                className="font-mono"
                style={{
                  fontSize: '0.75rem',
                  letterSpacing: '0.08em',
                  color: 'var(--text-faint)',
                  textTransform: 'uppercase',
                  marginTop: 'auto',
                }}
              >
                Good for: {service.goodFor}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Availability */}
        <div
          style={{
            marginTop: 'clamp(3rem, 6vw, 5rem)',
            paddingBlock: '1.5rem',
            borderTop: '1px solid var(--line)',
            borderBottom: '1px solid var(--line)',
            textAlign: 'center',
          }}
        >
          <p className="font-mono" style={{ fontSize: '0.8rem', letterSpacing: '0.12em', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            Available Now &middot;{' '}
            <a href="mailto:hello@paulojuri.com" style={{ color: 'var(--accent)', textDecoration: 'none' }}>
              hello@paulojuri.com
            </a>
            {' '}&middot; Response Time: 24 Hours
          </p>
        </div>
      </div>
    </section>
  )
}
