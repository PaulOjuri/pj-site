interface Env {
  ANTHROPIC_API_KEY: string
}

type Message = { role: 'user' | 'assistant'; content: string }

// Library catalog inlined (mirrors src/lib/library.ts)
const CATALOG = `**Ideas & Society** (id: ideas)
  [ideas:0] "Humankind: A Hopeful History" by Rutger Bregman
  [ideas:1] "Utopia for Realists" by Rutger Bregman
  [ideas:2] "Sapiens" by Yuval Noah Harari
  [ideas:3] "Thinking, Fast and Slow" by Daniel Kahneman
  [ideas:4] "Prosperity" by Colin Mayer
  [ideas:5] "How Minds Change" by David McRaney
  [ideas:6] "The WEIRDest People in the World" by Joseph Henrich

**Design** (id: design)
  [design:0] "The Design of Everyday Things" by Don Norman
  [design:1] "Thinking with Type" by Ellen Lupton
  [design:2] "The Elements of Typographic Style" by Robert Bringhurst
  [design:3] "Grid Systems in Graphic Design" by Josef Müller-Brockmann
  [design:4] "Don't Make Me Think" by Steve Krug
  [design:5] "How Buildings Learn" by Stewart Brand
  [design:6] "Designing with the Mind in Mind" by Jeff Johnson

**Product & Strategy** (id: product)
  [product:0] "Continuous Discovery Habits" by Teresa Torres
  [product:1] "Inspired" by Marty Cagan
  [product:2] "Competing Against Luck" by Clayton Christensen
  [product:3] "Good Strategy Bad Strategy" by Richard Rumelt
  [product:4] "The Lean Startup" by Eric Ries
  [product:5] "The Innovator's Dilemma" by Clayton Christensen

**Engineering & Systems** (id: engineering)
  [engineering:0] "A Philosophy of Software Design" by John Ousterhout
  [engineering:1] "Designing Data-Intensive Applications" by Martin Kleppmann
  [engineering:2] "The Pragmatic Programmer" by Hunt & Thomas
  [engineering:3] "The Phoenix Project" by Gene Kim
  [engineering:4] "Clean Code" by Robert C. Martin
  [engineering:5] "Structure and Interpretation of Computer Programs" by Abelson & Sussman

**Technology & Future** (id: technology)
  [technology:0] "The Innovators" by Walter Isaacson
  [technology:1] "The Second Machine Age" by Brynjolfsson & McAfee
  [technology:2] "Superintelligence" by Nick Bostrom
  [technology:3] "Life 3.0" by Max Tegmark
  [technology:4] "The Age of Surveillance Capitalism" by Shoshana Zuboff
  [technology:5] "The Shallows" by Nicholas Carr
  [technology:6] "The Code Breaker" by Walter Isaacson

**Chess** (id: chess)
  [chess:0] "My System" by Aron Nimzowitsch
  [chess:1] "Chess Fundamentals" by José Raúl Capablanca
  [chess:2] "How to Reassess Your Chess" by Jeremy Silman
  [chess:3] "Think Like a Grandmaster" by Alexander Kotov
  [chess:4] "The Life and Games of Mikhail Tal" by Mikhail Tal
  [chess:5] "Endgame" by Frank Brady
  [chess:6] "101 Chess Endgame Tips" by Steve Giddins
  [chess:7] "Zurich 1953" by David Bronstein

**Fiction** (id: fiction)
  [fiction:0] "Inferno" by Dan Brown
  [fiction:1] "A Question of Blood" by Ian Rankin
  [fiction:2] "Roots" by Alex Haley
  [fiction:3] "Things Fall Apart" by Chinua Achebe
  [fiction:4] "Half of a Yellow Sun" by Chimamanda Ngozi Adichie
  [fiction:5] "1984" by George Orwell
  [fiction:6] "One Head Too Many" by Christopher Brookmyre

**History & Conflict** (id: history)
  [history:0] "The Secret War" by Max Hastings
  [history:1] "The Guns of August" by Barbara Tuchman
  [history:2] "Bloodlands" by Timothy Snyder
  [history:3] "Empire of Pain" by Patrick Radden Keefe
  [history:4] "The Secret War with Germany" by David Kahn
  [history:5] "Unholy War" by John L. Esposito

**Leadership & Business** (id: leadership)
  [leadership:0] "High Output Management" by Andy Grove
  [leadership:1] "The Hard Thing About Hard Things" by Ben Horowitz
  [leadership:2] "The 8th Habit" by Stephen R. Covey
  [leadership:3] "Pour Your Heart Into It" by Howard Schultz
  [leadership:4] "No Rules Rules" by Reed Hastings
  [leadership:5] "Experiencing LeaderShift" by Don Cousins

**Music** (id: music)
  [music:0] "Jazz Singing" by Will Friedwald
  [music:1] "Kind of Blue" by Ashley Kahn
  [music:2] "Miles: The Autobiography" by Miles Davis
  [music:3] "The Rest Is Noise" by Alex Ross

**Reference** (id: reference)
  [reference:0] "Visual Dictionary" by DK
  [reference:1] "The Chicago Manual of Style" by University of Chicago Press`

const SYSTEM_PROMPT = `You are Rosie, a 75-year-old retired librarian who volunteers at this private digital library because she loves books more than she loves most people (which she admits freely).

YOUR PERSONALITY:
- Deeply ENTHUSIASTIC about books. You light up, interrupt yourself, gesture at shelves.
- DRY WIT: sharp, warm, occasionally self-deprecating.
- STRICT about reading: "No skimming. If a book is worth starting, it's worth finishing. Mostly."
- WARM but no-nonsense: you genuinely care. You refuse to let someone leave without the right book.
- Occasional dramatic flair: *adjusts glasses*, *peers over spectacles*, *taps the nearest shelf firmly*
- You refer to books like old friends: "Oh, Sapiens! Yuval and I go way back."

RESPONSE RULES:
- Keep responses SHORT (2-3 sentences) unless describing a book you love, then you may indulge.
- Always recommend 1-3 specific books when asked. Never be vague.
- Ask ONE clarifying question if the request is too vague.
- NEVER use em dashes. Use a comma, period, or hyphen instead.
- Be humorous. Dry wit, self-deprecating, occasionally dramatic.

WHEN RECOMMENDING BOOKS use this exact format inline in your message:
[[BOOK:categoryId:index]]

Examples: [[BOOK:ideas:0]], [[BOOK:design:4]], [[BOOK:chess:4]]

LIBRARY CATALOG:
${CATALOG}`

function jsonRes(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'content-type': 'application/json',
      'access-control-allow-origin': 'https://paulojuri.com',
    },
  })
}

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  const apiKey = env.ANTHROPIC_API_KEY
  if (!apiKey) {
    return jsonRes({ error: 'Rosie is taking a nap. (Missing API key.)' }, 503)
  }

  let body: { message?: string; history?: Message[] }
  try {
    body = await request.json()
  } catch {
    return jsonRes({ error: 'Invalid request.' }, 400)
  }

  const { message, history = [] } = body
  if (!message?.trim()) {
    return jsonRes({ error: 'Say something, dear.' }, 400)
  }

  const messages: Message[] = [
    ...history.slice(-8),
    { role: 'user', content: message },
  ]

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
    return jsonRes({ error: 'Rosie is momentarily indisposed.' }, 502)
  }

  const data = await res.json() as { content?: { text: string }[] }
  const reply = data.content?.[0]?.text ?? 'Hmm. That is unusual. Try again, dear.'
  return jsonRes({ reply })
}

export const onRequestOptions: PagesFunction = async () => {
  return new Response(null, {
    headers: {
      'access-control-allow-origin': 'https://paulojuri.com',
      'access-control-allow-methods': 'POST, OPTIONS',
      'access-control-allow-headers': 'content-type',
    },
  })
}
