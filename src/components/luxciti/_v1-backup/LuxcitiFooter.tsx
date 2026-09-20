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
    <footer
      style={{
        backgroundColor: '#433B30',
        color: 'var(--lc-mocha)',
        paddingTop: '5rem',
        paddingBottom: '3rem',
        textAlign: 'center',
      }}
    >
      {/* Gold hairline top rule */}
      <div style={{ maxWidth: '72rem', margin: '0 auto', padding: '0 2rem' }}>
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
            color: 'var(--lc-gold-light)',
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
            color: 'var(--lc-mocha)',
            marginBottom: '3rem',
          }}
        >
          Where Culture Meets Elegance
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
                color: 'var(--lc-mocha)',
                transition: 'color 300ms',
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
            href="mailto:gift@luxciti.co.uk"
            style={{
              fontFamily: 'var(--lc-font-sans)',
              fontWeight: 200,
              fontSize: '0.75rem',
              color: 'var(--lc-mocha)',
              textDecoration: 'none',
              letterSpacing: '0.05em',
            }}
          >
            gift@luxciti.co.uk
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
              color: 'var(--lc-mocha)',
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
              color: 'var(--lc-mocha)',
              textDecoration: 'none',
              letterSpacing: '0.05em',
            }}
          >
            London · luxciti.co.uk
          </a>
        </div>

        {/* Copyright */}
        <p
          style={{
            fontFamily: 'var(--lc-font-sans)',
            fontWeight: 200,
            fontSize: '0.7rem',
            color: 'var(--lc-mocha)',
            opacity: 0.6,
            letterSpacing: '0.05em',
            marginTop: '1.5rem',
          }}
        >
          © 2026 Luxciti Luxury Events. All rights reserved.
        </p>
      </div>

      <style>{`
        .lc-footer-link:hover {
          color: var(--lc-gold) !important;
        }
      `}</style>
    </footer>
  )
}
