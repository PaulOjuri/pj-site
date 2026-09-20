import type { Metadata } from 'next'
import Link from 'next/link'
import { testimonials } from '@/content/luxciti/testimonials'
import { TestimonialsCarousel } from '@/components/luxciti/TestimonialsCarousel'

export const metadata: Metadata = {
  title: 'Client Stories',
  description:
    'What our clients say about the Luxciti experience — real words from British-Nigerian couples and families who trusted us with their most important celebrations.',
}

export default function TestimonialsPage() {
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
          In their words
        </p>
        <h1
          className="lc-serif"
          style={{
            fontSize: 'clamp(2.5rem, 5vw, 5rem)',
            fontWeight: 300,
            fontStyle: 'italic',
          }}
        >
          Client Stories
        </h1>
      </div>

      {/* ── Rotating Carousel ── */}
      <section
        style={{
          padding: 'clamp(4rem, 8vw, 7rem) 2rem',
          backgroundColor: 'var(--lc-ivory)',
        }}
      >
        <div style={{ maxWidth: '80rem', margin: '0 auto' }}>
          <TestimonialsCarousel testimonials={testimonials} />
        </div>
      </section>

      {/* ── Video Testimonial Slots ── */}
      <section
        style={{
          padding: 'clamp(3rem, 6vw, 5rem) 2rem',
          backgroundColor: 'var(--lc-blush)',
        }}
      >
        <div style={{ maxWidth: '80rem', margin: '0 auto' }}>
          <p className="lc-eyebrow" style={{ marginBottom: '0.75rem', textAlign: 'center' }}>
            On camera
          </p>
          <h2
            className="lc-serif"
            style={{
              fontSize: 'clamp(1.8rem, 3.5vw, 3rem)',
              fontWeight: 300,
              fontStyle: 'italic',
              textAlign: 'center',
              marginBottom: '3rem',
            }}
          >
            Hear from Our Clients
          </h2>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: '1.5rem',
            }}
          >
            {[
              'Toluwani Benson — 40th Birthday Gala',
              'Blessing & Ikenna Nwosu — Fusion Wedding',
              'Coming Soon',
            ].map((label, i) => (
              <div
                key={i}
                style={{
                  position: 'relative',
                  aspectRatio: '16/9',
                  backgroundColor: 'var(--lc-charcoal)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {i < 2 && (
                  <div
                    style={{
                      width: '3.5rem',
                      height: '3.5rem',
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
                        borderTop: '0.5rem solid transparent',
                        borderBottom: '0.5rem solid transparent',
                        borderLeft: '0.85rem solid var(--lc-gold)',
                        marginLeft: '0.15rem',
                      }}
                    />
                  </div>
                )}
                <div
                  style={{
                    position: 'absolute',
                    bottom: '0.75rem',
                    left: '0.75rem',
                  }}
                >
                  <p
                    className="lc-eyebrow"
                    style={{ color: 'var(--lc-ivory)', fontSize: '0.6rem' }}
                  >
                    {label}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Full Testimonials Grid ── */}
      <section
        style={{
          padding: 'clamp(4rem, 8vw, 7rem) 2rem',
          backgroundColor: 'var(--lc-ivory)',
        }}
      >
        <div style={{ maxWidth: '80rem', margin: '0 auto' }}>
          <p className="lc-eyebrow" style={{ marginBottom: '0.75rem', textAlign: 'center' }}>
            All stories
          </p>
          <h2
            className="lc-serif"
            style={{
              fontSize: 'clamp(1.8rem, 3.5vw, 3rem)',
              fontWeight: 300,
              fontStyle: 'italic',
              textAlign: 'center',
              marginBottom: '3.5rem',
            }}
          >
            Every Word
          </h2>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
              gap: '2rem',
            }}
          >
            {testimonials.map((t) => (
              <article
                key={t.id}
                style={{
                  backgroundColor: 'var(--lc-ivory-hi)',
                  padding: '2.5rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1.25rem',
                  borderTop: '1px solid var(--lc-gold-hair)',
                }}
              >
                <p
                  className="lc-serif"
                  style={{
                    fontStyle: 'italic',
                    fontSize: '1rem',
                    lineHeight: 1.75,
                    color: 'var(--lc-charcoal)',
                    flex: 1,
                  }}
                >
                  &ldquo;{t.body}&rdquo;
                </p>
                <div>
                  <span className="lc-gold-rule" style={{ marginBottom: '1rem', display: 'block' }} />
                  <p className="lc-eyebrow" style={{ marginBottom: '0.25rem' }}>
                    {t.name}
                  </p>
                  <p
                    style={{
                      fontFamily: 'var(--lc-font-sans)',
                      fontWeight: 200,
                      fontSize: '0.72rem',
                      color: 'var(--lc-ink-70)',
                      letterSpacing: '0.05em',
                    }}
                  >
                    {t.eventType} · {t.date}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ── Award ── */}
      <section
        style={{
          padding: 'clamp(4rem, 8vw, 7rem) 2rem',
          backgroundColor: 'var(--lc-ivory)',
          textAlign: 'center',
        }}
      >
        <div style={{ maxWidth: '40rem', margin: '0 auto' }}>
          <p className="lc-eyebrow" style={{ marginBottom: '2rem' }}>
            Industry Recognition
          </p>
          <div
            className="lc-award-frame"
            style={{ backgroundColor: 'var(--lc-ivory-hi)' }}
          >
            <p
              className="lc-serif"
              style={{ fontSize: '1rem', fontStyle: 'italic', color: 'var(--lc-ink-70)', marginBottom: '0.75rem' }}
            >
              Honoured with
            </p>
            <h2
              className="lc-serif"
              style={{
                fontSize: 'clamp(1.4rem, 2.5vw, 1.8rem)',
                fontWeight: 400,
                marginBottom: '0.5rem',
              }}
            >
              Event Management Excellence Award
            </h2>
            <p
              className="lc-serif"
              style={{ fontSize: '1rem', fontStyle: 'italic', marginBottom: '0.25rem' }}
            >
              2024
            </p>
            <p
              style={{
                fontFamily: 'var(--lc-font-sans)',
                fontWeight: 200,
                fontSize: '0.75rem',
                letterSpacing: '0.2em',
                color: 'var(--lc-ink-70)',
              }}
            >
              British-African Business Awards
            </p>
          </div>
        </div>
      </section>

      {/* ── Press ── */}
      <section
        style={{
          padding: 'clamp(3rem, 5vw, 4rem) 2rem',
          backgroundColor: 'var(--lc-blush)',
          textAlign: 'center',
        }}
      >
        <div style={{ maxWidth: '60rem', margin: '0 auto' }}>
          <p className="lc-eyebrow" style={{ marginBottom: '2rem' }}>
            Press &amp; Community Recognition
          </p>
          <span className="lc-gold-rule" style={{ display: 'block', marginBottom: '2rem' }} />
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'center',
              gap: '1.5rem 3rem',
              opacity: 0.5,
            }}
          >
            {[
              'British Vogue Weddings',
              'Aso Ebi Belle',
              'Bella Naija Weddings',
              'Nigerian Wedding Magazine',
              'The Wedding Industry Awards',
            ].map((publication) => (
              <span
                key={publication}
                style={{
                  fontFamily: 'var(--lc-font-serif)',
                  fontStyle: 'italic',
                  fontSize: '1rem',
                  color: 'var(--lc-charcoal)',
                  letterSpacing: '0.05em',
                }}
              >
                {publication}
              </span>
            ))}
          </div>
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
        <h2
          className="lc-serif"
          style={{
            fontSize: 'clamp(1.8rem, 4vw, 3rem)',
            fontWeight: 300,
            fontStyle: 'italic',
            marginBottom: '2rem',
          }}
        >
          Your story could be next
        </h2>
        <Link href="/luxciti/enquire" className="lc-btn">
          <span>Begin Your Enquiry</span>
        </Link>
      </section>
    </>
  )
}
