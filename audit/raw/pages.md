# Internal Pages — Raw Content Capture
Fetched: 2026-05-22

---

## /work — Work page

**Title:** "Work · Paul Ojuri"
**Meta description:** "Selected projects: browser extensions, SaaS products, editorial websites, and more."
**H1:** "Products, tools, and systems I've built, shipped, or contributed to since 2020."
  - font-size: clamp(1.1rem, 2vw, 1.5rem) — noticeably small for an h1
  - Eyebrow: "Selected work" label-caps, text-muted

**Stats strip:** "{n} projects" | "{n} live" (colored by first featured project's accent)

**Hero card (first featured project = Prism):**
- Split layout: left dark editorial panel + right solid accent-color block (hidden on mobile)
- Left panel (bg: --ink):
  - Ghost "01" number, color: #7C3AED, opacity 0.07
  - Status dot (green) + "Product · Browser Extension · Live"
  - H2: "Prism" — clamp 2.75rem–5.5rem, -0.055em, lineHeight 0.95, color: --paper
  - Tagline: "Privacy-first browsing analytics. Your data, finally yours."
  - Stack tags: Chrome MV3, TypeScript, React, Node.js, Supabase
  - CTA: "View case study →" colored #7C3AED
  - Year: "2025"
- Right panel (bg: #7C3AED): decorative ghost text "Prism" vertical writing mode; "2025 · Product Engineer & Founder" bottom label

**Secondary featured cards (Alfera, ApplyAI — 2-column grid):**
Each card:
- Color-block top (220px): project's accent color, ghost project name in large text
- Number badge top-left, status badge top-right
- Below: H2 title + tagline + stack tags + category + year →

**Other work (table, 3 projects):**
Column headers: #, Project, Category, Year, Status
Rows:
- CarbonWise (2024) | Product · SaaS | Shipped | accent: #0891B2
- Virtual PO (2024) | Product · AI · SaaS | Shipped | accent: #B45309
- Nigeria EMR (2023) | Product · Healthcare · Web | Shipped | accent: #059669

**Footer strip:** "6 projects since 2020 · 3 still live" | "Start a project →" → /contact

---

## /about — About page

**Title:** "About · Paul Ojuri"
**Meta description:** "Product engineer and designer. Six years building across fintech, healthtech, and consumer software."
**H1:** "I make software that feels like it was made for humans."
  - "for humans." in --accent italic
  - Dark (--ink) opening section
  - Eyebrow: "Paul Ojuri" left, "Turnhout, Belgium" right

**Body copy (2 columns on --ink bg):**
- "Six years building across fintech, healthtech, and consumer software. I work across the full stack, from the first wireframe to production infrastructure, with a preference for early-stage work where every decision still matters."
- "I care about the craft. Not as an aesthetic preference but as a practical bet: software that feels right gets used. Software that doesn't, doesn't."

**Stats row (4 cells, bg: --paper separated by 1px --subtle gaps):**
- 6+ / Years building
- 20+ / Projects shipped
- 4 / Countries
- 100% / Client ownership
- Animated counters via AnimatedCounter component

**Experience timeline (vertical dot timeline):**
1. 2025–now | Prism | Founder | "Building a privacy-first browsing analytics extension. MV3, on-device classification, encrypted sync." | color: #7C3AED
2. 2024–25 | Freelance | Product Engineer & Designer | "Independent work across hardware brands, climate tech, and AI tooling. Clients in Nigeria, Belgium, and Switzerland." | color: #C8553D
3. 2023–24 | CarbonWise | Lead Product Engineer | "Built the core product from scratch: carbon tracking, offset marketplace, SME onboarding flow." | color: #059669
4. 2022–23 | Healthcare NGO | Product & Engineering Lead | "Offline-first EMR for Nigerian primary health centres. IndexedDB sync, PWA, designed for 2G and intermittent power." | color: #0891B2
5. 2020–22 | Early career | Software Engineer | "Full-stack roles across fintech and e-commerce. Learned what shipping to real users actually means." | color: #B45309

**Capabilities section (bg: --cream):**
- Engineering: TypeScript, React, Next.js, Node.js, PostgreSQL, Supabase, Chrome MV3, PWA, Cloudflare Workers, WebGL
- Design: UX research, Information architecture, Interaction design, Figma, Design systems, Typography
- Strategy: Product strategy, Technical consulting, Systems design, AI integrations, Due diligence

**How I work (3 principles, alternating centered layout):**
1. "Clarity before code" — "A week spent understanding the problem saves a month of refactoring. I ask more questions than most engineers and fewer than most consultants."
2. "Ship something real" — "Prototypes lie. The only honest feedback is from something a real person used to do a real thing. I bias toward getting something in front of users early."
3. "Own the outcome" — "I take responsibility for product decisions, not just implementation. If a feature I built isn't working, that's my problem too."

**Closing CTA (dark):**
- "If you've read this far, we're probably a good fit." — "a good fit." in --accent italic
- "Get in touch →" → /contact
- "See my work →" → /work

---

## /services — Services page

**Title:** "Services · Paul Ojuri"
**Meta description:** "Product engineering, UX design, and technical consulting for early-stage teams."
**H1:** "What I do, and how." — text-heading class (clamp 2.75rem–5.5rem)
  - "and how." in `<em>`
- Right column subtext: "A small number of projects at a time, from first conversation to launch. No hand-offs to a junior team halfway through."
- Instruction: "Hover a service to preview it →" (visible only on desktop, label-caps text-subtle)

**Interactive service rows (ServicesShowcase component, 4 rows):**
Each row has: giant chapter number, label, H2 title, "good for" line (on hover), rotating arrow

01 — Product engineering | Engineering | "I build your idea into real, working software — website, app, or tool. You bring the vision, I handle the code and make sure it actually ships."
  - Deliverables: A real product you can show users; Clean code, no shortcuts; Set up and ready to launch; Handoff or ongoing support
  - Good for: "You have an idea but no product yet"
  - Hover: bg #EFF6FF, accent #1D4ED8

02 — Product design | Design | "I figure out how your product should look and feel, then design every screen so it's easy to use and nice to look at. No confusing layouts, no guessing."
  - Deliverables: Finding out what your users actually need; Mockups of every screen; A consistent look and feel; Click-through prototypes
  - Good for: "Your app looks rough or feels confusing to use"
  - Hover: bg #FFF5F3, accent #C8553D

03 — Technical consulting | Consulting | "Not sure why things are slow, breaking, or hard to build on? I look under the hood, tell you exactly what's wrong, and give you a clear plan to fix it."
  - Deliverables: Plain-English report; Clear fix priority plan; Second opinion on process; Help choosing tools
  - Good for: "Something is broken and you're not sure why"
  - Hover: bg #ECFDF5, accent #059669

04 — Editorial web | Editorial | "A custom website built just for you — not a template, not a drag-and-drop builder. Something that actually reflects who you are and loads fast on any device."
  - Deliverables: Custom website from scratch; Easy to update; SEO + performance; Optional monthly maintenance
  - Good for: "You need a website that actually stands out"
  - Hover: bg #F5F3FF, accent #7C3AED

**Note:** No pricing shown anywhere. No CTA button at the bottom of the services page. The floating cursor preview card is desktop-only.

---

## /contact — Contact page

**Title:** "Contact · Paul Ojuri"
**Meta description:** "Let's work together. Tell me about your project and I'll get back to you within a day or two."
**H1:** "Let's build something good."
  - "something good." in --accent italic
  - clamp(3.5rem, 10vw, 8.5rem), -0.06em tracking, lineHeight 0.92
  - Inline: hello@paulojuri.com + LinkedIn →

**Body copy:** "Tell me what you're working on. I read every message and reply within a day."

**Contact form (ContactForm component, on --cream bg):**
Fields:
- Name (id="cf-name", required, type=text, autoComplete=name)
- Email (id="cf-email", required, type=email, autoComplete=email)
- What's this about? (id="cf-subject", required)
- Message (id="cf-message", required, textarea rows=5)
- Honeypot: hidden `_h` input, tabIndex=-1
- Submit: "Send message →" pill, bg --accent
- Alternative: "or email directly" → mailto:hello@paulojuri.com

**FAQ (dl/dt/dd):**
01. "How quickly do you reply?" — "Within one business day. I'll usually suggest a short call to talk through the details."
02. "Do you work with clients outside Belgium?" — "Yes. Most of my work is remote. I've worked with teams in Nigeria, Switzerland, Germany, and the Netherlands."
03. "What's your minimum engagement?" — "No hard minimum. A focused two-week audit can be as valuable as a six-month build. Tell me what you need and we'll figure out what makes sense."
04. "Do you do equity or deferred payment?" — "Occasionally, for the right project. It has to be something I genuinely believe in."

**Availability strip:**
- Green dot + "Available for new projects from Q3 2026"
- "Response time: < 24 hours"

---

## /journal — Journal page

**Title:** "Journal · Paul Ojuri"
**Meta description:** "Writing on product, design, engineering, and building things people actually use."
**H1:** (rendered inside JournalMasthead component — "Journal")

7 posts listed. Rendered by JournalMasthead component with tag filtering.

Posts:
1. "The AI That Forgets You" | Apr 23, 2026 | 8 min | "Every AI assistant you've used starts fresh each conversation. Ad networks have had an uninterrupted record of you for 20 years."
2. "The Prompt You Never Typed" | Apr 16, 2026 | 9 min | "Your browser history is the richest context document that exists about you."
3. "The Cookie Banner Comedy: A Dark Pattern in Three Acts" | Apr 9, 2026 | 8 min | "GDPR gave Europeans the legal right to say no to tracking."
4. "Your Browser is a Stock Exchange (And You're Not the Trader)" | Apr 3, 2026 | 9 min | "Every time you load a webpage, an invisible auction runs in under 100ms."
5. "Why privacy is a design problem" | Apr 14, 2025 | 7 min | "Privacy tools have a user experience problem."
6. "On building in public without burning out" | Mar 2025 | 5 min
7. "The product engineer is not a myth" | Feb 2025 | 6 min

---

## /library — Library page

**Title:** "Library · Paul Ojuri"
**Meta description:** "Books I've read, am reading, or keep on the shelf because they earned the space."
**H1:** "165 books, 11 shelves." — "11 shelves." in `<em>`
  - text-heading class

**Intro text:** "Books I've read, am reading, or keep around because they changed how I think about something. No ratings. If it's here, it was worth the time."

**CTA:** "Walk in →" → /library/walk (accent pill button, leads to 3D WebGL library experience)

**Jump nav:** links to all 11 category anchors

**11 shelves (BookShelf component):**
1. Ideas & Society (15 books) — "Books that changed how I think about people, systems, and what's possible."
2. Design (15 books) — "How things are shaped, why that matters, and the invisible decisions behind every object."
3. Product & Strategy (15 books) — "The craft of deciding what to build and why."
4. Engineering & Systems (15 books) — "How to build things that last, scale, and don't quietly rot."
5. Technology & Future (15 books) — "The arc of computing."
6. Chess (15 books) — "The game that taught me how to think about positions, plans, and patience."
7. Fiction (15 books) — "Novels I've read and ones on the to-read pile. Mostly thrillers and crime."
8. History & Conflict (15 books) — "Mostly 20th century — war, intelligence, and the machinery of states."
9. Leadership & Business (15 books) — "The ones that earned their place by being specific, not by being motivational."
10. Music (15 books) — "Jazz lives here."
11. Reference (15 books) — "Things I reach for, not read cover to cover."

**Footer note:** "Hover a spine to see the book. Affiliate links coming soon. Updated as I finish things."

---

## /library/walk — 3D Library walk (bonus page)

Interactive WebGL 3D room (Three.js / @react-three/fiber). Features:
- 3D bookshelf room with camera navigation (CameraRig)
- Book3D components with hover-to-see-spine interaction
- RosieCharacter — an AI character ("Rosie") with dialog tree
- RosieDialog — chat UI for Rosie (powered by /api/rosie route)
- Atmosphere, Lights, PostProcessing (bloom/DOF effects)
- SoundController with Howler.js audio
- Preloader with GPU tier detection
- BookViewer panel when a book is selected

---

## /robots.txt

```
User-Agent: *
Allow: /
Disallow: /api/
Disallow: /design-system

User-Agent: GPTBot
Allow: /

User-Agent: ClaudeBot
Allow: /

User-Agent: Applebot-Extended
Allow: /

User-Agent: PerplexityBot
Allow: /

Sitemap: https://paulojuri.com/sitemap.xml
```

---

## /sitemap.xml

24 URLs total. Priority structure:
- / — 1.0
- /work — 0.9
- /journal, /work/[slug] pages — 0.8
- /journal/[slug], /library, /about, /services, /contact — 0.7

All entries share lastmod: 2026-05-27 (static, not auto-generated from file dates).

Work slugs: alfera, applyai, carbonwise, nigeria-emr, prism, virtual-po
Journal slugs: building-in-public, the-ai-that-forgets-you, the-cookie-banner-comedy, the-product-engineer, the-prompt-you-never-typed, why-privacy-is-a-design-problem, your-browser-is-a-stock-exchange
