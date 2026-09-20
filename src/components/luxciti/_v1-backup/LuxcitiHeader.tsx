'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'

const navLinks = [
  { label: 'Home',       href: '/luxciti' },
  { label: 'About',      href: '/luxciti/about' },
  { label: 'Services',   href: '/luxciti/services' },
  { label: 'Experience', href: '/luxciti/experience' },
  { label: 'Portfolio',  href: '/luxciti/portfolio' },
  { label: 'Hub',        href: '/luxciti/hub' },
  { label: 'Enquire',    href: '/luxciti/enquire' },
]

export function LuxcitiHeader() {
  const [scrolled, setScrolled] = useState(false)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const headerRef = useRef<HTMLElement>(null)

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 80)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    if (drawerOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [drawerOpen])

  return (
    <>
      <header
        ref={headerRef}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 100,
          padding: '1.25rem 2rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          transition: 'background 400ms cubic-bezier(0.22, 1, 0.36, 1), border-color 400ms cubic-bezier(0.22, 1, 0.36, 1), backdrop-filter 400ms cubic-bezier(0.22, 1, 0.36, 1)',
          background: scrolled ? 'rgba(239,231,214,0.92)' : 'transparent',
          backdropFilter: scrolled ? 'blur(12px)' : 'none',
          WebkitBackdropFilter: scrolled ? 'blur(12px)' : 'none',
          borderBottom: scrolled ? '1px solid rgba(179,147,92,0.3)' : '1px solid transparent',
        }}
      >
        {/* Logo */}
        <Link
          href="/luxciti"
          style={{ textDecoration: 'none' }}
          aria-label="Luxciti Luxury Events — Home"
        >
          <span
            className="lc-serif lc-gold-text"
            style={{
              fontSize: '1.35rem',
              fontWeight: 300,
              letterSpacing: '0.35em',
              textTransform: 'uppercase',
            }}
          >
            Luxciti
          </span>
        </Link>

        {/* Desktop nav */}
        <nav aria-label="Main navigation" style={{ display: 'flex', gap: '2rem' }} className="lc-desktop-nav">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href} className="lc-nav-link">
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Mobile hamburger */}
        <button
          aria-label={drawerOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={drawerOpen}
          onClick={() => setDrawerOpen(!drawerOpen)}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '0.5rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '5px',
          }}
          className="lc-hamburger"
        >
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              style={{
                display: 'block',
                width: '24px',
                height: '1px',
                backgroundColor: 'var(--lc-gold)',
                transition: 'transform 300ms cubic-bezier(0.22, 1, 0.36, 1), opacity 300ms',
                transform:
                  drawerOpen
                    ? i === 0
                      ? 'translateY(6px) rotate(45deg)'
                      : i === 1
                        ? 'scaleX(0)'
                        : 'translateY(-6px) rotate(-45deg)'
                    : 'none',
                opacity: drawerOpen && i === 1 ? 0 : 1,
              }}
            />
          ))}
        </button>
      </header>

      {/* Mobile drawer overlay */}
      <div
        aria-hidden={!drawerOpen}
        onClick={() => setDrawerOpen(false)}
        style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(67,59,48,0.4)',
          zIndex: 200,
          opacity: drawerOpen ? 1 : 0,
          pointerEvents: drawerOpen ? 'auto' : 'none',
          transition: 'opacity 300ms cubic-bezier(0.22, 1, 0.36, 1)',
        }}
      />

      {/* Mobile drawer */}
      <nav
        aria-label="Mobile navigation"
        aria-hidden={!drawerOpen}
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          bottom: 0,
          width: 'min(320px, 85vw)',
          backgroundColor: 'var(--lc-ivory)',
          zIndex: 201,
          transform: drawerOpen ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 400ms cubic-bezier(0.22, 1, 0.36, 1)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '4rem 2.5rem',
          gap: '2rem',
        }}
      >
        {/* Drawer close */}
        <button
          aria-label="Close menu"
          onClick={() => setDrawerOpen(false)}
          style={{
            position: 'absolute',
            top: '1.5rem',
            right: '1.5rem',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: 'var(--lc-gold)',
            fontSize: '1.2rem',
            fontFamily: 'var(--lc-font-sans)',
            fontWeight: 300,
            letterSpacing: '0.1em',
          }}
        >
          ✕
        </button>

        <p className="lc-eyebrow" style={{ marginBottom: '0.5rem' }}>Navigation</p>
        <span className="lc-gold-rule" />

        {navLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            onClick={() => setDrawerOpen(false)}
            style={{
              textDecoration: 'none',
              fontFamily: 'var(--lc-font-serif)',
              fontWeight: 300,
              fontSize: '1.6rem',
              color: 'var(--lc-espresso)',
              letterSpacing: '0.05em',
              transition: 'color 200ms',
            }}
          >
            {link.label}
          </Link>
        ))}
      </nav>

      <style>{`
        @media (min-width: 768px) {
          .lc-hamburger { display: none !important; }
        }
        @media (max-width: 767px) {
          .lc-desktop-nav { display: none !important; }
        }
      `}</style>
    </>
  )
}
