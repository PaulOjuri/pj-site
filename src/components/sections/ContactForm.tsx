'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/Button'

type Status = 'idle' | 'loading' | 'success' | 'error'

const budgetOptions = [
  'Under €5k',
  '€5k – €15k',
  '€15k – €30k',
  '€30k+',
  'Not sure yet',
]

const inputClass =
  'border-b border-subtle bg-transparent py-3 text-ink placeholder:text-subtle focus:border-ink focus:outline-none transition-colors duration-200 w-full'

export function ContactForm() {
  const formRef  = useRef<HTMLFormElement>(null)
  const [status, setStatus]   = useState<Status>('idle')
  const [errorMsg, setErrorMsg] = useState('')
  const [budget, setBudget]   = useState('')

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setStatus('loading')
    setErrorMsg('')

    const data = new FormData(e.currentTarget)
    const payload = {
      name:    (data.get('name')    as string).trim(),
      email:   (data.get('email')   as string).trim(),
      subject: (data.get('subject') as string).trim(),
      message: (data.get('message') as string).trim(),
      budget,
    }

    try {
      const res  = await fetch('/api/contact', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(payload),
      })
      const json = await res.json()

      if (!res.ok) {
        setErrorMsg(json.error ?? 'Something went wrong.')
        setStatus('error')
        return
      }

      setStatus('success')
      setBudget('')
      formRef.current?.reset()
    } catch {
      setErrorMsg('Network error — please try again.')
      setStatus('error')
    }
  }

  if (status === 'success') {
    return (
      <div className="flex flex-col items-center gap-4 py-12 text-center">
        <span className="text-4xl text-accent">✦</span>
        <h2 className="text-subheading">Message sent.</h2>
        <p className="max-w-sm text-muted">
          I read every message personally and reply within a day or two.
          Talk soon.
        </p>
        <button
          onClick={() => setStatus('idle')}
          className="label-caps mt-4 text-muted underline underline-offset-4 hover:text-ink transition-colors"
        >
          Send another
        </button>
      </div>
    )
  }

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit}
      className="flex flex-col gap-6"
      noValidate
    >
      {/* Name + Email */}
      <div className="grid gap-6 md:grid-cols-2">
        <label className="flex flex-col gap-2">
          <span className="label-caps text-muted">Name *</span>
          <input
            name="name"
            type="text"
            required
            autoComplete="name"
            placeholder="Your name"
            className={inputClass}
          />
        </label>

        <label className="flex flex-col gap-2">
          <span className="label-caps text-muted">Email *</span>
          <input
            name="email"
            type="email"
            required
            autoComplete="email"
            placeholder="you@example.com"
            className={inputClass}
          />
        </label>
      </div>

      {/* Subject */}
      <label className="flex flex-col gap-2">
        <span className="label-caps text-muted">Subject</span>
        <input
          name="subject"
          type="text"
          placeholder="What's this about?"
          className={inputClass}
        />
      </label>

      {/* Budget */}
      <div>
        <p className="label-caps text-muted mb-3">Budget range</p>
        <div className="flex flex-wrap gap-2" role="group" aria-label="Budget range">
          {budgetOptions.map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => setBudget(budget === opt ? '' : opt)}
              className={`label-caps px-3 py-1.5 border transition-colors duration-150 ${
                budget === opt
                  ? 'border-ink bg-ink text-paper'
                  : 'border-subtle text-muted hover:border-ink hover:text-ink'
              }`}
            >
              {opt}
            </button>
          ))}
        </div>
        {/* hidden input so the value is included in FormData */}
        <input type="hidden" name="budget" value={budget} />
      </div>

      {/* Message */}
      <label className="flex flex-col gap-2">
        <span className="label-caps text-muted">Message *</span>
        <textarea
          name="message"
          required
          rows={6}
          placeholder="Tell me about the project — what you're building, where you are, what you need."
          className={`${inputClass} resize-none`}
        />
      </label>

      {/* Error */}
      {status === 'error' && (
        <p className="text-sm text-red-600" role="alert">
          {errorMsg}
        </p>
      )}

      <Button
        type="submit"
        variant="primary"
        size="lg"
        disabled={status === 'loading'}
        className="self-start disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {status === 'loading' ? 'Sending…' : 'Send message →'}
      </Button>
    </form>
  )
}
