# Page-Level Design Overrides
**paulojuri.com** | Last updated: 2026-05-31

Each section below covers one route. All overrides are additive — they layer on top of global tokens and principles, they do not replace them. The global nav and footer are always painted with global tokens regardless of the page.

---

## 1. Home `/`

**Mood:** Atmospheric, confident, unhurried. The home page does not explain itself. It assumes you are worth talking to.

**Typography role:** Fraunces at `--text-7xl` or larger, WONK:1, weight 300–400. The headline is sparse — 4–8 words maximum. Geist body at `--text-md`, line-height 1.7, used only for the 2–3 line sub-statement below the headline. Navigation uses Geist at `--text-xs` with `0.08em` letter-spacing.

**Motion posture:** Expressive but not gratuitous. The WebGL canvas in the hero responds to cursor position with a parallax shift (max 12px, damped with `lerp()`). On scroll, the headline performs a vertical split-reveal — each word slides up from a clip, staggered at 40ms per word, `var(--ease-out)` at 600ms. Once revealed, nothing in the hero animates again. The rest of the page uses scroll-triggered opacity + slight Y-translate reveals (24px lift, 400ms, `var(--ease-out)`) at 15% intersection threshold.

**Primary challenge:** Land quality in 3 seconds without gimmick. The WebGL hero passes this test only if it has a lo-fi poster image as LCP content and the canvas layer loads after. If the canvas fails, the page still looks right. Test this by disabling JavaScript — the headline and sub-statement must be fully readable.

**Key component decisions:**
- WebGL canvas: `aria-hidden="true"`, `role="presentation"`. The canvas is atmospheric, not informational.
- Headline: `<h1>`, Fraunces, `var(--text-7xl)` clamped with `clamp(var(--text-4xl), 8vw, var(--text-7xl))`. Never centered — always left-aligned, 8 of 12 columns desktop.
- Featured project strip: 3 cards below the fold, horizontal scroll on mobile. Cards use `--bg-raised` and show project name, a single-sentence role, and one thumbnail. No hover animations at rest — the beam border appears only on focus/hover.
- Availability badge: Geist Mono, `--text-2xs`, `oklch(65% 0.20 32)` — the accent color, visible but not loud. "Available Q3 2026 · Turnhout, Belgium." Positioned at the bottom of the hero, not in the nav.
- CTA: Not a button. A plain text link — "hello@paulojuri.com" — set in Geist at `--text-sm` with an animated underline. Appears after the sub-statement. The underline draws in on page load at 800ms delay.

---

## 2. About `/about`

**Mood:** Editorial, portrait-led, reading-room. The page has the quality of a long magazine profile — specific, personal, with opinions. It is not a résumé. There is no timeline. There is no skills matrix.

**Typography role:** Body paragraphs in Geist at `--text-md`, line-height 1.65, max-width 64ch. Section labels in Geist Mono at `--text-xs`, all-caps, `0.08em` tracking, `--ink-3`. Pull quotes in Fraunces at `--text-3xl`, weight 300, WONK:0, offset to columns 2–8 desktop. The portrait image spans columns 9–12, sticky in the first third of the page on desktop, then releases to flow with content.

**Motion posture:** Restrained. This is a reading page. Paragraphs reveal on scroll with a simple opacity fade (0 → 1, 400ms). No slide-up on a reading page — vertical motion while trying to read is hostile. The portrait has a very slow parallax (max 20px over full scroll distance) — barely perceptible, adds depth without distraction.

**Primary challenge:** Feel personal without being a résumé. The solution is to write in paragraphs, not bullets, and to include one section — "Things I've figured out the hard way" or equivalent — that is opinion, not fact. Paul's take on the product-design-engineering triangle, his view on spec documents, his opinion on Figma. This is what separates a profile from a CV.

**Key component decisions:**
- Portrait: Full-bleed in the column, grayscale by default, shifts to very slight color saturation on scroll past the 50% mark of the about section. Implemented via CSS `filter: saturate()` transitioned on a scroll observer.
- Experience block: Not a timeline. A simple two-column prose block — role on the left in Geist Mono, narrative on the right in Geist body. Emphasizes what was built, not where Paul worked.
- "Currently" section: Last section on the page. One sentence about Turnhout, one sentence about Q3 2026 availability. Followed by the email link, large, accent color. The section is never more than 3 sentences.
- No tech stack section. No tools list. If a technology mattered to a specific project, it appears in that project's case study.

---

## 3. Portfolio Index `/work`

**Mood:** Catalog, data-forward, ambient tint. The page is a considered selection, not an exhaustive archive. 6 projects, each presented as a substantial object.

**Typography role:** Project titles in Fraunces at `--text-4xl` desktop / `--text-3xl` mobile. Role/year metadata in Geist Mono at `--text-xs`. Single-sentence description in Geist at `--text-md`, `--ink-2`. All project titles left-aligned, no center-alignment on this page.

**Motion posture:** Ambient. Each project card has a very subtle background tint that derives from its `--project-accent` — not the full accent, but `--project-accent-glow` applied as a radial gradient that emanates from the card's center. On hover, the card lifts via `translateY(-4px)` and the tint brightens slightly. The tint is visible at rest but very low — it is a whisper, not a statement. Projects reveal in sequence on initial load: staggered at 80ms per card, opacity + 16px Y translate, `var(--ease-out)` at 500ms.

**Primary challenge:** Surface all 6 projects without gridding them to death. A 3×2 or 2×3 uniform grid turns projects into products in a catalog. The layout alternates span patterns — project 1 spans 8 columns with large thumbnail, project 2 spans 4 columns right-aligned, project 3 is full-width with a thin horizontal strip layout, and so on. No two adjacent projects have the same span.

**Key component decisions:**
- Project card: Not a rectangle with a thumbnail. Each card shows: project name (Fraunces), role sentence (Geist body), year and type (Geist Mono), and a thumbnail. The thumbnail is not a mockup screenshot — it is a cropped detail that shows craft: a single UI component, a color system swatch, a typeset detail. Full mockups are inside the case study.
- Filtering: None. Six projects do not need a filter. Filters signal an archive; this is a selection.
- Sorting: Chronological descending. Most recent first. No toggleable sort.
- "More on request" note: Below all six projects, a single line in Geist Mono `--text-xs` `--ink-3`: "Earlier work available on request." This acknowledges 6 years without expanding the page.

---

## 4. Portfolio Project `/work/[slug]`

**Mood:** Per-project world. The shell (nav, footer) stays global; everything inside the `[data-project="slug"]` wrapper takes on the project's palette, motion posture, and typographic tuning.

**Typography role:** Project title in Fraunces at `--text-6xl` desktop, variable weight and WONK axis per project theme. Body in Geist at `--text-md`, max-width 68ch. Technical callouts and stat figures in Geist Mono. Section labels in Geist Mono all-caps `--text-xs`. Pull quotes from the project — a real stakeholder quote or a constraint stated bluntly — in Fraunces `--text-2xl`, weight 300.

**Motion posture:** Defined per project in the project's theme file. As a baseline: section reveals use the standard opacity + Y-translate. Projects with more kinetic domains (Prism, ApplyAI) may use more assertive spring-based reveals at 300ms. Projects with documentary/social domains (Nigeria EMR) use slower, more deliberate fades at 600ms with no Y motion. All postures must respect `prefers-reduced-motion`.

**Primary challenge:** Feel bespoke per-project while living in the same shell. The solution is that the bespoke-ness is never decorative — it always reflects something real about the project. Prism's cool blue tilt comes from privacy software conventions. Alfera Technik's warm amber comes from the hardware/physical-world domain. CarbonWise's green-tinted dark comes from its environmental subject matter. The per-project theme is a design decision that can be defended.

**Key component decisions:**
- Hero: Full-bleed project title and a single-sentence problem statement. No mockup in the hero — the problem comes first. The visual arrives in the second section.
- Case study structure: Problem → Constraint → Decision → Outcome. Not "Overview / Process / Results." The structure is narrative, not template.
- Stat blocks: Key outcomes (e.g., "clinic onboarding time from 3 hours → 22 minutes") displayed in Geist Mono large figures with Geist body labels. These are not icons-with-numbers — just numbers, sized to demand attention.
- Image treatment: Full-bleed images span the full content column. Captions in Geist Mono `--text-2xs` `--ink-3`, below the image, no italic. No drop shadows on screenshots — they sit directly on the project's `--project-bg-raised`.
- Next project: Bottom of every case study, full-width strip: "Next: [Project Name]" with a horizontal swipe transition to the next project page. The strip is painted with the next project's `--project-accent-glow`.
- Back link: "← Work" in Geist `--text-xs` `--ink-3`, sticky at top of page, below the global nav. Disappears after 200px scroll, reappears on scroll-up.

---

## 5. Journal Index `/journal`

**Mood:** Reading list, monospaced dates, vertical rhythm. The page has the aesthetic of a well-kept technical index — not a blog, not a feed, a list of considered documents.

**Typography role:** Article titles in Geist at `--text-xl`, weight 500. Dates in Geist Mono at `--text-xs`, `--ink-3`, formatted as `YYYY-MM-DD`. One-sentence summaries in Geist at `--text-sm`, `--ink-2`. No Fraunces on this page — the journal index is functional, not expressive.

**Motion posture:** Near-static. Rows appear on scroll with a 24px Y-translate + opacity, 300ms, staggered at 30ms. Nothing else moves. The list should feel like a document, not a UI.

**Primary challenge:** 7 articles without looking sparse. The solution is not to pad — it is to commit to vertical space. Each article row has generous padding (`--space-8` top and bottom), a full-width hairline border at `--line`, and the date is given full typographic weight in Geist Mono. The sparseness becomes the aesthetic. If there are fewer than 7 articles at launch, do not add placeholder content — a short, committed list reads as curated.

**Key component decisions:**
- Row structure: Date (Geist Mono, left, fixed width 120px) | Title (Geist, flex) | Reading time (Geist Mono, right, `--ink-3`). Three-column flex row on desktop. On mobile: date above title, reading time below.
- No tags. No categories. No pagination — 7 articles fit on one page with scroll.
- No featured article card. No hero. The list starts immediately below the page heading.
- Page heading: "Writing" not "Blog" or "Journal Index." One word. Fraunces, `--text-5xl`, weight 300. The only Fraunces instance on this page.
- Year separators: If articles span multiple years, a Geist Mono all-caps year label separates groups — `2025`, `2024` etc. — in `--ink-4`, `--text-xs`. Adds structure without adding noise.

---

## 6. Journal Article `/journal/[slug]`

**Mood:** Long-form reading. Deep focus. No distractions.

**Typography role:** Body in Geist at `--text-md`, line-height 1.7, max-width 66ch, centered in the column. H2s in Geist weight 600 at `--text-xl`. H3s in Geist weight 500 at `--text-lg`. Pull quotes in Fraunces `--text-2xl` weight 300, offset left of column by 2 columns desktop. Code in Geist Mono at `--text-sm`, in a `--bg-sunken` block with `--radius-md`. Running header (article title + progress indicator) in Geist Mono `--text-2xs`.

**Motion posture:** Essentially none. A subtle reading progress bar — 2px, `--accent`, top of viewport, width driven by scroll percentage. No section reveals. No scroll animations. Motion on a reading page competes with attention. The only animation is the progress bar.

**Primary challenge:** Keep 8-minute reads feeling fast. This is solved by writing, not design — but design supports it. Generous line-height (1.7), correct measure (66ch), short paragraphs, visible H2 anchors, and the progress bar that shows the reader how far they've come. Anchor links on H2s (a `#` appears on hover) let readers return to specific sections.

**Key component decisions:**
- No sidebar. No related articles widget. No newsletter signup mid-article. These exist to capture people who are about to leave — on a reading page they signal that you expect readers to leave, which becomes a self-fulfilling prophecy.
- Article header: Title (Fraunces `--text-4xl`), date (Geist Mono `--text-xs`), reading time (Geist Mono `--text-xs`), one-sentence summary (Geist body `--text-md` `--ink-2`). Nothing else.
- Article footer: After the final paragraph, a hairline divider, then: author note (1–2 sentences from Paul, first-person, present tense), the email link, and a "← Back to Writing" link. No next/previous article navigation — finish the article, then decide.
- Code blocks: Syntax highlighted. Language label in Geist Mono `--text-2xs` at top-right of block. Copy button, icon-only with `aria-label="Copy code"`. No line numbers unless the article references specific lines.
- Images: Full column width, no captions unless the image requires one. Alt text is real — descriptive, not decorative.

---

## 7. Contact `/contact`

**Mood:** Direct, confident, big email. The page has one job. It does not apologize for having one job.

**Typography role:** The email address — `hello@paulojuri.com` — is the largest text on the page after the home headline. Set in Fraunces `--text-5xl`, weight 300, WONK:0, `--accent` color. It is a `<a href="mailto:">` link. On hover, the underline animates in from left, `--accent`, 2px, 200ms. Above it: a single sentence in Geist `--text-md` — the setup. Below it: two lines in Geist Mono `--text-xs` `--ink-3` — availability and location.

**Motion posture:** The email address performs a slow reveal on page load: a clip-path wipe from left, 700ms, `var(--ease-out)`, 200ms delay. Nothing else moves. The page should feel like opening a letter.

**Primary challenge:** Don't bury the email in a form. There is no form on this page. A contact form adds friction, implies a queue, and makes Paul feel like a service rather than a person. The email address is the contact mechanism. If someone needs to reach Paul, they already know how to compose an email.

**Key component decisions:**
- Page structure: A single vertical stack, vertically centered in the viewport on desktop. Setup sentence → email address → availability line → location line. That is the entire page.
- Setup sentence: "If you're building something and need someone who can design it and build it — let's talk." Set in Geist `--text-md`, `--ink-2`, max-width 40ch.
- Availability: "Available Q3 2026" in Geist Mono `--text-xs` `--ink-3`. If it's past Q3 2026, this line changes — do not leave stale availability on the page.
- Location: "Based in Turnhout, Belgium" in Geist Mono `--text-xs` `--ink-3`. On the same line as availability, separated by a `·`.
- No social links on this page. Social links exist in the footer. The contact page is for one action.
- No "thank you" page. The `mailto:` link opens the user's email client directly. Paul responds to emails personally.
