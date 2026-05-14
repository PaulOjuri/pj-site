import type { MDXComponents } from 'mdx/types'
import Image, { ImageProps } from 'next/image'
import Link from 'next/link'

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    h1: ({ children }) => (
      <h1 className="text-heading mt-12 mb-6 first:mt-0">{children}</h1>
    ),
    h2: ({ children }) => (
      <h2 className="text-subheading mt-10 mb-4">{children}</h2>
    ),
    h3: ({ children }) => (
      <h3 className="text-xl font-sans mt-8 mb-3">{children}</h3>
    ),
    p: ({ children }) => (
      <p className="text-base leading-relaxed text-muted mb-6">{children}</p>
    ),
    a: ({ href, children }) => {
      if (href?.startsWith('/')) {
        return (
          <Link href={href} className="text-ink underline underline-offset-4 decoration-subtle hover:decoration-accent transition-colors">
            {children}
          </Link>
        )
      }
      return (
        <a href={href} target="_blank" rel="noopener noreferrer" className="text-ink underline underline-offset-4 decoration-subtle hover:decoration-accent transition-colors">
          {children}
        </a>
      )
    },
    img: (props) => (
      <Image
        sizes="(max-width: 768px) 100vw, 800px"
        className="w-full rounded-none my-8"
        {...(props as ImageProps)}
        alt={props.alt ?? ''}
      />
    ),
    blockquote: ({ children }) => (
      <blockquote className="border-l-2 border-accent pl-6 my-8 text-muted italic">
        {children}
      </blockquote>
    ),
    code: ({ children }) => (
      <code className="bg-cream font-mono text-sm px-1.5 py-0.5 rounded-sm text-ink">
        {children}
      </code>
    ),
    pre: ({ children }) => (
      <pre className="bg-ink text-paper font-mono text-sm p-6 overflow-x-auto my-8 rounded-none">
        {children}
      </pre>
    ),
    ul: ({ children }) => (
      <ul className="list-disc list-outside pl-5 text-muted space-y-2 mb-6">{children}</ul>
    ),
    ol: ({ children }) => (
      <ol className="list-decimal list-outside pl-5 text-muted space-y-2 mb-6">{children}</ol>
    ),
    li: ({ children }) => (
      <li className="leading-relaxed">{children}</li>
    ),
    hr: () => <hr className="border-t border-subtle my-12" />,
    ...components,
  }
}
