import type { Metadata } from 'next'
import { Footer } from '@/components/layout/Footer'

export const metadata: Metadata = {
  title: 'ApplyAI — Job Application Autofill',
  description:
    'Fill any ATS form in seconds from a single profile. ApplyAI handles the repetition so you can focus on the job itself.',
  openGraph: {
    title: 'ApplyAI — Job Application Autofill',
    description:
      'Fill any ATS form in seconds from a single profile. ApplyAI handles the repetition so you can focus on the job itself.',
  },
}

const AI_ACCENT    = 'oklch(72% 0.19 165)'
const AI_BG        = 'oklch(8% 0.008 165)'
const AI_BG_RAISED = 'oklch(13% 0.010 165)'
const AI_INK_1     = 'oklch(97% 0.005 165)'
const AI_INK_2     = 'oklch(72% 0.012 165)'
const AI_GLOW      = 'oklch(72% 0.19 165 / 0.12)'

const features = [
  {
    icon: '◉',
    title: 'One profile, every ATS',
    body: 'Fill your work history, skills, and answers once. ApplyAI maps it to 12+ applicant tracking systems automatically.',
  },
  {
    icon: '◎',
    title: 'Claude writes the gaps',
    body: "When an employer asks something your profile can't answer, Claude drafts a response in your tone — not a generic template.",
  },
  {
    icon: '◈',
    title: '30+ field classifiers',
    body: 'Name, pronouns, work authorisation, salary expectations, cover letter. ApplyAI identifies the field type and fills it correctly.',
  },
  {
    icon: '✦',
    title: 'Zero servers see your profile',
    body: 'Your CV and profile live in the extension. Nothing is sent to a server. Claude only receives the question — never your data.',
  },
  {
    icon: '⬡',
    title: 'One-click apply',
    body: 'Open a job listing, click Apply, watch every field fill. Review, tweak, submit. The whole cycle in under two minutes.',
  },
  {
    icon: '⊕',
    title: 'Application log',
    body: 'Every application tracked locally: company, role, date, status. A complete job search history without a third-party CRM.',
  },
]

const steps = [
  {
    n: '01',
    title: 'Install the extension',
    body: 'Add ApplyAI to Chrome. Takes 30 seconds. No account required.',
  },
  {
    n: '02',
    title: 'Build your profile',
    body: 'Fill in your work history, skills, and preferences once. ApplyAI stores everything locally — nothing leaves your machine.',
  },
  {
    n: '03',
    title: 'Apply anywhere',
    body: 'Navigate to any job listing. Click the ApplyAI button. Watch it fill the form. Review and submit in seconds.',
  },
]

export default function ApplyAIPage() {
  return (
    <>
      <style>{`
        .applyai-btn-primary {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          background: oklch(72% 0.19 165);
          color: oklch(8% 0.008 165);
          font-family: var(--font-ui);
          font-weight: 600;
          font-size: 0.875rem;
          letter-spacing: 0.01em;
          padding: 0 1.75rem;
          height: 48px;
          border-radius: 9999px;
          text-decoration: none;
          transition: background 200ms ease;
        }
        .applyai-btn-primary:hover {
          background: oklch(62% 0.17 165);
        }
        .applyai-btn-outline {
          display: inline-flex;
          align-items: center;
          font-family: var(--font-ui);
          font-weight: 500;
          font-size: 0.875rem;
          color: oklch(72% 0.012 165);
          text-decoration: none;
          padding: 0 1.25rem;
          height: 48px;
          border: 1px solid oklch(28% 0.010 165);
          border-radius: 9999px;
          transition: color 200ms ease, border-color 200ms ease;
        }
        .applyai-btn-outline:hover {
          color: oklch(97% 0.005 165);
          border-color: oklch(48% 0.010 165);
        }
      `}</style>
      <main id="main-content">

        {/* Hero */}
        <section
          style={{
            background: AI_BG,
            padding: 'clamp(5rem, 10vw, 9rem) var(--gutter) clamp(4rem, 8vw, 7rem)',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div
            aria-hidden="true"
            style={{
              position: 'absolute',
              inset: 0,
              background: `radial-gradient(ellipse 70% 55% at 50% -10%, ${AI_GLOW}, transparent 70%)`,
              pointerEvents: 'none',
            }}
          />

          <div className="container-page" style={{ position: 'relative' }}>
            <div style={{ maxWidth: '820px' }}>
              <p
                className="label-caps"
                style={{
                  color: AI_ACCENT,
                  marginBottom: '1.75rem',
                  letterSpacing: '0.12em',
                }}
              >
                ApplyAI — Job application autofill
              </p>

              <h1
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 'clamp(2.75rem, 7vw, 6rem)',
                  lineHeight: 0.94,
                  letterSpacing: '-0.02em',
                  color: AI_INK_1,
                  marginBottom: 'clamp(1.5rem, 3vw, 2.5rem)',
                }}
              >
                The average job application takes 47 minutes.
              </h1>

              <p
                style={{
                  fontSize: 'clamp(1.05rem, 1.4vw, 1.35rem)',
                  color: AI_INK_2,
                  lineHeight: 1.65,
                  maxWidth: '56ch',
                  marginBottom: 'clamp(2.5rem, 5vw, 4rem)',
                }}
              >
                Most of that is copying the same information into slightly different boxes. ApplyAI fills every ATS form from a single profile — and when an employer asks something your profile can&apos;t answer, Claude writes a response in your tone.
              </p>

              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
                <a
                  href="https://applyai.paulojuri.com"
                  className="applyai-btn-primary"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Get early access →
                </a>
                <a href="#how-it-works" className="applyai-btn-outline">
                  See how it works
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Stats */}
        <section
          style={{
            background: AI_BG_RAISED,
            borderTop: `1px solid oklch(20% 0.010 165)`,
            borderBottom: `1px solid oklch(20% 0.010 165)`,
            padding: 'clamp(2rem, 4vw, 3rem) var(--gutter)',
          }}
        >
          <div
            className="container-page"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
              gap: '2rem',
            }}
          >
            {[
              { value: '12+', label: 'ATS platforms' },
              { value: '30+', label: 'field classifiers' },
              { value: '47 min', label: 'saved per application' },
              { value: '0', label: 'servers see your profile' },
            ].map((s) => (
              <div key={s.label}>
                <p
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: 'clamp(2rem, 4vw, 3rem)',
                    lineHeight: 1,
                    color: AI_ACCENT,
                    marginBottom: '0.5rem',
                  }}
                >
                  {s.value}
                </p>
                <p
                  className="label-caps"
                  style={{ color: AI_INK_2 }}
                >
                  {s.label}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Features */}
        <section
          style={{
            background: AI_BG,
            padding: 'clamp(4rem, 8vw, 7rem) var(--gutter)',
          }}
        >
          <div className="container-page">
            <p
              className="label-caps"
              style={{ color: AI_ACCENT, marginBottom: '1.5rem' }}
            >
              What it does
            </p>
            <h2
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(1.75rem, 3.5vw, 3rem)',
                lineHeight: 1.05,
                letterSpacing: '-0.02em',
                color: AI_INK_1,
                marginBottom: 'clamp(3rem, 6vw, 5rem)',
                maxWidth: '600px',
              }}
            >
              Everything except clicking Submit.
            </h2>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 280px), 1fr))',
                gap: 'clamp(2rem, 4vw, 3rem)',
              }}
            >
              {features.map((f) => (
                <div key={f.title}>
                  <p
                    style={{
                      fontSize: '1.25rem',
                      color: AI_ACCENT,
                      marginBottom: '1rem',
                    }}
                  >
                    {f.icon}
                  </p>
                  <p
                    style={{
                      fontSize: '0.9rem',
                      fontWeight: 500,
                      color: AI_INK_1,
                      marginBottom: '0.5rem',
                    }}
                  >
                    {f.title}
                  </p>
                  <p
                    style={{
                      fontSize: '0.875rem',
                      color: AI_INK_2,
                      lineHeight: 1.65,
                    }}
                  >
                    {f.body}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How it works */}
        <section
          id="how-it-works"
          style={{
            background: AI_BG_RAISED,
            padding: 'clamp(4rem, 8vw, 7rem) var(--gutter)',
            borderTop: `1px solid oklch(20% 0.010 165)`,
          }}
        >
          <div className="container-page">
            <p
              className="label-caps"
              style={{ color: AI_ACCENT, marginBottom: '1.5rem' }}
            >
              How it works
            </p>
            <h2
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(1.75rem, 3.5vw, 3rem)',
                lineHeight: 1.05,
                letterSpacing: '-0.02em',
                color: AI_INK_1,
                marginBottom: 'clamp(3rem, 6vw, 5rem)',
                maxWidth: '480px',
              }}
            >
              Set up once. Apply everywhere.
            </h2>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 260px), 1fr))',
                gap: 'clamp(2rem, 5vw, 4rem)',
              }}
            >
              {steps.map((s) => (
                <div key={s.n}>
                  <p
                    className="label-caps"
                    style={{
                      color: AI_ACCENT,
                      marginBottom: '1rem',
                      fontSize: '0.75rem',
                    }}
                  >
                    {s.n}
                  </p>
                  <p
                    style={{
                      fontSize: '1.05rem',
                      fontWeight: 500,
                      color: AI_INK_1,
                      marginBottom: '0.5rem',
                    }}
                  >
                    {s.title}
                  </p>
                  <p
                    style={{
                      fontSize: '0.875rem',
                      color: AI_INK_2,
                      lineHeight: 1.65,
                    }}
                  >
                    {s.body}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section
          style={{
            background: AI_BG,
            padding: 'clamp(5rem, 10vw, 9rem) var(--gutter)',
            borderTop: `1px solid oklch(20% 0.010 165)`,
            textAlign: 'center',
          }}
        >
          <div className="container-page">
            <h2
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(2rem, 5vw, 4.5rem)',
                lineHeight: 0.96,
                letterSpacing: '-0.02em',
                color: AI_INK_1,
                marginBottom: '2rem',
              }}
            >
              Stop retyping.
              <br />
              Start applying.
            </h2>
            <p
              style={{
                fontSize: 'clamp(1rem, 1.3vw, 1.25rem)',
                color: AI_INK_2,
                lineHeight: 1.65,
                maxWidth: '44ch',
                margin: '0 auto 2.5rem',
              }}
            >
              ApplyAI is in private beta. Join the waitlist and get early access when it ships.
            </p>
            <a
              href="https://applyai.paulojuri.com"
              className="applyai-btn-primary"
              target="_blank"
              rel="noopener noreferrer"
            >
              Join the waitlist →
            </a>
          </div>
        </section>

      </main>
      <Footer />
    </>
  )
}
