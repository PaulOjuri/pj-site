import type { Metadata } from 'next'
import Link from 'next/link'
import { HeroTagline } from '@/components/luxciti/HeroTagline'
import { PlaceholderImage } from '@/components/luxciti/PlaceholderImage'
import { JourneySection } from '@/components/luxciti/JourneySection'
import { TestimonialsCarousel } from '@/components/luxciti/TestimonialsCarousel'
import { services } from '@/content/luxciti/services'
import { testimonials } from '@/content/luxciti/testimonials'

export const metadata: Metadata = {
  title: 'Luxciti Luxury Events — Nigerian Wedding Coordinator London',
  description:
    'Premium British-African event production by Gift Anighoro. Specialising in Nigerian weddings, luxury celebrations and lifestyle events across London and the UK.',
}

const differenceItems = [
  {
    eyebrow: 'Innovation',
    title: 'See it before it exists',
    body: 'Before a single deposit is placed, you see your wedding. AI-powered design renders bring your vision to life at our very first design consultation — your colour palette, your tablescapes, your stage — visualised in photorealistic detail and refined until it matches exactly what you have always imagined.',
    imageSide: 'right' as const,
    caption: 'AI DESIGN RENDERS — ORSETT HALL, ESSEX',
  },
  {
    eyebrow: 'Immersion',
    title: 'Walk through your day before it arrives',
    body: 'Then we take you further. A cinematic three-dimensional walkthrough of your venue, dressed precisely as it will be on the day. You navigate your own celebration — the arrival, the reception room, the stage — and feel it breathing before it exists. You walk into your wedding knowing every corner.',
    imageSide: 'left' as const,
    caption: '3D VENUE WALKTHROUGH — PLANNING SESSION',
  },
  {
    eyebrow: 'Culture',
    title: 'We are the culture',
    body: 'Luxciti was built inside the British-African community, not adjacent to it. Gift brings a decade of lived experience planning Yoruba, Igbo, Hausa and Edo celebrations — from the intricacies of the Eru Iyawo to the coordination of multi-family introductions. Your traditions are not research to us. They are home.',
    imageSide: 'right' as const,
    caption: 'TRADITIONAL YORUBA CEREMONY — LONDON',
  },
  {
    eyebrow: 'Legacy',
    title: 'Beyond the last dance',
    body: 'We do not stop when the night ends. Bespoke honeymoon curation, first home sourcing, personal styling for every milestone that follows — Luxciti is designed to walk alongside you into the life that begins after the celebration.',
    imageSide: 'left' as const,
    caption: 'HONEYMOON CURATION — SANTORINI',
  },
]

export default function LuxcitiHomePage() {
  const featuredServices = services.slice(0, 8)

  return (
    <>
      {/* ── Hero ── */}
      <section
        style={{
          position: 'relative',
          height: '100svh',
          minHeight: '600px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
        }}
      >
        {/* Background image */}
        <div style={{ position: 'absolute', inset: 0 }}>
          <PlaceholderImage
            aspectRatio="auto"
            caption=""
            className="hero-bg-image"
            style={{ width: '100%', height: '100%' }}
          />
        </div>

        {/* Dark overlay */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'rgba(60,53,48,0.45)',
          }}
        />

        {/* Blush gradient scrim at bottom */}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: '35%',
            background: 'linear-gradient(to bottom, transparent, var(--lc-ivory))',
          }}
        />

        <HeroTagline />
      </section>

      {/* ── Opening Statement ── */}
      <section
        style={{
          padding: 'clamp(5rem, 10vw, 9rem) 2rem',
          maxWidth: '72rem',
          margin: '0 auto',
          textAlign: 'center',
          backgroundColor: 'var(--lc-ivory)',
        }}
      >
        <span className="lc-gold-rule" style={{ marginBottom: '3rem', display: 'block' }} />
        <blockquote
          className="lc-serif"
          style={{
            fontStyle: 'italic',
            fontSize: 'clamp(1.4rem, 2.8vw, 2.4rem)',
            fontWeight: 400,
            lineHeight: 1.55,
            color: 'var(--lc-charcoal)',
            margin: 0,
            padding: 0,
            border: 'none',
          }}
        >
          You have imagined this day your whole life. Walk into it knowing every detail has already
          been seen, styled, and perfected — your only task is to be celebrated.
        </blockquote>
        <span className="lc-gold-rule" style={{ marginTop: '3rem', display: 'block' }} />
      </section>

      {/* ── The Luxciti Difference ── */}
      <section style={{ padding: '2rem 0 6rem' }}>
        <div
          style={{
            textAlign: 'center',
            maxWidth: '56rem',
            margin: '0 auto',
            padding: '0 2rem 5rem',
          }}
        >
          <span className="lc-gold-rule" style={{ width: '24px', margin: '0 auto 1rem', display: 'block' }} />
          <p className="lc-eyebrow" style={{ marginBottom: '1rem' }}>
            What sets us apart
          </p>
          <h2
            className="lc-serif"
            style={{
              fontSize: 'clamp(2rem, 4vw, 3.5rem)',
              fontWeight: 300,
              fontStyle: 'italic',
            }}
          >
            The Luxciti Difference
          </h2>
        </div>

        {differenceItems.map((item, index) => (
          <div
            key={item.eyebrow}
            style={{
              backgroundColor:
                index % 2 === 0 ? 'var(--lc-blush)' : 'var(--lc-ivory)',
              padding: 'clamp(3rem, 6vw, 5rem) 2rem',
            }}
          >
            <div
              style={{
                maxWidth: '80rem',
                margin: '0 auto',
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                gap: '3rem 5rem',
                alignItems: 'center',
              }}
            >
              <div style={{ order: item.imageSide === 'left' ? 1 : 2 }}>
                <PlaceholderImage aspectRatio="4/3" caption={item.caption} />
              </div>
              <div style={{ order: item.imageSide === 'left' ? 2 : 1 }}>
                <span className="lc-gold-rule" style={{ width: '24px', marginBottom: '0.75rem', display: 'block' }} />
                <p className="lc-eyebrow" style={{ marginBottom: '0.75rem' }}>
                  {item.eyebrow}
                </p>
                <h3
                  className="lc-serif"
                  style={{
                    fontSize: 'clamp(1.8rem, 3vw, 2.8rem)',
                    fontWeight: 300,
                    lineHeight: 1.2,
                    marginBottom: '1.25rem',
                  }}
                >
                  {item.title}
                </h3>
                <span className="lc-gold-rule" style={{ marginBottom: '1.5rem', display: 'block' }} />
                <p
                  style={{
                    fontFamily: 'var(--lc-font-sans)',
                    fontWeight: 300,
                    fontSize: '0.95rem',
                    lineHeight: 1.75,
                    color: 'var(--lc-ink-70)',
                  }}
                >
                  {item.body}
                </p>
              </div>
            </div>
          </div>
        ))}
      </section>

      {/* ── Services Overview ── */}
      <section
        style={{
          padding: 'clamp(4rem, 8vw, 7rem) 2rem',
          backgroundColor: 'var(--lc-ivory)',
        }}
      >
        <div style={{ maxWidth: '80rem', margin: '0 auto' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-end',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '1.5rem',
              marginBottom: '3.5rem',
            }}
          >
            <div>
              <span className="lc-gold-rule" style={{ width: '24px', marginBottom: '0.75rem', display: 'block' }} />
              <p className="lc-eyebrow" style={{ marginBottom: '0.75rem' }}>
                What we offer
              </p>
              <h2
                className="lc-serif"
                style={{
                  fontSize: 'clamp(2rem, 4vw, 3rem)',
                  fontWeight: 300,
                  fontStyle: 'italic',
                }}
              >
                Our Services
              </h2>
            </div>
            <Link href="/luxciti/services" className="lc-btn">
              <span>View All Services</span>
            </Link>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: '1px',
              backgroundColor: 'var(--lc-gold-hair)',
            }}
          >
            {featuredServices.map((service) => (
              <Link
                key={service.id}
                href={`/luxciti/services#${service.anchor}`}
                style={{ textDecoration: 'none', color: 'inherit' }}
              >
                <article
                  style={{
                    backgroundColor: 'var(--lc-ivory-hi)',
                    padding: '2.5rem 2rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.75rem',
                    height: '100%',
                    transition: 'background-color 250ms',
                  }}
                  className="service-card"
                >
                  <p className="lc-eyebrow">{service.price}</p>
                  <h3
                    className="lc-serif"
                    style={{ fontSize: '1.4rem', fontWeight: 400, lineHeight: 1.2 }}
                  >
                    {service.title}
                  </h3>
                  <span className="lc-gold-rule" />
                  <p
                    style={{
                      fontFamily: 'var(--lc-font-sans)',
                      fontStyle: 'italic',
                      fontWeight: 300,
                      fontSize: '0.85rem',
                      lineHeight: 1.6,
                      color: 'var(--lc-ink-70)',
                      flex: 1,
                    }}
                  >
                    {service.feeling}
                  </p>
                  <span
                    style={{
                      fontFamily: 'var(--lc-font-sans)',
                      fontWeight: 300,
                      fontSize: '0.65rem',
                      letterSpacing: '0.3em',
                      textTransform: 'uppercase',
                      color: 'var(--lc-ink-70)',
                    }}
                  >
                    Learn more
                  </span>
                </article>
              </Link>
            ))}
          </div>
        </div>

        <style>{`
          .service-card:hover {
            background-color: var(--lc-blush) !important;
          }
        `}</style>
      </section>

      {/* ── The Journey ── */}
      <JourneySection />

      {/* ── Featured Work ── */}
      <section
        style={{
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <PlaceholderImage
          aspectRatio="21/9"
          caption="THE ORSETT HALL COMMISSION — ESSEX, AUGUST 2025"
        />
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(to right, rgba(60,53,48,0.75) 0%, rgba(60,53,48,0.2) 60%, transparent 100%)',
            display: 'flex',
            alignItems: 'center',
            padding: '4rem 5vw',
          }}
        >
          <div style={{ maxWidth: '480px' }}>
            <span className="lc-gold-rule" style={{ width: '24px', marginBottom: '1rem', display: 'block' }} />
            <p
              className="lc-eyebrow"
              style={{ color: 'var(--lc-ivory)', marginBottom: '1rem' }}
            >
              Featured Work
            </p>
            <h2
              className="lc-serif"
              style={{
                fontSize: 'clamp(2rem, 4vw, 3.5rem)',
                fontWeight: 300,
                fontStyle: 'italic',
                color: 'var(--lc-ivory)',
                lineHeight: 1.2,
                marginBottom: '1.25rem',
              }}
            >
              The Orsett Hall Commission
            </h2>
            <p
              style={{
                fontFamily: 'var(--lc-font-sans)',
                fontWeight: 300,
                fontSize: '0.9rem',
                lineHeight: 1.7,
                color: 'rgba(250,246,240,0.8)',
                marginBottom: '2rem',
              }}
            >
              A Yoruba-Igbo fusion wedding for 350 guests across two ceremonies and four days.
              Every detail — from the Eru Iyawo to the final dance — seen to with the precision
              that has become our signature.
            </p>
            <Link href="/luxciti/portfolio" className="lc-btn-on-dark">
              <span>View the Portfolio</span>
            </Link>
          </div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section
        style={{
          padding: 'clamp(5rem, 10vw, 9rem) 2rem',
          backgroundColor: 'var(--lc-blush)',
        }}
      >
        <div style={{ maxWidth: '80rem', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
            <span className="lc-gold-rule" style={{ width: '24px', margin: '0 auto 0.75rem', display: 'block' }} />
            <p className="lc-eyebrow" style={{ marginBottom: '0.75rem' }}>
              In their words
            </p>
            <h2
              className="lc-serif"
              style={{
                fontSize: 'clamp(2rem, 4vw, 3rem)',
                fontWeight: 300,
                fontStyle: 'italic',
              }}
            >
              What Our Clients Say
            </h2>
          </div>
          <TestimonialsCarousel testimonials={testimonials.slice(0, 3)} />
        </div>
      </section>

      {/* ── Closing CTA ── */}
      <section
        style={{
          padding: 'clamp(5rem, 10vw, 9rem) 2rem',
          textAlign: 'center',
          backgroundColor: 'var(--lc-blush)',
        }}
      >
        <span className="lc-gold-rule" style={{ width: '24px', margin: '0 auto 1.5rem', display: 'block' }} />
        <p
          className="lc-eyebrow"
          style={{ marginBottom: '1.5rem' }}
        >
          Your celebration awaits
        </p>
        <h2
          className="lc-serif"
          style={{
            fontSize: 'clamp(2.2rem, 5vw, 4.5rem)',
            fontWeight: 300,
            fontStyle: 'italic',
            marginBottom: '2.5rem',
            color: 'var(--lc-charcoal)',
            display: 'block',
          }}
        >
          Start Your Journey
        </h2>
        <p
          style={{
            fontFamily: 'var(--lc-font-sans)',
            fontWeight: 300,
            fontSize: '0.9rem',
            color: 'var(--lc-ink-70)',
            maxWidth: '40rem',
            margin: '0 auto 3rem',
            lineHeight: 1.7,
          }}
        >
          Every extraordinary celebration begins with a conversation. Tell us about your vision
          and Gift will be in touch within 48 hours.
        </p>
        <Link href="/luxciti/enquire" className="lc-btn">
          <span>Begin Your Experience</span>
        </Link>
      </section>
    </>
  )
}
