'use client'

interface WorkCTALinksProps {
  accentColor?: string
  productPageUrl?: string
  liveUrl?: string
}

export function WorkCTALinks({ accentColor = 'var(--accent)', productPageUrl, liveUrl }: WorkCTALinksProps) {
  if (!productPageUrl && !liveUrl) return null

  return (
    <section
      style={{
        borderTop: '1px solid var(--line)',
        padding: 'clamp(3rem, 6vw, 5rem) 0',
        background: 'var(--bg-elevated)',
      }}
    >
      <div className="container-site">
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
          {liveUrl && (
            <a
              href={liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 24px',
                background: accentColor,
                color: 'var(--bg)',
                fontFamily: 'var(--font-mono-stack), monospace',
                fontSize: '0.72rem',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                borderRadius: '2px',
                transition: 'opacity 200ms',
              }}
              onMouseEnter={(e) => {
                ;(e.currentTarget as HTMLAnchorElement).style.opacity = '0.85'
              }}
              onMouseLeave={(e) => {
                ;(e.currentTarget as HTMLAnchorElement).style.opacity = '1'
              }}
            >
              LIVE SITE ↗
            </a>
          )}
          {productPageUrl && (
            <a
              href={productPageUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 24px',
                background: 'transparent',
                color: 'var(--text)',
                border: '1px solid var(--line)',
                fontFamily: 'var(--font-mono-stack), monospace',
                fontSize: '0.72rem',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                borderRadius: '2px',
                transition: 'border-color 200ms',
              }}
              onMouseEnter={(e) => {
                ;(e.currentTarget as HTMLAnchorElement).style.borderColor = 'var(--line-strong)'
              }}
              onMouseLeave={(e) => {
                ;(e.currentTarget as HTMLAnchorElement).style.borderColor = 'var(--line)'
              }}
            >
              PRODUCT PAGE ↗
            </a>
          )}
        </div>
      </div>
    </section>
  )
}
