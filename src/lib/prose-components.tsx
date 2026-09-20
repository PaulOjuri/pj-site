import type { MDXComponents } from 'mdx/types'
import Image, { ImageProps } from 'next/image'
import Link from 'next/link'

export const proseComponents: MDXComponents = {
  h1: ({ children }) => (
    <h1 style={{ fontFamily: 'var(--font-sans)', fontWeight: 300, fontSize: 'clamp(28px, 4vw, 40px)', letterSpacing: '-0.025em', lineHeight: 1.1, color: 'var(--ink)', marginTop: '3rem', marginBottom: '1.25rem' }}>
      {children}
    </h1>
  ),
  h2: ({ children }) => (
    <h2 style={{ fontFamily: 'var(--font-sans)', fontWeight: 300, fontSize: 'clamp(22px, 3vw, 30px)', letterSpacing: '-0.02em', lineHeight: 1.15, color: 'var(--ink)', marginTop: '3.25rem', marginBottom: '1rem' }}>
      {children}
    </h2>
  ),
  h3: ({ children }) => (
    <h3 style={{ fontFamily: 'var(--font-ui)', fontWeight: 600, fontSize: 18, color: 'var(--ink)', marginTop: '2.25rem', marginBottom: '0.75rem', letterSpacing: '-0.01em' }}>
      {children}
    </h3>
  ),
  p: ({ children }) => (
    <p style={{ fontSize: 17, lineHeight: 1.85, color: 'var(--muted)', marginBottom: '1.375rem' }}>
      {children}
    </p>
  ),
  a: ({ href, children }) => {
    if (href?.startsWith('/')) {
      return (
        <Link
          href={href}
          style={{ color: 'var(--accent)', textDecoration: 'underline', textDecorationColor: 'rgba(200,85,61,0.35)', textUnderlineOffset: 3 }}
        >
          {children}
        </Link>
      )
    }
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        style={{ color: 'var(--accent)', textDecoration: 'underline', textDecorationColor: 'rgba(200,85,61,0.35)', textUnderlineOffset: 3 }}
      >
        {children}
      </a>
    )
  },
  img: (props) => (
    <Image
      sizes="(max-width: 768px) 100vw, 720px"
      style={{ width: '100%', borderRadius: 8, marginBlock: '2rem' }}
      {...(props as ImageProps)}
      alt={props.alt ?? ''}
    />
  ),
  blockquote: ({ children }) => (
    <blockquote style={{
      borderLeft: '3px solid var(--accent)',
      paddingLeft: '1.75rem',
      marginBlock: '2.5rem',
      fontFamily: 'var(--font-sans)',
      fontStyle: 'italic',
      fontSize: 'clamp(19px, 2.4vw, 26px)',
      fontWeight: 300,
      letterSpacing: '-0.015em',
      color: 'var(--ink)',
      lineHeight: 1.4,
    }}>
      {children}
    </blockquote>
  ),
  code: ({ children }) => (
    <code style={{
      background: 'var(--cream)',
      border: '1px solid var(--subtle)',
      fontFamily: 'var(--font-mono)',
      fontSize: '0.82em',
      padding: '2px 6px',
      borderRadius: 3,
      color: 'var(--ink)',
    }}>
      {children}
    </code>
  ),
  pre: ({ children }) => (
    <pre style={{
      background: 'var(--cream)',
      border: '1px solid var(--subtle)',
      fontFamily: 'var(--font-mono)',
      fontSize: 13.5,
      padding: '1.5rem',
      overflowX: 'auto',
      marginBlock: '2rem',
      borderRadius: 4,
      color: 'var(--ink)',
      lineHeight: 1.7,
    }}>
      {children}
    </pre>
  ),
  ul: ({ children }) => (
    <ul style={{ paddingLeft: '1.5rem', marginBottom: '1.375rem', color: 'var(--muted)', listStyleType: 'disc' }}>
      {children}
    </ul>
  ),
  ol: ({ children }) => (
    <ol style={{ paddingLeft: '1.5rem', marginBottom: '1.375rem', color: 'var(--muted)', listStyleType: 'decimal' }}>
      {children}
    </ol>
  ),
  li: ({ children }) => (
    <li style={{ fontSize: 17, lineHeight: 1.75, marginBottom: '0.625rem' }}>
      {children}
    </li>
  ),
  hr: () => (
    <hr style={{ border: 'none', borderTop: '1px solid var(--subtle)', marginBlock: '3rem' }} />
  ),
}
