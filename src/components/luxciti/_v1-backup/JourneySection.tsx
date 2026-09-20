'use client'

import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const stages = [
  {
    number: '01',
    title: 'Consultation',
    body: 'We begin with a conversation — unhurried, exploratory, and honest. We want to understand not just what you want your wedding to look like, but what you want it to feel like.',
  },
  {
    number: '02',
    title: 'Design Renders',
    body: 'Before a single deposit is placed, you see your day. AI-powered design renders of your venue dressed, your colour palette alive, your most important moments visualised.',
  },
  {
    number: '03',
    title: '3D Walkthrough',
    body: 'Then you walk through it. A cinematic three-dimensional walkthrough of your venue as it will be. You navigate your own wedding before it exists.',
  },
  {
    number: '04',
    title: 'The Day',
    body: 'You arrive at a room you have already seen. That calm — that knowledge — is what we have been building towards. We run every second. You live every second.',
  },
  {
    number: '05',
    title: 'Honeymoon',
    body: 'The celebration continues. A bespoke honeymoon itinerary curated around who you are together — every suite, every sunrise, already chosen with intention.',
  },
  {
    number: '06',
    title: 'First Home',
    body: 'For those who want it — a home that already feels like yours. Interior sourcing and lifestyle design to begin your marriage in a space built around who you are.',
  },
]

export function JourneySection() {
  const trackRef = useRef<HTMLDivElement>(null)
  const sectionRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduced || !trackRef.current || !sectionRef.current) return

    const ctx = gsap.context(() => {
      const track = trackRef.current!
      const totalWidth = track.scrollWidth - track.offsetWidth

      gsap.to(track, {
        x: -totalWidth,
        ease: 'none',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top top',
          end: () => `+=${totalWidth}`,
          pin: true,
          scrub: 1,
          anticipatePin: 1,
        },
      })
    })

    return () => ctx.revert()
  }, [])

  return (
    <section
      ref={sectionRef}
      style={{
        overflow: 'hidden',
        backgroundColor: 'var(--lc-sand-deep)',
      }}
    >
      <div style={{ padding: '5rem 2rem 3rem', textAlign: 'center' }}>
        <p className="lc-eyebrow" style={{ marginBottom: '1rem' }}>The Process</p>
        <h2
          className="lc-serif"
          style={{ fontSize: 'clamp(2rem, 4vw, 3.5rem)', fontWeight: 300, fontStyle: 'italic' }}
        >
          Your Journey With Us
        </h2>
      </div>

      <div
        ref={trackRef}
        style={{
          display: 'flex',
          width: 'max-content',
          paddingBottom: '5rem',
          paddingLeft: '2rem',
          gap: '2px',
        }}
      >
        {stages.map((stage) => (
          <div
            key={stage.number}
            style={{
              width: 'min(380px, 80vw)',
              flexShrink: 0,
              padding: '3rem 3rem 3rem',
              backgroundColor: 'var(--lc-cream)',
              marginRight: '1.5rem',
            }}
          >
            <div
              className="lc-serif lc-gold-text"
              style={{ fontSize: '5rem', fontWeight: 300, lineHeight: 1, marginBottom: '1.5rem' }}
              aria-hidden="true"
            >
              {stage.number}
            </div>
            <span className="lc-gold-rule" style={{ marginBottom: '1.5rem', display: 'block' }} />
            <h3
              className="lc-serif"
              style={{ fontSize: '1.8rem', fontWeight: 400, marginBottom: '1rem' }}
            >
              {stage.title}
            </h3>
            <p
              style={{
                fontFamily: 'var(--lc-font-sans)',
                fontWeight: 300,
                fontSize: '0.9rem',
                lineHeight: 1.7,
                color: 'var(--lc-mocha)',
              }}
            >
              {stage.body}
            </p>
          </div>
        ))}
      </div>
    </section>
  )
}
