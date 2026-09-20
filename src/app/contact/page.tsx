import type { Metadata } from 'next'
import { SiteFooter } from '@/components/sections/SiteFooter'
import { ContactForm } from '@/components/sections/ContactForm'

export const metadata: Metadata = {
  title: 'Contact',
  description: "Let's work together. Tell me about your project and I'll get back to you within a day or two.",
}

const faqs = [
  {
    n: '01',
    q: 'How quickly do you reply?',
    a: "Within one business day. I'll usually suggest a short call to talk through the details.",
  },
  {
    n: '02',
    q: 'Do you work with clients outside Belgium?',
    a: "Yes. Most of my work is remote. I've worked with teams in Nigeria, Switzerland, Germany, and the Netherlands.",
  },
  {
    n: '03',
    q: "What's your minimum engagement?",
    a: "No hard minimum. A focused two-week audit can be as valuable as a six-month build. Tell me what you need and we'll figure out what makes sense.",
  },
  {
    n: '04',
    q: 'Do you do equity or deferred payment?',
    a: 'Occasionally, for the right project. It has to be something I genuinely believe in.',
  },
]

export default function ContactPage() {
  return (
    <>
      {/* Masthead */}
      <section
        className="container-page"
        style={{
          paddingTop: 'clamp(10rem, 20vw, 16rem)',
          paddingBottom: 0,
        }}
      >
        <div
          style={{
            paddingBottom: '2rem',
            borderBottom: '1px solid var(--line)',
          }}
        >
          <p className="label-caps" style={{ color: 'var(--accent)', marginBottom: '1.5rem' }}>Contact</p>
          <h1
            className="font-display"
            style={{
              fontSize: 'clamp(3rem, 8vw, 7rem)',
              letterSpacing: '-0.03em',
              lineHeight: 0.95,
              color: 'var(--text)',
              marginBottom: '1.5rem',
            }}
          >
            Let&apos;s build
            <br />
            <em style={{ fontStyle: 'italic', color: 'var(--accent)' }}>something good.</em>
          </h1>

          <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
            <a
              href="mailto:hello@paulojuri.com"
              className="label-caps"
              style={{ color: 'var(--text)', transition: 'color 200ms' }}
            >
              hello@paulojuri.com
            </a>
            <a
              href="https://linkedin.com/in/paulojuri"
              target="_blank"
              rel="noopener noreferrer"
              className="label-caps"
              style={{ color: 'var(--text-muted)', transition: 'color 200ms' }}
            >
              LinkedIn &rarr;
            </a>
          </div>
        </div>

        <p
          style={{
            fontSize: 'var(--text-base)',
            lineHeight: 1.8,
            color: 'var(--text-muted)',
            maxWidth: '52ch',
            paddingBlock: '2rem',
            fontWeight: 300,
          }}
        >
          Tell me what you&apos;re working on. I read every message and reply within a day.
        </p>
      </section>

      {/* Form + FAQ */}
      <section
        className="container-page"
        style={{ paddingTop: 'var(--section-md)', paddingBottom: 'var(--section-lg)' }}
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))',
            gap: 'clamp(3rem, 6vw, 6rem)',
          }}
        >
          {/* Form */}
          <div>
            <p className="label-caps" style={{ color: 'var(--accent)', marginBottom: '2rem' }}>
              Send a message
            </p>
            <ContactForm />
          </div>

          {/* FAQ */}
          <div>
            <p className="label-caps" style={{ color: 'var(--accent)', marginBottom: '2rem' }}>
              FAQ
            </p>
            <dl style={{ borderTop: '1px solid var(--line)' }}>
              {faqs.map(({ n, q, a }) => (
                <div key={n} style={{ borderBottom: '1px solid var(--line)', padding: '1.5rem 0' }}>
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'baseline' }}>
                    <span className="label-caps" style={{ color: 'var(--text-faint)', width: '2rem', flexShrink: 0 }}>
                      {n}
                    </span>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      <dt style={{ fontSize: '1rem', letterSpacing: '-0.01em', lineHeight: 1.3, color: 'var(--text)', fontWeight: 400 }}>
                        {q}
                      </dt>
                      <dd style={{ fontSize: 'var(--text-base)', lineHeight: 1.75, color: 'var(--text-muted)', fontWeight: 300 }}>
                        {a}
                      </dd>
                    </div>
                  </div>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      {/* Availability strip */}
      <section className="container-page" style={{ paddingBlock: '2rem', borderTop: '1px solid var(--line)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#22c55e' }} />
            <p className="label-caps" style={{ color: 'var(--text-muted)' }}>
              Available for new projects from Q3 2026
            </p>
          </div>
          <p className="label-caps" style={{ color: 'var(--text-faint)' }}>
            Response time: &lt; 24 hours
          </p>
        </div>
      </section>

      <SiteFooter />
    </>
  )
}
