# Component Inventory
paulojuri.com — Phase 2
Derived from: audit/inventory.md + static code review of src/components/

Each component has: states, responsive behavior, a11y notes, and a "fix needed" flag from the audit.

---

## UI Primitives

### Button
**File:** `src/components/ui/Button.tsx`
**Variants:** primary, ghost, outline, text
**Sizes:** sm (h:36px), md (h:44px), lg (h:52px)
**Renders as:** `<button>`, `<Link>` (internal), `<a target="_blank">` (external)

| State | Behavior |
|-------|----------|
| Default | Variant-specific fill/border/color |
| Hover | `opacity-90` + `translateY(-1px)`. Only fires on `(hover: hover)` — correct. |
| Active | `scale(0.98)` + `translateY(0)` + `opacity-100` |
| Focus-visible | 2px `--accent` outline, 3px offset |
| Disabled | `opacity-40`, `cursor-not-allowed` |
| Loading | Not currently implemented — add spinner + `aria-busy` |

**Responsive:** Full-width on mobile if `w-full` class passed. Otherwise inline.

**A11y notes:**
- External links include `rel="noopener noreferrer"` ✓
- Primary CTA currently uses `color: var(--paper)` (text on terracotta) — contrast is ~4.1:1 (marginal pass for large text at 12px uppercase). **Fix:** use `color: #FFFFFF` (white). White on #C8553D = 7.1:1 ✓
- Ghost variant: ink text on paper bg — passes ✓
- `aria-disabled` should be added alongside `disabled` prop for screen reader compatibility

**Fix needed:**
- `text-on-accent` should be `#FFFFFF`, not `--paper`. See tokens.json.

---

### Tag
**File:** `src/components/ui/Tag.tsx`
**Usage:** Journal post tags, capability tags on /about

| State | Behavior |
|-------|----------|
| Default | Outlined or filled chip |
| Hover (if interactive) | bg fill |
| Active (filter selected) | filled, accent outline |
| Focus-visible | accent outline |

**A11y:** If used as filter buttons, needs `aria-pressed` for selected state.

---

### AnimatedCounter
**File:** `src/components/ui/AnimatedCounter.tsx`
**Usage:** Stats row on /about (6+, 20+, 4, 100%)

**A11y:** Animation triggered by IntersectionObserver. Must respect `prefers-reduced-motion` — if motion reduced, show final value immediately without animation. Check current implementation.

---

### Divider
**File:** `src/components/ui/Divider.tsx`
**Usage:** Between sections as a decorative rule.
**A11y:** Should be `aria-hidden="true"` — it is decorative, not structural. Use `<hr>` only when it has semantic meaning (topic break).

---

### POLogo
**File:** `src/components/ui/POLogo.tsx`
**Usage:** Nav brand mark.
**A11y:** Must have an accessible name. If used as a link to homepage, the parent `<Link>` needs `aria-label="Paul Ojuri — home"`.

---

## Layout Components

### Nav
**File:** `src/components/Nav.tsx`

| State | Behavior |
|-------|----------|
| Default | Transparent or paper bg, border-b on scroll |
| Scrolled | `border-b: 1px solid var(--ink-line)` |
| Mobile menu closed | Full nav hidden, hamburger visible |
| Mobile menu open | Full-screen overlay, z-200 |

**Responsive:**
- Desktop: horizontal nav links
- Mobile (<md): hamburger + full-screen overlay

**A11y — fixes needed (from audit):**
1. **Focus trap:** When mobile overlay opens, focus must move to first nav link. When it closes, focus must return to hamburger button. Currently neither happens.
2. **Escape key:** Add `onKeyDown` handler to close overlay on Escape.
3. **`aria-controls`:** Add `aria-controls="mobile-menu"` to hamburger button.
4. **Tab order behind overlay:** When overlay is open, links behind it must have `tabIndex={-1}` to prevent focus reaching them. Currently they remain keyboard-reachable.

**Implementation note:** Use `focus-trap-react` (lightweight) or implement a custom trap. The trap must include the close button.

---

### Footer
**File:** `src/components/Footer.tsx`

**A11y:** `aria-label="Footer navigation"` ✓. Copyright in `<small>`.

**Fix needed:** Add social links (Twitter/GitHub/LinkedIn) to footer — they exist in JSON-LD but are invisible in the UI. P2 audit finding.

---

## Section Components

### Hero
**File:** `src/components/sections/Hero.tsx`
**Current state:** Single column, copy only. Right column removed.

**Responsive:**
- Mobile: stack vertically, CTAs stacked
- Desktop: currently single column — was grid, card removed

**A11y:** `aria-labelledby="hero-heading"` on `<section>` ✓. Pulsing dot is `aria-hidden="true"` ✓.

**Fix needed (P1-5):** Identity is not established in the hero. The nav shows "Paul Ojuri" but the hero skips straight to the tagline. Consider adding a byline — small text "Paul Ojuri" or a brief intro line above the h1 that establishes who is speaking. This is copy work, not component work.

---

### NowStrip
**File:** `src/components/sections/NowStrip.tsx`

| State | Behavior |
|-------|----------|
| Playing | Continuous 40s marquee |
| Reduced motion | Animation stopped ✓ |
| Hover | No pause — **fix needed** |

**A11y:**
- `aria-label="Current status"` on outer div ✓
- Separator ◆ is `aria-hidden="true"` ✓
- Content is duplicated (`[...items, ...items]`) — screen readers will read items twice. Wrap one copy in `aria-hidden="true"` to prevent double-reading.
- Add `role="marquee"` or `role="status"` for context.

**Fix needed:**
1. Add `onMouseEnter` / `onFocus` pause, `onMouseLeave` / `onBlur` resume.
2. Add `aria-hidden="true"` on the duplicate second pass of items.
3. Replace fragile `[style*="marquee"]` selector in reduced-motion override with a CSS class.

---

### SelectedWork
**File:** `src/components/sections/SelectedWork.tsx`

| State | Behavior |
|-------|----------|
| Default | List of 3 work rows |
| Row hover | Dark fill + left accent stripe + "Case study →" reveal |
| Row active | Navigates to /work/[slug] |
| Scroll entrance | GSAP fade+slide in |

**Responsive:**
- Mobile: simplified row (no hover interaction)
- Desktop: full hover interaction

**A11y — fix needed (HIGH PRIORITY from audit):**
The outer `role="group"` div with `onClick={() => router.push(...)}` is NOT keyboard accessible. The clickable area is mouse-only.

**Correct pattern:**
```tsx
// Wrap the entire row in a <Link> or use a <button> + router.push
// The inner <Link> for the project title creates a nested-link issue
// Solution: make the outer wrapper the <Link>, remove inner anchor
<Link href={`/work/${work.slug}`} className="group block relative...">
  {/* all row content here — no nested <a> or <Link> inside */}
</Link>
```

---

### AboutTeaser
**File:** `src/components/sections/AboutTeaser.tsx`

**A11y — fix needed:**
Body copy uses `rgba(244,236,224,0.45)` on `#1A1815` background — contrast ~4.2:1, **fails WCAG AA** for normal body text. Replace with `color.dark.text` (#E5DDD2) — passes at 12.4:1.

Stats (`6+ years`, `20+ projects`) conveyed by large numbers. These numbers are currently decorative; the label text provides the semantics. Confirm the label text is always announced by screen readers (not inside an `aria-hidden` container).

---

### JournalTeaser
**File:** `src/components/sections/JournalTeaser.tsx`

**A11y:** Post rows use GSAP entrance. Each row should be a `<Link>` with accessible name. Confirm `role="list"` on the `<ol>` and `role="listitem"` on `<li>` (or native semantics via `<ol>/<li>`).

---

### ContactCTA
**File:** `src/components/sections/ContactCTA.tsx`
**Dark section variant of the contact form.**

| State | Behavior |
|-------|----------|
| Idle | Form visible |
| Sending | Button shows "Sending…", `aria-busy`, fields disabled |
| Success | Form replaced by success message, `role="status"` |
| Error | Error message shown, `role="alert"` |

**A11y — fixes needed:**
1. Form label color `rgba(244,236,224,0.3)` on dark bg — **fails WCAG AA**. Replace with `color.dark.text-muted` (#AEA89F) at minimum, or full `color.dark.text` (#E5DDD2).
2. On form success, move focus explicitly to the success message container.
3. The progress bar is `aria-hidden="true"` ✓ but does not reflect that the form is partially complete — consider removing (it tracks 3 of 4 fields, creating an inaccurate completion signal).
4. "Subject" field — make consistent with ContactForm: both should be optional, or both required. Currently inconsistent (P0-4 in audit).

---

### ContactForm
**File:** `src/components/sections/ContactForm.tsx`
**Light section variant — used on /contact.**

**Fix needed:**
- Align "Subject" required status with ContactCTA (P0-4 — both should be optional or both required).
- On form success, move focus to success container.
- Add field-level validation (not just server-side) — show inline error on blur for email field.

---

### ServicesShowcase
**File:** `src/components/sections/ServicesShowcase.tsx`

| State | Behavior |
|-------|----------|
| Default | 4 service title rows, giant ghost numbers |
| Row hover (desktop) | bg tint fill + ghost number color + "good for" text reveal + floating cursor card |
| Floating card | Follows mouse cursor, shows service title + body copy |

**Responsive:**
- Desktop: full hover interaction
- Mobile: **broken** — "good for" text permanently hidden, cursor card hidden. Row has no interactive affordance.

**A11y — fix needed (HIGH PRIORITY):**
1. Service rows are plain `<div>` elements — no `tabIndex`, no keyboard interaction, no `role`. Keyboard users cannot interact at all.
2. "Good for" context text is `maxHeight: 0, opacity: 0` by default and only revealed by `isHov`. Keyboard users never see it.
3. The floating cursor card is mouse-cursor-following — completely inaccessible.

**Fix plan:**
- Each row should be a `<button>` or expandable `<details>/<summary>`.
- "Good for" text should be visible at all times on mobile, or revealed via focus/click on the row.
- Floating cursor card: on focus/keyboard interaction, show as a static tooltip below the row instead of following the cursor.
- Add `aria-expanded` to each row if using accordion pattern.
- Add CTA button at the bottom of the section (P0-3 in audit — the services page currently has NO CTA).

---

### JournalMasthead + JournalGrid
**Files:** `src/components/sections/JournalMasthead.tsx`, `JournalGrid.tsx`

**A11y:**
- Tag filter buttons need `aria-pressed` for selected state.
- When filters change, announce result count via `aria-live="polite"`.

---

### WorkHero
**File:** `src/components/sections/WorkHero.tsx`

**Fix needed:** Not a component fix, but the work page h1 must be restored to full heading size. The current `clamp(1.1rem, 2vw, 1.5rem)` override that makes it smaller than the eyebrow label must be removed.

---

### WorkProgressBar
**File:** `src/components/sections/WorkProgressBar.tsx`

**A11y:** Should have `role="progressbar"`, `aria-valuenow` updated on scroll, `aria-valuemin="0"`, `aria-valuemax="100"`, `aria-label="Reading progress"`.

---

## New components needed (Phase 4)

These components are needed to address audit findings but do not exist yet:

### TestimonialCard *(new)*
**Purpose:** Display a client testimonial with name, role, company, quote.
**Location:** Work case study pages, potentially /about CTA area.
**A11y:** `<figure>` + `<blockquote>` + `<figcaption>` pattern.
**Note:** Only add when real content exists. Use `// TODO: real testimonial from [name]` placeholder in the interim.

### OutcomeMetric *(new)*
**Purpose:** Display a quantified project outcome ("Reduced onboarding time by 40%").
**Location:** Work case study pages, AboutTeaser stats area.
**Note:** Only add when real metrics exist.

### ServicesCTA *(new)*
**Purpose:** A CTA section appended to the ServicesShowcase.
**Location:** Bottom of /services page.
**Content:** Headline + subtext + contact button. Addresses P0-3 audit finding.

### OGImage templates *(new)*
**Purpose:** Generate OG images for /about, /services, /contact, /library, /journal.
**Location:** `src/app/*/opengraph-image.tsx` for each missing page.
**Addresses:** P1-2 audit finding.

---

## Components to audit / possibly remove

- `ServicesAccordion.tsx` — exists but unclear if used. If unused, delete.
- `ServicesEngagement.tsx` — exists but unclear if used. If unused, delete.
- `AboutTimeline.tsx` vs `AboutHorizontalTimeline.tsx` — two versions exist. Confirm which is active, delete the unused one.
- `HeroGL` — exists as a component but not imported in current `page.tsx`. Either use it intentionally or delete it to prevent accidental bundle inclusion.

---

## Component priority for Phase 4 implementation

| Priority | Component | Reason |
|----------|-----------|--------|
| P0 | ServicesShowcase keyboard/mobile fix | Services rows inaccessible to keyboard/touch |
| P0 | ServicesShowcase CTA | No CTA on purchase-intent page |
| P0 | Nav focus trap | Mobile menu focus management broken |
| P0 | SelectedWork accessible row | Mouse-only click target |
| P0 | ContactCTA/Form contrast fix | WCAG AA fails |
| P0 | Work page h1 size fix | Broken visual hierarchy |
| P1 | NowStrip pause-on-hover | Interaction completeness |
| P1 | OG images for missing pages | Social sharing |
| P1 | Services mobile "good for" visibility | Content hidden on touch |
| P1 | About page h2→h3 fix | Heading hierarchy |
| P1 | Form focus-on-success | Focus management |
| P2 | Footer social links | Discoverability |
| P2 | Alfera accent color deduplication | Data consistency |
