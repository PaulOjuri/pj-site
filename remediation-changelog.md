# Remediation Changelog

**Date:** 2026-05-15
**Session:** Full audit + remediation pass

---

## `src/app/globals.css`

**Changes:**
1. Added `--nav-height: 64px` to `:root`
2. Added `--section-lg: 7.5rem`, `--section-md: 6rem`, `--section-sm: 4rem` to `:root`
3. Added `scroll-padding-top: calc(var(--nav-height) + 24px)` to `html` rule
4. Added `.page-header` utility: `padding-top: calc(var(--nav-height) + var(--section-lg))`
5. Added `section[id] { scroll-margin-top: calc(var(--nav-height) + 24px) }`
6. Added `.prose-body { max-inline-size: 65ch; text-wrap: pretty }`
7. Added `h1, h2, h3, h4 { text-wrap: balance }` global rule

**Rationale:** Establishes nav-aware spacing system and WCAG-supportive reading widths across the whole site.

---

## `src/components/layout/Nav.tsx`

**Changes:**
1. Removed `import { POLogo }` line
2. Replaced `<POLogo size={28} variant="badge" />` with cursive Playfair Display italic `<span>Paul Ojuri</span>`

**Rationale:** §01.2 — identity must show full name in editorial serif italic, not SVG initials abbreviation.

---

## `src/components/layout/Footer.tsx`

**Changes:**
1. Removed `import { POLogo }` line
2. Replaced `<POLogo size={30} variant="badge" />` with matching cursive `<span>Paul Ojuri</span>` at `1.25rem`

**Rationale:** Consistent logo identity treatment across nav and footer.

---

## `src/components/sections/Hero.tsx`

**Changes:**
1. Removed `pt-28` Tailwind class from section
2. Added `style={{ paddingTop: 'calc(var(--nav-height) + var(--section-lg))' }}`

**Rationale:** §01.3 — unified first-section padding using design tokens.

---

## `src/components/sections/WorkHero.tsx`

**Changes:**
1. Replaced `pt-36` with `page-header` class on inner container div

**Rationale:** §01.3 — consistent first-section padding.

---

## `src/components/sections/ContactForm.tsx`

**Changes:**
1. Added `role="status" aria-live="polite"` to success state div
2. Added `aria-live="assertive"` to error `<p>` (alongside existing `role="alert"`)

**Rationale:** §WCAG 4.1.3 — status messages must be programmatically determined without focus.

---

## `src/components/sections/ContactCTA.tsx`

**Changes:**
1. Added `role="status" aria-live="polite"` to success state div
2. Added `aria-live="assertive"` to error `<p>`

**Rationale:** Same as ContactForm — WCAG 4.1.3 compliance.

---

## `src/app/about/page.tsx`

**Changes:**
1. First section: `pt-36` → `page-header`

---

## `src/app/contact/page.tsx`

**Changes:**
1. First section: `pt-36` → `page-header`

---

## `src/app/services/page.tsx`

**Changes:**
1. First section: `pt-36` → `page-header`

---

## `src/app/journal/page.tsx`

**Changes:**
1. First section: `pt-36` → `page-header`

---

## `src/app/library/page.tsx`

**Changes:**
1. First section: `pt-36` → `page-header`

---

## `src/app/work/page.tsx`

**Changes:**
1. `<main className="pt-36 ...">` → `<main className="page-header ...">`

---

## `src/app/journal/[slug]/page.tsx`

**Changes:**
1. Article header: `pt-32` → `page-header`

---

## Files reviewed, no changes needed

- `src/app/layout.tsx` — `lang="en"`, skip-link, font variables all correct
- `src/app/not-found.tsx` — `<h1>`, aria-hidden ghost number, correct
- `src/components/ui/Button.tsx` — padding, contrast correct
- `src/components/ui/Tag.tsx` — color variants, animated prop correct
- `src/lib/jsonld.ts` — structured data correct
