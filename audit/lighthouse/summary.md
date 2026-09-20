# Lighthouse Estimates
paulojuri.com — Phase 0
Date: 2026-05-22

IMPORTANT: These are estimates based on static code review. They have not been measured with real Lighthouse, WebPageTest, or Chrome DevTools. Real scores can only be obtained by running Lighthouse against the live site or a local production build. Treat these as "likely range" assessments, not measurements.

---

## Homepage (/)

### Performance — Estimated: 70–82

**What should be fast:**
- No images in the homepage components — all visual elements are CSS color blocks, text, and borders. No LCP image to optimize.
- Fonts: Playfair Display, DM Sans, DM Mono served via `next/font/google` with `display: 'swap'`. Next.js self-hosts these at build time, so no third-party font CDN round-trip. Font files served from the same domain.
- LCP candidate: The h1 text "Building at the intersection of code, craft, and culture." — text LCP is fast.
- `<html>` has `background: var(--paper)` (`#F4ECE0`) defined in the CSS, preventing flash of unstyled content.

**What will hurt performance:**
- **JS bundle size is the main risk.** Production dependencies include three.js (^0.184.0, ~600KB raw), @react-three/fiber, @react-three/drei, @react-three/postprocessing, react-spring, GSAP, Lenis, Howler.js, and Zustand. Even if `HeroGL` and the library-walk components are dynamically imported (not confirmed in reviewed code), the shared chunk will be large.
- `page.tsx` imports `gsap` via `@/lib/gsap` — if GSAP ScrollTrigger is registered globally in that module, it loads on every page, not just scroll-animated pages.
- `LenisProvider` wraps the entire app in the root layout — Lenis loads on every route, including routes that may not need smooth scroll.
- `ContactCTA` is a client component (`'use client'`) with GSAP imported — adds to client JS.

**Estimated scores:**
- First Contentful Paint: 1.0–1.8s (likely fast — text-based LCP, no blocking resources)
- LCP: 1.2–2.5s (text LCP, should be quick)
- Total Blocking Time: 100–400ms (depends on JS parse/execution of bundle)
- Cumulative Layout Shift: 0.0–0.05 (no images, fonts have display:swap, minimal layout shift risk)
- Speed Index: 1.5–3.0s

**To measure accurately:**
- Run `npx next build && npx next start` locally with production optimizations
- Use Lighthouse in Chrome DevTools on the production URL (not dev server)
- Check `.next/analyze` bundle output with `@next/bundle-analyzer`

---

## /library/walk — Estimated: 30–50

**This page will score poorly on performance by design.** It loads:
- Three.js full scene
- @react-three/fiber renderer
- @react-three/drei helpers
- @react-three/postprocessing (bloom, DOF)
- Howler.js audio engine
- GSAP
- Zustand store
- A 3D room geometry, multiple Book3D instances, RosieCharacter model, lighting rigs

The `gpuTier` detection happens inside the scene, not at the route level. There is no pre-visit performance budget check.

**Recommendation:** Dynamic import the entire `<Scene>` with `next/dynamic` and `{ ssr: false }`, add a quality selector at the Preloader level, and document that this page will always have a lower Lighthouse score as an acceptable trade-off.

---

## Accessibility — Estimated: 85–92

**Should score well:**
- `lang="en"` on `<html>`
- Skip-to-content link
- `aria-label` on main nav, footer nav, form sections
- `aria-current="page"` on active nav links
- `role="status"`, `aria-live="polite"` on form success
- `role="alert"`, `aria-live="assertive"` on form errors
- `:focus-visible` outlined with 2px --accent, 3px offset
- `aria-hidden="true"` on all decorative elements (dots, ghost numbers, stripes)
- Form labels with `htmlFor` matching `id` on all fields (both form instances)
- `prefers-reduced-motion` respected in global CSS and NowStrip

**Will lose points:**
- Color contrast: --muted (#6B6457) on --paper (#F4ECE0) — needs measurement (see a11y/summary.md)
- Label text at 0.56rem (likely 9px rendered) — Lighthouse flags text < 12px as too small
- Mobile menu does not trap focus inside overlay when open

**Automated Lighthouse a11y checks would likely pass:** ARIA roles, form labels, image alt text (no images on homepage), link names, document title.

---

## Best Practices — Estimated: 90–95

**Should pass:**
- HTTPS
- No deprecated APIs in reviewed code
- `rel="noopener noreferrer"` on all `target="_blank"` links
- Image elements use `<img>` via Next.js Image or are absent entirely
- No inline event handlers (uses React synthetic events)
- `type="email"` and `autoComplete` on form fields

**Unknowns:**
- No Content Security Policy headers visible in codebase (would score lower if absent)
- Console errors/warnings at runtime not measurable from static code review

---

## SEO — Estimated: 90–95

**Should pass:**
- `<title>` and `<meta name="description">` on all audited pages
- `metadataBase` set correctly
- `<html lang="en">`
- robots meta: index, follow
- One `<h1>` per page
- Sitemap referenced in robots.txt
- JSON-LD structured data on homepage

**Will lose points:**
- OG image missing on /about, /services, /contact, /library, /journal (Lighthouse doesn't penalize this but some SEO tools do)
- /work h1 at clamp(1.1rem, 2vw, 1.5rem) may be flagged as visually insufficient

---

## What needs actual measurement

1. **JS bundle size** — run `ANALYZE=true next build` with bundle analyzer
2. **Contrast ratios** — measure #6B6457 on #F4ECE0, rgba(244,236,224,0.45) on #1A1815
3. **CLS** — watch for font swap shift on Playfair Display (large headings at render)
4. **TBT/TTI** — depends on how much JS hydrates on homepage load
5. **Real device testing** — library/walk on mid-range Android
6. **Network tab** — confirm three.js is NOT loaded on homepage (verify dynamic imports)
7. **Security headers** — check Cloudflare edge config for CSP, X-Frame-Options, etc.
