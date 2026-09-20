import type { Metadata } from 'next'
import Link from 'next/link'
import { SiteFooter } from '@/components/sections/SiteFooter'
import { getAllWork } from '@/lib/content'

export const metadata: Metadata = {
  title: 'Work',
  description: 'Selected projects: browser extensions, SaaS products, editorial websites, and more.',
}

const projectColors: Record<string, string> = {
  prism:         '#7C3AED',
  applyai:       '#C8553D',
  alfera:        '#C9A84C',
  'nigeria-emr': '#059669',
  'virtual-po':  '#5B8DEF',
  carbonwise:    '#4A9B7F',
}

function statusInfo(s: string) {
  if (s === 'live')     return { dot: '#22c55e', label: 'Live' }
  if (s === 'building') return { dot: '#F59E0B', label: 'Building' }
  return                       { dot: '#6B7280', label: 'Shipped' }
}

function pad(n: number) { return String(n).padStart(2, '0') }

export default function WorkPage() {
  const works     = getAllWork()
  const featured  = works.filter((w) => w.frontmatter.featured)
  const rest      = works.filter((w) => !w.frontmatter.featured)
  const liveCount = works.filter((w) => w.frontmatter.status === 'live').length

  return (
    <>
      {/* Masthead */}
      <section
        className="container-page"
        style={{ paddingTop: 'clamp(10rem, 20vw, 16rem)', paddingBottom: 'clamp(3rem, 6vw, 5rem)' }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <p className="label-caps" style={{ color: 'var(--accent)' }}>Selected Work</p>
          <h1
            className="font-display"
            style={{
              fontSize: 'clamp(2.75rem, 6vw, 5.5rem)',
              letterSpacing: '-0.03em',
              lineHeight: 1,
              color: 'var(--text)',
              maxWidth: '22ch',
            }}
          >
            Products, tools, and systems I&apos;ve shipped since 2020.
          </h1>
          <div style={{ display: 'flex', gap: '2rem', marginTop: '0.5rem' }}>
            <p className="label-caps" style={{ color: 'var(--text-faint)' }}>
              {works.length} projects
            </p>
            <p className="label-caps" style={{ color: 'var(--accent)' }}>
              {liveCount} live
            </p>
          </div>
        </div>
      </section>

      {/* Featured projects */}
      <section style={{ borderTop: '1px solid var(--line)' }}>
        {featured.map((work, i) => {
          const color  = projectColors[work.slug] ?? 'var(--accent)'
          const status = statusInfo(work.frontmatter.status)

          return (
            <Link
              key={work.slug}
              href={`/work/${work.slug}`}
              style={{
                display: 'block',
                borderBottom: '1px solid var(--line)',
                textDecoration: 'none',
                color: 'inherit',
                transition: 'background 300ms',
              }}
            >
              <div
                className="container-page"
                style={{
                  paddingBlock: 'clamp(3rem, 6vw, 5rem)',
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))',
                  gap: 'clamp(2rem, 4vw, 4rem)',
                  alignItems: 'center',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                    <span
                      style={{
                        width: '6px',
                        height: '6px',
                        borderRadius: '50%',
                        background: status.dot,
                        flexShrink: 0,
                      }}
                    />
                    <span className="label-caps" style={{ color: 'var(--text-faint)' }}>
                      {work.frontmatter.category} &middot; {status.label}
                    </span>
                  </div>

                  <h2
                    className="font-display"
                    style={{
                      fontSize: 'clamp(2rem, 4vw, 3.5rem)',
                      letterSpacing: '-0.03em',
                      lineHeight: 1.05,
                      color: 'var(--text)',
                      marginBottom: '1rem',
                    }}
                  >
                    {work.frontmatter.title}
                  </h2>

                  <p
                    style={{
                      fontSize: 'var(--text-base)',
                      lineHeight: 1.75,
                      color: 'var(--text-muted)',
                      maxWidth: '48ch',
                      marginBottom: '1.5rem',
                      fontWeight: 300,
                    }}
                  >
                    {work.frontmatter.tagline}
                  </p>

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1.5rem' }}>
                    {work.frontmatter.stack.slice(0, 5).map((s) => (
                      <span
                        key={s}
                        className="label-caps"
                        style={{
                          padding: '3px 10px',
                          borderRadius: 99,
                          color: 'var(--text-faint)',
                          border: '1px solid var(--line-strong)',
                        }}
                      >
                        {s}
                      </span>
                    ))}
                  </div>

                  <span className="label-caps" style={{ color }}>
                    View case study &rarr;
                  </span>
                </div>

                {/* Accent block */}
                <div
                  style={{
                    background: color,
                    height: 'clamp(200px, 30vw, 320px)',
                    display: 'flex',
                    alignItems: 'flex-end',
                    justifyContent: 'space-between',
                    padding: '1.5rem',
                    position: 'relative',
                    overflow: 'hidden',
                  }}
                >
                  <span
                    aria-hidden="true"
                    style={{
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)',
                      fontSize: 'clamp(4rem, 8vw, 7rem)',
                      fontFamily: 'var(--font-display-stack), Georgia, serif',
                      letterSpacing: '-0.05em',
                      color: 'rgba(0,0,0,0.08)',
                      lineHeight: 1,
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {work.frontmatter.title}
                  </span>
                  <span className="label-caps" style={{ color: 'rgba(0,0,0,0.35)', position: 'relative' }}>
                    {pad(i + 1)}
                  </span>
                  <span className="label-caps" style={{ color: 'rgba(0,0,0,0.35)', position: 'relative' }}>
                    {work.frontmatter.year}
                  </span>
                </div>
              </div>
            </Link>
          )
        })}
      </section>

      {/* Other projects */}
      {rest.length > 0 && (
        <section className="container-page" style={{ paddingBlock: 'var(--section-md)' }}>
          <div style={{ borderBottom: '1px solid var(--line)', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
            <p className="label-caps" style={{ color: 'var(--accent)' }}>Other work</p>
          </div>

          {rest.map((work, i) => {
            const color  = projectColors[work.slug] ?? 'var(--accent)'
            const status = statusInfo(work.frontmatter.status)

            return (
              <Link
                key={work.slug}
                href={`/work/${work.slug}`}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '2.5rem 1fr auto auto',
                  gap: '1rem',
                  alignItems: 'center',
                  paddingBlock: '1.25rem',
                  borderBottom: '1px solid var(--line)',
                  textDecoration: 'none',
                  color: 'inherit',
                }}
              >
                <span className="label-caps" style={{ color: 'var(--text-faint)' }}>
                  {pad(featured.length + i + 1)}
                </span>
                <div>
                  <p style={{ fontSize: '1rem', color: 'var(--text)', fontWeight: 400 }}>
                    {work.frontmatter.title}
                  </p>
                  <p className="label-caps" style={{ color: 'var(--text-faint)', marginTop: '0.25rem' }}>
                    {work.frontmatter.category}
                  </p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: status.dot }} />
                  <span className="label-caps" style={{ color: 'var(--text-faint)' }}>{status.label}</span>
                </div>
                <span className="label-caps" style={{ color }}>
                  {work.frontmatter.year} &rarr;
                </span>
              </Link>
            )
          })}
        </section>
      )}

      {/* Footer strip */}
      <section className="container-page" style={{ paddingBlock: '2rem', borderTop: '1px solid var(--line)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <p className="label-caps" style={{ color: 'var(--text-faint)' }}>
            {works.length} projects since 2020 &middot; {liveCount} still live
          </p>
          <Link href="/contact" className="label-caps" style={{ color: 'var(--accent)' }}>
            Start a project &rarr;
          </Link>
        </div>
      </section>

      <SiteFooter />
    </>
  )
}
