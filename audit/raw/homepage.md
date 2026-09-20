# Homepage — Raw Content Capture
URL: https://paulojuri.com/
Fetched: 2026-05-22

---

## Meta

- **Title:** Paul Ojuri, Product Engineer & Designer
- **Meta description:** "Product engineer and designer. I build software people actually want to use."
- **OG image:** /opengraph-image (1200×630, generated via Next.js route)
- **Twitter card:** summary_large_image, creator @paulojuri
- **JSON-LD schemas:** Person, WebSite (both injected via `<script type="application/ld+json">`)

---

## Navigation (fixed header, 64px height)

Left: "Paul Ojuri" (wordmark) + "home" subscript label
Right links (desktop, hidden on mobile):
- Work → /work
- Services → /services
- Journal → /journal
- Library → /library
- About → /about
- Contact → /contact

Mobile: hamburger (animated 3-bar → X), opens full-screen overlay with same links at text-4xl

---

## Hero section

- **Location badge:** pulsing dot + "Turnhout, Belgium · Open to collaborate" (label-caps, muted)
- **H1:** "Building at the intersection of code, craft, and culture."
  - "intersection" rendered in --accent (#C8553D), italic, font-sans
  - Two `<br className="hidden md:block" />` force-break after "intersection" and "craft,"
- **Subheading (p):** "Product engineer and designer. I turn ambiguous ideas into software people actually want to use."
- **Primary CTA:** "View work →" — inline-flex link to /work, bg: #C8553D, color: --paper, padding: 1rem 3.3rem, minHeight: 52px, box-shadow: 0 4px 20px rgba(200,85,61,0.28)
- **Secondary CTA:** "Get in touch" — Button component, variant="ghost", size="lg", href="/contact"
- **Section min-height:** 92vh

---

## Now Strip (marquee)

Scrolling ticker, 40s linear infinite, paused on prefers-reduced-motion:
1. "Currently building Prism, a privacy-first browser analytics extension"
2. "Available for product design & engineering work"
3. "Based in Belgium · Working globally"
4. "Interested in AI, privacy tech, and spatial computing"

Separator: ◆ diamond character (aria-hidden)

---

## Selected Work section

**Section header:** "Selected work" (h2, clamp 2rem–4rem, -0.05em tracking)
**Link:** "All projects →" → /work

Three projects displayed as list rows (`<ol>`). Each row:
- Hover fill: black background (--ink) fades in, text inverts to --paper tones
- Left stripe: 3px colored bar scales in on hover
- Index number (hidden desktop)
- Title link → /work/[slug]
- Status dot + label
- Tagline text
- Category, year (right column)
- "Case study →" label (appears on hover, colored by project)
- "Visit site ↗" (appears on hover, if productPageUrl exists)

Projects:
1. **Prism** (2025) — "Privacy-first browsing analytics. Your data, finally yours." | Product · Browser Extension | Live | accent: #7C3AED
2. **Alfera Technik** (2025) — "Nigeria's laptop brand, built for the world." | Web · Brand · E-commerce | Live | accent: #1D4ED8 (homepage) / #C9A84C (work page)
3. **ApplyAI** (2025) — "One profile, every ATS. Claude writes the rest, in your tone." | Product · Browser Extension | Live | accent: #C8553D

---

## About Teaser section

**Background:** --ink (dark)
**Eyebrow:** "About" label-caps, rgba(244,236,224,0.3)
**H2:** "Engineer by training, designer by conviction."
  - "designer by conviction." in --accent italic
- Para 1: "I build products end-to-end, from the first sketch to production code. Six years of shipping across fintech, healthtech, and consumer apps."
- Para 2: "I care about the details most people ship past."
  - Both paragraphs: rgba(244,236,224,0.5)
- Link: "More about me →" → /about, rgba(244,236,224,0.4)

Right column (hidden on mobile):
- Ghost "6+" number: rgba(244,236,224,0.04) — decorative only
- Stats:
  - "6+" / "Years building" (accent color)
  - "20+" / "Projects shipped" (accent color)

---

## Journal Teaser section

**H2:** "Journal" (same style as Selected Work header)
**Link:** "All essays →" → /journal

Three posts as list rows:
1. "The AI That Forgets You" | Apr 2026 | 8 min
2. "The Prompt You Never Typed" | Apr 2026 | 9 min
3. "The Cookie Banner Comedy: A Dark Pattern in Three Acts" | Apr 2026 | 8 min

Each row: hover fills --cream bg, left colored stripe, index number, title (h3), date (hidden mobile), reading time, → arrow (appears on hover)

---

## Contact CTA section

**Background:** --ink (dark)
**H2:** "Have a project in mind?" — clamp 3.5rem–7.5rem, -0.06em tracking, lineHeight 0.92
  - "in mind?" in --accent italic
- Email: hello@paulojuri.com (hover → accent)
- "Response time: < 24 hours" (rgba(244,236,224,0.2))
- Body copy: "Tell me what you're building. I read every message and reply within a day."

**Inline contact form (4 fields):**
- Name (id="cta-name", required)
- Email (id="cta-email", required, type=email)
- What's this about? (id="cta-subject", optional)
- Message (id="cta-message", required, textarea)
- Honeypot: hidden `_h` input
- Progress bar (visual only, aria-hidden): fills to 33/67/100% as Name/Email/Message filled
- Submit: "Send message →" pill button, bg: --accent
- Alternative: "or email directly" → mailto:hello@paulojuri.com

**Availability strip:**
- Green dot + "Available for new projects from Q3 2026"
- "Turnhout, Belgium · Remote-friendly"

---

## Footer

- "Paul Ojuri" link → /
- Nav links: Work, Services, Journal, Library, About, Contact
- Copyright: "© 2026 Paul Ojuri"
- Border-top: 1px solid --subtle
