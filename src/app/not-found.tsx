'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'

const EASE = [0.22, 1, 0.36, 1] as const

const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'

function useScramble(text: string) {
  const [display, setDisplay] = useState(() =>
    text.split('').map((c) => (c === ' ' ? ' ' : CHARS[Math.floor(Math.random() * CHARS.length)])).join('')
  )

  useEffect(() => {
    let iteration = 0
    const id = setInterval(() => {
      setDisplay(
        text.split('').map((char, i) => {
          if (char === ' ') return ' '
          if (i < Math.floor(iteration)) return char
          return CHARS[Math.floor(Math.random() * CHARS.length)]
        }).join('')
      )
      iteration += 0.4
      if (iteration >= text.length) {
        clearInterval(id)
        setDisplay(text)
      }
    }, 40)
    return () => clearInterval(id)
  }, [text])

  return display
}

export default function NotFound() {
  const scrambled = useScramble('404')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 100)
    return () => clearTimeout(t)
  }, [])

  return (
    <main
      style={{
        minHeight: '100dvh',
        background: 'var(--bg)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        justifyContent: 'center',
        padding: 'clamp(1.25rem, 5vw, 6rem)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Giant ghost number */}
      <p
        aria-hidden="true"
        style={{
          position: 'absolute',
          right: '-0.05em',
          top: '50%',
          transform: 'translateY(-50%)',
          fontSize: 'clamp(12rem, 35vw, 40rem)',
          lineHeight: 0.85,
          fontFamily: 'var(--font-display-stack), Impact, sans-serif',
          textTransform: 'uppercase',
          color: 'var(--text)',
          opacity: 0.04,
          userSelect: 'none',
          pointerEvents: 'none',
          letterSpacing: '-0.04em',
        }}
      >
        {scrambled}
      </p>

      {/* Content */}
      <div
        style={{
          position: 'relative',
          maxWidth: '600px',
          opacity: mounted ? 1 : 0,
          transform: mounted ? 'translateY(0)' : 'translateY(20px)',
          transition: `opacity 0.7s cubic-bezier(${EASE.join(',')}), transform 0.7s cubic-bezier(${EASE.join(',')})`,
        }}
      >
        <p
          className="font-mono"
          style={{
            fontSize: '0.65rem',
            letterSpacing: '0.15em',
            color: 'var(--accent)',
            marginBottom: '1.5rem',
          }}
        >
          ERROR — PAGE NOT FOUND
        </p>

        <h1
          className="font-display"
          style={{
            fontSize: 'clamp(2.5rem, 6vw, 6rem)',
            lineHeight: 0.92,
            letterSpacing: '-0.02em',
            color: 'var(--text)',
            marginBottom: 'clamp(1.5rem, 3vw, 2.5rem)',
          }}
        >
          THIS PAGE
          <br />
          DOESN&apos;T EXIST.
          <br />
          <span style={{ color: 'var(--accent)' }}>YET.</span>
        </h1>

        <p
          style={{
            fontSize: '1rem',
            color: 'var(--text-muted)',
            lineHeight: 1.7,
            maxWidth: '40ch',
            marginBottom: 'clamp(2rem, 4vw, 3rem)',
          }}
        >
          You followed a broken link, or wandered somewhere unbuilt. Either way — nothing here.
          But the rest of the site is worth seeing.
        </p>

        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <Link
            href="/"
            className="font-mono"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontSize: '0.75rem',
              letterSpacing: '0.1em',
              color: 'var(--bg)',
              background: 'var(--text)',
              padding: '0.8rem 1.5rem',
              textDecoration: 'none',
              transition: 'background 200ms, color 200ms',
            }}
            onMouseEnter={(e) => {
              ;(e.currentTarget as HTMLAnchorElement).style.background = 'var(--accent)'
            }}
            onMouseLeave={(e) => {
              ;(e.currentTarget as HTMLAnchorElement).style.background = 'var(--text)'
            }}
          >
            GO HOME →
          </Link>

          <Link
            href="/#work"
            className="font-mono"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontSize: '0.75rem',
              letterSpacing: '0.1em',
              color: 'var(--text-muted)',
              border: '1px solid var(--line)',
              padding: '0.8rem 1.5rem',
              textDecoration: 'none',
              transition: 'border-color 200ms, color 200ms',
            }}
            onMouseEnter={(e) => {
              const el = e.currentTarget as HTMLAnchorElement
              el.style.borderColor = 'var(--text-faint)'
              el.style.color = 'var(--text)'
            }}
            onMouseLeave={(e) => {
              const el = e.currentTarget as HTMLAnchorElement
              el.style.borderColor = 'var(--line)'
              el.style.color = 'var(--text-muted)'
            }}
          >
            SEE MY WORK
          </Link>
        </div>

        {/* Hidden detail for the curious */}
        <p
          className="font-mono"
          style={{
            marginTop: '3rem',
            fontSize: '0.58rem',
            letterSpacing: '0.08em',
            color: 'var(--text-faint)',
            opacity: 0.4,
          }}
          title="You found the hidden message. Nice instinct."
        >
          HTTP 404 · paulojuri.com · 2026
        </p>
      </div>
    </main>
  )
}
