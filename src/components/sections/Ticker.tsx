'use client'

const CONTENT =
  'PRODUCT ENGINEER & DESIGNER · TURNHOUT, BELGIUM · AVAILABLE NOW · PRISM · APPLYAI · ALFERA TECHNIK · SIX YEARS · '

const REPEATED = Array(4).fill(CONTENT).join('')

export function Ticker() {
  return (
    <div
      aria-label="Ticker"
      style={{
        width: '100%',
        overflow: 'hidden',
        background: 'var(--bg-elevated)',
        borderTop: '1px solid var(--line)',
        borderBottom: '1px solid var(--line)',
        paddingBlock: '0.75rem',
      }}
    >
      <div
        className="font-mono"
        style={{
          display: 'flex',
          whiteSpace: 'nowrap',
          width: 'max-content',
          fontSize: '0.65rem',
          letterSpacing: '0.15em',
          color: 'var(--text-faint)',
          animation: 'marquee 30s linear infinite',
        }}
      >
        {REPEATED}
        {REPEATED}
      </div>
    </div>
  )
}
