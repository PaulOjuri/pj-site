# Accessibility Audit
paulojuri.com — Phase 0
Date: 2026-05-22
Method: Static code review of src/ files. No automated axe/Lighthouse run performed.

---

## Summary rating: Moderate — good foundations, specific gaps

The codebase shows genuine accessibility awareness: skip link, ARIA landmarks, form label/id pairing, aria-live regions, reduced-motion support, and focus-visible styles are all present. The gaps are specific rather than systemic: color-only status communication, focus trapping in the mobile menu overlay, very small text in metadata labels, and missing form validation feedback at the field level.

---

## 1. Missing Alt Text

**Finding: No `<img>` elements found on the homepage, work list, or about page.**
All visual content uses CSS backgrounds (solid color blocks via `background: heroColor`), text, and SVG. The library-walk has Three.js canvas which is inherently inaccessible to screen readers but is a bonus interactive feature, not essential content. No alt text issues on the pages reviewed.

**Action needed:** Verify that work case study detail pages (`/work/[slug]`) and journal post pages (`/journal/[slug]`) include `alt` text on any images embedded in MDX content. The `prose-components.tsx` file at `src/lib/prose-components.tsx` likely wraps MDX `<img>` — confirm it includes alt attributes.

---

## 2. Form Labels

**Finding: All form fields have properly associated labels.**

### ContactForm (/contact)
- Name: `<label htmlFor="cf-name">` / `<input id="cf-name">`
- Email: `<label htmlFor="cf-email">` / `<input id="cf-email">`
- What's this about?: `<label htmlFor="cf-subject">` / `<input id="cf-subject">`
- Message: `<label htmlFor="cf-message">` / `<textarea id="cf-message">`

### ContactCTA (homepage)
- Name: `<label htmlFor="cta-name">` / `<input id="cta-name">`
- Email: `<label htmlFor="cta-email">` / `<input id="cta-email">`
- What's this about?: `<label htmlFor="cta-subject">` / `<input id="cta-subject">`
- Message: `<label htmlFor="cta-message">` / `<textarea id="cta-message">`

The label text is `label-caps` class at `fontSize: '0.6rem'` — very small, but the label is present and functional. Labels use `rgba(244,236,224,0.3)` on dark background (ContactCTA) or `text-muted` (#6B6457) on cream (ContactForm).

**Action needed:** The label color in ContactCTA is `rgba(244,236,224,0.3)` on `var(--ink)` (#1A1815 background). This is approximately equivalent to ~#AFA89F on dark — very low contrast. Users with low vision may not see form labels in the homepage form. Calculate exact contrast ratio.

---

## 3. Color Contrast Issues

### Critical: Body text on dark sections

**rgba(244,236,224,0.45) on #1A1815 (AboutTeaser body copy)**
- Foreground: rgba(244,236,224,0.45) composited over #1A1815 → approximately #8B8174
- Background: #1A1815
- Estimated contrast ratio: ~4.2:1
- WCAG AA requires 4.5:1 for normal text, 3:1 for large text (>18pt or >14pt bold)
- At `var(--text-base)` (0.9375rem–1rem = 15–16px, not bold), this fails WCAG AA for normal text.
- Status: **Likely fail** — needs exact measurement

**rgba(244,236,224,0.5) on #1A1815 (ContactCTA body copy)**
- Slightly lighter than above, approximately #978E84 on #1A1815
- Estimated contrast ratio: ~4.8:1
- Status: **Likely pass** at 4.8:1 for normal text (just above 4.5:1 threshold)
- Still low — recommend verifying

**rgba(244,236,224,0.3) on #1A1815 (ContactCTA labels, eyebrow labels)**
- Approximately #6E6862 on #1A1815
- Estimated contrast ratio: ~3.0:1
- At label-caps 0.6rem (10px rendered) — fails WCAG AA for normal text (requires 4.5:1)
- Status: **Fail** — text is too small AND too low contrast

### Medium: Muted text on paper background

**--muted (#6B6457) on --paper (#F4ECE0)**
- Foreground: #6B6457
- Background: #F4ECE0
- Approximate contrast ratio: ~4.0:1 (needs exact measurement with contrast checker)
- WCAG AA requires 4.5:1 for normal text, 3:1 for large text
- Status: **Likely fail for small body text** (text-base 15–16px), **likely pass for large headings**
- This color pairing is used extensively: subheading text, metadata labels throughout the site

### Low concern: --subtle (rgba(26,24,21,0.28)) on --paper

Used for decorative borders and aria-hidden elements — no readable text uses this color.

### Accent on paper (CTAs, hover states)

**--accent (#C8553D) on --paper (#F4ECE0)**
- Foreground: #C8553D
- Background: #F4ECE0
- Approximate contrast ratio: ~3.9:1
- Text at this color pairing includes "View case study →" labels at 0.6rem
- Status: **Fail for small text** — 3.9:1 is below 4.5:1

---

## 4. Heading Hierarchy Issues

**Finding: Multiple `<h2>` elements used for section titles that are structurally sub-sections of an `<h1>`.**

### Homepage
- `<h1>` in Hero: "Building at the intersection of code, craft, and culture."
- `<h2>` in SelectedWork: "Selected work" ✓ correct level
- `<h2>` in AboutTeaser: "Engineer by training, designer by conviction." ✓ correct level
- `<h2>` in JournalTeaser: "Journal" ✓ correct level
- `<h2>` in ContactCTA: "Have a project in mind?" ✓ correct level
- `<h3>` in JournalTeaser rows for post titles ✓ correct level

### /work page
- `<h1>` "Products, tools, and systems I've built..." — visually unsatisfying but semantically correct
- `<h2>` for hero featured project (Prism) — treated as a project title
- `<h2>` for secondary card project titles
- `<h2>` for "Other work" table project titles (in mobile AND desktop layouts)
- **Issue:** Multiple `<h2>` elements on the work page are all peer-level project titles within an `<ol>` list. Using `<h2>` inside `<li>` or link elements is semantically unusual — heading levels inside lists create an ambiguous document outline. Better practice is to use descriptive `aria-label` on the card links and keep headings outside lists, or use `<h2>` for section headers and `<h3>` for project titles.

### /about page
- `<h1>`: "I make software that feels like it was made for humans."
- `<h2>` elements used for: individual experience items (Prism, Freelance, etc.), individual principles (Clarity before code, etc.)
- **Issue:** Experience items and principles are each `<h2>` — same level as a page section heading — when they are clearly sub-items of the "Experience" and "How I work" sections. These should be `<h3>` at minimum. The "Experience" section is introduced only by a `<p className="label-caps">Experience</p>` paragraph, not an `<h2>`, making the heading hierarchy inconsistent: `<h2>` items (experience/principle items) have no `<h2>` parent section heading.

---

## 5. ARIA Issues

### Mobile menu overlay
```tsx
<div
  className={`fixed inset-0 ...`}
  style={{ zIndex: 200 }}
  aria-hidden={!menuOpen}
>
```
- `aria-hidden={!menuOpen}` on the overlay correctly hides it from the accessibility tree when closed.
- **Issue:** When the menu is open (`menuOpen = true`), `aria-hidden={false}` is applied (removes the attribute). Focus is NOT explicitly moved into the overlay on open, and there is no `aria-modal` attribute. Screen reader users may not know the menu opened. Correct pattern: on open, move focus to the first menu link; on close, return focus to the hamburger button.

### Hamburger button
```tsx
<button
  aria-label={menuOpen ? 'Close menu' : 'Open menu'}
  aria-expanded={menuOpen}
  onClick={() => setMenuOpen(v => !v)}
>
```
- `aria-label` and `aria-expanded` are correctly implemented. This is good.
- Missing: `aria-controls` pointing to the overlay's id. Not required but recommended.

### WorkRow component (SelectedWork)
```tsx
<div
  role="group"
  className="group relative flex flex-col..."
  onClick={() => router.push(`/work/${work.slug}`)}
>
```
- The outer div has `role="group"` and `onClick` for router navigation but is not a link, button, or interactive element. It has no `aria-label`, no `tabIndex`, and no keyboard event handler (`onKeyDown`). The inner `<Link>` is the correct interactive element, but the entire row is clickable — keyboard-only users cannot activate the row by pressing Enter on the div.
- **Issue:** The clickable `role="group"` div is not keyboard accessible. Users who tab through will land on the `<Link>` (project title) and can activate that, but the outer click target that navigates is inaccessible via keyboard.

### NowStrip
- `aria-label="Current status"` on the outer div — good.
- Separator ◆ is `aria-hidden="true"` — good.
- Items are rendered as `<span>` elements inside a scrolling `<div>` — no `role="list"` or `role="marquee"`. Screen readers will read the concatenated text of all visible spans, which may be confusing given the infinite scroll duplication (items rendered twice: `[...items, ...items]`).

### Status dots throughout site
```tsx
<span
  className="inline-block w-1.5 h-1.5 rounded-full"
  style={{ background: status.dot }}
  aria-hidden="true"
/>
<span className="label-caps">
  {status.label}
</span>
```
- The dot is correctly `aria-hidden`. The adjacent label text ("Live", "Shipped", "Building") is the accessible text. **This pattern is correct as long as the label span is always present.** Verify it is consistent across all work row contexts.

---

## 6. Keyboard Navigation Issues

### WorkRow (SelectedWork, homepage)
- **Issue documented above:** The outer `role="group"` div with `onClick` is not keyboard accessible. Tab focus will land on the inner `<Link>` (title), which works, but the row-level click zone is mouse-only.

### ServicesShowcase (/services)
- Service rows use `onMouseEnter`/`onMouseLeave` for hover reveals (good-for text, preview card). There is no `onFocus`/`onBlur` equivalent.
- **Issue:** The "good_for" context line (`"You have an idea but no product yet"`) inside each service row is `maxHeight: 0, opacity: 0` by default and only revealed on `isHov`. Keyboard users who tab into the service area will not see this contextual text. The service rows themselves appear to have no `tabIndex` or interactive role — they are plain `<div>` elements, meaning keyboard users cannot focus or activate them at all. There is no link or button within the service rows to navigate to a detail page.

### Mobile menu focus trap
- **Issue documented in ARIA section:** No focus trap when overlay is open. Keyboard users can tab behind the overlay.

---

## 7. Focus Management

### Skip link (layout.tsx)
```tsx
<a
  href="#main-content"
  className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[--z-top] focus:px-4 focus:py-2 focus:bg-ink focus:text-paper focus:label-caps"
>
  Skip to content
</a>
```
- Correctly implemented: visually hidden by default, appears on focus, high z-index, targets `#main-content`. All pages have `<main id="main-content">`. **Pass.**

### Form success state (ContactCTA)
```tsx
<div role="status" aria-live="polite">
  <p>Message sent.</p>
  ...
  <button onClick={() => setStatus('idle')}>Send another →</button>
</div>
```
- When the form transitions to the success state, `aria-live="polite"` announces the change. However, focus remains on the submit button area which has now been replaced by the success div. Focus should be explicitly moved to the success state container or the "Send another" button on form success.

### Form error state
- Error messages use `role="alert"` and `aria-live="assertive"` — these are announced automatically. Focus is not moved to the error message, but screen readers will interrupt and read it. Acceptable but imperfect; moving focus to the error or the first failed field would be better.

### Modal / overlay transitions
- No explicit focus management found in Nav.tsx for the mobile overlay. As noted, focus is not moved into the overlay on open, and the overlay does not trap focus.

---

## Recommended fixes by priority

| Priority | Issue | File |
|----------|-------|------|
| High | rgba(244,236,224,0.45) on #1A1815 fails contrast for body text | AboutTeaser.tsx |
| High | rgba(244,236,224,0.3) on #1A1815 fails contrast for form labels | ContactCTA.tsx |
| High | Mobile menu overlay has no focus trap | Nav.tsx |
| High | WorkRow onClick div is not keyboard accessible | SelectedWork.tsx |
| High | ServicesShowcase rows have no keyboard interaction | ServicesShowcase.tsx |
| Medium | --muted on --paper contrast: verify ~4.0:1 (borderline fail) | globals.css / all pages |
| Medium | Experience and principle items use h2 where h3 is appropriate | about/page.tsx |
| Medium | Focus not moved to success state on form submit | ContactCTA.tsx, ContactForm.tsx |
| Low | NowStrip content rendered twice (aria reading may be confusing) | NowStrip.tsx |
| Low | Hamburger button missing aria-controls | Nav.tsx |
