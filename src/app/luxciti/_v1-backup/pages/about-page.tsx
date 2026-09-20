import type { Metadata } from 'next'
import Link from 'next/link'
import { PlaceholderImage } from '@/components/luxciti/PlaceholderImage'

export const metadata: Metadata = {
  title: 'About Gift Anighoro',
  description:
    'The story behind Luxciti Luxury Events — Gift Anighoro, British-African event producer, cultural coordinator, and the mind behind your most unforgettable celebration.',
}

export default function AboutPage() {
  return (
    <>
      {/* ── Page Header ── */}
      <div
        style={{
          paddingTop: '9rem',
          paddingBottom: '4rem',
          textAlign: 'center',
          backgroundColor: 'var(--lc-sand)',
          padding: '9rem 2rem 4rem',
        }}
      >
        <p className="lc-eyebrow" style={{ marginBottom: '1rem' }}>
          About
        </p>
        <h1
          className="lc-serif"
          style={{
            fontSize: 'clamp(2.5rem, 5vw, 5rem)',
            fontWeight: 300,
            fontStyle: 'italic',
          }}
        >
          Gift Anighoro
        </h1>
        <p
          style={{
            fontFamily: 'var(--lc-font-sans)',
            fontWeight: 300,
            fontSize: '0.8rem',
            letterSpacing: '0.3em',
            textTransform: 'uppercase',
            color: 'var(--lc-mocha)',
            marginTop: '0.75rem',
          }}
        >
          Founder &amp; Lead Producer · Luxciti Luxury Events
        </p>
      </div>

      {/* ── Portrait + Story ── */}
      <section
        style={{
          maxWidth: '88rem',
          margin: '0 auto',
          padding: '4rem 2rem 6rem',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '5rem',
          alignItems: 'start',
        }}
      >
        {/* Portrait */}
        <div style={{ position: 'sticky', top: '8rem' }}>
          <PlaceholderImage
            aspectRatio="3/4"
            caption="GIFT ANIGHORO — LONDON, 2026"
          />
          {/* Pull quote */}
          <div
            style={{
              marginTop: '2.5rem',
              paddingLeft: '1.5rem',
              borderLeft: '1px solid var(--lc-gold)',
            }}
          >
            <p
              className="lc-script"
              style={{
                fontSize: '1.6rem',
                lineHeight: 1.4,
                color: 'var(--lc-espresso)',
              }}
            >
              "Every celebration deserves to be felt, not just planned."
            </p>
            <p
              className="lc-eyebrow"
              style={{ marginTop: '0.75rem', color: 'var(--lc-gold-deep)' }}
            >
              — Gift Anighoro
            </p>
          </div>
        </div>

        {/* Story */}
        <div>
          <p
            className="lc-serif lc-drop-cap"
            style={{
              fontSize: 'clamp(1rem, 1.4vw, 1.15rem)',
              lineHeight: 1.8,
              marginBottom: '1.75rem',
            }}
          >
            Before Luxciti, there was a decade of boardrooms. Gift Anighoro spent ten years
            in corporate programme management — overseeing complex, multi-stakeholder projects
            where precision was not optional, and where the consequences of failure were very real.
            She was brilliant at it. And she found it almost entirely soulless.
          </p>

          <p
            style={{
              fontFamily: 'var(--lc-font-sans)',
              fontWeight: 300,
              fontSize: 'clamp(0.9rem, 1.2vw, 1rem)',
              lineHeight: 1.8,
              color: 'var(--lc-espresso)',
              marginBottom: '1.75rem',
            }}
          >
            The turning point came at a friend&apos;s wedding. The planner was technically
            adequate. The timeline was met. The flowers arrived. But there was something absent
            from the room — a kind of cultural groundedness, a warmth that understood the
            significance of what was happening. Two families coming together. A tradition
            being honoured. A new life beginning. The planner had managed the event. No one
            had produced the celebration.
          </p>

          <p
            style={{
              fontFamily: 'var(--lc-font-sans)',
              fontWeight: 300,
              fontSize: 'clamp(0.9rem, 1.2vw, 1rem)',
              lineHeight: 1.8,
              color: 'var(--lc-espresso)',
              marginBottom: '1.75rem',
            }}
          >
            Gift understood immediately what was missing — and that she was uniquely placed
            to provide it. She had grown up between two worlds: the precision and professionalism
            of British corporate culture, and the richness, warmth, and ceremony of the
            British-African community she had been part of her entire life. She had danced
            at Yoruba introductions, carried palm wine at Igbo weddings, watched her aunties
            tie gele until their arms knew the shapes by heart.
          </p>

          <span className="lc-gold-rule" style={{ margin: '2.5rem 0', display: 'block' }} />

          <h2
            className="lc-serif"
            style={{
              fontSize: 'clamp(1.6rem, 2.5vw, 2.2rem)',
              fontWeight: 300,
              fontStyle: 'italic',
              marginBottom: '1.25rem',
            }}
          >
            The philosophy behind every event
          </h2>

          <p
            style={{
              fontFamily: 'var(--lc-font-sans)',
              fontWeight: 300,
              fontSize: 'clamp(0.9rem, 1.2vw, 1rem)',
              lineHeight: 1.8,
              color: 'var(--lc-espresso)',
              marginBottom: '1.75rem',
            }}
          >
            Luxciti is built on three convictions: emotional intelligence, cultural fluency,
            and operational discipline. Not one or two of these. All three, always, in equal
            measure.
          </p>

          <p
            style={{
              fontFamily: 'var(--lc-font-sans)',
              fontWeight: 300,
              fontSize: 'clamp(0.9rem, 1.2vw, 1rem)',
              lineHeight: 1.8,
              color: 'var(--lc-espresso)',
              marginBottom: '1.75rem',
            }}
          >
            Emotional intelligence means Gift genuinely listens. Not for the checklist items,
            but for the feeling behind them. When a mother describes what she wants the room
            to look like, Gift hears what she wants the room to feel like. That translation
            — from desire to reality — is where Luxciti lives.
          </p>

          <p
            style={{
              fontFamily: 'var(--lc-font-sans)',
              fontWeight: 300,
              fontSize: 'clamp(0.9rem, 1.2vw, 1rem)',
              lineHeight: 1.8,
              color: 'var(--lc-espresso)',
              marginBottom: '1.75rem',
            }}
          >
            Cultural fluency means the traditions of your family are understood, not just
            noted. Yoruba, Igbo, Hausa, Edo — the ceremonies, the protocols, the hierarchy
            of family roles, the meaning behind each element — Gift knows these not as an
            outsider who has researched them, but as someone who has lived alongside them
            her entire life.
          </p>

          <p
            style={{
              fontFamily: 'var(--lc-font-sans)',
              fontWeight: 300,
              fontSize: 'clamp(0.9rem, 1.2vw, 1rem)',
              lineHeight: 1.8,
              color: 'var(--lc-espresso)',
              marginBottom: '2.5rem',
            }}
          >
            Operational discipline means the beautiful room actually happens. The suppliers
            are briefed, the timeline is held, the contingencies are planned. The decade in
            programme management was not wasted — it simply found its rightful context.
          </p>

          {/* Award */}
          <div
            className="lc-award-frame"
            style={{ backgroundColor: 'var(--lc-cream)', marginBottom: '3rem' }}
          >
            <p className="lc-eyebrow" style={{ marginBottom: '0.5rem' }}>
              Recognition
            </p>
            <h3
              className="lc-serif"
              style={{ fontSize: '1.4rem', fontWeight: 400, marginBottom: '0.5rem' }}
            >
              Event Management Excellence Award
            </h3>
            <p
              style={{
                fontFamily: 'var(--lc-font-sans)',
                fontWeight: 200,
                fontSize: '0.8rem',
                letterSpacing: '0.15em',
                color: 'var(--lc-mocha)',
              }}
            >
              British-African Business Awards · 2024
            </p>
          </div>

          <Link href="/luxciti/enquire" className="lc-btn">
            <span>Meet Gift Over Tea</span>
          </Link>
        </div>
      </section>
    </>
  )
}
