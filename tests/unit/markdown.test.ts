import { test, expect } from '@playwright/test'
import { parseInline, parseMarkdown, plainSummary, safeHref, stripComments } from '../../src/lib/app/markdown'

test('markup in issue text is never markup: it stays text in the tree', () => {
  const blocks = parseMarkdown('<script>alert(1)</script> and <img src=x onerror=alert(1)>')
  expect(blocks).toEqual([
    { type: 'para', inline: [{ type: 'text', text: '<script>alert(1)</script> and <img src=x onerror=alert(1)>' }] },
  ])
})

test('an HTML comment, including the claude.ai marker, is dropped', () => {
  expect(stripComments('<!-- agent-inbox:claude-ai -->\nGo with option 2.').trim()).toBe('Go with option 2.')
  expect(parseMarkdown('<!-- x -->hello')).toEqual([{ type: 'para', inline: [{ type: 'text', text: 'hello' }] }])
})

test('only http(s) and site-relative links survive', () => {
  expect(safeHref('https://alferatechnik.com')).toBe('https://alferatechnik.com')
  expect(safeHref('/app#inbox/12')).toBe('/app#inbox/12')
  expect(safeHref('javascript:alert(1)')).toBeNull()
  expect(safeHref('data:text/html,<script>')).toBeNull()
  expect(safeHref('  javascript:alert(1)')).toBeNull()
})

test('an unsafe link is rendered as the text that was written, never as a link', () => {
  for (const source of ['see [here](javascript:alert(1))', 'see [here](data:text/html,x)']) {
    const inline = parseInline(source)
    expect(inline.some((token) => token.type === 'link')).toBe(false)
    expect(inline.map((token) => token.text).join('')).toBe(source)
  }
})

test('inline code, bold, italic and links', () => {
  expect(parseInline('run `npm test`, **now**, *please*, see [docs](https://x.dev)')).toEqual([
    { type: 'text', text: 'run ' },
    { type: 'code', text: 'npm test' },
    { type: 'text', text: ', ' },
    { type: 'strong', text: 'now' },
    { type: 'text', text: ', ' },
    { type: 'em', text: 'please' },
    { type: 'text', text: ', see ' },
    { type: 'link', text: 'docs', href: 'https://x.dev' },
  ])
})

test('the blocks claude.ai actually writes', () => {
  const blocks = parseMarkdown(
    [
      '## Recommendation',
      '',
      'Go with **option 2**.',
      '',
      '- cheaper per seat',
      '- no migration',
      '',
      '1. sign',
      '2. invoice',
      '',
      '> This assumes the December launch holds.',
      '',
      '```',
      'npx wrangler deploy',
      '```',
      '',
      '---',
    ].join('\n'),
  )
  expect(blocks.map((b) => b.type)).toEqual(['heading', 'para', 'list', 'list', 'quote', 'code', 'rule'])
  expect(blocks[2]).toMatchObject({ type: 'list', ordered: false })
  expect(blocks[3]).toMatchObject({ type: 'list', ordered: true })
  expect(blocks[5]).toEqual({ type: 'code', text: 'npx wrangler deploy' })
})

test('a wall of text cannot turn into unlimited blocks', () => {
  const blocks = parseMarkdown(Array.from({ length: 500 }, (_, i) => `- item ${i}\n`).join('\n'), { maxBlocks: 10 })
  expect(blocks.length).toBeLessThanOrEqual(10)
})

test('plainSummary strips markup and clips', () => {
  expect(plainSummary('## Title\n\nSome **bold** text with `code`')).toBe('Title Some bold text with code')
  expect(plainSummary('x'.repeat(300))).toHaveLength(160)
})

test('a summary keeps the words of a link and drops its URL', () => {
  expect(plainSummary('Go with **1 December**. See [the brief](https://github.com/PaulOjuri/agent-network).')).toBe(
    'Go with 1 December. See the brief.',
  )
})
