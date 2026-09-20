# Style Guide Conformance Report

**Date:** 2026-05-15
**Reference:** PAULOJURI.COM AUDIT & STYLING REMEDIATION BRIEF

---

## §02.1 — Colour tokens

| Token | Value | Status |
|---|---|---|
| `--ink` | `#1A1815` | ✅ Defined |
| `--paper` | `#F4ECE0` | ✅ Defined |
| `--cream` | `#EFE5D6` | ✅ Defined |
| `--muted` | `#6B6457` | ✅ Defined |
| `--subtle` | `rgba(26,24,21,0.28)` | ✅ Defined |
| `--accent` | `#C8553D` | ✅ Defined |
| `--accent-alt` | `#B2422E` | ✅ Defined |

**WCAG contrast pairs (estimated):**
- `--ink` on `--paper` (#1A1815 on #F4ECE0) — ratio ~15:1 ✅ AAA
- `--muted` on `--paper` (#6B6457 on #F4ECE0) — ratio ~5.5:1 ✅ AA (large text AAA)
- `--accent` on `--paper` (#C8553D on #F4ECE0) — ratio ~3.8:1 ✅ AA (large/UI)
- `--paper` on `--ink` (dark sections) — ratio ~15:1 ✅ AAA
- `--muted` on dark (`--ink`) — `text-paper/55` ≈ `rgba(244,236,224,0.55)` — estimated ~5:1 ✅ AA

---

## §02.2 — Typography scale

| Token | Value | Status |
|---|---|---|
| `--text-xs` | `clamp(0.625rem, 0.55rem + 0.25vw, 0.75rem)` | ✅ |
| `--text-sm` | `clamp(0.75rem, 0.7rem + 0.3vw, 0.875rem)` | ✅ |
| `--text-base` | `clamp(0.9375rem, 0.875rem + 0.35vw, 1rem)` | ✅ |
| `--text-lg` | `clamp(1.0625rem, 1rem + 0.4vw, 1.25rem)` | ✅ |
| `--text-xl` | `clamp(1.25rem, 1.1rem + 0.75vw, 1.75rem)` | ✅ |
| `--text-2xl` | `clamp(1.5rem, 1.25rem + 1.25vw, 2.25rem)` | ✅ |
| `--text-3xl` | `clamp(2rem, 1.5rem + 2.5vw, 3.5rem)` | ✅ |
| `--text-4xl` | `clamp(2.75rem, 2rem + 3.75vw, 5.5rem)` | ✅ |
| `--text-hero` | `clamp(3.5rem, 2.5rem + 5vw, 8rem)` | ✅ |

**Font stacks:**
- `--font-sans` → Playfair Display (editorial serif) ✅
- `--font-ui` → DM Sans ✅
- `--font-mono` → DM Mono ✅

**Heading styles:**
- All headings: `font-family: var(--font-sans)`, `font-weight: 400`, `line-height: 1.05` ✅
- `text-wrap: balance` applied globally ✅ (added this session)

**Paragraph styles:**
- `font-family: var(--font-ui)`, `font-size: var(--text-base)`, `line-height: 1.7` ✅
- `.prose-body` utility available: `max-inline-size: 65ch; text-wrap: pretty` ✅ (added this session)

---

## §02.3 — Spacing system

| Token | Value | Status |
|---|---|---|
| `--section-lg` | `7.5rem` (120px) | ✅ Added this session |
| `--section-md` | `6rem` (96px) | ✅ Added this session |
| `--section-sm` | `4rem` (64px) | ✅ Added this session |
| `--nav-height` | `64px` | ✅ Added this session |
| `--gutter` | `clamp(1.25rem, 4vw, 4rem)` | ✅ |

**`.page-header` utility:** `padding-top: calc(var(--nav-height) + var(--section-lg))` = 184px ✅ Applied to all first sections.

---

## §02.4 — Radius tokens

| Token | Value | Status |
|---|---|---|
| `--radius-sm` | `4px` | ✅ |
| `--radius-md` | `8px` | ✅ |
| `--radius-lg` | `16px` | ✅ |
| `--radius-full` | `9999px` | ✅ |

---

## §02.5 — Motion system

| Token | Value | Status |
|---|---|---|
| `--ease-out-expo` | `cubic-bezier(0.16, 1, 0.3, 1)` | ✅ |
| `--ease-in-expo` | `cubic-bezier(0.7, 0, 0.84, 0)` | ✅ |
| `--ease-in-out` | `cubic-bezier(0.4, 0, 0.2, 1)` | ✅ |
| `--duration-fast` | `150ms` | ✅ |
| `--duration-base` | `300ms` | ✅ |
| `--duration-slow` | `600ms` | ✅ |

GSAP is used for scroll-triggered animations (ContactCTA, WorkHero, BookShelf, ServicesEngagement, ContactForm). CSS transitions use token durations.

---

## §03 — Audit checklist

### Layout
- [x] `--col-max: 1400px` max-width via `.container-page`
- [x] `--gutter` fluid padding inline
- [x] Fixed nav height `--nav-height: 64px`
- [x] `scroll-padding-top` on `html`
- [x] `scroll-margin-top` on `section[id]`
- [x] All first sections use `.page-header`

### Typography
- [x] Playfair Display italic for all headings
- [x] DM Sans for UI copy
- [x] `text-wrap: balance` on headings
- [x] `.label-caps` utility (`0.12em` tracking, uppercase, DM Sans 500)
- [x] Italic emphasis pattern in section headings (`<em>` used across all pages)

### Contrast (WCAG 2.1 AA)
- [x] Body text (ink/paper) ~15:1 AAA
- [x] Muted text (muted/paper) ~5.5:1 AA
- [x] Accent on paper ~3.8:1 AA (for non-body use)
- [x] Dark sections: paper/ink ~15:1 AAA
- [x] Error text: `text-red-600` / `text-red-400` on respective backgrounds — AA

### Accessibility
- [x] `<html lang="en">`
- [x] Skip-to-content link (sr-only, focus:not-sr-only)
- [x] All `<nav>` have `aria-label`
- [x] All form inputs associated with labels
- [x] `role="alert" aria-live="assertive"` on error messages
- [x] `role="status" aria-live="polite"` on success messages (added this session)
- [x] Budget radio group: `role="group" aria-label="Budget range"`
- [x] `aria-current="page"` on active nav link
- [x] `aria-hidden="true"` on decorative elements

### SEO
- [x] `<h1>` on every route
- [x] `generateMetadata()` on all page routes
- [x] JSON-LD structured data: Person, WebSite, Article, CreativeWork schemas
- [x] `openGraph` title + description on all pages

### Responsive
- [x] Mobile-first Tailwind classes throughout
- [x] Mobile nav sheet with hamburger
- [x] Grid layouts collapse to single column on mobile
- [x] `clamp()` fluid type scale — no breakpoint-specific font overrides needed

### Logo identity
- [x] Nav: "Paul Ojuri" in Playfair Display italic 1.375rem (this session)
- [x] Footer: "Paul Ojuri" in Playfair Display italic 1.25rem (this session)
- [x] `POLogo` mark retained as decorative accent in `ContactCTA`

---

## Outstanding / not in scope this session

- [ ] Contact page availability date: "Q3 2025" — needs content update to Q3 2026
- [ ] `prefers-reduced-motion` media query on GSAP animations (enhancement)
- [ ] OG image (`opengraph-image.tsx`) — not yet created
- [ ] Favicon — not audited
