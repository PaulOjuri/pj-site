import type { Metadata } from 'next'
import Link from 'next/link'
import { Footer } from '@/components/layout/Footer'

export const metadata: Metadata = {
  title: 'Prism — Privacy-first browsing analytics',
  description:
    'Your browser has been watching you. Prism turns the lens around. Track your own data, block trackers, and own everything your browser sees.',
  openGraph: {
    title: 'Prism — Privacy-first browsing analytics',
    description:
      'Your browser has been watching you. Prism turns the lens around. Track your own data, block trackers, and own everything your browser sees.',
  },
}

const PRISM_ACCENT    = 'oklch(68% 0.22 255)'
const PRISM_BG        = 'oklch(9% 0.012 255)'
const PRISM_BG_RAISED = 'oklch(14% 0.015 255)'
const PRISM_INK_1     = 'oklch(96% 0.008 255)'
const PRISM_INK_2     = 'oklch(74% 0.015 255)'
const PRISM_GLOW      = 'oklch(68% 0.22 255 / 0.14)'
const DASHBOARD_URL   = 'https://prism-dashboard-7n2.pages.dev'

const features = [
  {
    icon: '◉',
    title: 'Cookie transparency',
    body: 'Every cookie on every site you visit — identified, explained in plain English. Who set it, what it infers about you, how long it lives.',
  },
  {
    icon: '◎',
    title: 'Fingerprint shield',
    body: 'Spoofs canvas, audio, and font enumeration APIs. Makes your browser look like a thousand other browsers — not yours.',
  },
  {
    icon: '◈',
    title: 'Tracker blocking',
    body: 'Standard and strict modes. Per-site overrides. 150+ trackers across advertising, analytics, social, and fingerprinting categories.',
  },
  {
    icon: '✦',
    title: 'AI insights',
    body: 'Daily briefings and proactive insights powered by Claude. Contextualised by your wallet — not by a profile someone else built.',
  },
  {
    icon: '⬡',
    title: 'Encrypted wallet',
    body: 'AES-256 encryption. PBKDF2 key derivation. The key never leaves your device. Export anytime. Delete instantly.',
  },
  {
    icon: '⊕',
    title: 'Consent control',
    body: 'Block individual trackers, auto-reject consent banners, set global privacy preferences. One dashboard, full control.',
  },
]

const steps = [
  {
    n: '01',
    title: 'Install the extension',
    body: 'Add Prism to Chrome. No account needed. Nothing runs until you say so.',
  },
  {
    n: '02',
    title: 'Connect your wallet',
    body: 'Sign up for a dashboard. Generate a sync token. Paste it into the extension. Paired in under a minute.',
  },
  {
    n: '03',
    title: 'Browse, then see clearly',
    body: 'Prism runs silently. Every page logged, queued locally, synced in encrypted batches. Open the dashboard when you want the picture.',
  },
]

export default function PrismPage() {
  return (
    <>
      <style>{`
        .prism-btn-primary {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          background: oklch(68% 0.22 255);
          color: oklch(9% 0.012 255);
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
        .prism-btn-primary:hover {
          background: oklch(58% 0.20 255);
        }
        .prism-btn-outline {
          display: inline-flex;
          align-items: center;
          font-family: var(--font-ui);
          font-weight: 500;
          font-size: 0.875rem;
          color: oklch(74% 0.015 255);
          text-decoration: none;
          padding: 0 1.25rem;
          height: 48px;
          border: 1px solid oklch(30% 0.015 255);
          border-radius: 9999px;
          transition: color 200ms ease, border-color 200ms ease;
        }
        .prism-btn-outline:hover {
          color: oklch(96% 0.008 255);
          border-color: oklch(50% 0.015 255);
        }
      `}</style>
      <main id="main-content">

        {/* ── Hero ──────────────────────────────────────────────────── */}
        <section
          style={{
            background: PRISM_BG,
            padding: 'clamp(5rem, 10vw, 9rem) var(--gutter) clamp(4rem, 8vw, 7rem)',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Ambient glow */}
          <div
            aria-hidden="true"
            style={{
              position: 'absolute',
              inset: 0,
              background: `radial-gradient(ellipse 70% 55% at 50% -10%, ${PRISM_GLOW}, transparent 70%)`,
              pointerEvents: 'none',
            }}
          />

          <div className="container-page" style={{ position: 'relative' }}>
            <div style={{ maxWidth: '820px' }}>
              <p
                className="label-caps"
                style={{
                  color: PRISM_ACCENT,
                  marginBottom: '1.75rem',
                  letterSpacing: '0.12em',
                }}
              >
                Prism — Privacy analytics
              </p>

              <h1
                style={{
                  fontFamily: 'var(--font-sans)',
                  fontWeight: 400,
                  fontSize: 'clamp(2.75rem, 5.5vw, 5.5rem)',
                  lineHeight: 1.05,
                  letterSpacing: '-0.03em',
                  color: PRISM_INK_1,
                  marginBottom: '2rem',
                }}
              >
                Your browser has been{' '}
                <em style={{ fontStyle: 'italic', color: PRISM_ACCENT }}>watching you.</em>
                <br />
                Now you can watch back.
              </h1>

              <p
                style={{
                  fontSize: 'clamp(1rem, 1.5vw, 1.2rem)',
                  lineHeight: 1.65,
                  color: PRISM_INK_2,
                  maxWidth: '56ch',
                  marginBottom: '2.75rem',
                }}
              >
                Prism is a Chrome extension and personal dashboard that captures
                your browsing data, stores it in an encrypted wallet only you
                own, and uses AI to turn it into clarity — without sending a
                single raw record to anyone.
              </p>

              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
                <a
                  href={DASHBOARD_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="prism-btn-primary"
                >
                  Open dashboard →
                </a>
                <Link href="/work/prism" className="prism-btn-outline">
                  Read the case study
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ── Stats ─────────────────────────────────────────────────── */}
        <section
          style={{
            background: PRISM_BG_RAISED,
            borderTop: `1px solid oklch(20% 0.015 255)`,
          }}
        >
          <div
            className="container-page"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
              gap: '1px',
              background: 'oklch(20% 0.015 255)',
            }}
          >
            {[
              { value: '150+', label: 'Trackers identified' },
              { value: '10',   label: 'Signals per page' },
              { value: '0',    label: 'Raw data sent to AI' },
              { value: 'AES-256', label: 'Wallet encryption' },
            ].map(({ value, label }) => (
              <div
                key={label}
                style={{
                  background: PRISM_BG_RAISED,
                  padding: 'clamp(1.5rem, 3vw, 2.5rem) clamp(1.25rem, 2.5vw, 2rem)',
                }}
              >
                <div
                  style={{
                    fontFamily: 'var(--font-sans)',
                    fontSize: 'clamp(1.75rem, 3.5vw, 2.75rem)',
                    fontWeight: 400,
                    letterSpacing: '-0.03em',
                    color: PRISM_ACCENT,
                    lineHeight: 1,
                    marginBottom: '0.5rem',
                  }}
                >
                  {value}
                </div>
                <div
                  className="label-caps"
                  style={{ color: PRISM_INK_2, fontSize: '0.625rem' }}
                >
                  {label}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── How it works ──────────────────────────────────────────── */}
        <section
          style={{
            background: PRISM_BG,
            padding: 'clamp(4rem, 8vw, 7rem) var(--gutter)',
            borderTop: `1px solid oklch(18% 0.012 255)`,
          }}
        >
          <div className="container-page">
            <p
              className="label-caps"
              style={{ color: PRISM_ACCENT, marginBottom: '1rem' }}
            >
              How it works
            </p>
            <h2
              style={{
                fontFamily: 'var(--font-sans)',
                fontWeight: 400,
                fontSize: 'clamp(1.75rem, 3.5vw, 3rem)',
                letterSpacing: '-0.03em',
                color: PRISM_INK_1,
                marginBottom: 'clamp(3rem, 6vw, 5rem)',
                maxWidth: '30ch',
                lineHeight: 1.1,
              }}
            >
              Set up once. Works silently. Clarity on demand.
            </h2>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                gap: 'clamp(2rem, 4vw, 3rem)',
              }}
            >
              {steps.map(({ n, title, body }) => (
                <div key={n}>
                  <div
                    style={{
                      fontFamily: 'var(--font-sans)',
                      fontSize: 'clamp(2.5rem, 5vw, 4rem)',
                      fontWeight: 400,
                      letterSpacing: '-0.04em',
                      color: 'oklch(25% 0.018 255)',
                      lineHeight: 1,
                      marginBottom: '1.5rem',
                    }}
                  >
                    {n}
                  </div>
                  <h3
                    style={{
                      fontFamily: 'var(--font-sans)',
                      fontWeight: 400,
                      fontSize: 'clamp(1.1rem, 1.8vw, 1.35rem)',
                      letterSpacing: '-0.02em',
                      color: PRISM_INK_1,
                      marginBottom: '0.75rem',
                      lineHeight: 1.2,
                    }}
                  >
                    {title}
                  </h3>
                  <p
                    style={{
                      fontSize: '0.9375rem',
                      lineHeight: 1.65,
                      color: PRISM_INK_2,
                    }}
                  >
                    {body}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Features ──────────────────────────────────────────────── */}
        <section
          style={{
            background: PRISM_BG_RAISED,
            padding: 'clamp(4rem, 8vw, 7rem) var(--gutter)',
            borderTop: `1px solid oklch(18% 0.012 255)`,
          }}
        >
          <div className="container-page">
            <p
              className="label-caps"
              style={{ color: PRISM_ACCENT, marginBottom: '1rem' }}
            >
              Features
            </p>
            <h2
              style={{
                fontFamily: 'var(--font-sans)',
                fontWeight: 400,
                fontSize: 'clamp(1.75rem, 3.5vw, 3rem)',
                letterSpacing: '-0.03em',
                color: PRISM_INK_1,
                marginBottom: 'clamp(3rem, 6vw, 5rem)',
                maxWidth: '28ch',
                lineHeight: 1.1,
              }}
            >
              Everything the data economy uses against you. Yours now.
            </h2>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                gap: '1px',
                background: 'oklch(20% 0.015 255)',
              }}
            >
              {features.map(({ icon, title, body }) => (
                <div
                  key={title}
                  style={{
                    background: PRISM_BG_RAISED,
                    padding: 'clamp(1.75rem, 3vw, 2.5rem)',
                  }}
                >
                  <div
                    style={{
                      fontSize: '1.1rem',
                      color: PRISM_ACCENT,
                      marginBottom: '1.25rem',
                      lineHeight: 1,
                    }}
                  >
                    {icon}
                  </div>
                  <h3
                    style={{
                      fontFamily: 'var(--font-sans)',
                      fontWeight: 400,
                      fontSize: 'clamp(1rem, 1.5vw, 1.2rem)',
                      letterSpacing: '-0.02em',
                      color: PRISM_INK_1,
                      marginBottom: '0.625rem',
                      lineHeight: 1.2,
                    }}
                  >
                    {title}
                  </h3>
                  <p
                    style={{
                      fontSize: '0.875rem',
                      lineHeight: 1.65,
                      color: PRISM_INK_2,
                    }}
                  >
                    {body}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Privacy promise ───────────────────────────────────────── */}
        <section
          style={{
            background: PRISM_BG,
            padding: 'clamp(4rem, 7vw, 6rem) var(--gutter)',
            borderTop: `1px solid oklch(18% 0.012 255)`,
          }}
        >
          <div className="container-page">
            <div
              style={{
                maxWidth: '640px',
                borderLeft: `2px solid ${PRISM_ACCENT}`,
                paddingLeft: '2rem',
              }}
            >
              <p
                className="label-caps"
                style={{ color: PRISM_ACCENT, marginBottom: '1.5rem' }}
              >
                Privacy commitments
              </p>
              <ul
                style={{
                  listStyle: 'none',
                  padding: 0,
                  margin: 0,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1rem',
                }}
              >
                {[
                  'All browsing data stored in your personal encrypted wallet. Never sold, shared, or used for advertising.',
                  'Granular consent collected for every data type before capturing anything.',
                  'Each consent decision is timestamped and logged. Withdraw any consent at any time.',
                  'Right to erasure: deletion is immediate and permanent.',
                  'Zero raw data sent to the AI — the assistant works from anonymised summaries only.',
                ].map((item) => (
                  <li
                    key={item}
                    style={{
                      display: 'flex',
                      gap: '0.875rem',
                      alignItems: 'flex-start',
                    }}
                  >
                    <span
                      style={{
                        color: PRISM_ACCENT,
                        fontSize: '0.75rem',
                        lineHeight: '1.65',
                        flexShrink: 0,
                        marginTop: '0.05em',
                      }}
                    >
                      ✓
                    </span>
                    <span
                      style={{
                        fontSize: '0.9375rem',
                        lineHeight: 1.65,
                        color: PRISM_INK_2,
                      }}
                    >
                      {item}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* ── CTA ───────────────────────────────────────────────────── */}
        <section
          style={{
            background: PRISM_BG_RAISED,
            padding: 'clamp(4rem, 8vw, 7rem) var(--gutter)',
            borderTop: `1px solid oklch(20% 0.015 255)`,
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div
            aria-hidden="true"
            style={{
              position: 'absolute',
              inset: 0,
              background: `radial-gradient(ellipse 60% 70% at 80% 50%, ${PRISM_GLOW}, transparent 70%)`,
              pointerEvents: 'none',
            }}
          />

          <div className="container-page" style={{ position: 'relative' }}>
            <div style={{ maxWidth: '640px' }}>
              <p
                className="label-caps"
                style={{ color: PRISM_ACCENT, marginBottom: '1.25rem' }}
              >
                Get started free
              </p>
              <h2
                style={{
                  fontFamily: 'var(--font-sans)',
                  fontWeight: 400,
                  fontSize: 'clamp(1.75rem, 3.5vw, 3rem)',
                  letterSpacing: '-0.03em',
                  color: PRISM_INK_1,
                  marginBottom: '1rem',
                  lineHeight: 1.1,
                }}
              >
                Your data. Your rules.
              </h2>
              <p
                style={{
                  fontSize: '1rem',
                  lineHeight: 1.65,
                  color: PRISM_INK_2,
                  marginBottom: '2.25rem',
                  maxWidth: '45ch',
                }}
              >
                Sign up for the dashboard, install the extension, and start
                seeing what the web has been collecting about you — before
                you decide what to do about it.
              </p>

              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
                <a
                  href={DASHBOARD_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="prism-btn-primary"
                >
                  Create free account →
                </a>
                <Link href="/work/prism" className="prism-btn-outline">
                  How it was built
                </Link>
              </div>
            </div>
          </div>
        </section>

      </main>
      <Footer />
    </>
  )
}
