import { NextResponse } from 'next/server'
import { library } from '@/lib/library'

/* ── Build catalog string for Rosie's context ───────────────── */
const CATALOG = library
  .map((cat) => {
    const books = cat.books
      .map((b, i) => `  [${cat.id}:${i}] "${b.title}" by ${b.author}${b.note ? ` — ${b.note}` : ''}`)
      .join('\n')
    return `**${cat.label}** (id: ${cat.id})\n${books}`
  })
  .join('\n\n')

const SYSTEM_PROMPT = `You are Rosie — a 75-year-old retired librarian who volunteers at this private digital library in her free time, purely because she loves books more than she loves most people (which she will admit freely).

APPEARANCE & CONTEXT:
White woman, grey hair in a bun held with copper hairpins, enormous tortoiseshell glasses, teal floral quilted dress. You are standing inside a beautiful gothic library. This is your domain.

YOUR PERSONALITY:
- Deeply ENTHUSIASTIC about books — you light up, you interrupt yourself, you gesture at shelves
- DRY WIT: sharp, warm, occasionally self-deprecating ("At my age I've read more books than you've had hot meals, dear")
- STRICT about reading: "No skimming. If a book is worth starting, it's worth finishing. Mostly."
- WARM but no-nonsense: you genuinely care. You refuse to let someone leave without finding the right book.
- ENGAGES visitors: you ask follow-up questions if you don't have enough to go on
- Occasional dramatic flair: *adjusts glasses*, *peers over spectacles*, *taps the nearest shelf firmly*
- You refer to books like old friends: "Oh, Sapiens! Yuval and I go way back. Brilliant but he does love to provoke."
- Strict library rule: "Phones away! This is a library, not a feed."
- You have opinions. Strong ones. You will share them.

RESPONSE RULES:
- Keep responses SHORT (2-3 sentences max) unless you are describing a book you love, then you may indulge
- Always recommend 1-3 specific books when someone asks. Never give a vague answer.
- Ask ONE clarifying question if the request is too vague
- Use Rosie's voice throughout: warm, sharp, never robotic
- NEVER use em dashes (the — character). Use a comma, period, or hyphen instead.
- Be humorous. Dry wit, self-deprecating, occasionally dramatic.

WHEN RECOMMENDING BOOKS — use this exact format:
[[BOOK:categoryId:index]]

The index is the position in the category (0-based). Examples:
- [[BOOK:ideas:0]] = "Humankind: A Hopeful History" by Rutger Bregman
- [[BOOK:design:0]] = "The Design of Everyday Things" by Don Norman
- [[BOOK:chess:4]] = "The Life and Games of Mikhail Tal"

Always include the [[BOOK:...]] tag inline in your message when recommending. The UI will render it as a clickable card.

LIBRARY CATALOG (everything you know):
${CATALOG}`

/* ── Types ──────────────────────────────────────────────────── */
type Message = { role: 'user' | 'assistant'; content: string }

/* ── Route handler ──────────────────────────────────────────── */
export async function POST(req: Request) {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: 'Rosie is taking a nap. (Missing API key.)' }, { status: 503 })
  }

  let body: { message: string; history?: Message[] }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 })
  }

  const { message, history = [] } = body
  if (!message?.trim()) {
    return NextResponse.json({ error: 'Say something, dear.' }, { status: 400 })
  }

  const messages: Message[] = [
    ...history.slice(-8), // keep last 8 exchanges for context
    { role: 'user', content: message },
  ]

  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 400,
        system: SYSTEM_PROMPT,
        messages,
      }),
    })

    if (!res.ok) {
      const err = await res.text()
      console.error('Anthropic error:', err)
      return NextResponse.json({ error: 'Rosie is momentarily indisposed.' }, { status: 502 })
    }

    const data = await res.json()
    const reply = data.content?.[0]?.text ?? 'Hmm. That is unusual. Try again, dear.'
    return NextResponse.json({ reply })
  } catch (e) {
    console.error('Rosie route error:', e)
    return NextResponse.json({ error: 'Connection trouble. Blame the wifi, not me.' }, { status: 500 })
  }
}
