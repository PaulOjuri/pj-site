import type { Metadata } from 'next'
import Link from 'next/link'
import { services, enhancements } from '@/content/luxciti/services'

export const metadata: Metadata = {
  title: 'Services & Investment',
  description:
    'From full luxury wedding production to day-of management, honeymoon curation and personal styling — discover the full Luxciti offering and find the service that is right for your celebration.',
}

export default function ServicesPage() {
  return (
    <>
      {/* ── Page Header ── */}
      <div
        style={{
          paddingTop: '9rem',
          paddingBottom: '4rem',
          textAlign: 'center',
          backgroundColor: 'var(--lc-ivory)',
          padding: '9rem 2rem 4rem',
        }}
      >
        <p className="lc-eyebrow" style={{ marginBottom: '1rem' }}>
          Our offering
        </p>
        <h1
          className="lc-serif"
          style={{
            fontSize: 'clamp(2.5rem, 5vw, 5rem)',
            fontWeight: 300,
            fontStyle: 'italic',
          }}
        >
          Services &amp; Investment
        </h1>
        <p
          style={{
            fontFamily: 'var(--lc-font-sans)',
            fontWeight: 300,
            fontSize: '0.95rem',
            lineHeight: 1.7,
            color: 'var(--lc-ink-70)',
            maxWidth: '48rem',
            margin: '1.5rem auto 0',
          }}
        >
          Every service is designed around a single question: what does this client need
          to feel completely cared for? Below you will find our full offering — from complete
          event ownership to a single day of professional direction.
        </p>
      </div>

      {/* ── Services ── */}
      {services.map((service, index) => (
        <section
          key={service.id}
          id={service.anchor}
          style={{
            padding: 'clamp(4rem, 7vw, 6rem) 2rem',
            backgroundColor: index % 2 === 0 ? 'var(--lc-ivory)' : 'var(--lc-blush)',
            scrollMarginTop: '6rem',
          }}
        >
          <div style={{ maxWidth: '72rem', margin: '0 auto' }}>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: '3rem 6rem',
                alignItems: 'start',
              }}
            >
              {/* Left: Title + Price */}
              <div>
                <p className="lc-eyebrow" style={{ marginBottom: '0.75rem' }}>
                  {String(index + 1).padStart(2, '0')} / {services.length}
                </p>
                <h2
                  className="lc-serif"
                  style={{
                    fontSize: 'clamp(1.8rem, 3.5vw, 3rem)',
                    fontWeight: 300,
                    lineHeight: 1.15,
                    marginBottom: '1.5rem',
                  }}
                >
                  {service.title}
                </h2>
                <span className="lc-gold-rule" style={{ display: 'block', marginBottom: '1.5rem' }} />
                <p
                  className="lc-serif"
                  style={{
                    fontStyle: 'italic',
                    fontSize: 'clamp(1.2rem, 2vw, 1.6rem)',
                    color: 'var(--lc-ink-70)',
                    marginBottom: '0.5rem',
                    lineHeight: 1.3,
                  }}
                >
                  {service.feeling}
                </p>
                <div style={{ marginTop: '2.5rem' }}>
                  <p className="lc-eyebrow" style={{ marginBottom: '0.25rem' }}>
                    Investment
                  </p>
                  <p
                    className="lc-serif"
                    style={{
                      fontSize: 'clamp(1.8rem, 3vw, 2.5rem)',
                      fontWeight: 300,
                    }}
                  >
                    {service.price}
                  </p>
                </div>
                <div style={{ marginTop: '2rem' }}>
                  <Link
                    href={`/luxciti/enquire?service=${service.id}`}
                    className="lc-btn"
                  >
                    <span>Enquire About This Service</span>
                  </Link>
                </div>
              </div>

              {/* Right: Details */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                <div>
                  <p className="lc-eyebrow" style={{ marginBottom: '0.75rem' }}>
                    What it means for you
                  </p>
                  <p
                    style={{
                      fontFamily: 'var(--lc-font-sans)',
                      fontWeight: 300,
                      fontSize: '0.95rem',
                      lineHeight: 1.8,
                      color: 'var(--lc-charcoal)',
                    }}
                  >
                    {service.description}
                  </p>
                </div>

                <span className="lc-gold-rule" style={{ opacity: 0.3 }} />

                <div>
                  <p className="lc-eyebrow" style={{ marginBottom: '0.75rem' }}>
                    What&apos;s included
                  </p>
                  <p
                    style={{
                      fontFamily: 'var(--lc-font-sans)',
                      fontWeight: 300,
                      fontSize: '0.9rem',
                      lineHeight: 1.8,
                      color: 'var(--lc-ink-70)',
                    }}
                  >
                    {service.includes}
                  </p>
                </div>

                <span className="lc-gold-rule" style={{ opacity: 0.3 }} />

                <div>
                  <p className="lc-eyebrow" style={{ marginBottom: '0.75rem' }}>
                    Made for
                  </p>
                  <p
                    style={{
                      fontFamily: 'var(--lc-font-sans)',
                      fontStyle: 'italic',
                      fontWeight: 300,
                      fontSize: '0.9rem',
                      lineHeight: 1.7,
                      color: 'var(--lc-ink-70)',
                    }}
                  >
                    {service.forWhom}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      ))}

      {/* ── Enhancements ── */}
      <section
        style={{
          padding: 'clamp(4rem, 7vw, 6rem) 2rem',
          backgroundColor: 'var(--lc-charcoal)',
        }}
      >
        <div style={{ maxWidth: '72rem', margin: '0 auto' }}>
          <div style={{ marginBottom: '3rem' }}>
            <p
              className="lc-eyebrow"
              style={{ color: 'var(--lc-ivory)', marginBottom: '0.75rem' }}
            >
              Optional add-ons
            </p>
            <h2
              className="lc-serif"
              style={{
                fontSize: 'clamp(1.8rem, 3.5vw, 3rem)',
                fontWeight: 300,
                fontStyle: 'italic',
                color: 'var(--lc-ivory)',
              }}
            >
              Enhancements
            </h2>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: '0',
            }}
          >
            {enhancements.map((item, i) => (
              <div
                key={item.name}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'baseline',
                  padding: '1.25rem 0',
                  borderBottom: '1px solid var(--lc-gold-hair)',
                  gap: '1rem',
                }}
              >
                <span
                  style={{
                    fontFamily: 'var(--lc-font-sans)',
                    fontWeight: 300,
                    fontSize: '0.85rem',
                    color: 'var(--lc-ivory)',
                    letterSpacing: '0.05em',
                  }}
                >
                  {item.name}
                </span>
                <span
                  className="lc-serif"
                  style={{
                    fontSize: '1.1rem',
                    color: 'var(--lc-gold)',
                    whiteSpace: 'nowrap',
                    flexShrink: 0,
                  }}
                >
                  {item.price}
                </span>
              </div>
            ))}
          </div>

          <div style={{ marginTop: '3.5rem', textAlign: 'center' }}>
            <Link
              href="/luxciti/enquire"
              className="lc-btn-on-dark"
            >
              <span>Begin Your Enquiry</span>
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
