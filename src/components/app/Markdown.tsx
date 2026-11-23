'use client'
import { Fragment } from 'react'
import { parseMarkdown, type Block, type Inline } from '@/lib/app/markdown'

/**
 * Renders the small markdown subset as React nodes.
 *
 * There is no dangerouslySetInnerHTML here and there never should be: every string below is a text
 * child, which React escapes, so an issue comment containing markup is shown as the markup it is.
 */

function inline(tokens: Inline[]) {
  return tokens.map((token, i) => {
    switch (token.type) {
      case 'code':
        return <code key={i}>{token.text}</code>
      case 'strong':
        return <strong key={i}>{token.text}</strong>
      case 'em':
        return <em key={i}>{token.text}</em>
      case 'link':
        return (
          <a key={i} href={token.href} target="_blank" rel="noopener noreferrer nofollow">
            {token.text}
          </a>
        )
      default:
        return <Fragment key={i}>{token.text}</Fragment>
    }
  })
}

function block(b: Block, key: number) {
  switch (b.type) {
    case 'heading':
      // h1 and h2 belong to the app's own chrome, so an issue's headings start at h3.
      return b.level === 1 ? (
        <h3 key={key}>{inline(b.inline)}</h3>
      ) : b.level === 2 ? (
        <h4 key={key}>{inline(b.inline)}</h4>
      ) : (
        <h5 key={key}>{inline(b.inline)}</h5>
      )
    case 'list':
      return b.ordered ? (
        <ol key={key}>
          {b.items.map((item, i) => (
            <li key={i}>{inline(item)}</li>
          ))}
        </ol>
      ) : (
        <ul key={key}>
          {b.items.map((item, i) => (
            <li key={i}>{inline(item)}</li>
          ))}
        </ul>
      )
    case 'code':
      return <pre key={key}>{b.text}</pre>
    case 'quote':
      return <blockquote key={key}>{inline(b.inline)}</blockquote>
    case 'rule':
      return <hr key={key} />
    default:
      return <p key={key}>{inline(b.inline)}</p>
  }
}

export function Markdown({ source, maxBlocks }: { source: string; maxBlocks?: number }) {
  const blocks = parseMarkdown(source, { maxBlocks })
  if (!blocks.length) return null
  return <div className="app-md">{blocks.map(block)}</div>
}
