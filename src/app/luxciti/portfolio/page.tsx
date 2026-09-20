import type { Metadata } from 'next'
import Link from 'next/link'
import { PlaceholderImage } from '@/components/luxciti/PlaceholderImage'
import { PortfolioFilter } from '@/components/luxciti/PortfolioFilter'

export const metadata: Metadata = {
  title: 'Portfolio',
  description:
    'A selection of the celebrations Luxciti has produced — Nigerian weddings, luxury birthday galas, corporate events, girls&apos; trips, and community occasions across London and beyond.',
}

export default function PortfolioPage() {
  return (
    <>
      {/* ── Page Header ── */}
      <div
        style={{
          padding: '9rem 2rem 5rem',
          textAlign: 'center',
          backgroundColor: 'var(--lc-ivory)',
        }}
      >
        <p className="lc-eyebrow" style={{ marginBottom: '1rem' }}>
          Our work
        </p>
        <h1
          className="lc-serif"
          style={{
            fontSize: 'clamp(2.5rem, 5vw, 5rem)',
            fontWeight: 300,
            fontStyle: 'italic',
          }}
        >
          Portfolio
        </h1>
        <p
          style={{
            fontFamily: 'var(--lc-font-sans)',
            fontWeight: 300,
            fontSize: '0.9rem',
            lineHeight: 1.7,
            color: 'var(--lc-ink-70)',
            maxWidth: '44rem',
            margin: '1.5rem auto 0',
          }}
        >
          Each event here began as a vision. Our work was to see it clearly, build it
          precisely, and deliver it beautifully. These are some of the celebrations we
          are most proud of.
        </p>
      </div>

      {/* ── Filter + Masonry Grid ── */}
      <section
        style={{
          padding: 'clamp(3rem, 6vw, 5rem) 2rem',
          maxWidth: '88rem',
          margin: '0 auto',
        }}
      >
        <PortfolioFilter />
      </section>

      {/* ── Featured Case Study ── */}
      <section
        style={{
          padding: 'clamp(4rem, 8vw, 7rem) 2rem',
          backgroundColor: 'var(--lc-charcoal)',
        }}
      >
        <div style={{ maxWidth: '80rem', margin: '0 auto' }}>
          <p
            className="lc-eyebrow"
            style={{ color: 'var(--lc-ivory)', marginBottom: '0.75rem', textAlign: 'center' }}
          >
            Case Study
          </p>
          <h2
            className="lc-serif"
            style={{
              fontSize: 'clamp(2rem, 4vw, 3.5rem)',
              fontWeight: 300,
              fontStyle: 'italic',
              color: 'var(--lc-ivory)',
              textAlign: 'center',
              marginBottom: '4rem',
            }}
          >
            The Orsett Hall Commission
          </h2>

          {/* Full-bleed image */}
          <PlaceholderImage
            aspectRatio="21/9"
            caption="THE ORSETT HALL — ESSEX, AUGUST 2025 — ADAEZE & EMEKA OKAFOR"
          />

          {/* Story */}
          <div
            style={{
              maxWidth: '64rem',
              margin: '4rem auto 0',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
              gap: '3rem',
            }}
          >
            <div>
              <p
                className="lc-eyebrow"
                style={{ color: 'var(--lc-ivory)', marginBottom: '0.75rem' }}
              >
                The Brief
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
                A Yoruba-Igbo fusion wedding for 350 guests across two ceremonies and four days.
                The bride&apos;s family was Yoruba, based in London. The groom&apos;s family was Igbo,
                with senior members travelling from Imo State. Two cultures, two sets of protocols,
                one vision: a celebration that honoured both families equally and beautifully.
              </p>
            </div>

            <div>
              <p
                className="lc-eyebrow"
                style={{ color: 'var(--lc-ivory)', marginBottom: '0.75rem' }}
              >
                The Challenge
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
                The key floristry supplier cancelled eleven weeks before the wedding. The alternative
                vendors found at short notice were either unavailable or unable to meet the design
                specifications Gift had rendered for the clients. We had three weeks and a very
                specific brief.
              </p>
            </div>

            <div>
              <p
                className="lc-eyebrow"
                style={{ color: 'var(--lc-ivory)', marginBottom: '0.75rem' }}
              >
                The Recovery
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
                Gift sourced a boutique floristry studio through her network — a team who had
                not previously worked at this scale, but whose aesthetic was precisely right.
                She briefed them personally using the AI renders, worked with them through three
                sample sessions, and delivered a floristry result that several guests assumed
                had been imported from Lagos.
              </p>
            </div>

            <div>
              <p
                className="lc-eyebrow"
                style={{ color: 'var(--lc-ivory)', marginBottom: '0.75rem' }}
              >
                The Result
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
                A four-day celebration that ran to the minute, honoured both families
                completely, and produced the most photographed Nigerian wedding of that
                year in the British community. The couple did not know about the floristry
                challenge until after the honeymoon.
              </p>
            </div>
          </div>

          {/* Before/After */}
          <div style={{ marginTop: '4rem' }}>
            <p
              className="lc-eyebrow"
              style={{ color: 'var(--lc-ivory)', textAlign: 'center', marginBottom: '2rem' }}
            >
              Concept to reality
            </p>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: '1.5rem',
              }}
            >
              <div>
                <PlaceholderImage
                  aspectRatio="4/3"
                  caption="AI RENDER — PRE-PRODUCTION DESIGN SESSION"
                />
                <p
                  style={{
                    fontFamily: 'var(--lc-font-sans)',
                    fontWeight: 300,
                    fontSize: '0.7rem',
                    letterSpacing: '0.3em',
                    textTransform: 'uppercase',
                    color: 'var(--lc-ivory)',
                    textAlign: 'center',
                    marginTop: '0.75rem',
                  }}
                >
                  AI Render
                </p>
              </div>
              <div>
                <PlaceholderImage
                  aspectRatio="4/3"
                  caption="THE REALITY — ORSETT HALL, AUGUST 2025"
                />
                <p
                  style={{
                    fontFamily: 'var(--lc-font-sans)',
                    fontWeight: 300,
                    fontSize: '0.7rem',
                    letterSpacing: '0.3em',
                    textTransform: 'uppercase',
                    color: 'var(--lc-ivory)',
                    textAlign: 'center',
                    marginTop: '0.75rem',
                  }}
                >
                  The Reality
                </p>
              </div>
            </div>
          </div>

          {/* Video slot */}
          <div
            style={{
              marginTop: '3rem',
              position: 'relative',
              aspectRatio: '16/9',
              backgroundColor: 'rgba(250,246,240,0.04)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <div
              style={{
                width: '5rem',
                height: '5rem',
                borderRadius: '50%',
                border: '1px solid var(--lc-gold)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <div
                style={{
                  width: 0,
                  height: 0,
                  borderTop: '0.7rem solid transparent',
                  borderBottom: '0.7rem solid transparent',
                  borderLeft: '1.2rem solid var(--lc-gold)',
                  marginLeft: '0.25rem',
                }}
              />
            </div>
            <div style={{ position: 'absolute', bottom: '1.5rem', left: '1.5rem' }}>
              <p className="lc-eyebrow" style={{ color: 'var(--lc-ivory)' }}>
                The Orsett Hall Commission — Event Film
              </p>
            </div>
          </div>

          {/* Pull quote */}
          <blockquote
            className="lc-serif"
            style={{
              fontStyle: 'italic',
              fontSize: 'clamp(1.2rem, 2.5vw, 1.8rem)',
              fontWeight: 300,
              color: 'var(--lc-ivory)',
              textAlign: 'center',
              maxWidth: '48rem',
              margin: '4rem auto 0',
              lineHeight: 1.55,
            }}
          >
            &ldquo;We walked into a room we had already seen. That calm — that knowing —
            changed everything about how we felt on our wedding day.&rdquo;
            <footer
              style={{
                display: 'block',
                marginTop: '1rem',
                fontStyle: 'normal',
              }}
            >
              <span className="lc-eyebrow" style={{ color: 'var(--lc-ink-70)' }}>
                — Adaeze &amp; Emeka Okafor
              </span>
            </footer>
          </blockquote>
        </div>
      </section>

      {/* ── CTA ── */}
      <section
        style={{
          padding: 'clamp(4rem, 8vw, 7rem) 2rem',
          textAlign: 'center',
          backgroundColor: 'var(--lc-ivory)',
        }}
      >
        <p className="lc-eyebrow" style={{ marginBottom: '1rem' }}>
          Your celebration
        </p>
        <h2
          className="lc-serif"
          style={{
            fontSize: 'clamp(1.8rem, 4vw, 3.5rem)',
            fontWeight: 300,
            fontStyle: 'italic',
            marginBottom: '2rem',
          }}
        >
          Yours could be next
        </h2>
        <Link href="/luxciti/enquire" className="lc-btn">
          <span>Begin Your Enquiry</span>
        </Link>
      </section>
    </>
  )
}
