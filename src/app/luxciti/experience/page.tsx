import type { Metadata } from 'next'
import Link from 'next/link'
import { PlaceholderImage } from '@/components/luxciti/PlaceholderImage'

export const metadata: Metadata = {
  title: 'The Luxciti Experience',
  description:
    'AI design renders, immersive 3D venue walkthroughs, and a Master Operational Manifesto — discover how Luxciti plans your celebration to a level of detail most people never imagine possible.',
}

const timelineStages = [
  {
    number: '01',
    title: 'Initial Enquiry',
    body: 'You reach out. We respond within 48 hours with a brief questionnaire that helps us understand the shape of your event before we speak.',
  },
  {
    number: '02',
    title: 'Discovery Call',
    body: 'A 45-minute conversation about your vision, your families, your hopes for the day — and the things you are worried about. This is where we really listen.',
  },
  {
    number: '03',
    title: 'Design Consultation',
    body: 'Your first AI design renders are presented. We sit with them together, refine them, and establish the creative direction that will guide every decision from this point forward.',
  },
  {
    number: '04',
    title: '3D Venue Walkthrough',
    body: 'A cinematic three-dimensional model of your venue dressed as it will be. You navigate your own celebration — and leave knowing exactly what to expect.',
  },
  {
    number: '05',
    title: 'Operational Build',
    body: 'The Master Operational Manifesto is built: a minute-by-minute document covering every supplier, every timeline point, every contingency. Nothing is left to chance.',
  },
  {
    number: '06',
    title: 'The Day',
    body: 'We arrive early. We stay late. You do not think about logistics once. Your job is to be celebrated, and we protect that job completely.',
  },
  {
    number: '07',
    title: 'After the Day',
    body: 'A post-event debrief, supplier evaluations, and for qualifying packages — your honeymoon itinerary lands in your inbox before you board the flight.',
  },
]

export default function ExperiencePage() {
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
          How we work
        </p>
        <h1
          className="lc-serif"
          style={{
            fontSize: 'clamp(2.5rem, 5vw, 5rem)',
            fontWeight: 300,
            fontStyle: 'italic',
          }}
        >
          The Luxciti Experience
        </h1>
        <p
          style={{
            fontFamily: 'var(--lc-font-sans)',
            fontWeight: 300,
            fontSize: '0.95rem',
            lineHeight: 1.7,
            color: 'var(--lc-ink-70)',
            maxWidth: '44rem',
            margin: '1.5rem auto 0',
          }}
        >
          We believe you should be able to close your eyes and see your day before it happens.
          Here is how we make that possible.
        </p>
      </div>

      {/* ── Stage One: AI Renders ── */}
      <section
        style={{
          padding: 'clamp(4rem, 8vw, 7rem) 2rem',
          backgroundColor: 'var(--lc-ivory)',
        }}
      >
        <div style={{ maxWidth: '80rem', margin: '0 auto' }}>
          <p className="lc-eyebrow" style={{ marginBottom: '0.75rem', textAlign: 'center' }}>
            Stage One
          </p>
          <h2
            className="lc-serif"
            style={{
              fontSize: 'clamp(2rem, 4vw, 3.5rem)',
              fontWeight: 300,
              fontStyle: 'italic',
              textAlign: 'center',
              marginBottom: '1.5rem',
            }}
          >
            You see it
          </h2>
          <p
            style={{
              fontFamily: 'var(--lc-font-sans)',
              fontWeight: 300,
              fontSize: '1rem',
              lineHeight: 1.75,
              color: 'var(--lc-ink-70)',
              maxWidth: '52rem',
              margin: '0 auto 4rem',
              textAlign: 'center',
            }}
          >
            Before a single flower is ordered, you see your wedding. Every table, every stage,
            every moment of light — visualised at our design consultation and refined until it
            matches what you have always imagined. AI-powered design renders give you the confidence
            to make decisions, and the certainty that what you are imagining is truly what we are building.
          </p>

          {/* Polaroid grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
              gap: '2rem',
            }}
          >
            {[
              { caption: 'AI RENDER — RECEPTION ROOM · COLOUR: CHAMPAGNE & ESPRESSO', rotation: '-1.5deg' },
              { caption: 'AI RENDER — CEREMONY STAGE · FLORAL ARCH DESIGN', rotation: '1deg' },
              { caption: 'AI RENDER — TABLESCAPES · PLACE SETTINGS & CENTREPIECES', rotation: '-0.8deg' },
              { caption: 'AI RENDER — BRIDAL SUITE · PREPARATION STYLING', rotation: '1.8deg' },
            ].map((polaroid, i) => (
              <div
                key={i}
                className="lc-polaroid"
                style={{ transform: `rotate(${polaroid.rotation})` }}
              >
                <PlaceholderImage
                  aspectRatio="4/3"
                  caption={polaroid.caption}
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Stage Two: 3D Walkthrough ── */}
      <section
        style={{
          padding: 'clamp(4rem, 8vw, 7rem) 2rem',
          backgroundColor: 'var(--lc-blush)',
        }}
      >
        <div style={{ maxWidth: '80rem', margin: '0 auto' }}>
          <p className="lc-eyebrow" style={{ marginBottom: '0.75rem', textAlign: 'center' }}>
            Stage Two
          </p>
          <h2
            className="lc-serif"
            style={{
              fontSize: 'clamp(2rem, 4vw, 3.5rem)',
              fontWeight: 300,
              fontStyle: 'italic',
              textAlign: 'center',
              marginBottom: '1.5rem',
            }}
          >
            You walk through it
          </h2>
          <p
            style={{
              fontFamily: 'var(--lc-font-sans)',
              fontWeight: 300,
              fontSize: '1rem',
              lineHeight: 1.75,
              color: 'var(--lc-ink-70)',
              maxWidth: '52rem',
              margin: '0 auto 3rem',
              textAlign: 'center',
            }}
          >
            Then you walk through it. A cinematic three-dimensional walkthrough of your venue,
            dressed as it will be on the day. You navigate your own wedding — the arrival, the
            tables, the stage — and see it breathing before it exists. The confidence that gives
            you on the morning of your wedding is something we have watched change people completely.
          </p>

          {/* Video slot */}
          <div
            style={{
              position: 'relative',
              aspectRatio: '16/9',
              backgroundColor: 'var(--lc-charcoal)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              maxWidth: '72rem',
              margin: '0 auto',
            }}
          >
            {/* Play button */}
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

            <div
              style={{
                position: 'absolute',
                bottom: '1.5rem',
                left: '1.5rem',
              }}
            >
              <p
                className="lc-eyebrow"
                style={{ color: 'var(--lc-ivory)' }}
              >
                Your venue, before the day — The Orsett Hall 3D Walkthrough
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── The Day Itself ── */}
      <section
        style={{
          padding: 'clamp(4rem, 8vw, 7rem) 2rem',
          backgroundColor: 'var(--lc-ivory)',
          textAlign: 'center',
        }}
      >
        <div style={{ maxWidth: '56rem', margin: '0 auto' }}>
          <span className="lc-gold-rule" style={{ display: 'block', marginBottom: '3rem' }} />
          <blockquote
            className="lc-serif"
            style={{
              fontStyle: 'italic',
              fontSize: 'clamp(1.4rem, 2.8vw, 2.2rem)',
              fontWeight: 300,
              lineHeight: 1.55,
              color: 'var(--lc-charcoal)',
              margin: 0,
              padding: 0,
            }}
          >
            You walk into a room you have already seen. The confidence that brings — that
            stillness — is what we have been building towards.
          </blockquote>
          <span className="lc-gold-rule" style={{ display: 'block', marginTop: '3rem' }} />
        </div>
      </section>

      {/* ── How We Work: Timeline ── */}
      <section
        style={{
          padding: 'clamp(4rem, 8vw, 7rem) 2rem',
          backgroundColor: 'var(--lc-ivory)',
        }}
      >
        <div style={{ maxWidth: '72rem', margin: '0 auto' }}>
          <p className="lc-eyebrow" style={{ marginBottom: '0.75rem', textAlign: 'center' }}>
            The process
          </p>
          <h2
            className="lc-serif"
            style={{
              fontSize: 'clamp(2rem, 4vw, 3rem)',
              fontWeight: 300,
              fontStyle: 'italic',
              textAlign: 'center',
              marginBottom: '4rem',
            }}
          >
            How We Work
          </h2>

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '0',
            }}
          >
            {timelineStages.map((stage, i) => (
              <div
                key={stage.number}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '4rem 1px 1fr',
                  gap: '0 2rem',
                  paddingBottom: i < timelineStages.length - 1 ? '2.5rem' : '0',
                }}
              >
                {/* Number */}
                <div>
                  <span
                    className="lc-serif lc-gold-text"
                    style={{ fontSize: '1.5rem', fontWeight: 300 }}
                  >
                    {stage.number}
                  </span>
                </div>

                {/* Line */}
                <div
                  style={{
                    position: 'relative',
                  }}
                >
                  <div
                    style={{
                      position: 'absolute',
                      top: '0.25rem',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      width: '6px',
                      height: '6px',
                      borderRadius: '50%',
                      backgroundColor: 'var(--lc-gold)',
                    }}
                  />
                  {i < timelineStages.length - 1 && (
                    <div
                      style={{
                        position: 'absolute',
                        top: '0.75rem',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        width: '1px',
                        height: 'calc(100% + 2.5rem - 0.75rem)',
                        background: 'linear-gradient(to bottom, var(--lc-gold), var(--lc-ivory))',
                        opacity: 0.4,
                      }}
                    />
                  )}
                </div>

                {/* Content */}
                <div>
                  <h3
                    className="lc-serif"
                    style={{
                      fontSize: '1.3rem',
                      fontWeight: 400,
                      marginBottom: '0.5rem',
                      lineHeight: 1.2,
                    }}
                  >
                    {stage.title}
                  </h3>
                  <p
                    style={{
                      fontFamily: 'var(--lc-font-sans)',
                      fontWeight: 300,
                      fontSize: '0.9rem',
                      lineHeight: 1.7,
                      color: 'var(--lc-ink-70)',
                    }}
                  >
                    {stage.body}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Our Instruments ── */}
      <section
        style={{
          padding: 'clamp(4rem, 8vw, 7rem) 2rem',
          backgroundColor: 'var(--lc-charcoal)',
        }}
      >
        <div style={{ maxWidth: '72rem', margin: '0 auto' }}>
          <p
            className="lc-eyebrow"
            style={{ color: 'var(--lc-ivory)', marginBottom: '0.75rem', textAlign: 'center' }}
          >
            What we use
          </p>
          <h2
            className="lc-serif"
            style={{
              fontSize: 'clamp(2rem, 4vw, 3rem)',
              fontWeight: 300,
              fontStyle: 'italic',
              color: 'var(--lc-ivory)',
              textAlign: 'center',
              marginBottom: '4rem',
            }}
          >
            Our Instruments
          </h2>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
              gap: '2rem',
            }}
          >
            {[
              {
                title: 'Midjourney Design Renders',
                body: 'Photorealistic AI-generated images of your venue dressed as it will be on the day. We use these to drive every creative decision in the early stages of planning — from tablescapes to lighting, florals to fabric.',
              },
              {
                title: 'Motion-Designed 3D Walkthrough',
                body: 'A cinematic three-dimensional model of your venue, built to scale and dressed with your exact design specifications. You move through it as if you are already there. We have seen this change everything about how relaxed our clients are.',
              },
              {
                title: 'Master Operational Manifesto',
                body: 'The spine of every Luxciti event. A minute-by-minute operational document covering every supplier briefing, every timeline point, every emergency protocol, and every contingency. Your day, written down before it happens.',
              },
            ].map((instrument) => (
              <div
                key={instrument.title}
                style={{
                  borderTop: '1px solid var(--lc-gold-hair)',
                  paddingTop: '2rem',
                }}
              >
                <h3
                  className="lc-serif"
                  style={{
                    fontSize: '1.3rem',
                    fontWeight: 400,
                    color: 'var(--lc-ivory)',
                    marginBottom: '1rem',
                  }}
                >
                  {instrument.title}
                </h3>
                <p
                  style={{
                    fontFamily: 'var(--lc-font-sans)',
                    fontWeight: 300,
                    fontSize: '0.9rem',
                    lineHeight: 1.7,
                    color: 'var(--lc-ink-70)',
                  }}
                >
                  {instrument.body}
                </p>
              </div>
            ))}
          </div>

          <div style={{ textAlign: 'center', marginTop: '4rem' }}>
            <Link
              href="/luxciti/enquire"
              className="lc-btn-on-dark"
            >
              <span>Experience This for Yourself</span>
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
