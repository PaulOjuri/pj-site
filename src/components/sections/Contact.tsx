'use client'
import { useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'

const EASE = [0.22, 1, 0.36, 1] as const

const FAQS = [
  {
    question: 'How quickly do you reply?',
    answer: "Within one business day. I'll usually suggest a short call.",
  },
  {
    question: 'Do you work outside Belgium?',
    answer: "Yes. Most of my work is remote. I've worked with teams in Nigeria, Switzerland, Germany, and the Netherlands.",
  },
  {
    question: "What's your minimum engagement?",
    answer: "No hard minimum. A focused two-week audit can be as valuable as a six-month build.",
  },
  {
    question: 'Do you do equity or deferred payment?',
    answer: 'Occasionally, for the right project. It has to be something I genuinely believe in.',
  },
]

interface FormState {
  name: string
  email: string
  message: string
}

export function Contact() {
  const reduced = useReducedMotion()
  const [form, setForm] = useState<FormState>({ name: '', email: '', message: '' })
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setStatus('sending')
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (res.ok) {
        setStatus('sent')
        setForm({ name: '', email: '', message: '' })
      } else {
        setStatus('error')
      }
    } catch {
      setStatus('error')
    }
  }

  const reveal = (delay = 0) => ({
    initial: reduced ? { opacity: 0 } : { opacity: 0, y: 24 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: '-10%' as const },
    transition: { duration: 0.7, ease: EASE, delay },
  })

  const inputStyle: React.CSSProperties = {
    width: '100%',
    background: 'transparent',
    border: 'none',
    borderBottom: '1px solid var(--line-strong)',
    color: 'var(--text)',
    fontSize: '1.05rem',
    padding: '0.75rem 0',
    outline: 'none',
    transition: 'border-color 300ms',
    fontFamily: 'inherit',
    fontWeight: 300,
  }

  return (
    <section
      id="contact"
      aria-label="Contact"
      className="section-pad"
      style={{ background: 'var(--bg-elevated)', borderTop: '1px solid var(--line)' }}
    >
      <div className="container-site">
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 340px), 1fr))',
            gap: 'clamp(3rem, 8vw, 8rem)',
            alignItems: 'start',
          }}
        >
          {/* Left */}
          <motion.div {...reveal()}>
            <p
              className="font-mono"
              style={{
                fontSize: '0.8rem',
                letterSpacing: '0.15em',
                color: 'var(--accent)',
                marginBottom: '1.5rem',
                textTransform: 'uppercase',
              }}
            >
              Contact
            </p>

            <h2
              className="font-display"
              style={{
                fontSize: 'clamp(2.5rem, 6vw, 5rem)',
                lineHeight: 1,
                letterSpacing: '-0.03em',
                color: 'var(--text)',
                marginBottom: '2rem',
              }}
            >
              Get in touch.
            </h2>

            <p
              style={{
                fontSize: 'clamp(1.05rem, 1.2vw, 1.2rem)',
                color: 'var(--text-muted)',
                lineHeight: 1.7,
                maxWidth: '46ch',
                marginBottom: '2.5rem',
                fontWeight: 300,
              }}
            >
              Tell me what you&apos;re working on. I read every message and reply within a day.
            </p>

            {/* Contact links */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '3rem' }}>
              <a href="mailto:hello@paulojuri.com" className="link-accent" style={{ fontSize: '1.05rem', width: 'fit-content' }}>
                hello@paulojuri.com
              </a>
              <a
                href="https://linkedin.com/in/paulojuri"
                target="_blank"
                rel="noopener noreferrer"
                className="link-accent"
                style={{ fontSize: '1.05rem', width: 'fit-content' }}
              >
                linkedin.com/in/paulojuri
              </a>
            </div>

            {/* FAQs */}
            <div>
              <p
                className="font-mono"
                style={{
                  fontSize: '0.8rem',
                  letterSpacing: '0.12em',
                  color: 'var(--text-faint)',
                  marginBottom: '1.5rem',
                  paddingBottom: '1rem',
                  borderBottom: '1px solid var(--line)',
                  textTransform: 'uppercase',
                }}
              >
                Common Questions
              </p>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {FAQS.map((faq) => (
                  <div
                    key={faq.question}
                    style={{ paddingBlock: '1.25rem', borderBottom: '1px solid var(--line)' }}
                  >
                    <p style={{ fontSize: '1rem', color: 'var(--text)', fontWeight: 400, marginBottom: '0.5rem' }}>
                      {faq.question}
                    </p>
                    <p style={{ fontSize: '0.95rem', color: 'var(--text-muted)', lineHeight: 1.65, fontWeight: 300 }}>
                      {faq.answer}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Right -- form */}
          <motion.div {...reveal(0.1)}>
            {status === 'sent' ? (
              <div
                style={{
                  padding: '3rem',
                  border: '1px solid var(--line)',
                  textAlign: 'center',
                }}
              >
                <p
                  className="font-display"
                  style={{
                    fontSize: 'clamp(1.5rem, 3vw, 2.5rem)',
                    color: 'var(--accent)',
                    marginBottom: '1rem',
                    letterSpacing: '-0.02em',
                  }}
                >
                  Message sent.
                </p>
                <p style={{ fontSize: '1rem', color: 'var(--text-muted)', fontWeight: 300 }}>
                  I&apos;ll get back to you within one business day.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} noValidate>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
                  <label style={{ display: 'block' }}>
                    <span className="font-mono" style={{ fontSize: '0.75rem', letterSpacing: '0.12em', color: 'var(--text-faint)', display: 'block', marginBottom: '0.5rem', textTransform: 'uppercase' }}>
                      Name
                    </span>
                    <input
                      type="text"
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      required
                      placeholder="Your name"
                      style={inputStyle}
                      onFocus={(e) => { e.currentTarget.style.borderBottomColor = 'var(--accent)' }}
                      onBlur={(e) => { e.currentTarget.style.borderBottomColor = 'var(--line-strong)' }}
                    />
                  </label>

                  <label style={{ display: 'block' }}>
                    <span className="font-mono" style={{ fontSize: '0.75rem', letterSpacing: '0.12em', color: 'var(--text-faint)', display: 'block', marginBottom: '0.5rem', textTransform: 'uppercase' }}>
                      Email
                    </span>
                    <input
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      required
                      placeholder="your@email.com"
                      style={inputStyle}
                      onFocus={(e) => { e.currentTarget.style.borderBottomColor = 'var(--accent)' }}
                      onBlur={(e) => { e.currentTarget.style.borderBottomColor = 'var(--line-strong)' }}
                    />
                  </label>

                  <label style={{ display: 'block' }}>
                    <span className="font-mono" style={{ fontSize: '0.75rem', letterSpacing: '0.12em', color: 'var(--text-faint)', display: 'block', marginBottom: '0.5rem', textTransform: 'uppercase' }}>
                      Message
                    </span>
                    <textarea
                      name="message"
                      value={form.message}
                      onChange={handleChange}
                      required
                      placeholder="Tell me about what you're working on..."
                      rows={6}
                      style={{ ...inputStyle, resize: 'vertical', minHeight: '120px' }}
                      onFocus={(e) => { e.currentTarget.style.borderBottomColor = 'var(--accent)' }}
                      onBlur={(e) => { e.currentTarget.style.borderBottomColor = 'var(--line-strong)' }}
                    />
                  </label>

                  {status === 'error' && (
                    <p style={{ fontSize: '0.8rem', color: '#e05c5c', marginTop: '-1rem', fontWeight: 300 }}>
                      Something went wrong. Please try emailing me directly.
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={status === 'sending'}
                    className="font-mono"
                    style={{
                      background: 'var(--accent)',
                      color: 'var(--bg)',
                      border: 'none',
                      padding: '14px 32px',
                      fontSize: '0.8rem',
                      letterSpacing: '0.12em',
                      textTransform: 'uppercase',
                      cursor: status === 'sending' ? 'not-allowed' : 'pointer',
                      opacity: status === 'sending' ? 0.7 : 1,
                      transition: 'background 300ms, opacity 200ms',
                      alignSelf: 'flex-start',
                    }}
                    onMouseEnter={(e) => {
                      if (status !== 'sending') e.currentTarget.style.background = 'var(--accent-hover)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'var(--accent)'
                    }}
                  >
                    {status === 'sending' ? 'Sending...' : 'Send Message'}
                  </button>
                </div>
              </form>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  )
}
