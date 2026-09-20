import type { Metadata } from 'next'
import Link from 'next/link'
import { SiteFooter } from '@/components/sections/SiteFooter'

export const metadata: Metadata = {
  title: 'About',
  description: 'Product engineer and designer. Six years building across fintech, healthtech, and consumer software.',
}

const stats = [
  { n: '6+', label: 'Years building' },
  { n: '20+', label: 'Projects shipped' },
  { n: '4', label: 'Countries' },
  { n: '100%', label: 'Client ownership' },
]

const experience = [
  {
    year: '2025 -- now',
    title: 'Prism',
    role: 'Founder',
    description: 'Building a privacy-first browsing analytics extension. MV3, on-device classification, encrypted sync.',
  },
  {
    year: '2024 -- 25',
    title: 'Freelance',
    role: 'Product Engineer & Designer',
    description: 'Independent work across hardware brands, climate tech, and AI tooling. Clients in Nigeria, Belgium, and Switzerland.',
  },
  {
    year: '2023 -- 24',
    title: 'CarbonWise',
    role: 'Lead Product Engineer',
    description: 'Built the core product from scratch: carbon tracking, offset marketplace, SME onboarding flow.',
  },
  {
    year: '2022 -- 23',
    title: 'Healthcare NGO',
    role: 'Product & Engineering Lead',
    description: 'Offline-first EMR for Nigerian primary health centres. IndexedDB sync, PWA, designed for 2G and intermittent power.',
  },
  {
    year: '2020 -- 22',
    title: 'Early career',
    role: 'Software Engineer',
    description: 'Full-stack roles across fintech and e-commerce. Learned what shipping to real users actually means.',
  },
]

const skills = [
  {
    label: 'Engineering',
    items: ['TypeScript', 'React', 'Next.js', 'Node.js', 'PostgreSQL', 'Supabase', 'Chrome MV3', 'PWA', 'Cloudflare Workers', 'WebGL'],
  },
  {
    label: 'Design',
    items: ['UX research', 'Information architecture', 'Interaction design', 'Figma', 'Design systems', 'Typography'],
  },
  {
    label: 'Strategy',
    items: ['Product strategy', 'Technical consulting', 'Systems design', 'AI integrations', 'Due diligence'],
  },
]

const principles = [
  {
    n: '01',
    title: 'Clarity before code',
    body: 'A week spent understanding the problem saves a month of refactoring. I ask more questions than most engineers and fewer than most consultants.',
  },
  {
    n: '02',
    title: 'Ship something real',
    body: 'Prototypes lie. The only honest feedback is from something a real person used to do a real thing. I bias toward getting something in front of users early.',
  },
  {
    n: '03',
    title: 'Own the outcome',
    body: "I take responsibility for product decisions, not just implementation. If a feature I built isn't working, that's my problem too.",
  },
]

export default function AboutPage() {
  return (
    <>
      {/* Opening statement */}
      <section
        style={{
          paddingTop: 'clamp(10rem, 20vw, 16rem)',
          paddingBottom: 'clamp(5rem, 10vw, 8rem)',
          background: 'var(--bg)',
        }}
      >
        <div className="container-page">
          <p className="label-caps" style={{ color: 'var(--accent)', marginBottom: '2rem' }}>
            About
          </p>
          <h1
            className="font-display"
            style={{
              fontSize: 'clamp(2.75rem, 7vw, 6.5rem)',
              letterSpacing: '-0.03em',
              lineHeight: 1.0,
              color: 'var(--text)',
              maxWidth: '18ch',
            }}
          >
            I make software that feels like it was made{' '}
            <em style={{ color: 'var(--accent)', fontStyle: 'italic' }}>for humans.</em>
          </h1>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))',
              gap: '2rem',
              marginTop: '3rem',
              paddingTop: '2rem',
              borderTop: '1px solid var(--line)',
              maxWidth: '80ch',
            }}
          >
            <p style={{ fontSize: 'var(--text-base)', lineHeight: 1.8, color: 'var(--text-muted)', fontWeight: 300 }}>
              Six years building across fintech, healthtech, and consumer software.
              I work across the full stack, from the first wireframe to production
              infrastructure, with a preference for early-stage work where every
              decision still matters.
            </p>
            <p style={{ fontSize: 'var(--text-base)', lineHeight: 1.8, color: 'var(--text-muted)', fontWeight: 300 }}>
              I care about the craft. Not as an aesthetic preference but as a
              practical bet: software that feels right gets used. Software that
              doesn&apos;t, doesn&apos;t.
            </p>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section style={{ background: 'var(--bg-elevated)', borderTop: '1px solid var(--line)', borderBottom: '1px solid var(--line)' }}>
        <div
          className="container-page"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
            gap: '1px',
            background: 'var(--line)',
          }}
        >
          {stats.map(({ n, label }) => (
            <div
              key={label}
              style={{
                background: 'var(--bg-elevated)',
                padding: 'clamp(2rem, 4vw, 3rem) clamp(1.5rem, 3vw, 2.5rem)',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.5rem',
              }}
            >
              <span
                className="font-display"
                style={{
                  fontSize: 'clamp(2.5rem, 5vw, 3.5rem)',
                  letterSpacing: '-0.03em',
                  lineHeight: 1,
                  color: 'var(--accent)',
                }}
              >
                {n}
              </span>
              <span className="label-caps" style={{ color: 'var(--text-faint)' }}>
                {label}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Experience */}
      <section className="container-page" style={{ paddingBlock: 'var(--section-lg)' }}>
        <div style={{ borderBottom: '1px solid var(--line)', paddingBottom: '1rem', marginBottom: '2.5rem' }}>
          <p className="label-caps" style={{ color: 'var(--accent)' }}>Experience</p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {experience.map((item) => (
            <div
              key={item.title + item.year}
              style={{
                display: 'grid',
                gridTemplateColumns: 'minmax(90px, 130px) minmax(100px, 160px) 1fr',
                gap: 'clamp(1rem, 3vw, 3rem)',
                alignItems: 'start',
                paddingBlock: '1.75rem',
                borderBottom: '1px solid var(--line)',
              }}
            >
              <span className="label-caps" style={{ color: 'var(--text-faint)', paddingTop: '0.15rem' }}>
                {item.year}
              </span>
              <span style={{ fontSize: '0.9rem', color: 'var(--accent)', paddingTop: '0.15rem' }}>
                {item.title}
              </span>
              <div>
                <p style={{ fontSize: '0.95rem', color: 'var(--text)', marginBottom: '0.4rem', fontWeight: 400 }}>
                  {item.role}
                </p>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: 1.65, fontWeight: 300 }}>
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Skills */}
      <section style={{ background: 'var(--bg-elevated)', borderTop: '1px solid var(--line)', borderBottom: '1px solid var(--line)' }}>
        <div className="container-page" style={{ paddingBlock: 'var(--section-md)' }}>
          <div style={{ borderBottom: '1px solid var(--line)', paddingBottom: '1rem', marginBottom: '2.5rem' }}>
            <p className="label-caps" style={{ color: 'var(--accent)' }}>Capabilities</p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {skills.map(({ label, items }) => (
              <div key={label} style={{ display: 'flex', flexDirection: 'row', gap: '2rem', alignItems: 'baseline', flexWrap: 'wrap' }}>
                <div style={{ width: '6rem', flexShrink: 0 }}>
                  <span className="label-caps" style={{ color: 'var(--accent)' }}>{label}</span>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  {items.map((item) => (
                    <span
                      key={item}
                      className="label-caps"
                      style={{
                        padding: '4px 12px',
                        borderRadius: 99,
                        color: 'var(--text-muted)',
                        border: '1px solid var(--line-strong)',
                        background: 'var(--bg)',
                      }}
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Principles */}
      <section className="container-page" style={{ paddingBlock: 'var(--section-lg)' }}>
        <div style={{ borderBottom: '1px solid var(--line)', paddingBottom: '1rem', marginBottom: 'clamp(3rem, 6vw, 5rem)' }}>
          <p className="label-caps" style={{ color: 'var(--accent)' }}>How I work</p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(3.5rem, 7vw, 6rem)' }}>
          {principles.map(({ n, title, body }) => (
            <div key={n} style={{ maxWidth: '56ch' }}>
              <span
                className="font-display"
                style={{ fontSize: '2rem', color: 'var(--accent)', opacity: 0.3, lineHeight: 1 }}
              >
                {n}
              </span>
              <h3
                className="font-display"
                style={{
                  fontSize: 'clamp(1.5rem, 3vw, 2.5rem)',
                  letterSpacing: '-0.02em',
                  lineHeight: 1.1,
                  color: 'var(--text)',
                  marginTop: '0.75rem',
                  marginBottom: '1rem',
                }}
              >
                {title}
              </h3>
              <p
                style={{
                  fontSize: 'clamp(1rem, 1.3vw, 1.15rem)',
                  lineHeight: 1.75,
                  color: 'var(--text-muted)',
                  borderLeft: '2px solid var(--accent)',
                  paddingLeft: '1rem',
                  fontWeight: 300,
                }}
              >
                {body}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section
        style={{
          background: 'var(--bg-elevated)',
          borderTop: '1px solid var(--line)',
        }}
      >
        <div className="container-page" style={{ paddingBlock: 'var(--section-md)' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <p
              className="font-display"
              style={{
                fontSize: 'clamp(1.5rem, 3.5vw, 2.75rem)',
                letterSpacing: '-0.02em',
                lineHeight: 1.1,
                color: 'var(--text)',
                maxWidth: '28ch',
              }}
            >
              If you&apos;ve read this far, we&apos;re probably{' '}
              <em style={{ color: 'var(--accent)', fontStyle: 'italic' }}>a good fit.</em>
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <Link
                href="/contact"
                className="label-caps"
                style={{ color: 'var(--accent)', transition: 'color 200ms' }}
              >
                Get in touch &rarr;
              </Link>
              <Link
                href="/work"
                className="label-caps"
                style={{ color: 'var(--text-faint)', transition: 'color 200ms' }}
              >
                See my work &rarr;
              </Link>
            </div>
          </div>
        </div>
      </section>

      <SiteFooter />
    </>
  )
}
