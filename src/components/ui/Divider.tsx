interface DividerProps {
  className?: string
}

export function Divider({ className = '' }: DividerProps) {
  return (
    <hr
      className={className}
      style={{
        border: 'none',
        borderTop: '1px solid var(--line)',
        margin: 0,
      }}
    />
  )
}
