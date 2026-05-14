type TagProps = {
  children: React.ReactNode
  className?: string
}

export function Tag({ children, className = '' }: TagProps) {
  return (
    <span
      className={`label-caps inline-block border border-subtle px-2.5 py-1 text-muted ${className}`}
    >
      {children}
    </span>
  )
}
