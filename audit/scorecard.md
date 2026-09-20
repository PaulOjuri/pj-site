# Audit Scorecard
paulojuri.com — Phase 0
Date: 2026-05-22
Scale: 1 (critical failure) → 10 (excellent)

---

## 1. Visual Design — 8/10

**Justification:** The token system is genuine and thoughtful: 9-step fluid type scale, 8-pt spacing ladder, named color roles (--ink, --paper, --cream, --muted, --accent), layered shadows, motion easing constants. Playfair Display for display headings against DM Sans body is a strong, intentional pairing. The terracotta accent (#C8553D) on warm paper (#F4ECE0) is distinctive. The only reason this isn't a 9 is that label-caps text runs as small as 0.56rem (effectively 9px) on several work and journal row meta fields, which creates legibility stress at the detail level.

**Top issue:** Micro-label text (0.56rem–0.60rem) is below comfortable reading size; readability suffers on non-retina displays.

---

## 2. Layout & Composition — 7/10

**Justification:** The homepage sections use a coherent horizontal rhythm with `container-page` (max-width 1400px, fluid gutter clamp(1.25rem, 4vw, 4rem)). Dark/light section alternation (hero → NowStrip → SelectedWork → dark AboutTeaser → JournalTeaser → dark ContactCTA) creates clear visual cadence. The work page hero card (3fr/2fr split with dark + accent-color panels) is strong. Weaknesses: the work page h1 is visually smaller than its eyebrow label; the services page closes without a footer CTA section; the hero section has no visual layout beyond a single centered column — the 92vh real estate is underfilled given there is no visual/imagery to balance the copy column.

**Top issue:** Hero section never uses its right half — the copy sits in a single left-aligned column inside a full-width `container-page` div with no grid split, leaving the right side empty on wide screens.

---

## 3. Information Architecture — 7/10

**Justification:** Nav labels are clear (Work, Services, Journal, Library, About, Contact). The six-item nav is borderline — "Library" is an unusual item that doesn't communicate its purpose (book collection). The footer duplicates the nav exactly, which is fine for utility. The work page's split between "featured" (big cards) and "other work" (table) is a sensible hierarchy. Issues: there is no breadcrumb or current-page indicator beyond aria-current on nav links; the journal has no category pages; the library has no search.

**Top issue:** "Library" in the nav is opaque — a visitor who hasn't seen the page will not know what it is from the label alone.

---

## 4. Interaction Design — 8/10

**Justification:** Hover states are deliberate throughout: work rows invert to full dark with left color stripe and reveal "Case study →"; journal rows fill to --cream with colored stripe and reveal arrow; service rows fill to a tinted bg with giant number gaining color. The ServicesShowcase floating cursor preview card (gradient panel following the mouse) is a genuine delight. Focus-visible is globally defined (2px --accent outline, 3px offset). Button has `active:scale-[0.98]` press feedback. GSAP ScrollTrigger entrance animations on work and journal rows. Main deduction: no pause-on-hover on the NowStrip marquee; services hover interactions are completely inaccessible on mobile.

**Top issue:** ServicesShowcase good-for context lines are hover-only and permanently invisible on mobile/touch.

---

## 5. Content — 7/10

**Justification:** The copy voice is sharp and direct: "I turn ambiguous ideas into software people actually want to use," "I care about the details most people ship past," "Prototypes lie." The journal writing is solid — the AI/privacy theme cluster is coherent and the titles are good. The about page principles section reads authentically. Deductions: zero social proof (no named clients, no testimonials, no outcome metrics); the services descriptions are clear but feel written for an educated buyer who already understands what "product engineering" means; no pricing context anywhere creates friction for anyone budgeting; the work case studies (not fully audited) are the critical missing content.

**Top issue:** No social proof anywhere: no client names, logos, testimonials, or quantified outcomes.

---

## 6. Accessibility — 6/10

**Justification:** Solid foundations: `lang="en"` on html, skip-to-content link, `aria-label` on main nav and footer nav, `aria-current="page"` on active links, `aria-labelledby` on major sections, `role="status"` and `aria-live="polite"` on form success states, `role="alert"` on errors, `prefers-reduced-motion` respected in both global CSS and NowStrip inline style. Honeypot inputs have `tabIndex={-1}`. Problems identified by code review: status dots (green/yellow/gray circles) convey meaning by color alone with no text fallback for the color; mobile menu overlay uses `aria-hidden={!menuOpen}` correctly but links inside it lack `tabIndex=-1` when hidden, meaning they may be keyboard-reachable when not visible; small label text at 0.56rem fails WCAG 1.4.4 practically; color contrast of --muted (#6B6457) on --paper (#F4ECE0) needs verification (see a11y/summary.md).

**Top issue:** Status indicators (live/building/shipped) are communicated by colored dot only — the dot is `aria-hidden="true"` but there is no text alternative that screen readers will encounter independently of the adjacent label text (label is present but needs verification it's always announced together).

---

## 7. Performance — 6/10

**Justification (estimates — not Lighthouse-measured):** The homepage itself is lean: no images, GSAP loaded but used on scroll, fonts served via next/font with `display: swap`. The JS bundle will be large due to three.js (^0.184.0), @react-three/fiber, @react-three/drei, @react-three/postprocessing, react-spring, GSAP, Lenis, Howler, Zustand all being production dependencies. Three.js alone is ~600KB unminified. Even with tree-shaking, the bundle will be substantial. The library/walk page will be especially heavy. The hero section does NOT appear to use HeroGL on the current live homepage (HeroGL is defined as a component but not imported in page.tsx) — this is neutral. Fonts are Google Fonts via next/font (self-hosted, optimal). No images found in homepage components (all work cards use solid color blocks, not photos). LCP on homepage is likely the h1 text (fast). The 3D library walk is not lazy-loaded at route level in an obvious way.

**Top issue:** The three.js ecosystem adds significant JS weight to the bundle even for routes that never render 3D content, unless dynamic imports with `next/dynamic` are used everywhere (not confirmed in audited files).

---

## 8. Mobile UX — 7/10

**Justification:** The mobile menu is a full-screen overlay with large tap targets (text-4xl links). The marquee respects reduced motion. Section padding uses clamp values so spacing contracts appropriately at small viewports. Font sizes use fluid clamp so nothing gets too small at the type scale level (text-base bottoms at 0.9375rem = 15px). Problems: label-caps at 0.56rem–0.60rem is too small for comfortable mobile reading; the services page "good_for" context is invisible on touch; the work page hero card right panel is `hidden md:block` so mobile users see only the dark editorial panel with no image or visual relief; NowStrip whitespace is `gap-16` (4rem) which may overflow poorly on very narrow screens; hero has no thumb-zone consideration (CTAs appear below a large headline, possibly below the fold on shorter phones).

**Top issue:** Hero CTAs ("View work →" and "Get in touch") may fall below the fold on short-viewport phones given the h1 has `max-w-4xl` and can wrap across multiple lines before them.

---

## 9. SEO — 7/10

**Justification:** metadataBase correctly set to `https://paulojuri.com`. Title template `'%s · Paul Ojuri'` applied on all inner pages. Meta descriptions exist on all audited pages. OG type, locale, siteName, and image set on homepage. Twitter card with `summary_large_image` and creator handle. robots.txt correctly structured — AI bots explicitly allowed. Sitemap exists with 24 URLs and priority values. JSON-LD Person + WebSite on homepage, Article schema on journal posts, CreativeWork on work posts. Heading hierarchy is generally correct (one h1 per page). Weaknesses: OG images are missing on /about, /services, /contact, /library, /journal; sitemap lastmod dates are static (all "2026-05-27"); the /work h1 is tiny and likely not used as a featured snippet due to low visual weight; no FAQ schema on the contact page FAQ section despite it being structured as dl/dt/dd.

**Top issue:** OG image missing on /about, /services, /contact, /library, /journal — social sharing for these pages will show no image preview.

---

## 10. Conversion & CTAs — 5/10

**Justification:** The homepage has a clear primary CTA ("View work →") and secondary ("Get in touch") in the hero. The contact form appears twice (homepage and /contact page). The about page closes with a CTA. The work page footer has "Start a project →". The journal posts presumably have CTAs (not fully audited). Problems: the services page has NO CTA at the bottom; "View work →" leads to a portfolio with no actual case study images visible in the live fetches (color blocks only); there is no social proof to reduce friction before the form; no pricing signal anywhere on services page creates a "price anxiety" gap; the primary CTA copy "View work →" is weak — it doesn't specify what the visitor will see or why it benefits them; "Available for new projects from Q3 2026" is demotivating if someone is ready to hire now.

**Top issue:** Services page has no CTA — the most purchase-intent page on the site ends with a border-top div.

---

## 11. Trust Signals — 4/10

**Justification:** Verified signals: email address is real and displayed (hello@paulojuri.com); LinkedIn link present; HTTPS; active journal with recent posts (Apr 2026); JSON-LD sameAs links to public social profiles; real project names (Prism, Alfera, ApplyAI) with tech stacks. Missing: no client testimonials; no named client logos; no case study results or outcome metrics; no face/photo anywhere on the site; no press mentions or external links; no client-facing references; the stats (6+ years, 20+ projects) are unverifiable; three of the six portfolio projects are "Shipped" (not live) with no public demo or artifact. For a freelancer asking early-stage teams to trust them with their product, the trust deficit is the biggest business risk on the site.

**Top issue:** Zero third-party social proof — no testimonials, named clients, logos, or quantified results.

---

## 12. Technical Hygiene — 8/10

**Justification:** Next.js 16, React 19, Tailwind 4 — current major versions. TypeScript throughout. ESLint + Prettier configured. `@cloudflare/next-on-pages` and `@opennextjs/cloudflare` for Cloudflare Pages deployment. `sharp` for image optimization. honeypot spam protection on forms. `aria-hidden` on decorative elements. `noopener noreferrer` on all `target="_blank"` links. `box-sizing: border-box` global reset. `overflow-x: hidden` on body. `text-rendering: optimizeLegibility`. `min-height: 100dvh` (uses dvh, not vh — correct). Potential issues: the `scroll-behavior: smooth` on html combined with `LenisProvider` (Lenis smooth scroll) may produce double-smooth behavior or conflicts; `document.body.style.overflow` is set imperatively in Nav when mobile menu opens (side-effect outside React state — can cause issues if multiple components do this); no CSP headers visible from code review; two contact API routes (/api/contact, /api/rosie) disallowed in robots.txt correctly.

**Top issue:** No Content Security Policy headers visible — Cloudflare Pages deployment should have CSP configured at the edge but it's not visible in the codebase.
