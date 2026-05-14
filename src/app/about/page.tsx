import type { Metadata } from 'next'
import { Nav } from '@/components/layout/Nav'
import { Footer } from '@/components/layout/Footer'
import { Button } from '@/components/ui/Button'
import { Tag } from '@/components/ui/Tag'
import { Divider } from '@/components/ui/Divider'

export const metadata: Metadata = {
  title: 'About',
  description:
    'Product engineer and designer. Six years building across fintech, healthtech, and consumer software.',
}

const skills = [
  'Product strategy',
  'UX design',
  'TypeScript',
  'React / Next.js',
  'Node.js',
  'PostgreSQL',
  'Chrome extensions',
  'WebGL / Three.js',
  'Cloudflare',
  'AI integrations',
  'PWA / offline-first',
  'Systems design',
]

const timeline = [
  {
    year: '2025',
    title: 'Prism',
    role: 'Founder',
    description:
      'Building a privacy-first browsing analytics extension. MV3, on-device classification, encrypted sync.',
  },
  {
    year: '2024–25',
    title: 'Freelance',
    role: 'Product Engineer & Designer',
    description:
      'Independent work across hardware brands, climate tech, and AI tooling. Clients in Nigeria, Belgium, and Switzerland.',
  },
  {
    year: '2023–24',
    title: 'CarbonWise',
    role: 'Lead Product Engineer',
    description:
      'Built the core product from scratch — carbon tracking, offset marketplace, SME onboarding flow.',
  },
  {
    year: '2022–23',
    title: 'Healthcare NGO',
    role: 'Product & Engineering Lead',
    description:
      'Offline-first EMR for Nigerian primary health centres. IndexedDB sync, PWA, designed for 2G and intermittent power.',
  },
  {
    year: '2020–22',
    title: 'Early career',
    role: 'Software Engineer',
    description:
      'Full-stack roles across fintech and e-commerce. Learned what shipping to real users actually means.',
  },
]

export default function AboutPage() {
  return (
    <>
      <Nav />
      <main id="main-content">

        {/* Hero */}
        <section className="pt-32 pb-16 border-b border-subtle">
          <div className="container-page grid gap-12 md:grid-cols-2 md:gap-24">
            <div>
              <p className="label-caps text-muted mb-4">About</p>
              <h1 className="text-heading">
                I build products people{' '}
                <em>actually want to use.</em>
              </h1>
            </div>
            <div className="flex flex-col justify-end gap-6">
              <p className="text-lg leading-relaxed text-muted">
                Product engineer and designer based in Belgium. I work across
                the full stack — from the first wireframe to production
                infrastructure — with a preference for early-stage work where
                every decision still matters.
              </p>
              <p className="text-lg leading-relaxed text-muted">
                I care about the craft. Not as an aesthetic preference but as a
                practical bet: software that feels right gets used. Software
                that doesn&apos;t, doesn&apos;t.
              </p>
            </div>
          </div>
        </section>

        {/* Skills */}
        <section className="container-page py-16 border-b border-subtle">
          <p className="label-caps text-muted mb-8">Skills & tools</p>
          <div className="flex flex-wrap gap-2">
            {skills.map((s) => (
              <Tag key={s}>{s}</Tag>
            ))}
          </div>
        </section>

        {/* Timeline */}
        <section className="container-page py-16 md:py-24" aria-labelledby="timeline-heading">
          <p className="label-caps text-muted mb-12" id="timeline-heading">
            Experience
          </p>
          <ol className="divide-y divide-subtle">
            {timeline.map((item) => (
              <li
                key={item.year + item.title}
                className="grid grid-cols-1 gap-4 py-10 md:grid-cols-[10rem_1fr] md:gap-12"
              >
                <div>
                  <p className="label-caps text-muted">{item.year}</p>
                </div>
                <div className="flex flex-col gap-2">
                  <h2 className="text-subheading">{item.title}</h2>
                  <p className="label-caps text-accent">{item.role}</p>
                  <p className="mt-2 max-w-prose text-muted leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        <Divider />

        {/* Principles */}
        <section className="bg-ink text-paper">
          <div className="container-page py-24 md:py-32">
            <p className="label-caps text-paper/40 mb-12">How I work</p>
            <div className="grid gap-12 md:grid-cols-3">
              {[
                {
                  n: '01',
                  title: 'Clarity before code',
                  body: 'A week spent understanding the problem saves a month of refactoring. I ask more questions than most engineers and fewer than most consultants.',
                },
                {
                  n: '02',
                  title: 'Ship something real',
                  body: "Prototypes lie. The only honest feedback is from something a real person used to do a real thing. I bias toward getting something in front of users early and fixing what's wrong.",
                },
                {
                  n: '03',
                  title: 'Own the outcome',
                  body: 'I take responsibility for product decisions, not just implementation. If a feature I built isn\'t working, that\'s my problem too.',
                },
              ].map((p) => (
                <div key={p.n} className="flex flex-col gap-4">
                  <p className="label-caps text-paper/30">{p.n}</p>
                  <h3 className="text-xl font-sans text-paper">{p.title}</h3>
                  <p className="text-paper/60 leading-relaxed">{p.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="container-page py-24 text-center">
          <h2 className="text-heading max-w-xl mx-auto mb-8">
            Want to work together?
          </h2>
          <div className="flex flex-wrap justify-center gap-4">
            <Button href="/contact" variant="primary" size="lg">
              Get in touch
            </Button>
            <Button href="/work" variant="outline" size="lg">
              See my work
            </Button>
          </div>
        </section>

      </main>
      <Footer />
    </>
  )
}
