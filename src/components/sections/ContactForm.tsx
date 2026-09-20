'use client'
import { useState } from 'react'

export function ContactForm() {
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')
  const [form, setForm] = useState({ name: '', email: '', message: '' })

  const inputStyle: React.CSSProperties = {
    width: '100%',
    background: 'var(--bg-elevated)',
    border: '1px solid var(--line)',
    borderRadius: '2px',
    padding: '12px 16px',
    color: 'var(--text)',
    fontSize: '0.9rem',
    fontFamily: 'inherit',
    outline: 'none',
    transition: 'border-color 200ms',
  }

  async function handleSubmit(e: React.FormEvent) {
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
      } else {
        setStatus('error')
      }
    } catch {
      setStatus('error')
    }
  }

  if (status === 'sent') {
    return (
      <div
        style={{
          padding: '2rem',
          border: '1px solid var(--line)',
          borderRadius: '2px',
          color: 'var(--accent)',
          fontFamily: 'var(--font-mono-stack), monospace',
          fontSize: '0.75rem',
          letterSpacing: '0.1em',
        }}
      >
        MESSAGE SENT — I&apos;ll get back to you within a day or two.
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <div>
        <label
          htmlFor="contact-name"
          style={{
            display: 'block',
            fontSize: '0.8rem',
            letterSpacing: '0.12em',
            color: 'var(--text-faint)',
            fontFamily: 'var(--font-mono-stack), monospace',
            marginBottom: '0.5rem',
          }}
        >
          NAME
        </label>
        <input
          id="contact-name"
          type="text"
          required
          value={form.name}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          style={inputStyle}
          placeholder="Your name"
        />
      </div>
      <div>
        <label
          htmlFor="contact-email"
          style={{
            display: 'block',
            fontSize: '0.8rem',
            letterSpacing: '0.12em',
            color: 'var(--text-faint)',
            fontFamily: 'var(--font-mono-stack), monospace',
            marginBottom: '0.5rem',
          }}
        >
          EMAIL
        </label>
        <input
          id="contact-email"
          type="email"
          required
          value={form.email}
          onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
          style={inputStyle}
          placeholder="your@email.com"
        />
      </div>
      <div>
        <label
          htmlFor="contact-message"
          style={{
            display: 'block',
            fontSize: '0.8rem',
            letterSpacing: '0.12em',
            color: 'var(--text-faint)',
            fontFamily: 'var(--font-mono-stack), monospace',
            marginBottom: '0.5rem',
          }}
        >
          MESSAGE
        </label>
        <textarea
          id="contact-message"
          required
          rows={6}
          value={form.message}
          onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
          style={{ ...inputStyle, resize: 'vertical' }}
          placeholder="Tell me about your project..."
        />
      </div>

      {status === 'error' && (
        <p
          style={{
            color: '#ef4444',
            fontSize: '0.75rem',
            fontFamily: 'var(--font-mono-stack), monospace',
          }}
        >
          Something went wrong. Please try again or email me directly.
        </p>
      )}

      <button
        type="submit"
        disabled={status === 'sending'}
        style={{
          background: 'var(--accent)',
          color: 'var(--bg)',
          border: 'none',
          borderRadius: '2px',
          padding: '12px 24px',
          fontFamily: 'var(--font-mono-stack), monospace',
          fontSize: '0.72rem',
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          cursor: status === 'sending' ? 'wait' : 'pointer',
          opacity: status === 'sending' ? 0.7 : 1,
          transition: 'opacity 200ms',
          alignSelf: 'flex-start',
        }}
      >
        {status === 'sending' ? 'SENDING...' : 'SEND MESSAGE'}
      </button>
    </form>
  )
}
