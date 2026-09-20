import type { Metadata } from 'next'
import Link from 'next/link'
import { Footer } from '@/components/layout/Footer'

export const metadata: Metadata = {
  title: 'Privacy Policy — Prism',
  description: 'How Prism collects, stores, and protects your data.',
}

const LAST_UPDATED = '1 June 2025'

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section style={{ marginBottom: '3rem' }}>
      <h2
        style={{
          fontFamily: 'var(--font-sans)',
          fontWeight: 400,
          fontSize: 'clamp(1.1rem, 2vw, 1.4rem)',
          letterSpacing: '-0.02em',
          color: 'var(--ink)',
          marginBottom: '1rem',
          lineHeight: 1.2,
        }}
      >
        {title}
      </h2>
      {children}
    </section>
  )
}

export default function PrismPrivacyPage() {
  return (
    <>
      <main id="main-content">
        <div className="page-header container-page" style={{ paddingBottom: '5rem' }}>

          {/* Breadcrumb */}
          <nav style={{ marginBottom: '2.5rem' }}>
            <Link href="/prism" className="label-caps text-muted hover:text-ink transition-colors duration-150" style={{ fontSize: '0.625rem' }}>
              ← Prism
            </Link>
          </nav>

          {/* Header */}
          <div style={{ maxWidth: '68ch', marginBottom: '3.5rem' }}>
            <p className="label-caps text-muted" style={{ marginBottom: '1rem' }}>Legal</p>
            <h1
              className="text-heading"
              style={{ marginBottom: '1rem' }}
            >
              Privacy Policy
            </h1>
            <p style={{ color: 'var(--muted)', fontSize: '0.875rem', lineHeight: 1.6 }}>
              Last updated: {LAST_UPDATED}. This policy applies to the Prism browser extension and Prism dashboard at{' '}
              <a href="https://prism-dashboard-7n2.pages.dev" style={{ color: 'var(--accent)', textDecoration: 'underline' }}>
                prism-dashboard-7n2.pages.dev
              </a>.
            </p>
          </div>

          {/* Body */}
          <div style={{ maxWidth: '68ch' }}>
            <div
              style={{
                background: 'var(--cream)',
                border: '1px solid var(--subtle)',
                borderRadius: 'var(--radius-md)',
                padding: '1.25rem 1.5rem',
                marginBottom: '3rem',
                fontSize: '0.9375rem',
                lineHeight: 1.65,
                color: 'var(--muted)',
              }}
            >
              <strong style={{ color: 'var(--ink)' }}>Short version:</strong> Your data belongs to you. Prism stores
              your browsing data in an encrypted wallet that only you can read. We do not sell your data, share it
              with advertisers, or use it for any purpose other than generating your personal insights. You can
              delete everything at any time.
            </div>

            <Section title="1. Who we are">
              <p style={{ fontSize: '0.9375rem', lineHeight: 1.7, color: 'var(--muted)', marginBottom: '0.75rem' }}>
                Prism is a privacy analytics product built and operated by Paul Ojuri, based in Belgium. You can
                reach us at{' '}
                <a href="mailto:hello@paulojuri.com" style={{ color: 'var(--accent)' }}>
                  hello@paulojuri.com
                </a>.
              </p>
              <p style={{ fontSize: '0.9375rem', lineHeight: 1.7, color: 'var(--muted)' }}>
                For GDPR purposes, Paul Ojuri is the Data Controller for personal data processed by Prism.
              </p>
            </Section>

            <Section title="2. What we collect and why">
              <p style={{ fontSize: '0.9375rem', lineHeight: 1.7, color: 'var(--muted)', marginBottom: '1rem' }}>
                Prism only collects data you explicitly consent to during the onboarding flow. Each type is opt-in:
              </p>
              <ul style={{ paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {[
                  {
                    title: 'Browsing data',
                    body: 'URL, page title, time spent, scroll depth, content category, and tracker signals observed on each page. Collected by the Chrome extension and stored locally first, then synced to your encrypted wallet if you have enabled sync.',
                    basis: 'Consent — GDPR Article 6(1)(a)',
                  },
                  {
                    title: 'Account data',
                    body: 'Your email address and a hashed password, used to authenticate your dashboard account. Managed by Supabase Auth.',
                    basis: 'Contract — GDPR Article 6(1)(b)',
                  },
                  {
                    title: 'AI processing (optional)',
                    body: 'Anonymised, aggregated summaries of your browsing patterns — never raw URLs or identifiable history — are sent to Anthropic\'s Claude API to generate insights and briefings. You must explicitly enable this.',
                    basis: 'Consent — GDPR Article 6(1)(a)',
                  },
                  {
                    title: 'Sync token',
                    body: 'A one-time cryptographic token that pairs your extension with your dashboard. Stored only in the extension\'s local storage and on your account. Never logged or transmitted in plaintext.',
                    basis: 'Contract — GDPR Article 6(1)(b)',
                  },
                ].map(({ title, body, basis }) => (
                  <li key={title} style={{ fontSize: '0.9375rem', lineHeight: 1.7, color: 'var(--muted)', listStyle: 'none' }}>
                    <strong style={{ color: 'var(--ink)', display: 'block', marginBottom: '0.25rem' }}>{title}</strong>
                    {body}
                    <br />
                    <span style={{ fontSize: '0.8125rem', color: 'var(--muted)', fontStyle: 'italic' }}>Lawful basis: {basis}</span>
                  </li>
                ))}
              </ul>
            </Section>

            <Section title="3. How your data is stored">
              <p style={{ fontSize: '0.9375rem', lineHeight: 1.7, color: 'var(--muted)', marginBottom: '0.75rem' }}>
                Your browsing data is encrypted with AES-256 before being stored. The encryption key is derived from
                your sync token using PBKDF2 — it never leaves your device. Prism's servers hold only the
                ciphertext; we cannot read your browsing history.
              </p>
              <p style={{ fontSize: '0.9375rem', lineHeight: 1.7, color: 'var(--muted)' }}>
                Account metadata (email, hashed password, consent records) is stored in a Supabase Postgres
                database hosted in the EU (Frankfurt region).
              </p>
            </Section>

            <Section title="4. Third-party services">
              <p style={{ fontSize: '0.9375rem', lineHeight: 1.7, color: 'var(--muted)', marginBottom: '1rem' }}>
                Prism uses a minimal set of third-party services:
              </p>
              <ul style={{ paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {[
                  { name: 'Supabase', role: 'Database, authentication, and encrypted wallet storage. EU-hosted (Frankfurt).', link: 'https://supabase.com/privacy' },
                  { name: 'Cloudflare Workers', role: 'API edge runtime. Processes requests but does not store your browsing data.', link: 'https://www.cloudflare.com/privacypolicy/' },
                  { name: 'Anthropic Claude', role: 'AI insights generation. Receives only anonymised summaries, never raw browsing data. Only used if you have enabled AI processing.', link: 'https://www.anthropic.com/privacy' },
                ].map(({ name, role, link }) => (
                  <li key={name} style={{ fontSize: '0.9375rem', lineHeight: 1.7, color: 'var(--muted)', listStyle: 'none' }}>
                    <strong style={{ color: 'var(--ink)' }}>{name}</strong> — {role}{' '}
                    <a href={link} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent)', fontSize: '0.8125rem' }}>
                      Privacy policy ↗
                    </a>
                  </li>
                ))}
              </ul>
            </Section>

            <Section title="5. Data transfers">
              <p style={{ fontSize: '0.9375rem', lineHeight: 1.7, color: 'var(--muted)' }}>
                Your account data is stored within the EU. If you have enabled AI processing, anonymised summaries
                are sent to Anthropic, a US company. This transfer is governed by Standard Contractual Clauses (SCCs)
                as required by GDPR Chapter V.
              </p>
            </Section>

            <Section title="6. Your rights">
              <p style={{ fontSize: '0.9375rem', lineHeight: 1.7, color: 'var(--muted)', marginBottom: '1rem' }}>
                Under GDPR, you have the right to:
              </p>
              <ul style={{ paddingLeft: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {[
                  'Access — request a copy of all data we hold about you',
                  'Rectification — correct inaccurate personal data',
                  'Erasure — delete your account and all associated data immediately and permanently',
                  'Restriction — pause processing of your data',
                  'Portability — export your wallet data in JSON format at any time from the dashboard',
                  'Objection — object to any processing based on legitimate interest',
                  'Withdraw consent — revoke any consent from the extension popup or dashboard settings at any time, with immediate effect',
                ].map(item => (
                  <li key={item} style={{ fontSize: '0.9375rem', lineHeight: 1.7, color: 'var(--muted)' }}>
                    <strong style={{ color: 'var(--ink)' }}>{item.split(' — ')[0]}</strong>
                    {' — '}{item.split(' — ')[1]}
                  </li>
                ))}
              </ul>
              <p style={{ fontSize: '0.9375rem', lineHeight: 1.7, color: 'var(--muted)', marginTop: '1rem' }}>
                To exercise any of these rights, email{' '}
                <a href="mailto:hello@paulojuri.com" style={{ color: 'var(--accent)' }}>hello@paulojuri.com</a>.
                We respond within 30 days.
              </p>
            </Section>

            <Section title="7. Data retention">
              <p style={{ fontSize: '0.9375rem', lineHeight: 1.7, color: 'var(--muted)' }}>
                Your encrypted wallet data is retained until you delete your account. Account metadata is deleted
                within 30 days of account deletion. Consent records are retained for 6 years for legal compliance,
                in anonymised form only (no browsing data).
              </p>
            </Section>

            <Section title="8. Cookies">
              <p style={{ fontSize: '0.9375rem', lineHeight: 1.7, color: 'var(--muted)' }}>
                The Prism dashboard uses a single authentication session cookie managed by Supabase. It is
                strictly necessary for the dashboard to function and does not require consent under the ePrivacy
                Directive. We do not use advertising cookies, analytics cookies, or third-party tracking.
              </p>
            </Section>

            <Section title="9. Children">
              <p style={{ fontSize: '0.9375rem', lineHeight: 1.7, color: 'var(--muted)' }}>
                Prism requires users to confirm they are 16 or older during onboarding. We do not knowingly
                collect data from children under 16. If you believe a child has created an account, contact us
                and we will delete it immediately.
              </p>
            </Section>

            <Section title="10. Changes to this policy">
              <p style={{ fontSize: '0.9375rem', lineHeight: 1.7, color: 'var(--muted)' }}>
                If we make material changes, we will notify you by email (if you have an account) and update the
                date at the top of this page. Continued use of Prism after changes constitutes acceptance.
              </p>
            </Section>

            <Section title="11. Complaints">
              <p style={{ fontSize: '0.9375rem', lineHeight: 1.7, color: 'var(--muted)' }}>
                If you believe we have not handled your data correctly, you have the right to lodge a complaint
                with the Belgian Data Protection Authority (Autorité de protection des données —{' '}
                <a href="https://www.autoriteprotectiondonnees.be" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent)' }}>
                  autoriteprotectiondonnees.be
                </a>).
              </p>
            </Section>

            {/* Footer links */}
            <div
              style={{
                borderTop: '1px solid var(--subtle)',
                paddingTop: '2rem',
                display: 'flex',
                gap: '2rem',
                flexWrap: 'wrap',
              }}
            >
              <Link href="/prism/terms" className="label-caps text-muted hover:text-ink transition-colors duration-150" style={{ fontSize: '0.625rem' }}>
                Terms of Service →
              </Link>
              <Link href="/prism" className="label-caps text-muted hover:text-ink transition-colors duration-150" style={{ fontSize: '0.625rem' }}>
                ← Back to Prism
              </Link>
              <a href="mailto:hello@paulojuri.com" className="label-caps text-muted hover:text-ink transition-colors duration-150" style={{ fontSize: '0.625rem' }}>
                Contact us
              </a>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
