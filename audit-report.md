# paulojuri.com — Audit Report

**Date:** 2026-05-15
**Auditor:** Claude Code
**Scope:** Full site audit against style guide brief

---

## P0 — Critical (blocks usability)

### P0-1 · Headers cut off behind fixed nav
**File:** All page-level first sections
**Symptom:** Fixed nav (64px) overlaps page content when scrolling to anchor links or loading mid-page.
**Root cause:** No `scroll-padding-top` on `html`; no `scroll-margin-top` on sections; first-section top padding inconsistent.
**Fix applied:**
- Added `--nav-height: 64px` to `:root` in `globals.css`
- Added `scroll-padding-top: calc(var(--nav-height) + 24px)` on `html`
- Added `.page-header { padding-top: calc(var(--nav-height) + var(--section-lg)) }` utility
- Added `section[id] { scroll-margin-top: calc(var(--nav-height) + 24px) }` rule
- Applied `.page-header` to first sections across all 8 pages

---

### P0-2 · Logo identity broken (abbreviated initials, not name)
**File:** `src/components/layout/Nav.tsx`, `src/components/layout/Footer.tsx`
**Symptom:** Nav showed a terracotta SVG badge with "PO" initials. Brief requires the full name "Paul Ojuri" in Playfair Display italic.
**Fix applied:**
- Removed `<POLogo size={28} variant="badge" />` from Nav
- Replaced with `<span style={{ fontFamily: 'var(--font-sans)', fontStyle: 'italic', fontSize: '1.375rem', letterSpacing: '-0.02em' }}>Paul Ojuri</span>`
- Same replacement in Footer at `1.25rem`
- `POLogo` import removed from both files; component still used in `ContactCTA` as decorative mark only

---

## P1 — High (degrades experience significantly)

### P1-1 · Section padding inconsistent across pages
**Files:** All page `*.tsx`, `Hero.tsx`, `WorkHero.tsx`, `journal/[slug]/page.tsx`
**Symptom:** Mix of `pt-28`, `pt-32`, `pt-36` with no shared token. Dark/light section boundaries unequal.
**Fix applied:**
- Defined `--section-lg: 7.5rem` (120px), `--section-md: 6rem` (96px), `--section-sm: 4rem` (64px) in `:root`
- Unified all first-section top padding via `.page-header` class
- Hero updated from `pt-28` to `calc(var(--nav-height) + var(--section-lg))`

---

### P1-2 · Missing `aria-live` on form status changes
**Files:** `ContactForm.tsx`, `ContactCTA.tsx`
**Symptom:** Screen readers do not announce form success or error states without polling.
**Fix applied:**
- Success containers: `role="status" aria-live="polite"`
- Error paragraphs: `aria-live="assertive"` added alongside existing `role="alert"`

---

### P1-3 · Headings lack `text-wrap: balance`; paragraphs lack max-width constraint
**File:** `globals.css`
**Symptom:** Long headings can produce single-word orphans on narrow viewports. Prose lines exceed comfortable reading width.
**Fix applied:**
- `h1, h2, h3, h4 { text-wrap: balance }` added globally
- `.prose-body { max-inline-size: 65ch; text-wrap: pretty }` utility added

---

## P2 — Medium (polish / consistency)

### P2-1 · Nav opaque state only triggers after 40px scroll
**File:** `Nav.tsx`
**Symptom:** At scroll position 1–39px nav background is `bg-paper/95`; subtle bleed of dark sections.
**Status:** Accepted — nav goes fully opaque at 40px which is below one screen-height worth of content. Not changed.

### P2-2 · `POLogo` SVG badge orphaned after identity change
**File:** `src/components/ui/POLogo.tsx`
**Symptom:** `badge` variant now unused; only `mark` variant is used in `ContactCTA`.
**Status:** File retained — component may be useful for future favicon/OG use. `badge` variant not deleted.

### P2-3 · Contact page availability date stale (`Q3 2025`)
**File:** `src/app/contact/page.tsx:110`
**Symptom:** "Available for new projects — Q3 2025" shown in May 2026.
**Status:** Not fixed in this pass — content update only, not a code issue.

---

## P3 — Low (minor / informational)

### P3-1 · `ScrollTrigger` imported but unused in `ContactCTA.tsx`
**File:** `src/components/sections/ContactCTA.tsx:4`
**Symptom:** Named import may generate a lint warning.
**Status:** Noted; TypeScript does not error on this. No change.

### P3-2 · `text-wrap: balance` not supported on Firefox < 121
**File:** `globals.css`
**Symptom:** Older Firefox versions silently ignore the property; fallback is default wrapping.
**Status:** Accepted — progressive enhancement, no functional impact.

---

## Confirmed passing

- `<html lang="en">` — ✅ `src/app/layout.tsx:1`
- Skip-to-content link — ✅ `src/app/layout.tsx` (sr-only, focus:not-sr-only)
- `<h1>` on every page — ✅ verified across all routes
- `noValidate` on all forms — ✅ ContactForm, ContactCTA
- `aria-label` on all `<nav>` elements — ✅ Nav (main/footer), ContactCTA budget group
- `alt` text on all `<img>` / `<Image>` — ✅ ProjectLogoCard, BookShelf
- `rel="noopener noreferrer"` on external links — ✅ Footer socials, Contact page LinkedIn
- Form inputs have associated labels or `aria-label` — ✅ FloatingInput uses `id`+`label` via Field wrapper
