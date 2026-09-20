import type { Metadata } from 'next'
import Link from 'next/link'
import { Footer } from '@/components/layout/Footer'

export const metadata: Metadata = {
  title: 'Terms of Service — Prism',
  description: 'Terms governing your use of the Prism browser extension and dashboard.',
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

const prose: React.CSSProperties = {
  fontSize: '0.9375rem',
  lineHeight: 1.7,
  color: 'var(--muted)',
}

export default function PrismTermsPage() {
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
            <h1 className="text-heading" style={{ marginBottom: '1rem' }}>
              Terms of Service
            </h1>
            <p style={{ color: 'var(--muted)', fontSize: '0.875rem', lineHeight: 1.6 }}>
              Last updated: {LAST_UPDATED}. By installing the Prism extension or creating a Prism account, you
              agree to these terms.
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
                ...prose,
              }}
            >
              <strong style={{ color: 'var(--ink)' }}>Short version:</strong> Prism is a personal data tool.
              You own your data. Use it lawfully and don't try to abuse the service. We may change or discontinue
              the service, but we'll give you reasonable notice and a way to export your data first.
            </div>

            <Section title="1. Acceptance">
              <p style={prose}>
                These Terms of Service ("Terms") form a legally binding agreement between you and Paul Ojuri
                ("Prism", "we", "us") governing your use of the Prism browser extension and dashboard
                (collectively, the "Service"). If you do not agree, do not use the Service.
              </p>
            </Section>

            <Section title="2. Eligibility">
              <p style={prose}>
                You must be at least 16 years old to use Prism. By using the Service, you confirm that you meet
                this requirement. If you are using Prism on behalf of an organisation, you confirm you have
                authority to bind that organisation to these Terms.
              </p>
            </Section>

            <Section title="3. Your account">
              <p style={{ ...prose, marginBottom: '0.75rem' }}>
                You are responsible for keeping your sync token and account credentials confidential. Your sync
                token is shown once only and is the key to your encrypted wallet — if you lose it, we cannot
                recover your historical data.
              </p>
              <p style={prose}>
                You must provide accurate information when creating your account. Notify us immediately at{' '}
                <a href="mailto:hello@paulojuri.com" style={{ color: 'var(--accent)' }}>hello@paulojuri.com</a>{' '}
                if you believe your account has been compromised.
              </p>
            </Section>

            <Section title="4. Acceptable use">
              <p style={{ ...prose, marginBottom: '0.75rem' }}>
                You agree not to:
              </p>
              <ul style={{ paddingLeft: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '0.75rem' }}>
                {[
                  'Use the Service to collect data about other people without their consent',
                  'Reverse-engineer, decompile, or attempt to extract the source code of the Service',
                  'Use automated scripts to interact with the Service at a volume that disrupts normal operation',
                  'Attempt to circumvent any security or encryption features',
                  'Use the Service for any unlawful purpose or in violation of any applicable law',
                  'Resell or sublicense access to the Service',
                ].map(item => (
                  <li key={item} style={prose}>{item}</li>
                ))}
              </ul>
            </Section>

            <Section title="5. Your data and intellectual property">
              <p style={{ ...prose, marginBottom: '0.75rem' }}>
                You own all browsing data stored in your encrypted wallet. We claim no intellectual property
                rights over it.
              </p>
              <p style={prose}>
                By using the AI insights feature, you grant Prism a limited, non-exclusive licence to process
                anonymised summaries of your data solely for the purpose of generating your personal insights.
                This licence terminates when you disable AI processing or delete your account.
              </p>
            </Section>

            <Section title="6. Privacy">
              <p style={prose}>
                Our{' '}
                <Link href="/prism/privacy" style={{ color: 'var(--accent)' }}>
                  Privacy Policy
                </Link>{' '}
                explains how we collect, store, and protect your data. It forms part of these Terms.
              </p>
            </Section>

            <Section title="7. Service availability">
              <p style={{ ...prose, marginBottom: '0.75rem' }}>
                We aim for high availability but do not guarantee uninterrupted access. We may modify or
                discontinue any part of the Service at any time.
              </p>
              <p style={prose}>
                If we discontinue the Service entirely, we will give at least 30 days' notice and provide a
                data export mechanism so you can retrieve your wallet contents before shutdown.
              </p>
            </Section>

            <Section title="8. Fees">
              <p style={prose}>
                Prism is currently free. If we introduce paid tiers, existing users will be given at least
                30 days' notice and will not be charged without explicit agreement.
              </p>
            </Section>

            <Section title="9. Disclaimers">
              <p style={{ ...prose, marginBottom: '0.75rem' }}>
                The Service is provided "as is" without warranties of any kind, express or implied. We do not
                warrant that:
              </p>
              <ul style={{ paddingLeft: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {[
                  'The Service will be error-free or uninterrupted',
                  'AI-generated insights will be accurate, complete, or suitable for any particular purpose',
                  'The tracker database will identify every tracker on every website',
                ].map(item => (
                  <li key={item} style={prose}>{item}</li>
                ))}
              </ul>
            </Section>

            <Section title="10. Limitation of liability">
              <p style={prose}>
                To the maximum extent permitted by applicable law, Prism's total liability to you for any claim
                arising from your use of the Service is limited to the amount you paid us in the 12 months
                preceding the claim (which may be zero). We are not liable for any indirect, incidental, special,
                or consequential damages.
              </p>
            </Section>

            <Section title="11. Indemnification">
              <p style={prose}>
                You agree to indemnify and hold harmless Paul Ojuri from any claims, damages, or expenses
                (including legal fees) arising from your violation of these Terms or your misuse of the Service.
              </p>
            </Section>

            <Section title="12. Termination">
              <p style={{ ...prose, marginBottom: '0.75rem' }}>
                You may delete your account at any time from the dashboard settings. All your data will be
                permanently deleted within 30 days.
              </p>
              <p style={prose}>
                We may suspend or terminate your access if you violate these Terms, with or without notice
                depending on the severity of the violation.
              </p>
            </Section>

            <Section title="13. Governing law">
              <p style={prose}>
                These Terms are governed by Belgian law. Any disputes will be subject to the exclusive
                jurisdiction of the courts of Antwerp, Belgium, unless mandatory consumer protection law in
                your country of residence provides otherwise.
              </p>
            </Section>

            <Section title="14. Changes to these terms">
              <p style={prose}>
                We may update these Terms. If we make material changes, we will notify you by email and update
                the date at the top of this page. Continued use of the Service after changes constitutes
                acceptance of the revised Terms.
              </p>
            </Section>

            <Section title="15. Contact">
              <p style={prose}>
                Questions about these Terms?{' '}
                <a href="mailto:hello@paulojuri.com" style={{ color: 'var(--accent)' }}>
                  hello@paulojuri.com
                </a>
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
              <Link href="/prism/privacy" className="label-caps text-muted hover:text-ink transition-colors duration-150" style={{ fontSize: '0.625rem' }}>
                Privacy Policy →
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
