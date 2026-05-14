import type { Metadata } from 'next'
import { Nav } from '@/components/layout/Nav'
import { Footer } from '@/components/layout/Footer'
import { Button } from '@/components/ui/Button'
import { Divider } from '@/components/ui/Divider'

export const metadata: Metadata = {
  title: 'Services',
  description:
    'Product engineering, UX design, and technical consulting for early-stage teams.',
}

const services = [
  {
    id: '01',
    title: 'Product engineering',
    description:
      'End-to-end development of web applications, browser extensions, and APIs. I work across the stack — React, Node.js, PostgreSQL, Cloudflare — and take ownership of architectural decisions, not just tickets.',
    deliverables: [
      'Working software, shipped to production',
      'TypeScript, tested, documented',
      'Infrastructure setup and CI/CD',
      'Handoff to your team or ongoing retainer',
    ],
    good_for: 'Early-stage startups, MVPs, complex feature builds',
  },
  {
    id: '02',
    title: 'Product design',
    description:
      'UX research, information architecture, interaction design, and visual design — through to production-ready specs or direct implementation. I work in Figma and code, which means the gap between design and build stays small.',
    deliverables: [
      'User research synthesis',
      'Wireframes and high-fidelity mockups',
      'Design system and component library',
      'Prototypes for user testing',
    ],
    good_for: 'New products, redesigns, design system foundations',
  },
  {
    id: '03',
    title: 'Technical consulting',
    description:
      'Short-term engagements to diagnose problems, set technical direction, or review architecture. Useful when you need someone who can read the code and challenge the strategy in the same conversation.',
    deliverables: [
      'Technical audit and written findings',
      'Architecture recommendations',
      'Team process review',
      'Vendor and tool selection',
    ],
    good_for: 'Teams scaling past 5 engineers, pre-fundraise technical due diligence',
  },
  {
    id: '04',
    title: 'Editorial web',
    description:
      'Bespoke websites for brands, studios, and individuals who want something that stands out — not a template. Performance-obsessed, mobile-first, and built to last.',
    deliverables: [
      'Custom design and development',
      'CMS integration or MDX content pipeline',
      'SEO and Core Web Vitals optimisation',
      'Ongoing maintenance retainer (optional)',
    ],
    good_for: 'Brand launches, portfolio sites, marketing pages',
  },
]

export default function ServicesPage() {
  return (
    <>
      <Nav />
      <main id="main-content">

        {/* Header */}
        <section className="pt-32 pb-16 border-b border-subtle">
          <div className="container-page max-w-3xl">
            <p className="label-caps text-muted mb-4">Services</p>
            <h1 className="text-heading">
              What I do,{' '}
              <em>and how I do it.</em>
            </h1>
            <p className="mt-8 text-lg text-muted leading-relaxed">
              I take a small number of projects at a time and stay involved from
              first conversation to shipping. No hand-offs to a junior team
              halfway through.
            </p>
          </div>
        </section>

        {/* Services list */}
        <ol className="divide-y divide-subtle" aria-label="Services">
          {services.map((s) => (
            <li key={s.id}>
              <div className="container-page py-16 grid gap-10 md:grid-cols-[5rem_1fr_1fr] md:gap-16">

                {/* Number */}
                <p className="label-caps text-muted self-start pt-1">{s.id}</p>

                {/* Left col */}
                <div className="flex flex-col gap-4">
                  <h2 className="text-subheading">{s.title}</h2>
                  <p className="text-muted leading-relaxed max-w-prose">
                    {s.description}
                  </p>
                  <p className="label-caps text-subtle mt-2">
                    Good for: {s.good_for}
                  </p>
                </div>

                {/* Right col — deliverables */}
                <div>
                  <p className="label-caps text-muted mb-4">What you get</p>
                  <ul className="space-y-3" role="list">
                    {s.deliverables.map((d) => (
                      <li key={d} className="flex items-start gap-3">
                        <span className="text-accent mt-0.5 shrink-0" aria-hidden="true">
                          ◆
                        </span>
                        <span className="text-sm text-muted leading-relaxed">{d}</span>
                      </li>
                    ))}
                  </ul>
                </div>

              </div>
            </li>
          ))}
        </ol>

        <Divider />

        {/* Engagement model */}
        <section className="container-page py-16 md:py-24">
          <div className="grid gap-12 md:grid-cols-2 md:gap-24">
            <div>
              <p className="label-caps text-muted mb-6">How engagements work</p>
              <div className="space-y-8">
                {[
                  {
                    step: 'Intro call',
                    desc: '30 minutes to understand what you\'re building and whether I\'m the right person.',
                  },
                  {
                    step: 'Proposal',
                    desc: 'Scope, timeline, and fixed price or retainer rate — no surprises.',
                  },
                  {
                    step: 'Build',
                    desc: 'Weekly check-ins, async by default. I move fast and keep you informed.',
                  },
                  {
                    step: 'Handoff',
                    desc: 'Documented, tested code. I stay available for 30 days post-launch.',
                  },
                ].map((item, i) => (
                  <div key={item.step} className="flex gap-6">
                    <span className="label-caps text-subtle shrink-0 pt-1">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <div>
                      <p className="font-medium text-ink">{item.step}</p>
                      <p className="mt-1 text-muted">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-6 justify-center p-8 bg-cream border border-subtle">
              <p className="label-caps text-muted">Availability</p>
              <p className="text-subheading">
                Taking on{' '}
                <em>2 projects</em>{' '}
                this quarter.
              </p>
              <p className="text-muted leading-relaxed">
                I keep a small roster intentionally. The work is better for it.
              </p>
              <Button href="/contact" variant="primary" size="md" className="self-start">
                Let&apos;s talk →
              </Button>
            </div>
          </div>
        </section>

      </main>
      <Footer />
    </>
  )
}
