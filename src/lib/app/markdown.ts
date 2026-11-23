/**
 * A very small markdown subset, parsed into a tree the app renders as React nodes.
 *
 * Everything this parses is untrusted: GitHub issue bodies, claude.ai's recommendations, Paul's own
 * comments. Nothing here produces HTML, so there is no innerHTML anywhere in the app and no way for
 * issue text to become markup — React escapes every string in the tree it returns.
 *
 * Supported, because it is what the agents and claude.ai actually write: headings, bullet and numbered
 * lists, fenced code, block quotes, rules, `code`, **bold**, *italic* and [links](https://…).
 */

export type Inline =
  | { type: 'text'; text: string }
  | { type: 'code'; text: string }
  | { type: 'strong'; text: string }
  | { type: 'em'; text: string }
  | { type: 'link'; text: string; href: string }

export type Block =
  | { type: 'heading'; level: 1 | 2 | 3; inline: Inline[] }
  | { type: 'para'; inline: Inline[] }
  | { type: 'list'; ordered: boolean; items: Inline[][] }
  | { type: 'code'; text: string }
  | { type: 'quote'; inline: Inline[] }
  | { type: 'rule' }

/** Only plain web links survive. Anything else (javascript:, data:, mailto with tricks) stays text. */
export function safeHref(href: string): string | null {
  const url = href.trim()
  if (/^https?:\/\/[^\s<>"']+$/i.test(url)) return url
  if (/^\/[^\s<>"']*$/.test(url)) return url
  return null
}

const INLINE = /(`[^`]+`)|(\*\*[^*]+\*\*)|(\[[^\]\n]+\]\([^)\s]+\))|(\*[^*\n]+\*)/

export function parseInline(src: string): Inline[] {
  const out: Inline[] = []
  let rest = src
  while (rest) {
    const match = INLINE.exec(rest)
    if (!match || match.index === undefined) break
    if (match.index > 0) out.push({ type: 'text', text: rest.slice(0, match.index) })
    const token = match[0]
    if (token.startsWith('`')) {
      out.push({ type: 'code', text: token.slice(1, -1) })
    } else if (token.startsWith('**')) {
      out.push({ type: 'strong', text: token.slice(2, -2) })
    } else if (token.startsWith('[')) {
      const [, text, href] = /^\[([^\]]+)\]\(([^)\s]+)\)$/.exec(token) ?? []
      const safe = href ? safeHref(href) : null
      if (safe && text) out.push({ type: 'link', text, href: safe })
      else out.push({ type: 'text', text: token })
    } else {
      out.push({ type: 'em', text: token.slice(1, -1) })
    }
    rest = rest.slice(match.index + token.length)
  }
  if (rest) out.push({ type: 'text', text: rest })
  return out.length ? out : [{ type: 'text', text: '' }]
}

const HEADING = /^(#{1,3})\s+(.*)$/
const BULLET = /^\s*[-*+]\s+(.*)$/
const NUMBERED = /^\s*\d+[.)]\s+(.*)$/
const RULE = /^\s*(-{3,}|\*{3,}|_{3,})\s*$/
const QUOTE = /^\s*>\s?(.*)$/

/** The marker comment's HTML comment and any other comment are dropped before parsing. */
export function stripComments(src: string): string {
  return src.replace(/<!--[\s\S]*?-->/g, '')
}

export function parseMarkdown(source: string, opts: { maxBlocks?: number } = {}): Block[] {
  const maxBlocks = opts.maxBlocks ?? 200
  const lines = stripComments(source).replace(/\r\n/g, '\n').split('\n')
  const blocks: Block[] = []
  let paragraph: string[] = []

  const flush = () => {
    if (!paragraph.length) return
    blocks.push({ type: 'para', inline: parseInline(paragraph.join(' ').trim()) })
    paragraph = []
  }

  for (let i = 0; i < lines.length && blocks.length < maxBlocks; i++) {
    const line = lines[i]

    if (line.trim().startsWith('```')) {
      flush()
      const body: string[] = []
      i++
      while (i < lines.length && !lines[i].trim().startsWith('```')) body.push(lines[i++])
      blocks.push({ type: 'code', text: body.join('\n') })
      continue
    }
    if (!line.trim()) {
      flush()
      continue
    }
    if (RULE.test(line)) {
      flush()
      blocks.push({ type: 'rule' })
      continue
    }
    const heading = HEADING.exec(line)
    if (heading) {
      flush()
      blocks.push({
        type: 'heading',
        level: heading[1].length as 1 | 2 | 3,
        inline: parseInline(heading[2].trim()),
      })
      continue
    }
    const quote = QUOTE.exec(line)
    if (quote) {
      flush()
      blocks.push({ type: 'quote', inline: parseInline(quote[1]) })
      continue
    }
    const bullet = BULLET.exec(line)
    const numbered = NUMBERED.exec(line)
    if (bullet || numbered) {
      flush()
      const ordered = Boolean(numbered)
      const items: Inline[][] = [parseInline((bullet?.[1] ?? numbered?.[1] ?? '').trim())]
      while (i + 1 < lines.length) {
        const nextLine = lines[i + 1]
        const next = ordered ? NUMBERED.exec(nextLine) : BULLET.exec(nextLine)
        if (!next || RULE.test(nextLine)) break
        items.push(parseInline(next[1].trim()))
        i++
      }
      blocks.push({ type: 'list', ordered, items })
      continue
    }
    paragraph.push(line.trim())
  }
  flush()
  return blocks.slice(0, maxBlocks)
}

/** One line of plain text, for a card's summary. */
export function plainSummary(source: string, max = 160): string {
  const text = stripComments(source)
    .replace(/```[\s\S]*?```/g, ' ')
    // A link keeps its words and loses its URL: a summary is no place for a 60-character href.
    .replace(/\[([^\]\n]+)\]\([^)\s]*\)?/g, '$1')
    .replace(/[#>*`_[\]]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
  return text.length > max ? `${text.slice(0, max - 1)}…` : text
}
