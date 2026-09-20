# Site Audit — pj-site (Pre-session State)

This document records the state of the site **before** the improvements made in the June 2026 session. It is intended as a reference for understanding what existed, what was working, and what needed to change.

---

## Stack

- **Framework:** Next.js 16.2.6 (App Router, static export via `@opennextjs/cloudflare`)
- **Hosting:** Cloudflare Pages
- **Styling:** Tailwind CSS v4 + plain CSS custom properties. No CSS modules. All component styles are inline via `style={}`.
- **Animation:** Framer Motion 12 (scroll-triggered reveals, layout transitions), GSAP 3 (available via `src/lib/gsap.ts`, used selectively)
- **Smooth scroll:** Lenis 1.3 via `SiteLenis.tsx` wrapper
- **Carousel:** Embla Carousel React 8 (used in `FeaturedWork.tsx`)
- **3D:** Three.js + React Three Fiber + Drei (lazy-loaded, used only in `/library/walk`)
- **MDX:** `@next/mdx` + `next-mdx-remote` for work case studies and journal posts
- **Email:** Resend (contact form via `/api/contact`)
- **State:** Zustand (available, minimal use)
- **Fonts:** Anton (display/headlines via `--font-display-stack`), Inter (body via `--font-body-stack`), Space Mono (mono/labels via `--font-mono-stack`) — all loaded via `next/font/google`

---

## What Worked Well

**Design system coherence.** The token set in `globals.css` is tight and self-consistent: three background levels (`--bg`, `--bg-elevated`, `--bg-inset`), three text levels (`--text`, `--text-muted`, `--text-faint`), a single accent color, and two line opacities. Nothing leaks outside the system.

**Anton headline font.** Heavy, condensed, uppercase — it sets a strong editorial register that distinguishes the site from generic developer portfolios immediately.

**Fluid type scale.** All font sizes use `clamp()` throughout with consistent logic (`clamp(min, preferred-vw, max)`). The type scales gracefully across all viewport widths without breakpoints.

**Framer Motion integration.** `useReducedMotion()` is checked everywhere animations are defined. Every reveal passes the `once: true, margin: '-15%'` viewport options for sensible trigger timing.

**FeaturedWork section.** The alternating text/image layout with Embla carousel is solid. The carousel controls (prev/next + dot indicators) are functional and have proper `aria-label` attributes.

**Contact form.** The form in `Contact.tsx` has a working API route (`/api/contact` via Resend), proper `noValidate` on the form element with manual validation, loading/sent/error states, and accessible labels for all inputs.

**About timeline.** The experience section reads like a real career history. The entries are specific and credible. The accent-left-border visual treatment makes it easy to scan.

**Work case studies.** All six case study MDX files exist at `/content/work/`. The `[slug]` route at `src/app/work/[slug]/page.tsx` reads them via `next-mdx-remote/rsc` and renders with a reading progress bar (`WorkProgressBar.tsx`), immersive hero (`WorkHero.tsx`), and prev/next navigation (`WorkCTALinks.tsx`). These are complete, not placeholders.

**Journal posts.** Six MDX files exist at `/content/journal/` with real content, proper frontmatter (`title`, `date`, `excerpt`, `tags`, `readingTime`), and a functioning journal route.

**SEO basics.** `layout.tsx` sets `metadataBase`, default title, description, and OG image reference. `robots.ts` and `sitemap.ts` exist.

---

## What Was Generic or Template-Like

**Nav links were all `href="#"`** — every link in the header menu pointed nowhere. A visitor clicking "Prism" or "Library" would go nowhere.

**Dark mode toggle in the header.** The header included a `next-themes` toggle button but no light mode design exists. Clicking it would have changed the `data-theme` attribute and broken the visual entirely.

**Footer closing statement.** The footer read "THANK YOU FOR VISITING" — a complete non-statement. It functioned as visual filler rather than a CTA.

**Essays section.** Essays were listed as clickable links to `href="#"` that went nowhere, with no status indicators. A visitor would click a title, nothing would happen.

**Services section had a broken HTML entity.** The availability strip rendered `&lt;24 HOURS` as a literal string, not as `< 24 HOURS` or the intended `24 HOURS`. This was in the JSX where the entity was encoded as a string literal rather than a JSX entity.

**"Q3 2026" availability dates.** Both the Services section availability strip and the About section mentioned "Q3 2026" as the availability date. As of June 2026, this is past and needed to read "now."

**404 page was the Next.js default.** A plain error page with no design treatment, no brand, no CTAs. Deeply off-brand for a designer's portfolio.

**Accent color `#C2A878`.** The original amber-gold was muted and desaturated — close to "generic dark portfolio beige-gold." It did not distinguish the site from dozens of similar portfolios.

**Footer logomark.** `SiteFooter.tsx` uses `<MediaImage seed="logomark" />` which resolves to a Picsum placeholder image. No real logomark exists in `/public`.

**Placeholder OG image.** `layout.tsx` references `/og.png` which does not exist at the root of `/public`. The `/public/og/` directory exists but is empty. Link previews would have no image.

**Social links.** Instagram (`href="#"`) and X/Twitter (`href="#"`) in the footer nav have no real destinations.

---

## Accessibility Issues Found

**Focus management in the nav overlay.** Before the session, the overlay had no focus trap. A keyboard user could Tab through the overlay links and then continue tabbing into the page content underneath. The overlay now has a focus trap via `handleMenuKeyDown`.

**No `aria-expanded` on the hamburger button.** The open state was not communicated to screen readers.

**Essays section.** The original essay items with `href="#"` had no accessible indication of their status (draft vs. published). A screen reader user would hear link text with no context about clickability.

**Background video in Hero.** The video has `aria-hidden="true"` and `muted` — this is correct. No issues here.

**Images in FeaturedWork.** All `<MediaImage>` calls have `alt` text. Decorative images have `aria-hidden`. The carousel has an `aria-label` on the container and per-slide `aria-label` attributes.

**Color contrast.** `--text-faint` (`#565049`) on `--bg` (`#0D0C0B`) is at the edge of WCAG AA for small text. It is used only for metadata labels and decorative mono text, not for body copy.

---

## Performance Notes

**Three.js is lazy-loaded.** Only `/library/walk` imports R3F/Three. The main bundle does not include it.

**Hero video.** `/paul/hero-video.mp4` autoplay in the Hero section at 20% opacity. No `preload` attribute is set, so the browser decides. On slow connections this adds to LCP. Consider `preload="none"` if the file is large.

**Fonts.** All three Google Fonts are loaded via `next/font/google` with `display: 'swap'` — correct.

**Images.** Most project images in `FeaturedWork.tsx` are `next/image`-wrapped via `MediaImage.tsx`. The Unsplash hotlinks (Prism slide 3, all ApplyAI detail images, all Alfera images) are external URLs. Next.js image optimization does not apply to external domains not listed in `next.config`.

**Static export.** The site uses `@opennextjs/cloudflare` for static deployment. The `/api/contact` route uses Cloudflare Workers runtime (`export const runtime = 'edge'`). No server-side rendering at request time.

---

## Content Inventory — Authenticity Rating

| Section | Content | Rating |
|---|---|---|
| Hero headline | "I BUILD / THINGS PEOPLE / WANT TO USE." | Authentic |
| Hero paragraph | Six years, fintech/healthtech/consumer | Authentic |
| About — text | Three paragraphs, specific to Paul | Authentic |
| About — stats | 6+ years, 20+ projects, 4 countries | Authentic |
| About — timeline | 5 entries from 2020–now | Authentic |
| Services | Four service types, plain-language descriptions | Authentic |
| FeaturedWork — Prism | Description, stats, real screenshots (2/3) | Mostly authentic |
| FeaturedWork — ApplyAI | Description, stats | Authentic (no screenshots) |
| FeaturedWork — Alfera | Description | Authentic (all images are stock) |
| More Work (04–07) | Titles and years only, no detail pages | Partial |
| Essays | 6 titles with real excerpts | Placeholder (no full content) |
| Library | Real book list via `src/lib/library.ts` | Authentic |
| Contact | FAQ answers, email, LinkedIn | Authentic |
| Footer nav | Real project links (post-session) | Authentic |
| Footer social | LinkedIn is real; Instagram and X are `#` | Partial |
| OG image | Does not exist | Missing |
| 404 page | Was Next.js default | Missing (fixed in session) |

---

## Design System Notes

**Color model.** Tokens are defined in both `@theme {}` (Tailwind v4) and `:root {}` (plain CSS variables) at the top of `globals.css`. Components use `var(--token)` directly.

**Background levels:** `--bg` `#0D0C0B` (base), `--bg-elevated` `#141312` (raised surfaces), `--bg-inset` `#080807` (sunken, used for footer and contact)

**Text levels:** `--text` `#EDEAE3` (body), `--text-muted` `#8A857C` (secondary), `--text-faint` `#565049` (labels/metadata)

**Accent (post-session):** `#D4A255` / `oklch(73% 0.19 58)` — richer amber. Previous was `#C2A878`. Hover variant is `#E5B96A`.

**Line tokens:** `--line` at 12% opacity white, `--line-strong` at 22% opacity white.

**Type classes:** `.font-display` applies Anton + `text-transform: uppercase`. `.font-mono` applies Space Mono. Body text uses Inter implicitly via `body { font-family: var(--font-body-stack) }`.

**Layout:** `.container-site` caps at 1440px with `clamp(1.25rem, 5vw, 6rem)` horizontal padding. `.section-pad` applies `clamp(6rem, 14vw, 14rem)` vertical padding.

**Utilities:** `.hairline` is a 1px top border at `--line` opacity. `.img-hover` adds a scale-on-hover to child images. `.link-accent` is the amber underline anchor style.

**Custom scrollbar:** 5px width, transparent track, rounded `--line-strong` thumb.

**Selection color:** `--accent` background, `--bg` text — matches the amber accent.

**Keyframes defined:** `spin-slow` (20s, used on the Hero badge), `bounce-y` (1.6s, used on the scroll arrow), `marquee` (30s linear, used in Ticker).
