export function Preloader() {
  return (
    <div
      style={{
        minHeight: '100dvh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--bg)',
        color: 'var(--text-muted)',
        fontFamily: 'var(--font-mono-stack), monospace',
        fontSize: '0.75rem',
        letterSpacing: '0.12em',
      }}
    >
      LOADING...
    </div>
  )
}
