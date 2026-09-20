'use client'

const LINKS = [
  { label: 'Work', href: '/#work' },
  { label: 'About', href: '/#about' },
  { label: 'Services', href: '/#services' },
  { label: 'Journal', href: '/journal' },
  { label: 'Library', href: '/library' },
]

const SOCIAL = [
  { label: 'LinkedIn', href: 'https://linkedin.com/in/paulojuri' },
  { label: 'GitHub', href: 'https://github.com/paulojuri' },
]

export function SiteFooter() {
  return (
    <footer
      aria-label="Site footer"
      style={{ background: 'var(--bg-inset)', borderTop: '1px solid var(--line)' }}
    >
      <div className="container-site">
        {/* CTA */}
        <div style={{ paddingBlock: 'clamp(5rem, 10vw, 10rem)' }}>
          <p
            className="font-mono"
            style={{
              fontSize: '0.8rem',
              letterSpacing: '0.1em',
              color: 'var(--text-faint)',
              marginBottom: '2rem',
              textTransform: 'uppercase',
            }}
          >
            Available for new projects
          </p>
          <h2
            className="font-display"
            style={{
              fontSize: 'clamp(2.5rem, 7vw, 6rem)',
              lineHeight: 1,
              letterSpacing: '-0.03em',
              color: 'var(--text)',
              marginBottom: '2rem',
            }}
          >
            Let&apos;s build
            <br />
            <span style={{ color: 'var(--accent)' }}>something</span> real.
          </h2>
          <a
            href="mailto:hello@paulojuri.com"
            className="link-accent"
            style={{ fontSize: 'clamp(1rem, 1.3vw, 1.2rem)' }}
          >
            hello@paulojuri.com
          </a>
        </div>

        {/* Links row */}
        <div
          style={{
            borderTop: '1px solid var(--line)',
            paddingBlock: '3rem',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
            gap: '2rem',
          }}
        >
          <div>
            <p
              className="font-mono"
              style={{
                fontSize: '0.75rem',
                letterSpacing: '0.12em',
                color: 'var(--text-faint)',
                marginBottom: '1rem',
                textTransform: 'uppercase',
              }}
            >
              Navigate
            </p>
            <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              {LINKS.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    style={{
                      fontSize: '1rem',
                      color: 'var(--text-muted)',
                      transition: 'color 200ms',
                      fontWeight: 300,
                    }}
                    onMouseEnter={(e) => {
                      ;(e.currentTarget as HTMLAnchorElement).style.color = 'var(--text)'
                    }}
                    onMouseLeave={(e) => {
                      ;(e.currentTarget as HTMLAnchorElement).style.color = 'var(--text-muted)'
                    }}
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p
              className="font-mono"
              style={{
                fontSize: '0.75rem',
                letterSpacing: '0.12em',
                color: 'var(--text-faint)',
                marginBottom: '1rem',
                textTransform: 'uppercase',
              }}
            >
              Connect
            </p>
            <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              <li>
                <a
                  href="mailto:hello@paulojuri.com"
                  style={{ fontSize: '1rem', color: 'var(--text-muted)', transition: 'color 200ms', fontWeight: 300 }}
                  onMouseEnter={(e) => { ;(e.currentTarget as HTMLAnchorElement).style.color = 'var(--accent)' }}
                  onMouseLeave={(e) => { ;(e.currentTarget as HTMLAnchorElement).style.color = 'var(--text-muted)' }}
                >
                  hello@paulojuri.com
                </a>
              </li>
              {SOCIAL.map((s) => (
                <li key={s.label}>
                  <a
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ fontSize: '1rem', color: 'var(--text-muted)', transition: 'color 200ms', fontWeight: 300 }}
                    onMouseEnter={(e) => { ;(e.currentTarget as HTMLAnchorElement).style.color = 'var(--text)' }}
                    onMouseLeave={(e) => { ;(e.currentTarget as HTMLAnchorElement).style.color = 'var(--text-muted)' }}
                  >
                    {s.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p
              className="font-mono"
              style={{
                fontSize: '0.75rem',
                letterSpacing: '0.12em',
                color: 'var(--text-faint)',
                marginBottom: '1rem',
                textTransform: 'uppercase',
              }}
            >
              Location
            </p>
            <p style={{ fontSize: '1rem', color: 'var(--text-muted)', lineHeight: 1.6, fontWeight: 300 }}>
              Turnhout, Belgium
              <br />
              Working worldwide
            </p>
          </div>
        </div>

        {/* Bottom bar */}
        <div
          style={{
            borderTop: '1px solid var(--line)',
            paddingBlock: '1.5rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1rem',
          }}
        >
          <span
            className="font-mono"
            style={{ fontSize: '0.75rem', letterSpacing: '0.08em', color: 'var(--text-faint)' }}
          >
            &copy; 2026 Paul Ojuri. All rights reserved.
          </span>
          <span
            className="font-mono"
            style={{ fontSize: '0.75rem', letterSpacing: '0.08em', color: 'var(--text-faint)' }}
          >
            Product Engineer &amp; Designer
          </span>
        </div>
      </div>
    </footer>
  )
}
