import { forwardRef } from 'react'
import Link from 'next/link'

type Variant = 'primary' | 'ghost' | 'outline' | 'text'
type Size = 'sm' | 'md' | 'lg'

type ButtonBaseProps = {
  variant?: Variant
  size?: Size
  className?: string
  children: React.ReactNode
}

type ButtonAsButton = ButtonBaseProps &
  React.ButtonHTMLAttributes<HTMLButtonElement> & { href?: never }

type ButtonAsLink = ButtonBaseProps & { href: string; external?: boolean }

type ButtonProps = ButtonAsButton | ButtonAsLink

const variantClasses: Record<Variant, string> = {
  primary:
    'bg-ink text-paper hover:bg-accent transition-colors duration-300',
  ghost:
    'bg-transparent text-ink hover:text-accent transition-colors duration-200',
  outline:
    'border border-ink text-ink hover:bg-ink hover:text-paper transition-colors duration-300',
  text:
    'bg-transparent text-ink underline underline-offset-4 decoration-subtle hover:decoration-accent transition-colors duration-200',
}

const sizeClasses: Record<Size, string> = {
  sm: 'px-4 py-2 text-sm',
  md: 'px-6 py-3 text-base',
  lg: 'px-8 py-4 text-lg',
}

const base =
  'inline-flex items-center gap-2 font-medium font-ui cursor-pointer rounded-none focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-3'

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  function Button(props, ref) {
    const { variant = 'primary', size = 'md', className = '', children } = props

    const classes = `${base} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`

    if ('href' in props && props.href) {
      const { href, external, ...rest } = props
      if (external) {
        return (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className={classes}
          >
            {children}
          </a>
        )
      }
      return (
        <Link href={href} className={classes}>
          {children}
        </Link>
      )
    }

    const { href: _href, external: _ext, ...btnProps } = props as ButtonAsLink
    return (
      <button ref={ref} className={classes} {...(btnProps as ButtonAsButton)}>
        {children}
      </button>
    )
  },
)
