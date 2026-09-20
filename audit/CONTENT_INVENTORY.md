# Content Inventory — paulojuri.com
Phase 0 · May 2026
Primary language: **English**

---

## Site Map

| Route | Type | Status |
|---|---|---|
| `/` | Home | Live |
| `/work` | Portfolio index | Live |
| `/work/prism` | Case study | Live |
| `/work/alfera` | Case study | Live |
| `/work/applyai` | Case study | Live |
| `/work/carbonwise` | Case study | Live |
| `/work/virtual-po` | Case study | Live |
| `/work/nigeria-emr` | Case study | Live |
| `/journal` | Journal index | Live |
| `/journal/the-ai-that-forgets-you` | Article | Live |
| `/journal/the-prompt-you-never-typed` | Article | Live |
| `/journal/the-cookie-banner-comedy` | Article | Live |
| `/journal/your-browser-is-a-stock-exchange` | Article | Live |
| `/journal/why-privacy-is-a-design-problem` | Article | Live |
| `/journal/building-in-public` | Article | Live |
| `/journal/the-product-engineer` | Article | Live |
| `/services` | Services | Live |
| `/about` | Bio | Live |
| `/contact` | Contact | Live |
| `/library` | Book library | Live |
| `/library/walk` | 3D room (WebGL) | Live |

---

## Global Navigation

Desktop nav links: **Work · Services · Journal · Library · About · Contact**

Brand: **Paul Ojuri** (with sub-label "home")
Footer social: **GitHub · LinkedIn**
Email: **hello@paulojuri.com**

---

## `/` — Homepage

### Marquee / status ticker
> Currently building Prism, a privacy-first browser analytics extension ◆ Available for product design & engineering work ◆ Based in Belgium · Working globally ◆ Interested in AI, privacy tech, and spatial computing

### Hero
- **Headline:** "Building at the *intersection* of code, craft, and culture."
- **Subline:** "Product engineer and designer. I turn ambiguous ideas into software people actually want to use."
- **CTA 1:** "View work →"
- **CTA 2:** "Get in touch"

### Selected Work section
- **Section label:** "Selected work"
- **Link:** "All projects →"

Featured projects (3 rows):
1. **Prism** — "Privacy-first browsing analytics. Your data, finally yours." — Product · Browser Extension · 2025 · Live
2. **Alfera Technik** — "Nigeria's laptop brand, built for the world." — Web · Brand · E-commerce · 2025 · Live
3. **ApplyAI** — "One profile, every ATS. Claude writes the rest, in your tone." — Product · Browser Extension · 2025 · Live

### About teaser
- **Headline:** "Engineer by training, *designer by conviction.*"
- **Body 1:** "I build products end-to-end, from the first sketch to production code. Six years of shipping across fintech, healthtech, and consumer apps."
- **Body 2:** "I care about the details most people ship past."
- **Stats:** 6+ Years building · 20+ Projects shipped

### Journal teaser
- **Latest 3 posts:**
  - "The AI That Forgets You" — Apr 2026, 8 min
  - "The Prompt You Never Typed" — Apr 2026, 9 min
  - "The Cookie Banner Comedy: A Dark Pattern in Three Acts" — Apr 2026, 8 min

### Contact CTA
- **Headline:** "Have a project *in mind?*"
- **Sub-copy:** "Tell me what you're building. I read every message and reply within a day."
- **Meta:** "Response time: < 24 hours" · "hello@paulojuri.com"
- **Availability strip:** "Available for new projects from Q3 2026" · "Turnhout, Belgium · Remote-friendly"

---

## `/work` — Portfolio Index

**H1:** "Products, tools, and systems I've built, shipped, or contributed to since 2020."

**Stats:** 6 projects · 3 live

### Featured Projects

**01 — Prism** · Live
- Category: Product · Browser Extension
- Stack: Chrome MV3, TypeScript, React, Node.js, Supabase
- Tagline: "Privacy-first browsing analytics. Your data, finally yours."
- Year: 2025

**02 — Alfera Technik** · Live
- Category: Web · Brand · E-commerce
- Stack: HTML, CSS, JavaScript, Cloudflare Pages
- Tagline: "Nigeria's laptop brand, built for the world."
- Year: 2025

**03 — ApplyAI** · Live
- Category: Product · Browser Extension
- Stack: Chrome MV3, TypeScript, React, Claude AI
- Tagline: "One profile, every ATS. Claude writes the rest, in your tone."
- Year: 2025

### Other Work (table)

| # | Name | Category | Year | Status |
|---|---|---|---|---|
| 04 | CarbonWise | Product · SaaS | 2024 | Shipped |
| 05 | Virtual PO | Product · AI · SaaS | 2024 | Shipped |
| 06 | Nigeria EMR | Product · Healthcare · Web | 2023 | Shipped |

**Footer strip:** "[N] projects since 2020 · [N] still live" · "Start a project →"

---

## `/work/prism` — Prism Case Study

**Role:** Founder · Product · Engineering · Design
**Year:** 2025
**Status:** Live
**Stack:** Chrome MV3, TypeScript, React, Node.js, Supabase, Cloudflare Workers

### The Problem
> "Every page you visit drops trackers that build a profile of who you are — your interests, habits, health concerns, finances — and sells it to anyone willing to pay."

> "Every browser extension that calls itself 'privacy-first' still phones home. Tracking blockers log what they block."

> "I wanted a tool that told me how I actually spend time online, without trading that information to anyone."

### What Prism Does
> "Prism captures your browser data first, encrypts it in a wallet only you own, and uses AI to turn it into clarity and control."

**Key stats:**
- 150+ trackers identified across advertising, analytics, social, fingerprinting, marketing
- 10 signals captured per page: URL, title, time spent, scroll depth, topics, category, cookies, tracker signals
- 0 raw data sent to AI
- AES-256 wallet encryption with PBKDF2 key derivation

### How It Works (7 steps)
1. Install Chrome extension
2. Complete GDPR consent flow
3. Create dashboard account
4. Generate sync token
5. Paste token into extension
6. Browse normally
7. Open wallet and review insights

### Features
Cookie transparency · Consent Control Centre · Your data wallet · AI assistant (powered by Claude) · Per-site profiles · On-device classification · Blocking engine · Fingerprint shield

### Process
> "The first version took three weeks... I shipped it to five people I trusted to tell me when it broke."

> "The hardest part was the consent model... Getting that UX right took longer than the blocking engine itself."

### Privacy Commitments
> "All browsing data is stored in your personal encrypted wallet. Never sold, shared, or used for advertising."

### What I Learned
> "Browser extensions in Manifest V3 are genuinely hostile to privacy tooling."

> "Building in public is a forcing function. Having five real users in week one meant I couldn't hide behind 'it's not ready yet.'"

**Next project:** Alfera Technik

---

## `/work/alfera` — Alfera Technik Case Study

**Role:** Design · Engineering · Brand Direction
**Year:** 2025
**Client:** Alfera Technik
**Status:** Live
**Stack:** HTML, CSS, JavaScript, Cloudflare Pages, PyMuPDF

### The Brief
> "Alfera makes laptops, tablets, smartphones, and TVs — designed in Nigeria, built for a global market. They needed a digital presence that matched their ambition: not a 'made in Africa' story, but a premium tech brand that happened to be African-led."

> "The brief had one clear instruction: no compromises on quality. This site had to stand next to Apple and Nothing without flinching."

### The Design Direction
> "The palette is graphite and gold — dark backgrounds that make product photography pop, gold accents that reference craft without kitsch. Typography runs Syne for display and DM Sans for body: confident, geometric, contemporary."

> "Every section was designed to work at two speeds: a three-second scroll for someone browsing on mobile, and a fifteen-minute read for a buyer doing due diligence before a $600 purchase."

### Product Documentation
> "Four product PDFs totalling 200+ pages. I built a Python pipeline using PyMuPDF to extract every product image, filtered by dimension to remove UI chrome and icons, and organised the output into per-model directories."

### The Transfer
> "The site launched on Cloudflare Pages, then migrated from paulojuri.com/alfera to its own domain at alferatechnik.com."

### What I Learned
> "Product websites for hardware are a different problem to SaaS. The customer is making a considered purchase. Every word and image either builds or erodes confidence. Removing three bad photos did more for conversion than adding ten good ones."

**Next project:** ApplyAI

---

## `/work/applyai` — ApplyAI Case Study

**Role:** Founder · Product · Engineering · Design
**Year:** 2025
**Status:** Live
**Stack:** Chrome MV3, TypeScript, React, Claude AI, Anthropic SDK

### The Problem
> "Searching for a job is a full-time job. The same fields on different platforms. Open-ended questions that deserve real thought but arrive at the end of your tenth form today. Applications that vanish into silence with no way to track, follow up, or prepare when they do call back."

> "The average job application takes 47 minutes. Most of that time is spent copy-pasting the same information your CV already contains, into forms that weren't designed to make it easy."

**Three pain points:**
- **Form fatigue:** "Name, email, phone, address, LinkedIn, work authorisation — typed from scratch on every platform. Workday alone has 30 fields before you get to the interesting part."
- **Answering blind:** "'Why do you want to work here?' You have 200 words and no context about whether this role even fits your background."
- **The application black hole:** "You apply, then nothing. No system for follow-ups, no pipeline to track stages, no interview prep when they do call."

### What ApplyAI Does
> "ApplyAI fills every application field, scores your fit before you apply, tracks every stage in a Kanban pipeline, writes your follow-ups, and preps you for interviews. The whole job search, in one extension."

**Key stats:**
- 12+ ATS platforms supported (Workday, Greenhouse, Lever, Ashby, and more)
- 30+ field type classifiers
- 6 pipeline stages tracked automatically from Saved to Offer
- 0 servers that see your profile — it stays on your machine

### How It Works (5 steps)
1. Build your profile once (5 min onboarding)
2. See your fit before you apply (fit score + red flags)
3. Fill the form and submit (Click Fill All; Claude writes open-ended answers)
4. Track every stage (Kanban CRM, 6 stages)
5. Walk into the interview ready (AI mock interviewer)

### Features
Smart autofill · Application pipeline · Intelligence layer (fit score, answer generation, tone modes) · Interview prep · Follow-up composer

### Privacy
> "Your profile, experience bank, pipeline, and application history are stored in Chrome's local extension storage. Nothing is sent to an ApplyAI server. There isn't one."

> "AI requests go directly from your browser to Anthropic using your own Claude API key. No proxy, no middleman."

### Pricing
- **Free:** Standard autofill unlimited, pipeline up to 10 applications, 3 AI answers/month
- **Pro $12/mo:** Unlimited AI answers, full pipeline CRM, fit scoring, interview prep, follow-up composer, analytics
- **Lifetime $149:** Everything in Pro, forever

**Next project:** CarbonWise

---

## `/work/carbonwise` — CarbonWise Case Study

**Role:** Product · Full-stack Engineering · UX
**Year:** 2024
**Status:** Shipped
**Stack:** React, Node.js, PostgreSQL, Chart.js, Stripe, REST APIs

### Context
European SMEs face pressure to report emissions across multiple scopes. Existing tools target large compliance teams. CarbonWise addressed smaller operations.

### The Product
A web dashboard enabling SMEs to connect data sources (energy bills, fleet records, supply chain invoices) and receive granular emission footprints. Core workflow: connect → measure → reduce → offset, with integrated carbon credit marketplace. Goal: complete the cycle in one quarterly session.

### The Hard Parts
- **Data normalisation:** Energy bills in 17 European formats; fleet data across spreadsheets and APIs. Built flexible ingest layer handling CSV, API, manual entry.
- **Explaining uncertainty:** Emission factors have ranges; communicating uncertainty without decision paralysis.
- **Scope 3 complexity:** Upstream/downstream emissions require supplier data rarely available; scoped to "best available estimate" with transparency.

### Outcome
Deployed to 12 pilot companies across Belgium, Netherlands, and Germany. Average first-login session: 24 minutes.

---

## `/work/virtual-po` — Virtual PO Case Study

**Role:** Product · Full-stack Engineering
**Year:** 2024
**Status:** Shipped
**Stack:** Next.js, TypeScript, OpenAI API, Supabase, Vercel

### The Problem
Early-stage companies typically lack dedicated PMs. Virtual PO explored whether AI could handle administrative work — converting interviews into prioritized features and identifying conflicts.

### What It Does
Accepts raw materials (transcripts, tickets, call notes) and generates structured outputs: RICE-scored candidates, draft stories, dependency maps for PM review.

### Technical Approach
Staged processing: extract → classify → score → draft. Each stage uses separate LLM calls with constrained schemas.

### Lessons
> "AI-generated artefacts need human seams. The product succeeded when users controlled outputs as high-quality drafts rather than finished decisions. Features reducing user agency (bulk approval, auto-merge) faced consistent rejection despite accuracy."

---

## `/work/nigeria-emr` — Nigeria EMR Case Study

**Role:** Product · Design · Engineering
**Year:** 2023
**Status:** Shipped
**Stack:** React, IndexedDB, Service Workers, Node.js, PostgreSQL, PWA

### The Constraint
> "Nigerian primary health centres handle 80–200 patients daily. Many operate on generator power that fails unpredictably, with connectivity between 2G and nothing. Paper remains the primary record-keeping method."

### The Product
A PWA supporting patient registration, consultation recording, drug dispensing, and basic reporting. Built for clinical officers and nurses without prior software experience.

Interface requirements: single-handed operation (pen in other hand), legibility in direct sunlight on budget Android tablets, data persistence if forms close mid-entry.

### Offline Architecture
Patient records write immediately to IndexedDB. Service worker manages sync queues with local timestamps and pending flags. When connectivity restores, records synchronize in order. Conflicts use last-write-wins with merge logging.

Drug dispensing: optimistic dispensing (allowing transactions flagged for reconciliation) rather than blocking on connectivity — deliberate clinical tradeoff documented with facility management.

### What I Learned
> "Unreliable infrastructure demands rigorous design decisions; complexity cannot hide behind interface refresh. Every edge case requires intentional design, not assumption."

> "The sync status indicator in screen corners became the most trusted interface element. Users reported confidence in data safety despite inconsistent connectivity."

---

## `/services` — Services

**H1:** "What I do, *and how.*"
**Sub-copy:** "A small number of projects at a time, from first conversation to launch. No hand-offs to a junior team halfway through."
**Hover hint:** "Hover a service to preview it →"

### 01 — Product Engineering
> "I build your idea into real, working software — website, app, or tool. You bring the vision, I handle the code and make sure it actually ships."
- **Good for:** "You have an idea but no product yet"
- **Deliverables:** A real product you can show users · Clean code, no shortcuts · Set up and ready to launch · Handoff or ongoing support — your choice

### 02 — Product Design
> "I figure out how your product should look and feel, then design every screen so it's easy to use and nice to look at. No confusing layouts, no guessing."
- **Good for:** "Your app looks rough or feels confusing to use"
- **Deliverables:** Finding out what your users actually need · Mockups of every screen · A consistent look and feel across the whole product · Click-through prototypes for testing

### 03 — Technical Consulting
> "Not sure why things are slow, breaking, or hard to build on? I look under the hood, tell you exactly what's wrong, and give you a clear plan to fix it."
- **Good for:** "Something is broken and you're not sure why"
- **Deliverables:** A plain-English report of what's working and what isn't · A clear plan for what to fix first · A second opinion on your team's process · Help choosing the right tools

### 04 — Editorial Web
> "A custom website built just for you — not a template, not a drag-and-drop builder. Something that actually reflects who you are and loads fast on any device."
- **Good for:** "You need a website that actually stands out"
- **Deliverables:** A website built from scratch, designed for you · Easy to update yourself (or I can do it) · Shows up on Google, loads fast · Optional monthly maintenance

### CTA Section
> "Most projects begin with a short discovery call. Tell me what you're building."
- Button: "Get in touch →"
- Email: hello@paulojuri.com

---

## `/about` — About

**H1:** "I make software that feels like it was made for humans."

### Body Copy
> "Six years building across fintech, healthtech, and consumer software. I work across the full stack, from the first wireframe to production infrastructure, with a preference for early-stage work where every decision still matters."

> "I care about the craft. Not as an aesthetic preference but as a practical bet: software that feels right gets used. Software that doesn't, doesn't."

### Stats
- 6+ Years building
- 20+ Projects shipped
- 4 Countries
- 100% Client ownership

### Experience
| Period | Company | Role | Description |
|---|---|---|---|
| 2025–now | Prism | Founder | Building a privacy-first browsing analytics extension. MV3, on-device classification, encrypted sync. |
| 2024–25 | Freelance | Product Engineer & Designer | Independent work across hardware brands, climate tech, and AI tooling. Clients in Nigeria, Belgium, and Switzerland. |
| 2023–24 | CarbonWise | Lead Product Engineer | Built the core product from scratch: carbon tracking, offset marketplace, SME onboarding flow. |
| 2022–23 | Healthcare NGO | Product & Engineering Lead | Offline-first EMR for Nigerian primary health centres. IndexedDB sync, PWA, designed for 2G and intermittent power. |
| 2020–22 | Early career | Software Engineer | Full-stack roles across fintech and e-commerce. Learned what shipping to real users actually means. |

### Skills
- **Engineering:** TypeScript, React, Next.js, Node.js, PostgreSQL, Supabase, Chrome MV3, PWA, Cloudflare Workers, WebGL
- **Design:** UX research, Information architecture, Interaction design, Figma, Design systems, Typography
- **Strategy:** Product strategy, Technical consulting, Systems design, AI integrations, Due diligence

### Principles
**Clarity before code:** "A week spent understanding the problem saves a month of refactoring. I ask more questions than most engineers and fewer than most consultants."

**Ship something real:** "Prototypes lie. The only honest feedback is from something a real person used to do a real thing. I bias toward getting something in front of users early."

**Own the outcome:** "I take responsibility for product decisions, not just implementation. If a feature I built isn't working, that's my problem too."

### CTAs
"Get in touch →" · "See my work →"

---

## `/contact` — Contact

**H1:** "Let's build something good."

**Body:** "Tell me what you're working on. I read every message and reply within a day."

**Email:** hello@paulojuri.com

### Form Fields
Name · Email · What's this about? (optional) · Message · [Send message →]

### FAQ
**01. How quickly do you reply?**
"Within one business day. I'll usually suggest a short call to talk through the details."

**02. Do you work with clients outside Belgium?**
"Yes. Most of my work is remote. I've worked with teams in Nigeria, Switzerland, Germany, and the Netherlands."

**03. What's your minimum engagement?**
"No hard minimum. A focused two-week audit can be as valuable as a six-month build. Tell me what you need and we'll figure out what makes sense."

**04. Do you do equity or deferred payment?**
"Occasionally, for the right project. It has to be something I genuinely believe in."

### Availability
"Available for new projects from Q3 2026" · "Response time: < 24 hours"

---

## `/journal` — Journal Index

7 articles total.

| Title | Date | Read | Tags |
|---|---|---|---|
| The AI That Forgets You | Apr 23, 2026 | 8 min | ai, privacy, memory |
| The Prompt You Never Typed | Apr 16, 2026 | 9 min | ai, privacy, data |
| The Cookie Banner Comedy: A Dark Pattern in Three Acts | Apr 9, 2026 | 8 min | privacy, consent, ux |
| Your Browser is a Stock Exchange (And You're Not the Trader) | Apr 3, 2026 | 9 min | privacy, ad-tech, tracking |
| Why privacy is a design problem | Apr 14, 2025 | 7 min | privacy, design, product |
| On building in public without burning out | Mar 21, 2025 | 5 min | indie, building, mental health |
| The product engineer is not a myth | Feb 8, 2025 | 6 min | product, engineering, career |

### Article excerpts

**The AI That Forgets You:** "Every AI assistant you've used starts fresh each conversation. Ad networks have had an uninterrupted record of you for 20 years. That gap is not an accident."

**The Prompt You Never Typed:** "Your browser history is the richest context document that exists about you. Ad networks have been reading it for decades. AI hasn't started yet."

**The Cookie Banner Comedy:** "GDPR gave Europeans the legal right to say no to tracking. The ad industry spent years making that right almost impossible to exercise."

**Your Browser is a Stock Exchange:** "Every time you load a webpage, an invisible auction runs in under 100ms. Hundreds of companies bid on you. You don't get a cut."

**Why privacy is a design problem:** "Privacy tools have a user experience problem. Until we fix that, we'll keep building things nobody uses."

---

## `/library` — Book Library

**165 books across 11 shelves**

**CTA:** "Walk in →" (links to `/library/walk`, a WebGL 3D room)

### Shelves
1. Ideas & Society
2. Design
3. Product & Strategy
4. Engineering & Systems
5. Technology & Future
6. Chess
7. Fiction
8. History & Conflict
9. Leadership & Business
10. Music
11. Reference

*(Full book list preserved in source file at `src/lib/library.ts`)*

---

## Contact & Identity

- **Email:** hello@paulojuri.com
- **Location:** Turnhout, Belgium
- **Remote:** Yes, works globally
- **Availability:** Q3 2026
- **Response time:** < 24 hours
- **GitHub:** paulojuri
- **LinkedIn:** paulojuri
- **Live URL:** https://paulojuri.com
