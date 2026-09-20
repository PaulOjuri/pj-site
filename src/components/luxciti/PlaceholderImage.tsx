import type { CSSProperties } from 'react'

interface PlaceholderImageProps {
  className?: string
  caption?: string
  aspectRatio?: string
  style?: CSSProperties
}

export function PlaceholderImage({
  className = '',
  caption = 'Photography — Orsett Hall, July 2026',
  aspectRatio = '16/9',
  style: styleProp,
}: PlaceholderImageProps) {
  return (
    <div
      className={className}
      style={{
        position: 'relative',
        aspectRatio,
        background: [
          'radial-gradient(ellipse at 30% 40%, var(--lc-blush) 0%, var(--lc-blush-deep) 30%, transparent 70%)',
          'radial-gradient(ellipse at 70% 60%, var(--lc-ivory) 0%, var(--lc-gold) 40%, transparent 60%)',
          'radial-gradient(ellipse at 50% 50%, var(--lc-ivory-hi) 0%, var(--lc-gold) 50%, var(--lc-charcoal) 100%)',
        ].join(', '),
        overflow: 'hidden',
        ...styleProp,
      }}
    >
      {/* Film grain texture */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E\")",
          backgroundRepeat: 'repeat',
          backgroundSize: '200px 200px',
          opacity: 0.06,
          pointerEvents: 'none',
          zIndex: 2,
        }}
      />

      {/* LC watermark */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1,
        }}
      >
        <span
          style={{
            fontFamily: 'var(--lc-font-serif)',
            fontWeight: 300,
            fontSize: 'clamp(3rem, 8vw, 6rem)',
            color: 'var(--lc-charcoal)',
            opacity: 0.08,
            letterSpacing: '0.2em',
            userSelect: 'none',
          }}
        >
          LC
        </span>
      </div>

      {/* Caption */}
      {caption && (
        <div
          style={{
            position: 'absolute',
            bottom: '0.75rem',
            left: '0.75rem',
            zIndex: 3,
          }}
        >
          <span
            style={{
              fontFamily: 'var(--lc-font-sans)',
              fontWeight: 300,
              fontSize: '0.65rem',
              letterSpacing: '0.3em',
              textTransform: 'uppercase',
              color: 'rgba(250, 246, 240, 0.7)',
            }}
          >
            {caption}
          </span>
        </div>
      )}
    </div>
  )
}
