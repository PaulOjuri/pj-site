'use client'
import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const NAV_LINKS = [
  { label: 'Work', href: '/#work' },
  { label: 'About', href: '/#about' },
  { label: 'Services', href: '/#services' },
  { label: 'Journal', href: '/journal' },
  { label: 'Chess', href: '/chess' },
  { label: 'Contact', href: '/#contact' },
]

export function SiteHeader() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const hamburgerRef = useRef<HTMLButtonElement>(null)
  const closeRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 60)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape' && menuOpen) {
        setMenuOpen(false)
        hamburgerRef.current?.focus()
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [menuOpen])

  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = 'hidden'
      const t = setTimeout(() => closeRef.current?.focus(), 300)
      return () => clearTimeout(t)
    } else {
      document.body.style.overflow = ''
    }
  }, [menuOpen])

  const handleMenuKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key !== 'Tab' || !menuRef.current) return
    const focusables = menuRef.current.querySelectorAll<HTMLElement>(
      'button, a, [tabindex]:not([tabindex="-1"])'
    )
    const first = focusables[0]
    const last = focusables[focusables.length - 1]
    if (e.shiftKey) {
      if (document.activeElement === first) { e.preventDefault(); last?.focus() }
    } else {
      if (document.activeElement === last) { e.preventDefault(); first?.focus() }
    }
  }, [])

  return (
    <>
      <header
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          height: '80px',
          zIndex: 100,
          display: 'flex',
          alignItems: 'center',
          transition: 'background 400ms ease, backdrop-filter 400ms ease',
          background: scrolled ? 'rgba(10,10,10,0.9)' : 'transparent',
          backdropFilter: scrolled ? 'blur(16px)' : 'none',
          WebkitBackdropFilter: scrolled ? 'blur(16px)' : 'none',
          borderBottom: scrolled ? '1px solid var(--line)' : '1px solid transparent',
        }}
      >
        <div
          className="container-site"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            width: '100%',
          }}
        >
          {/* Logo */}
          <a
            href="/"
            aria-label="Paul Ojuri — home"
            style={{ display: 'flex', alignItems: 'center', gap: '12px' }}
          >
            <span
              className="font-display"
              style={{
                fontSize: 'clamp(1.1rem, 1.5vw, 1.3rem)',
                letterSpacing: '-0.02em',
                color: 'var(--text)',
              }}
            >
              Paul Ojuri
            </span>
          </a>

          {/* Desktop nav */}
          <nav
            aria-label="Main navigation"
            style={{ display: 'flex', alignItems: 'center', gap: 'clamp(1.5rem, 3vw, 3rem)' }}
            className="hidden md:flex"
          >
            {NAV_LINKS.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="font-mono"
                style={{
                  fontSize: '0.8rem',
                  letterSpacing: '0.1em',
                  color: 'var(--text-muted)',
                  textTransform: 'uppercase',
                  transition: 'color 300ms',
                }}
                onMouseEnter={(e) => {
                  ;(e.currentTarget as HTMLAnchorElement).style.color = 'var(--accent)'
                }}
                onMouseLeave={(e) => {
                  ;(e.currentTarget as HTMLAnchorElement).style.color = 'var(--text-muted)'
                }}
              >
                {link.label}
              </a>
            ))}
            <a
              href="mailto:hello@paulojuri.com"
              style={{
                fontSize: '0.8rem',
                letterSpacing: '0.08em',
                color: 'var(--bg)',
                background: 'var(--accent)',
                padding: '8px 20px',
                fontFamily: 'var(--font-mono-stack), monospace',
                textTransform: 'uppercase',
                transition: 'background 300ms',
              }}
              onMouseEnter={(e) => {
                ;(e.currentTarget as HTMLAnchorElement).style.background = 'var(--accent-hover)'
              }}
              onMouseLeave={(e) => {
                ;(e.currentTarget as HTMLAnchorElement).style.background = 'var(--accent)'
              }}
            >
              Hire Me
            </a>
          </nav>

          {/* Mobile hamburger */}
          <button
            ref={hamburgerRef}
            onClick={() => setMenuOpen(true)}
            aria-label="Open menu"
            aria-expanded={menuOpen}
            aria-controls="site-menu"
            className="md:hidden"
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text)',
              padding: '8px',
              display: 'flex',
              flexDirection: 'column',
              gap: '5px',
            }}
          >
            <span style={{ display: 'block', width: '22px', height: '1px', background: 'var(--text)' }} />
            <span style={{ display: 'block', width: '14px', height: '1px', background: 'var(--text)', marginLeft: 'auto' }} />
          </button>
        </div>
      </header>

      {/* Mobile overlay menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            id="site-menu"
            ref={menuRef}
            role="dialog"
            aria-label="Site navigation"
            onKeyDown={handleMenuKeyDown}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 200,
              background: 'var(--bg)',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {/* Close */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                height: '80px',
                padding: '0 clamp(1.5rem, 5vw, 6rem)',
              }}
            >
              <a
                href="/"
                onClick={() => setMenuOpen(false)}
                className="font-display"
                style={{ fontSize: '1.2rem', color: 'var(--text)', letterSpacing: '-0.02em' }}
              >
                Paul Ojuri
              </a>
              <button
                ref={closeRef}
                onClick={() => { setMenuOpen(false); hamburgerRef.current?.focus() }}
                aria-label="Close menu"
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--text)',
                  padding: '8px',
                  fontSize: '1.2rem',
                }}
              >
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
                  <line x1="2" y1="2" x2="16" y2="16" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
                  <line x1="16" y1="2" x2="2" y2="16" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
                </svg>
              </button>
            </div>

            {/* Nav links */}
            <div
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                padding: '0 clamp(1.5rem, 5vw, 6rem)',
                gap: '0.5rem',
              }}
            >
              {NAV_LINKS.map((link, i) => (
                <motion.a
                  key={link.label}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.1 + i * 0.05 }}
                  className="font-display"
                  style={{
                    fontSize: 'clamp(2rem, 5vw, 3.5rem)',
                    color: 'var(--text)',
                    lineHeight: 1.2,
                    padding: '0.5rem 0',
                    transition: 'color 200ms',
                  }}
                  onMouseEnter={(e) => {
                    ;(e.currentTarget as HTMLAnchorElement).style.color = 'var(--accent)'
                  }}
                  onMouseLeave={(e) => {
                    ;(e.currentTarget as HTMLAnchorElement).style.color = 'var(--text)'
                  }}
                >
                  {link.label}
                </motion.a>
              ))}
            </div>

            {/* Footer */}
            <div
              style={{
                padding: '1.5rem clamp(1.5rem, 5vw, 6rem)',
                borderTop: '1px solid var(--line)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <a
                href="mailto:hello@paulojuri.com"
                className="font-mono"
                style={{ fontSize: '0.8rem', letterSpacing: '0.08em', color: 'var(--accent)' }}
              >
                hello@paulojuri.com
              </a>
              <span className="font-mono" style={{ fontSize: '0.75rem', color: 'var(--text-faint)', letterSpacing: '0.08em' }}>
                &copy; 2026
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
