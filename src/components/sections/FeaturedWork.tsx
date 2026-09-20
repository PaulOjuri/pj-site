'use client'
import { motion, useReducedMotion } from 'framer-motion'
import { MediaImage } from '@/components/MediaImage'

const EASE = [0.22, 1, 0.36, 1] as const

interface Project {
  id: string
  title: string
  subtitle: string
  tags: string
  description: string
  image: string
  liveUrl?: string
  year: string
}

const FEATURED_PROJECTS: Project[] = [
  {
    id: 'prism',
    title: 'Prism',
    subtitle: 'Privacy-First Browsing Analytics',
    tags: 'Privacy / Browser Extension / AI / Full-Stack',
    description:
      'Every privacy tool I tried still phoned home. Prism runs on-device: browsing data is classified locally, encrypted with AES-256, and the AI assistant only sees anonymised summaries. 150+ tracker categories, 10 signals per page, zero raw data sent to AI.',
    image: '/images/work/prism-dashboard.png',
    liveUrl: '/prism',
    year: '2025',
  },
  {
    id: 'applyai',
    title: 'ApplyAI',
    subtitle: 'Job Application Autofill',
    tags: 'AI / Productivity / Browser Extension / Claude',
    description:
      'The average job application takes 47 minutes. ApplyAI fills every ATS form from a single profile, and when an employer asks something your profile can\'t answer, Claude writes a response in your tone. 12+ ATS platforms, 30+ field classifiers, zero servers see your profile.',
    image: '/images/work/applyai-icon.png',
    liveUrl: '/applyai',
    year: '2025',
  },
  {
    id: 'alfera',
    title: 'Alfera Technik',
    subtitle: 'Nigeria\'s Premium Laptop Brand',
    tags: 'Brand Identity / E-commerce / Hardware / Web',
    description:
      'The brief was to make Nigeria\'s homegrown laptop brand stand next to Apple and Nothing without flinching. Graphite and gold palette. Designed for the 3-second scroll and the 15-minute due-diligence read. 200+ pages of product documentation processed through a custom Python pipeline.',
    image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=1600&q=80',
    liveUrl: 'https://alferatechnik.com',
    year: '2025',
  },
]

const MORE_PROJECTS = [
  { num: '04', title: 'CarbonWise', subtitle: 'Carbon Tracking for SMEs', year: '2024', tags: 'Climate Tech / SaaS / B2B' },
  { num: '05', title: 'Virtual PO', subtitle: 'AI Product Ownership', year: '2024', tags: 'AI / Product Management / SaaS' },
  { num: '06', title: 'Nigeria EMR', subtitle: 'Offline-First Medical Records', year: '2023', tags: 'Healthcare / PWA / Nigeria' },
  { num: '07', title: 'TradeEasy', subtitle: 'Personal Options Signal Tool', year: '2026', tags: 'Python / AI / Options', link: '/tradeeasy' },
]

export function FeaturedWork() {
  const reduced = useReducedMotion()

  const reveal = (delay = 0) => ({
    initial: reduced ? { opacity: 0 } : { opacity: 0, y: 24 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: '-10%' as const },
    transition: { duration: 0.7, ease: EASE, delay },
  })

  return (
    <section
      id="work"
      aria-label="Featured Work"
      style={{ background: 'var(--bg-elevated)', borderTop: '1px solid var(--line)' }}
    >
      <div className="container-site" style={{ paddingBlock: 'clamp(6rem, 14vw, 12rem)' }}>
        {/* Section header */}
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
            Selected Work
          </p>
          <h2
            className="font-display"
            style={{
              fontSize: 'clamp(2rem, 4vw, 3.5rem)',
              lineHeight: 1.1,
              letterSpacing: '-0.02em',
              color: 'var(--text)',
            }}
          >
            Projects I&apos;ve built, shipped, and care about.
          </h2>
        </motion.div>

        {/* Featured projects */}
        {FEATURED_PROJECTS.map((project, index) => (
          <motion.article
            key={project.id}
            {...reveal()}
            style={{
              paddingBlock: 'clamp(3rem, 6vw, 5rem)',
              borderTop: '1px solid var(--line)',
            }}
          >
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 340px), 1fr))',
                gap: 'clamp(2.5rem, 6vw, 5rem)',
                alignItems: 'start',
              }}
            >
              {/* Image */}
              <div
                style={{ order: index % 2 === 1 ? 2 : 1 }}
                className="img-hover"
              >
                <div style={{ aspectRatio: '16/10', position: 'relative', overflow: 'hidden', background: 'var(--bg-inset)' }}>
                  <MediaImage
                    src={project.image}
                    alt={`${project.title} project`}
                    width={1600}
                    height={1000}
                    fill
                    sizes="(max-width: 768px) 100vw, 55vw"
                    priority={index === 0}
                  />
                </div>
              </div>

              {/* Content */}
              <div style={{ order: index % 2 === 1 ? 1 : 2, paddingTop: 'clamp(0rem, 1vw, 1rem)' }}>
                <p
                  className="font-mono"
                  style={{
                    fontSize: '0.75rem',
                    letterSpacing: '0.12em',
                    color: 'var(--text-faint)',
                    marginBottom: '1rem',
                    textTransform: 'uppercase',
                  }}
                >
                  {project.year}
                </p>

                <h3
                  className="font-display"
                  style={{
                    fontSize: 'clamp(1.75rem, 3.5vw, 3rem)',
                    lineHeight: 1.05,
                    letterSpacing: '-0.02em',
                    color: 'var(--text)',
                    marginBottom: '0.5rem',
                  }}
                >
                  {project.title}
                </h3>

                <p
                  style={{
                    fontSize: 'clamp(1rem, 1.2vw, 1.15rem)',
                    color: 'var(--accent)',
                    marginBottom: '1.5rem',
                    fontWeight: 300,
                  }}
                >
                  {project.subtitle}
                </p>

                <p
                  className="font-mono"
                  style={{
                    fontSize: '0.75rem',
                    letterSpacing: '0.08em',
                    color: 'var(--text-faint)',
                    marginBottom: '1.5rem',
                    textTransform: 'uppercase',
                  }}
                >
                  {project.tags}
                </p>

                <p
                  style={{
                    color: 'var(--text-muted)',
                    fontSize: 'clamp(1rem, 1.15vw, 1.1rem)',
                    lineHeight: 1.75,
                    marginBottom: '2rem',
                    maxWidth: '50ch',
                    fontWeight: 300,
                  }}
                >
                  {project.description}
                </p>

                {project.liveUrl && (
                  <a
                    href={project.liveUrl}
                    {...(project.liveUrl.startsWith('http') ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                    className="font-mono"
                    style={{
                      fontSize: '0.8rem',
                      letterSpacing: '0.1em',
                      color: 'var(--accent)',
                      textTransform: 'uppercase',
                      transition: 'color 200ms',
                    }}
                    onMouseEnter={(e) => { ;(e.currentTarget as HTMLAnchorElement).style.color = 'var(--accent-hover)' }}
                    onMouseLeave={(e) => { ;(e.currentTarget as HTMLAnchorElement).style.color = 'var(--accent)' }}
                  >
                    {project.liveUrl.startsWith('http') ? 'Visit Site' : 'View Project'} &rarr;
                  </a>
                )}
              </div>
            </div>
          </motion.article>
        ))}

        {/* More work */}
        <motion.div
          {...reveal()}
          style={{
            marginTop: 'clamp(2rem, 4vw, 3rem)',
            paddingTop: 'clamp(3rem, 6vw, 5rem)',
            borderTop: '1px solid var(--line)',
          }}
        >
          <p
            className="font-mono"
            style={{
              fontSize: '0.8rem',
              letterSpacing: '0.15em',
              color: 'var(--text-faint)',
              marginBottom: '2rem',
              textTransform: 'uppercase',
            }}
          >
            More Work
          </p>

          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {MORE_PROJECTS.map((proj, i) => (
              <motion.div
                key={proj.num}
                {...reveal(i * 0.06)}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '2.5rem 1fr auto',
                  gap: 'clamp(1rem, 2vw, 2rem)',
                  alignItems: 'center',
                  paddingBlock: '1.25rem',
                  borderBottom: '1px solid var(--line)',
                  transition: 'background 200ms',
                }}
              >
                <span
                  className="font-mono"
                  style={{ fontSize: '0.8rem', color: 'var(--text-faint)', letterSpacing: '0.06em' }}
                >
                  {proj.num}
                </span>
                <div>
                  <p style={{ fontSize: 'clamp(1.05rem, 1.2vw, 1.15rem)', color: 'var(--text)', fontWeight: 400, marginBottom: '0.2rem' }}>
                    {proj.title} <span style={{ color: 'var(--text-muted)', fontWeight: 300 }}>&mdash; {proj.subtitle}</span>
                  </p>
                  <p className="font-mono" style={{ fontSize: '0.75rem', color: 'var(--text-faint)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                    {proj.tags}
                  </p>
                </div>
                <span className="font-mono" style={{ fontSize: '0.8rem', color: 'var(--text-faint)', letterSpacing: '0.06em' }}>
                  {proj.year}
                </span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}
