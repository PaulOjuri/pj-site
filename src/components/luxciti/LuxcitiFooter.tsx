import Link from 'next/link'

const footerLinks = [
  { label: 'Home',       href: '/luxciti' },
  { label: 'About',      href: '/luxciti/about' },
  { label: 'Services',   href: '/luxciti/services' },
  { label: 'Experience', href: '/luxciti/experience' },
  { label: 'Portfolio',  href: '/luxciti/portfolio' },
  { label: 'Hub',        href: '/luxciti/hub' },
  { label: 'Enquire',    href: '/luxciti/enquire' },
]

export function LuxcitiFooter() {
  return (
    <>
      {/* ── Option 1: Dark charcoal footer (active) ── */}
      <footer
        style={{
          backgroundColor: 'var(--lc-charcoal)',
          color: 'var(--lc-ivory)',
          paddingTop: '5rem',
          paddingBottom: '3rem',
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Faint watermark monogram */}
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            pointerEvents: 'none',
          }}
        >
          <span
            style={{
              fontFamily: 'var(--lc-font-serif)',
              fontWeight: 300,
              fontSize: 'clamp(10rem, 25vw, 20rem)',
              color: 'rgba(250, 246, 240, 0.06)',
              letterSpacing: '0.2em',
              userSelect: 'none',
            }}
          >
            LC
          </span>
        </div>

        <div style={{ maxWidth: '72rem', margin: '0 auto', padding: '0 2rem', position: 'relative', zIndex: 1 }}>
          <span className="lc-gold-rule" style={{ display: 'block', marginBottom: '4rem' }} />

          {/* Monogram */}
          <div
            className="lc-serif lc-gold-text"
            style={{
              fontSize: 'clamp(4rem, 8vw, 7rem)',
              fontWeight: 300,
              lineHeight: 1,
              marginBottom: '1rem',
              letterSpacing: '0.1em',
            }}
          >
            LC
          </div>

          {/* Brand name */}
          <p
            style={{
              fontFamily: 'var(--lc-font-sans)',
              fontWeight: 200,
              fontSize: '0.75rem',
              letterSpacing: '0.5em',
              textTransform: 'uppercase',
              color: 'var(--lc-gold)',
              marginBottom: '0.75rem',
            }}
          >
            Luxciti Luxury Events
          </p>

          {/* Tagline */}
          <p
            className="lc-serif"
            style={{
              fontStyle: 'italic',
              fontSize: '1.1rem',
              color: 'var(--lc-ink-45)',
              marginBottom: '3rem',
            }}
          >
            Elegantly Planned. Beautifully Executed. Unforgettably Yours.
          </p>

          {/* Nav */}
          <nav
            aria-label="Footer navigation"
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'center',
              gap: '1.5rem 2rem',
              marginBottom: '3rem',
            }}
          >
            {footerLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                style={{
                  fontFamily: 'var(--lc-font-sans)',
                  fontWeight: 200,
                  fontSize: '0.7rem',
                  letterSpacing: '0.35em',
                  textTransform: 'uppercase',
                  textDecoration: 'none',
                  color: 'var(--lc-ivory)',
                  transition: 'color 250ms',
                }}
                className="lc-footer-link"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <span className="lc-gold-rule" style={{ opacity: 0.2, marginBottom: '2.5rem', display: 'block' }} />

          {/* Contact */}
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'center',
              gap: '0.5rem 2rem',
              marginBottom: '1rem',
            }}
          >
            <a
              href="mailto:hello@luxciti.co.uk"
              style={{
                fontFamily: 'var(--lc-font-sans)',
                fontWeight: 200,
                fontSize: '0.75rem',
                color: 'var(--lc-ivory)',
                textDecoration: 'none',
                letterSpacing: '0.05em',
              }}
            >
              hello@luxciti.co.uk
            </a>
            <span style={{ color: 'var(--lc-gold)', opacity: 0.4 }}>·</span>
            <a
              href="https://instagram.com/luxcitiluxuryevents"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                fontFamily: 'var(--lc-font-sans)',
                fontWeight: 200,
                fontSize: '0.75rem',
                color: 'var(--lc-ivory)',
                textDecoration: 'none',
                letterSpacing: '0.05em',
              }}
            >
              @luxcitiluxuryevents
            </a>
            <span style={{ color: 'var(--lc-gold)', opacity: 0.4 }}>·</span>
            <a
              href="https://luxciti.co.uk"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                fontFamily: 'var(--lc-font-sans)',
                fontWeight: 200,
                fontSize: '0.75rem',
                color: 'var(--lc-ivory)',
                textDecoration: 'none',
                letterSpacing: '0.05em',
              }}
            >
              luxciti.co.uk
            </a>
            {/* TODO: Phone number — confirm with Gift which is correct:
                +44 7908 050719 (old footer) vs +44 7442 709551 (business card / handoff doc marked FINAL).
                Uncomment once confirmed:
            */}
            {/* <span style={{ color: 'var(--lc-gold)', opacity: 0.4 }}>·</span>
            <a
              href="tel:+447442709551"
              style={{
                fontFamily: 'var(--lc-font-sans)',
                fontWeight: 200,
                fontSize: '0.75rem',
                color: 'var(--lc-ivory)',
                textDecoration: 'none',
                letterSpacing: '0.05em',
              }}
            >
              +44 7442 709551
            </a> */}
          </div>

          {/* Copyright */}
          <p
            style={{
              fontFamily: 'var(--lc-font-sans)',
              fontWeight: 200,
              fontSize: '0.7rem',
              color: 'var(--lc-ivory)',
              opacity: 0.6,
              letterSpacing: '0.05em',
              marginTop: '1.5rem',
            }}
          >
            &copy; 2026 Luxciti Luxury Events. All rights reserved.
          </p>
        </div>

        <style>{`
          .lc-footer-link:hover {
            color: var(--lc-gold) !important;
          }
        `}</style>
      </footer>

      {/* ── Option 2: Light blush footer (commented — uncomment to preview) ──
      <footer
        style={{
          backgroundColor: 'var(--lc-blush)',
          color: 'var(--lc-charcoal)',
          paddingTop: '5rem',
          paddingBottom: '3rem',
          textAlign: 'center',
          borderTop: '1px solid var(--lc-gold-hair)',
        }}
      >
        <div style={{ maxWidth: '72rem', margin: '0 auto', padding: '0 2rem' }}>
          <div
            className="lc-serif lc-gold-text"
            style={{
              fontSize: 'clamp(4rem, 8vw, 7rem)',
              fontWeight: 300,
              lineHeight: 1,
              marginBottom: '1rem',
              letterSpacing: '0.1em',
            }}
          >
            LC
          </div>
          <p
            style={{
              fontFamily: 'var(--lc-font-sans)',
              fontWeight: 200,
              fontSize: '0.75rem',
              letterSpacing: '0.5em',
              textTransform: 'uppercase',
              color: 'var(--lc-ink-70)',
              marginBottom: '0.75rem',
            }}
          >
            Luxciti Luxury Events
          </p>
          <p
            className="lc-serif"
            style={{
              fontStyle: 'italic',
              fontSize: '1.1rem',
              color: 'var(--lc-ink-70)',
              marginBottom: '3rem',
            }}
          >
            Elegantly Planned. Beautifully Executed. Unforgettably Yours.
          </p>
          <nav
            aria-label="Footer navigation"
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'center',
              gap: '1.5rem 2rem',
              marginBottom: '3rem',
            }}
          >
            ... nav links with color: var(--lc-charcoal) ...
          </nav>
          <p
            style={{
              fontFamily: 'var(--lc-font-sans)',
              fontWeight: 200,
              fontSize: '0.7rem',
              color: 'var(--lc-ink-45)',
              letterSpacing: '0.05em',
            }}
          >
            &copy; 2026 Luxciti Luxury Events. All rights reserved.
          </p>
        </div>
      </footer>
      ── End Option 2 ── */}
    </>
  )
}
