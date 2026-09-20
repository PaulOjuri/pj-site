interface TagProps {
  children: React.ReactNode
  color?: string
  className?: string
}

export function Tag({ children, color, className = '' }: TagProps) {
  return (
    <span
      className={`font-mono ${className}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        fontSize: '0.65rem',
        letterSpacing: '0.1em',
        textTransform: 'uppercase',
        padding: '4px 10px',
        borderRadius: '2px',
        border: '1px solid var(--line)',
        color: color ?? 'var(--text-muted)',
        background: 'transparent',
      }}
    >
      {children}
    </span>
  )
}
