'use client'

import { useEffect, useState, useRef } from 'react'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

const eventTypeOptions = [
  { value: '', label: 'Select an event type' },
  { value: 'Nigerian Wedding', label: 'Nigerian Wedding' },
  { value: 'Engagement', label: 'Engagement' },
  { value: 'Birthday', label: 'Birthday' },
  { value: "Girls' Trip", label: "Girls' Trip" },
  { value: 'Corporate', label: 'Corporate' },
  { value: 'Other', label: 'Other' },
]

const sourceOptions = [
  { value: '', label: 'How did you find us?' },
  { value: 'Instagram', label: 'Instagram' },
  { value: 'Google', label: 'Google' },
  { value: 'Word of Mouth', label: 'Word of Mouth' },
  { value: 'Other', label: 'Other' },
]

// Map service IDs to event types
const serviceToEventType: Record<string, string> = {
  'full-luxury': 'Nigerian Wedding',
  'signature': 'Nigerian Wedding',
  'hybrid': 'Nigerian Wedding',
  'day-of': 'Nigerian Wedding',
  'honeymoon': 'Other',
  'first-home': 'Other',
  'styling': 'Other',
  'girls-trips': "Girls' Trip",
  'corporate': 'Corporate',
  'community': 'Other',
}

interface FormState {
  name: string
  email: string
  phone: string
  eventType: string
  date: string
  guestCount: string
  source: string
  vision: string
  website: string // honeypot
}

function EnquireForm() {
  const searchParams = useSearchParams()
  const serviceParam = searchParams.get('service') ?? ''

  const [form, setForm] = useState<FormState>({
    name: '',
    email: '',
    phone: '',
    eventType: serviceToEventType[serviceParam] ?? '',
    date: '',
    guestCount: '',
    source: '',
    vision: '',
    website: '',
  })

  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')
  const sealRef = useRef<HTMLDivElement>(null)

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setStatus('loading')
    setErrorMessage('')

    try {
      const res = await fetch('/api/luxciti/enquire', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({})) as { error?: string }
        throw new Error(data.error ?? 'Something went wrong')
      }

      setStatus('success')
    } catch (err) {
      setStatus('error')
      setErrorMessage(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
    }
  }

  if (status === 'success') {
    return (
      <div
        style={{
          textAlign: 'center',
          padding: '5rem 2rem',
          backgroundColor: 'var(--lc-cream)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '1.5rem',
        }}
      >
        {/* LC Seal */}
        <div
          ref={sealRef}
          style={{
            width: '7rem',
            height: '7rem',
            borderRadius: '50%',
            border: '1px solid var(--lc-gold)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
            animation: 'lc-seal-in 0.8s cubic-bezier(0.22, 1, 0.36, 1) forwards',
          }}
        >
          <span
            className="lc-serif lc-gold-text"
            style={{ fontSize: '1.6rem', fontWeight: 300, letterSpacing: '0.1em' }}
          >
            LC
          </span>
        </div>

        <h2
          className="lc-serif"
          style={{
            fontSize: 'clamp(1.8rem, 3.5vw, 2.5rem)',
            fontWeight: 300,
            fontStyle: 'italic',
          }}
        >
          Your celebration is in beautiful hands.
        </h2>

        <p
          style={{
            fontFamily: 'var(--lc-font-sans)',
            fontWeight: 300,
            fontSize: '0.9rem',
            color: 'var(--lc-mocha)',
            lineHeight: 1.7,
            maxWidth: '36rem',
          }}
        >
          Gift will be in touch within 48 hours. In the meantime, you are welcome to
          browse our portfolio or read through the Hub — there may be something there
          that helps you dream a little bigger.
        </p>

        <p
          className="lc-script"
          style={{
            fontSize: '2rem',
            color: 'var(--lc-espresso)',
            marginTop: '1rem',
          }}
        >
          — Gift
        </p>

        <style>{`
          @keyframes lc-seal-in {
            from { opacity: 0; transform: scale(0.6) rotate(-15deg); }
            to { opacity: 1; transform: scale(1) rotate(0deg); }
          }
        `}</style>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      {/* Honeypot */}
      <input
        name="website"
        tabIndex={-1}
        aria-hidden="true"
        style={{ display: 'none' }}
        value={form.website}
        onChange={handleChange}
      />

      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        {/* Name */}
        <div>
          <label
            htmlFor="name"
            className="lc-eyebrow"
            style={{ display: 'block', marginBottom: '0.5rem' }}
          >
            Your Name
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            placeholder="First and last name"
            value={form.name}
            onChange={handleChange}
            className="lc-input"
          />
        </div>

        {/* Email */}
        <div>
          <label
            htmlFor="email"
            className="lc-eyebrow"
            style={{ display: 'block', marginBottom: '0.5rem' }}
          >
            Email Address
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            placeholder="you@example.com"
            value={form.email}
            onChange={handleChange}
            className="lc-input"
          />
        </div>

        {/* Phone */}
        <div>
          <label
            htmlFor="phone"
            className="lc-eyebrow"
            style={{ display: 'block', marginBottom: '0.5rem' }}
          >
            Phone Number
          </label>
          <input
            id="phone"
            name="phone"
            type="tel"
            placeholder="+44 7700 000000"
            value={form.phone}
            onChange={handleChange}
            className="lc-input"
          />
        </div>

        {/* Event Type */}
        <div>
          <label
            htmlFor="eventType"
            className="lc-eyebrow"
            style={{ display: 'block', marginBottom: '0.5rem' }}
          >
            Type of Event
          </label>
          <select
            id="eventType"
            name="eventType"
            required
            value={form.eventType}
            onChange={handleChange}
            className="lc-input"
            style={{ cursor: 'pointer' }}
          >
            {eventTypeOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Date + Guest Count */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '2rem',
          }}
        >
          <div>
            <label
              htmlFor="date"
              className="lc-eyebrow"
              style={{ display: 'block', marginBottom: '0.5rem' }}
            >
              Approximate Date
            </label>
            <input
              id="date"
              name="date"
              type="date"
              value={form.date}
              onChange={handleChange}
              className="lc-input"
            />
          </div>
          <div>
            <label
              htmlFor="guestCount"
              className="lc-eyebrow"
              style={{ display: 'block', marginBottom: '0.5rem' }}
            >
              Approximate Guest Count
            </label>
            <input
              id="guestCount"
              name="guestCount"
              type="number"
              min="1"
              placeholder="e.g. 250"
              value={form.guestCount}
              onChange={handleChange}
              className="lc-input"
            />
          </div>
        </div>

        {/* Source */}
        <div>
          <label
            htmlFor="source"
            className="lc-eyebrow"
            style={{ display: 'block', marginBottom: '0.5rem' }}
          >
            How You Found Us
          </label>
          <select
            id="source"
            name="source"
            value={form.source}
            onChange={handleChange}
            className="lc-input"
            style={{ cursor: 'pointer' }}
          >
            {sourceOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Vision */}
        <div>
          <label
            htmlFor="vision"
            className="lc-eyebrow"
            style={{ display: 'block', marginBottom: '0.5rem' }}
          >
            Tell Us Your Vision
          </label>
          <textarea
            id="vision"
            name="vision"
            required
            rows={5}
            minLength={10}
            placeholder="Describe your celebration — the feeling you want, the traditions you want to honour, what matters most to you..."
            value={form.vision}
            onChange={handleChange}
            className="lc-input"
            style={{ resize: 'vertical' }}
          />
        </div>

        {/* Error */}
        {status === 'error' && (
          <p
            style={{
              fontFamily: 'var(--lc-font-sans)',
              fontWeight: 300,
              fontSize: '0.85rem',
              color: '#C8553D',
            }}
          >
            {errorMessage}
          </p>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={status === 'loading'}
          className="lc-btn"
          style={{
            cursor: status === 'loading' ? 'wait' : 'pointer',
            opacity: status === 'loading' ? 0.7 : 1,
          }}
        >
          <span>
            {status === 'loading' ? 'Sending your enquiry...' : 'Send Enquiry'}
          </span>
        </button>
      </div>
    </form>
  )
}

export default function EnquirePage() {
  return (
    <>
      {/* ── Page Header ── */}
      <div
        style={{
          padding: '9rem 2rem 5rem',
          textAlign: 'center',
          backgroundColor: 'var(--lc-sand)',
        }}
      >
        <p className="lc-eyebrow" style={{ marginBottom: '1rem' }}>
          Let&apos;s begin
        </p>
        <h1
          className="lc-serif"
          style={{
            fontSize: 'clamp(2.5rem, 5vw, 5rem)',
            fontWeight: 300,
            fontStyle: 'italic',
          }}
        >
          Your Enquiry
        </h1>
      </div>

      {/* ── Content ── */}
      <section
        style={{
          padding: 'clamp(3rem, 6vw, 5rem) 2rem 6rem',
          backgroundColor: 'var(--lc-sand)',
        }}
      >
        <div
          style={{
            maxWidth: '80rem',
            margin: '0 auto',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '5rem',
            alignItems: 'start',
          }}
        >
          {/* Left column: warm copy */}
          <div>
            <p
              className="lc-serif"
              style={{
                fontSize: 'clamp(1.1rem, 2vw, 1.4rem)',
                fontStyle: 'italic',
                lineHeight: 1.6,
                marginBottom: '2rem',
              }}
            >
              We cannot wait to hear about your celebration.
            </p>

            <p
              style={{
                fontFamily: 'var(--lc-font-sans)',
                fontWeight: 300,
                fontSize: '0.9rem',
                lineHeight: 1.8,
                color: 'var(--lc-mocha)',
                marginBottom: '1.5rem',
              }}
            >
              Every great event begins with a conversation. Tell us about your vision — the
              feeling you want to create, the traditions you want to honour, the details that
              matter most to you. Nothing is too big, too specific, or too ambitious.
            </p>

            <p
              style={{
                fontFamily: 'var(--lc-font-sans)',
                fontWeight: 300,
                fontSize: '0.9rem',
                lineHeight: 1.8,
                color: 'var(--lc-mocha)',
                marginBottom: '3rem',
              }}
            >
              Gift will be in touch within 48 hours.
            </p>

            <span className="lc-gold-rule" style={{ display: 'block', marginBottom: '2rem' }} />

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <p className="lc-eyebrow" style={{ marginBottom: '0.25rem' }}>
                  Email
                </p>
                <a
                  href="mailto:gift@luxciti.co.uk"
                  style={{
                    fontFamily: 'var(--lc-font-sans)',
                    fontWeight: 300,
                    fontSize: '0.9rem',
                    color: 'var(--lc-espresso)',
                    textDecoration: 'none',
                  }}
                >
                  gift@luxciti.co.uk
                </a>
              </div>
              <div>
                <p className="lc-eyebrow" style={{ marginBottom: '0.25rem' }}>
                  Instagram
                </p>
                <a
                  href="https://instagram.com/luxcitiluxuryevents"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    fontFamily: 'var(--lc-font-sans)',
                    fontWeight: 300,
                    fontSize: '0.9rem',
                    color: 'var(--lc-espresso)',
                    textDecoration: 'none',
                  }}
                >
                  @luxcitiluxuryevents
                </a>
              </div>
            </div>

            <p
              className="lc-script"
              style={{
                fontSize: '2.5rem',
                color: 'var(--lc-espresso)',
                marginTop: '3rem',
              }}
            >
              — Gift
            </p>
          </div>

          {/* Right column: form */}
          <div
            style={{
              backgroundColor: 'var(--lc-cream)',
              padding: 'clamp(2rem, 4vw, 3rem)',
            }}
          >
            <Suspense
              fallback={
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minHeight: '400px',
                  }}
                >
                  <p
                    className="lc-eyebrow"
                    style={{ color: 'var(--lc-mocha)' }}
                  >
                    Loading...
                  </p>
                </div>
              }
            >
              <EnquireForm />
            </Suspense>
          </div>
        </div>
      </section>
    </>
  )
}
