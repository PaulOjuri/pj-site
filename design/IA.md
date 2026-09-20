# Information Architecture
paulojuri.com — Phase 3
Based on: audit/inventory.md, design/STRATEGY.md

---

## Sitemap — Current vs. Proposed

| URL | Current | Proposed | Change |
|-----|---------|----------|--------|
| `/` | Homepage | Homepage | No structural change. Hero copy tweak + section sequence tightened. |
| `/work` | Portfolio index | Portfolio index | H1 size fix. Footer CTA already exists — verify. |
| `/work/[slug]` | Case study | Case study | Add TestimonialCard + OutcomeMetric slots. No URL change. |
| `/about` | About | About | h2→h3 fix on experience/principle items. Social links in footer. |
| `/services` | Services (no CTA) | Services | Add ServicesCTA at bottom. Mobile "good for" text always visible. |
| `/contact` | Contact + FAQ | Contact + FAQ | Align Subject field with ContactCTA (make optional). |
| `/journal` | Journal index | Journal index | No change. |
| `/journal/[slug]` | Journal post | Journal post | No change. |
| `/library` | Book library | Book library | No change. |
| `/library/walk` | 3D room | 3D room | No change. |
| `/design-system` | Internal | Internal | Keep disallowed in robots.txt. No change. |

**No pages are being added, removed, or renamed.** All URLs stay the same. No redirects required.

---

## URL plan

All existing URLs preserved. No redirects needed.

The one structural question the audit surfaced: should `/services` and `/work` be combined, or should a "Hire me" landing page be added? Decision: **no**. The current separation is correct — work shows what has been built, services explains how to engage. The conversion gap is not structural (wrong pages) but executional (services page has no CTA, work page has a broken h1). Fix the execution, not the architecture.

---

## Page wireframes — text only

One bullet per section. Max two lines per bullet. Annotated with what changes vs. current.

---

### `/` — Homepage

```
HEADER
  Nav: [Paul Ojuri ◈] .......... [Work] [Services] [Journal] [Library] [About] [Contact →]

HERO
  [eyebrow] Turnhout, Belgium · Open to collaborate
  [h1] Building at the intersection of code, craft, and culture.
  [body] Product engineer and designer. I turn ambiguous ideas into software
         people actually want to use.
  [CTAs] [View work →]  [Get in touch]

  ← CHANGE: No image/card — copy column only, but hero is full-width now.
     The single-column hero is fine when the heading is at display scale
     and the subtext is lead-paragraph weight. It just needs to breathe.
     Add more vertical padding to the hero section so it owns the viewport.

NOW STRIP (dark)
  Scrolling ticker: current status items
  ← CHANGE: Add pause-on-hover. Fix duplicate aria reading.

SELECTED WORK
  [eyebrow] Selected work
  [h2] Three featured projects (Prism / Alfera / ApplyAI) as rows
  [footer] → All work
  ← No structural change. Fix WorkRow keyboard accessibility.

ABOUT TEASER (dark)
  [h2] "Engineer by training, designer by conviction."
  [2 paragraphs] Who Paul is + what he believes
  [stats sidebar] 6+ years · 20+ projects · 4 companies · 100% remote-capable
  [CTA] → About me
  ← CHANGE: Fix body text contrast (rgba opacity → fully opaque color).
     Stats need a brief qualifier: "unverified claims" are fine for a
     personal site but the formatting should signal confidence, not hype.

JOURNAL TEASER
  [eyebrow] Journal
  [h2] 3 recent posts as rows
  [footer] → All writing
  ← No change.

[section gap]

CONTACT CTA (dark)
  [h2] Have a project in mind?
  [body] Availability note
  Inline contact form: Name / Email / Subject / Message / [Send →]
  [bottom strip] Availability: Q3 2026 · hello@paulojuri.com
  ← CHANGE: Fix label contrast. Fix success-state focus. Make Subject optional
     (consistent with /contact form). Audit status dot vs. copy contradiction.

FOOTER
  [brand] Paul Ojuri ◈
  [nav] Work · Services · Journal · Library · About · Contact
  [social] ← ADD: GitHub · LinkedIn icons (P2 fix)
  [copyright] © 2026 Paul Ojuri
```

---

### `/work` — Portfolio index

```
HEADER (same nav)

MASTHEAD
  [eyebrow] Selected work
  [h1] Products, tools, and systems I've built or helped build.
  [stats] 6 projects · Since 2020
  ← CHANGE: Restore h1 to full heading size (clamp(2.75rem, 2rem + 3.75vw, 5.5rem)).
     The eyebrow must never be visually larger than the h1.

HERO CARD — Prism
  Dark/accent split card: project name, tagline, category, year, status
  [CTA] → View case study
  ← No structural change.

SECONDARY CARDS (2-up grid)
  Alfera card · ApplyAI card
  ← CHANGE: Deduplicate Alfera accent color (#1D4ED8 on homepage vs #C9A84C here).
     Pick one and apply it consistently. Suggested: keep #C9A84C (gold) — it is
     more distinctive and appears correct on the dedicated work page.

OTHER WORK TABLE
  [h2] Other work
  Row: CarbonWise · Virtual PO · Nigeria EMR (with category, year, status)
  ← No change.

FOOTER STRIP
  "6 projects across product, design, and engineering."
  [CTA] Start a project →
  ← Already exists. Verify it links to /contact.
```

---

### `/work/[slug]` — Case study

```
PROGRESS BAR (fixed, top)
  ← Add role="progressbar" aria-valuenow aria-valuemin aria-valuemax aria-label

WORK HERO
  Project name · Category · Year · Status · Tech stack tags
  Hero color block with project title at display scale
  ← No structural change.

CASE STUDY BODY (MDX)
  Overview / Problem / Approach / Outcome
  Code blocks, images, pull quotes as needed
  ← CHANGE: Add TestimonialCard slot after Outcome section.
     Markup: <figure><blockquote>…</blockquote><figcaption>Name, Role, Company</figcaption></figure>
     // TODO: real testimonial from [client name] — placeholder until content exists.
  ← CHANGE: Add OutcomeMetric slot within Outcome section.
     // TODO: real metric — placeholder until content exists.

NEXT / PREV NAV
  WorkCTALinks: ← Previous project · Next project →
  ← No change.

FOOTER (same)
```

---

### `/about` — About

```
HEADER (same nav)

OPENING (dark)
  [h1] I make software that feels like it was made for humans.
  [2-col body] Who Paul is · What drives the work
  ← No structural change.

STATS ROW
  6+ years · 20+ projects · 4 companies · 100%
  AnimatedCounter × 4
  ← No change. Verify reduced-motion shows final values immediately.

EXPERIENCE TIMELINE
  [label caps] Experience
  [h3 × 5] Prism / Freelance / CarbonWise / Healthcare NGO / ...
             each with role, dates, 1–2 line description
  ← CHANGE: Demote from h2 → h3 (audit finding: items are sub-sections,
     not page-level sections).

CAPABILITIES
  [label caps] Skills
  Three tag-cloud groups: Design · Engineering · Product
  ← No change.

PRINCIPLES
  [label caps] How I work
  [h3 × 3] Clarity before code · Ship to learn · Design is how it works
             each with a short paragraph
  ← CHANGE: Demote from h2 → h3 (same as experience items).

CTA STRIP (dark)
  "Want to work together?"
  [CTA] → Start a project  [CTA] → See the work
  ← No change.

FOOTER (same) + ADD social links
```

---

### `/services` — Services

```
HEADER (same nav)

MASTHEAD
  [eyebrow] Services
  [h1] The work I take on.
  [body] Short intro: what kinds of problems, who it's for.
  ← No structural change.

SERVICES SHOWCASE
  4 interactive rows: Product Engineering · Design Systems · 0→1 Products · Advisory
  Each row: title + giant ghost number + "good for" context

  ← CHANGE (mobile): "good for" text must be visible on mobile at all times,
     not hidden behind hover. On mobile: show as a second line below the title,
     always visible. The hover-only reveal is a desktop enhancement, not the
     only disclosure.

  ← CHANGE (keyboard): Each row must be keyboard-interactive. Convert to
     button/expand pattern or ensure row has a visible link to a destination.

  ← CHANGE (floating card): On keyboard focus, show card as static positioned
     element below the row, not as a cursor-following element.

SERVICES CTA  ← NEW (fixes P0-3 — no CTA currently)
  [h2] Ready to start?
  [body] "Most projects begin with a short discovery call."
  [CTA] → Get in touch  ·  hello@paulojuri.com
  ← This section does not exist today. Must be added in Phase 4.
     Do NOT add pricing. Do NOT add testimonials (none exist yet).
     Keep it structurally simple: heading + 1 sentence + 1 CTA button.

FOOTER (same)
```

---

### `/contact` — Contact

```
HEADER (same nav)

MASTHEAD
  [h1] Let's talk.
  [body] "Send a message or email directly:"
  [email] hello@paulojuri.com
  [LinkedIn link]
  ← No structural change.

CONTACT FORM
  Name / Email / Subject (optional) / Message
  [CTA] Send message →
  ← CHANGE: Make Subject optional (consistent with ContactCTA — P0-4 fix).
  ← CHANGE: Add field-level validation on email blur.
  ← CHANGE: On success, move focus to success state container.

FAQ
  [label caps] Common questions
  Q: How quickly do you respond? / International clients? /
     Minimum engagement? / Equity/deferred?
  dl/dt/dd structure
  ← No structural change. P2 note: this FAQ would also be valuable on /services.
     Link to it from there rather than duplicating.

AVAILABILITY STRIP
  "Available for new projects from Q3 2026."
  Status indicator + expected date
  ← CHANGE: Replace green dot (semantics = live/now) with a calendar/clock icon
     or a neutral dot. The green dot contradicts "from Q3 2026" text (P1-6).

FOOTER (same)
```

---

### `/journal` — Journal index

```
HEADER (same nav)

JOURNAL MASTHEAD
  [h1] Journal
  [issue number] — [post count]
  [tag filter] All · AI · Design · Product · Engineering · Privacy

  Post grid: title · date · read time · tags
  ← CHANGE: Tag filter buttons need aria-pressed for selected state.
  ← CHANGE: Add aria-live="polite" region that announces result count on filter.

FOOTER (same)
```

---

### `/library` — Book library

```
HEADER (same nav)

LIBRARY HEADER
  [h1] Library
  [body] Intro + "Walk in →" CTA (WebGL 3D room)
  [jump nav] 11 category anchor links
  ← No structural change.
  ← P2 note: "Walk in →" CTA should have a brief tooltip/label warning
     that it's a WebGL experience requiring a capable device. Not blocking.

11 × BOOKSHELF SECTIONS
  [h2] Category name
  Book grid: title · author · personal note
  ← No structural change. Headings confirmed correct (h2 per shelf).

FOOTER NOTE
  "165 books across 11 shelves."
  ← No change.

FOOTER (same)
```

---

### `/library/walk` — 3D room

```
PRELOADER
  Loading screen
  ← No change.

FULL-SCREEN 3D SCENE
  Three.js room: books, Rosie AI character, lighting, postprocessing
  Book panel: detail view on click
  Rosie dialog: AI chat
  Sound controller

  ← Note: This page intentionally has low Lighthouse scores. Acceptable trade-off.
  ← P2 note: document in README that /library/walk is intentionally excluded from
     performance budgets.
```

---

## Key IA decisions (with rationale)

**No new pages added.** The site has the right pages. Adding a "hire me" page, a "process" page, or a "testimonials" page would only be justified by real new content. Structural changes without new content create empty pages.

**No pages removed.** All six portfolio entries, the library, and the journal serve distinct purposes and have real content.

**No URL changes.** The existing URLs are clean, short, and already indexed. Changing them would require redirects and has no upside.

**The conversion problem is execution, not architecture.** The services page gets traffic from a motivated visitor (someone who clicked "Services" in the nav) and currently lets them leave without a next step. The fix is one new section at the bottom of an existing page — not a restructure.

**The trust problem is content, not architecture.** Testimonials and outcome metrics need real content before they need structural slots. Phase 4 adds the markup skeleton and `// TODO` placeholders so the need is visible and can be filled when content exists.
