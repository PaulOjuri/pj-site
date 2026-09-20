import type { Metadata } from 'next'
import { SiteFooter } from '@/components/sections/SiteFooter'
import { ServicesShowcase } from '@/components/sections/ServicesShowcase'

export const metadata: Metadata = {
  title: 'Services',
  description: 'Product engineering, UX design, and technical consulting for early-stage teams.',
}

const services = [
  {
    id: '01',
    title: 'Product engineering',
    description:
      'I build your idea into real, working software -- website, app, or tool. You bring the vision, I handle the code and make sure it actually ships.',
    deliverables: [
      'A real product you can show users',
      'Clean code, no shortcuts',
      'Set up and ready to launch',
      'Handoff or ongoing support -- your choice',
    ],
    good_for: 'You have an idea but no product yet',
  },
  {
    id: '02',
    title: 'Product design',
    description:
      'I figure out how your product should look and feel, then design every screen so it\'s easy to use and nice to look at. No confusing layouts, no guessing.',
    deliverables: [
      'Finding out what your users actually need',
      'Mockups of every screen',
      'A consistent look and feel across the whole product',
      'Click-through prototypes for testing',
    ],
    good_for: 'Your app looks rough or feels confusing to use',
  },
  {
    id: '03',
    title: 'Technical consulting',
    description:
      'Not sure why things are slow, breaking, or hard to build on? I look under the hood, tell you exactly what\'s wrong, and give you a clear plan to fix it.',
    deliverables: [
      'A plain-English report of what\'s working and what isn\'t',
      'A clear plan for what to fix first',
      'A second opinion on your team\'s process',
      'Help choosing the right tools',
    ],
    good_for: 'Something is broken and you\'re not sure why',
  },
  {
    id: '04',
    title: 'Editorial web',
    description:
      'A custom website built just for you -- not a template, not a drag-and-drop builder. Something that actually reflects who you are and loads fast on any device.',
    deliverables: [
      'A website built from scratch, designed for you',
      'Easy to update yourself (or I can do it)',
      'Shows up on Google, loads fast',
      'Optional monthly maintenance',
    ],
    good_for: 'You need a website that actually stands out',
  },
]

export default function ServicesPage() {
  return (
    <>
      {/* Header */}
      <section
        style={{
          paddingTop: 'clamp(10rem, 20vw, 16rem)',
          paddingBottom: 'clamp(3rem, 6vw, 5rem)',
          borderBottom: '1px solid var(--line)',
        }}
      >
        <div className="container-page">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))', gap: '2rem', alignItems: 'end' }}>
            <div>
              <p className="label-caps" style={{ color: 'var(--accent)', marginBottom: '1.5rem' }}>Services</p>
              <h1
                className="font-display"
                style={{
                  fontSize: 'clamp(2.5rem, 6vw, 5.5rem)',
                  letterSpacing: '-0.03em',
                  lineHeight: 1.05,
                  color: 'var(--text)',
                }}
              >
                What I do,{' '}
                <em style={{ fontStyle: 'italic', color: 'var(--accent)' }}>and how.</em>
              </h1>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <p style={{ fontSize: 'clamp(1rem, 1.3vw, 1.2rem)', color: 'var(--text-muted)', lineHeight: 1.7, fontWeight: 300 }}>
                A small number of projects at a time, from first conversation to
                launch. No hand-offs to a junior team halfway through.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Services */}
      <ServicesShowcase services={services} />

      <SiteFooter />
    </>
  )
}
