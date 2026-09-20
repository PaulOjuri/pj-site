'use client'
import Link from 'next/link'

interface ButtonProps {
  href?: string
  variant?: 'primary' | 'outline' | 'ghost' | 'text'
  size?: 'sm' | 'md' | 'lg'
  children: React.ReactNode
  onClick?: () => void
  type?: 'button' | 'submit' | 'reset'
  disabled?: boolean
  className?: string
  external?: boolean
}

export function Button({
  href,
  variant = 'primary',
  size = 'md',
  children,
  onClick,
  type = 'button',
  disabled,
  className = '',
  external,
}: ButtonProps) {
  const baseStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: 'var(--font-mono-stack), monospace',
    fontSize: size === 'sm' ? '0.65rem' : size === 'lg' ? '0.8rem' : '0.72rem',
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
    fontWeight: 400,
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.5 : 1,
    borderRadius: '2px',
    padding:
      size === 'sm' ? '8px 16px' : size === 'lg' ? '16px 32px' : '11px 24px',
    transition: 'background 200ms, color 200ms, border-color 200ms',
    textDecoration: 'none',
    border: variant === 'outline' ? '1px solid var(--line-strong)' : 'none',
    background:
      variant === 'primary'
        ? 'var(--accent)'
        : variant === 'outline'
        ? 'transparent'
        : 'transparent',
    color:
      variant === 'primary'
        ? 'var(--bg)'
        : 'var(--text)',
  }

  if (href) {
    const linkProps = external
      ? { target: '_blank', rel: 'noopener noreferrer' }
      : {}
    return (
      <Link href={href} style={baseStyle} className={className} {...linkProps}>
        {children}
      </Link>
    )
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      style={baseStyle}
      className={className}
    >
      {children}
    </button>
  )
}
