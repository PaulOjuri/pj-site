# Current State Audit
paulojuri.com — Phase 0
Date: 2026-05-22

---

## Verdict

This is a personal portfolio for a product engineer and designer based in Belgium. The target audience is early-stage founders and product teams who need a builder-designer hybrid. The design direction is confident and consistent — a warm paper editorial palette (#F4ECE0 background, #1A1815 ink, #C8553D terracotta accent), Playfair Display for headings, tight tracking, a well-thought-out token system. The craftsmanship is genuine and the writing is sharp. The site should be converting. It is probably not, for three concrete reasons: the primary CTA asks visitors to trust someone they can't verify yet (no client names, no testimonials, no visible results); the work page has no actual portfolio artifacts to look at (case studies are likely thin given the site is freshly built); and the contact form appears on the homepage before any of the trust-building work is done, which is a sequencing problem.

---

## P0 — Block trust or task completion

**P0-1: No social proof anywhere on the site.**
The about page lists four employers by name (Prism, Freelance, CarbonWise, Healthcare NGO) but names no clients, shows no testimonials, no logos, no outcome metrics ("CarbonWise reduced churn by X%"). The work page shows six projects but three of them have no live URL and no case study content that a visitor can verify. The stats (6+ years, 20+ projects) are unanchored claims. A decision-maker evaluating a freelancer needs third-party signal and finds none.

**P0-2: The /work H1 is visually subordinate to a label.**
The `<h1>` on the work page is set at `clamp(1.1rem, 2vw, 1.5rem)` — smaller than the eyebrow label "Selected work" above it on many viewports. This is not a stylistic choice that reads well; it looks like a broken hierarchy. The work page is the most important destination for decision-makers and the page-entry signal is broken.

**P0-3: Services page has no pricing, no engagement model, and no CTA.**
The services page describes four offerings and then ends. There is no call to action at the bottom of the page (the ServicesShowcase component closes with a border-top `<div>` and nothing else), no pricing range or "starting at" signal, and no way for a visitor who just read the services to take the next step without going back to the nav and finding Contact. This page currently does not convert.

**P0-4: Subject field is marked required in ContactForm (/contact) but not in ContactCTA (homepage).**
Inconsistent validation between the two form instances creates confusion. On /contact, a visitor who fills in name, email, and message but skips "What's this about?" will hit a required-field error. On the homepage the same field is optional. This discrepancy will cause form submission failures that look like bugs.

---

## P1 — Noticeably hurt experience

**P1-1: The accent color (#C8553D) used for "Alfera" on the homepage does not match the work page (#C9A84C).**
`projectColors` in `SelectedWork.tsx` sets Alfera's accent to `#1D4ED8` (blue). In `work/page.tsx` it is `#C9A84C` (gold). The live fetch shows "#1D4ED8" on the homepage. This is a data inconsistency across the codebase — two files define the same mapping with different values. The Alfera card will appear blue on the homepage and gold on the work page.

**P1-2: Key metadata is missing on inner pages.**
No OG image tags are defined on /about, /services, /contact, /library, or /journal. Only homepage and individual work/journal posts (via dynamic opengraph-image routes) have social share images. When someone shares /services or /about on social, there will be no image preview, just the default meta text. Given the site's visual quality, this is a missed distribution opportunity.

**P1-3: The NowStrip marquee has no pause-on-hover.**
The marquee animates at `40s linear infinite`. There is a `prefers-reduced-motion` override that stops animation entirely, but no interactive pause when a sighted user wants to read a particular item. The selector `[style*="marquee"]` used in the reduced-motion override is also fragile — it matches on inline style content, not a class, and could break if the animation property is ever extracted to CSS.

**P1-4: ServicesShowcase is hover-only with no mobile fallback for the floating preview card.**
The `<div ref={previewRef}>` floating cursor preview is `hidden md:block` — it does not appear on mobile. But the "good_for" sub-line inside each row is also only revealed on hover (`maxHeight: isHov ? '2.5rem' : '0'`). On mobile, hover never fires persistently, so the "good for" context line is permanently invisible. Visitors on mobile see four service titles with no qualifying context.

**P1-5: The hero has no visual hierarchy between name and role.**
The nav shows "Paul Ojuri" as the brand mark. The hero goes straight to the tagline headline. There is no clear visual statement of "I am Paul Ojuri and this is what I do" at the top of the first viewport — the location badge "Turnhout, Belgium · Open to collaborate" substitutes for a byline but doesn't establish identity. New visitors who land directly on the homepage from a search result may not immediately know whose site this is.

**P1-6: Availability status is stale or speculative.**
"Available for new projects from Q3 2026" appears in the homepage contact section and on /contact. The current date is May 2026, so Q3 is 6–8 weeks away. This is fine, but the green dot (used universally to indicate "currently available/online") signals immediate availability. The dot's semantics contradict the text. Visitors reading "green dot = available now" may misunderstand.

---

## P2 — Polish

**P2-1: Label-caps font size is 0.56rem–0.62rem in multiple places.**
At 0.56rem (~9px) the category labels, year markers, and status labels on the work page are below comfortable reading size for many users, especially on non-retina screens. WCAG 2.1 SC 1.4.4 (Resize Text) doesn't forbid small text but 9px is below the practical usability floor.

**P2-2: The footer is extremely minimal.**
The footer contains brand, nav links, and copyright — nothing else. No social links (despite Twitter, GitHub, LinkedIn being present in the JSON-LD schema), no contact email, no "made with" or tech credits. The social links exist in the structured data but are not exposed to users in the UI anywhere except the contact page LinkedIn link.

**P2-3: sitemap.xml has a static lastmod timestamp (2026-05-27) on all entries.**
The sitemap is generated by `src/app/sitemap.ts`. All entries likely share a hardcoded or build-time date rather than individual page modification dates. This gives crawlers no signal about which pages have actually changed since last index.

**P2-4: The library page CTA "Walk in →" is the primary visual CTA button, but the 3D experience requires WebGL and may be heavy on low-end devices.**
The gpuTier detection exists in the code but only applies inside the walk itself — there is no pre-visit warning or quality gating on the library page before the user clicks "Walk in". If the WebGL experience fails or runs poorly, there is no graceful fallback shown on the page itself (only within the scene via `WebGLErrorBoundary` → `HeroFallback`).

**P2-5: No 404 page is linked or indicated visually.**
`not-found.tsx` exists in the app directory but its content was not audited. Unknown if it matches the site's visual design.
