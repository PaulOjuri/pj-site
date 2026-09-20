'use client'
import Image from 'next/image'
import { motion, useReducedMotion } from 'framer-motion'

const EASE = [0.22, 1, 0.36, 1] as const

const STATS = [
  { value: '6+', label: 'Years' },
  { value: '20+', label: 'Projects' },
  { value: '4', label: 'Countries' },
]

const TIMELINE = [
  {
    years: '2025 -- Now',
    company: 'Prism',
    role: 'Founder',
    description: 'Building a privacy-first browsing analytics extension. MV3, on-device classification, encrypted sync.',
  },
  {
    years: '2024 -- 25',
    company: 'Freelance',
    role: 'Product Engineer & Designer',
    description: 'Independent work across hardware brands, climate tech, and AI tooling. Clients in Nigeria, Belgium, and Switzerland.',
  },
  {
    years: '2023 -- 24',
    company: 'CarbonWise',
    role: 'Lead Product Engineer',
    description: 'Built the core product from scratch: carbon tracking, offset marketplace, SME onboarding flow.',
  },
  {
    years: '2022 -- 23',
    company: 'Healthcare NGO',
    role: 'Product & Engineering Lead',
    description: 'Offline-first EMR for Nigerian primary health centres. IndexedDB sync, PWA, designed for 2G and intermittent power.',
  },
  {
    years: '2020 -- 22',
    company: 'Early Career',
    role: 'Software Engineer',
    description: 'Full-stack roles across fintech and e-commerce.',
  },
]

export function About() {
  const reduced = useReducedMotion()

  const reveal = (delay = 0) => ({
    initial: reduced ? { opacity: 0 } : { opacity: 0, y: 24 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: '-10%' as const },
    transition: { duration: 0.7, ease: EASE, delay },
  })

  return (
    <section
      id="about"
      aria-label="About"
      className="section-pad"
      style={{ background: 'var(--bg)' }}
    >
      <div className="container-site">
        {/* Two-column layout */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 320px), 1fr))',
            gap: 'clamp(3rem, 8vw, 8rem)',
            alignItems: 'start',
          }}
        >
          {/* Left -- portrait */}
          <motion.div
            {...reveal()}
            className="img-hover"
            style={{ aspectRatio: '4/5', position: 'relative', overflow: 'hidden' }}
          >
            <Image
              src="/paul/portrait.jpg"
              alt="Paul Ojuri"
              fill
              sizes="(max-width: 768px) 100vw, 40vw"
              style={{ objectFit: 'cover', objectPosition: 'center top' }}
              priority
            />
          </motion.div>

          {/* Right -- text */}
          <motion.div {...reveal(0.1)}>
            <p
              className="font-mono"
              style={{
                fontSize: '0.8rem',
                letterSpacing: '0.15em',
                color: 'var(--accent)',
                marginBottom: '2rem',
                textTransform: 'uppercase',
              }}
            >
              About
            </p>

            <h2
              className="font-display"
              style={{
                fontSize: 'clamp(2rem, 4vw, 3.5rem)',
                lineHeight: 1.1,
                letterSpacing: '-0.02em',
                color: 'var(--text)',
                marginBottom: '2.5rem',
              }}
            >
              I make software that feels like it was made for humans.
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <p style={{ color: 'var(--text-muted)', fontSize: 'clamp(1.05rem, 1.2vw, 1.2rem)', lineHeight: 1.75, fontWeight: 300 }}>
                Six years building across fintech, healthtech, and consumer software. I work across
                the full stack, from the first wireframe to production infrastructure, with a
                preference for early-stage work where every decision still matters.
              </p>
              <p style={{ color: 'var(--text-muted)', fontSize: 'clamp(1.05rem, 1.2vw, 1.2rem)', lineHeight: 1.75, fontWeight: 300 }}>
                I care about the craft. Not as an aesthetic preference but as a practical bet:
                software that feels right gets used. Software that doesn&apos;t, doesn&apos;t.
              </p>
              <p style={{ color: 'var(--text-muted)', fontSize: 'clamp(1.05rem, 1.2vw, 1.2rem)', lineHeight: 1.75, fontWeight: 300 }}>
                Currently based in Turnhout, Belgium. Founder of Prism, a privacy-first browsing
                analytics extension. Available for new projects now.
              </p>
            </div>

            {/* Stats */}
            <div
              style={{
                display: 'flex',
                gap: 'clamp(2.5rem, 5vw, 5rem)',
                marginTop: '3rem',
                paddingTop: '2.5rem',
                borderTop: '1px solid var(--line)',
              }}
            >
              {STATS.map((stat) => (
                <div key={stat.label}>
                  <p
                    className="font-display"
                    style={{
                      fontSize: 'clamp(2rem, 4vw, 3rem)',
                      lineHeight: 1,
                      color: 'var(--accent)',
                      letterSpacing: '-0.02em',
                    }}
                  >
                    {stat.value}
                  </p>
                  <p
                    className="font-mono"
                    style={{
                      fontSize: '0.75rem',
                      letterSpacing: '0.12em',
                      color: 'var(--text-faint)',
                      marginTop: '0.5rem',
                      textTransform: 'uppercase',
                    }}
                  >
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Timeline */}
        <motion.div
          {...reveal()}
          style={{ marginTop: 'clamp(5rem, 10vw, 10rem)' }}
        >
          <p
            className="font-mono"
            style={{
              fontSize: '0.8rem',
              letterSpacing: '0.15em',
              color: 'var(--text-faint)',
              marginBottom: '2.5rem',
              paddingBottom: '1.5rem',
              borderBottom: '1px solid var(--line)',
              textTransform: 'uppercase',
            }}
          >
            Experience
          </p>

          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {TIMELINE.map((entry, i) => (
              <motion.div
                key={entry.company}
                {...reveal(i * 0.06)}
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'minmax(90px, 130px) minmax(100px, 160px) 1fr',
                  gap: 'clamp(1rem, 3vw, 3rem)',
                  alignItems: 'start',
                  paddingBlock: '1.75rem',
                  borderBottom: '1px solid var(--line)',
                }}
              >
                <p
                  className="font-mono"
                  style={{ fontSize: '0.8rem', letterSpacing: '0.06em', color: 'var(--text-faint)', paddingTop: '0.15rem' }}
                >
                  {entry.years}
                </p>
                <p
                  style={{ fontSize: '1rem', color: 'var(--accent)', paddingTop: '0.15rem', fontWeight: 400 }}
                >
                  {entry.company}
                </p>
                <div>
                  <p style={{ fontSize: '1.05rem', color: 'var(--text)', marginBottom: '0.4rem', fontWeight: 400 }}>
                    {entry.role}
                  </p>
                  <p style={{ fontSize: '1.05rem', color: 'var(--text-muted)', lineHeight: 1.65, fontWeight: 300 }}>
                    {entry.description}
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
