# Anti-Patterns Checklist
**paulojuri.com** | Run before every PR that touches UI, animation, or layout.

Check all boxes before merging. If a box cannot be checked, document why in the PR description — do not skip silently.

---

## Motion & Interaction

- [ ] **Animation serves no purpose.** Every animation that ships can answer the question: "What does the user understand because of this motion that they would not understand without it?" If the answer is "nothing," remove the animation.

- [ ] **Marquee or scroll-ticker has no pause mechanism on touch.** Any horizontally scrolling text element must pause on `touchstart` / `focus` and must respect `prefers-reduced-motion`. Auto-playing text is inaccessible by default.

- [ ] **Custom cursor renders on touch devices.** The custom cursor element must be hidden via `@media (pointer: coarse)`. Touch users should never see a trailing dot or custom crosshair. Check on an actual iPhone, not just DevTools emulation.

- [ ] **Page transitions block input or defer interactivity.** Route transition animations must not prevent click/tap events during playback. If a transition runs, interactive elements behind it must still be reachable (e.g., via keyboard). Total blocking duration must not exceed 300ms.

- [ ] **Hover-only states with no keyboard equivalent.** Every state reachable by `:hover` must also be reachable by `:focus-visible`. Spot-check: tab through the entire page and verify that all interactive states are visible and functional.

- [ ] **Animation runs without checking `prefers-reduced-motion`.** All keyframe animations and transitions must be wrapped in the global `prefers-reduced-motion: reduce` override in `tokens.css`. No animation is exempt. Verify by toggling the OS-level reduced-motion setting and reloading.

- [ ] **Spring animation overshoots by more than 40px.** The `--ease-spring` easing curve is calibrated for micro-interactions (button presses, badge pops). Do not use it for elements that translate more than 40px — it will visibly overshoot the target and look broken. Use `--ease-out` for larger positional changes.

- [ ] **Multiple animated borders visible simultaneously.** The rule is strict: never more than one `border-beam` or `border-pulse` animation visible at the same time. If two card hover states can overlap in the viewport, ensure the animation only plays on the `:hover` target and not its sibling cards.

- [ ] **Scroll-triggered animations fire immediately without an intersection threshold.** Elements that animate on scroll must use an `IntersectionObserver` with a threshold of at least `0.1` — not `0`. An element at the bottom of the viewport should not animate before the user has scrolled to it.

- [ ] **Stagger delays make a list feel slow.** If a list of items staggers at more than 60ms per item, a 10-item list takes 600ms to finish revealing. Cap stagger at 40ms per item for lists of 5+ items. The first item should reveal at 0ms delay — don't delay the entire group.

- [ ] **Motion plays on page load for non-hero content.** Only the hero section and page title may animate on initial load. Everything else animates on scroll. Loading animations on content that is below the fold are pointless — the user isn't watching them.

- [ ] **Transition property is set to `all`.** `transition: all` is a performance hazard — it triggers layout transitions when none are intended. Always specify the exact property: `transition: opacity 200ms var(--ease-out), transform 200ms var(--ease-out)`.

---

## Performance

- [ ] **Three.js (or any 3D library) is shipped to mobile without code-splitting and lazy loading.** The WebGL canvas on the home page must be dynamically imported and only initialized after LCP. On mobile (viewport width < 768px or `pointer: coarse`), consider not initializing the 3D scene at all — serve the lo-fi poster only. Bundle size of the 3D chunk must not exceed 180kb gzipped.

- [ ] **CSS `backdrop-filter: blur()` applied to elements that scroll with the page.** Blur filters on scrolling elements cause continuous GPU compositing and will visibly drop frame rate on mid-range devices. `backdrop-filter` is acceptable only on fixed/sticky elements that do not scroll. If you must blur a scrolling element, test on a 2019 mid-range Android device.

- [ ] **Images lack explicit width and height attributes (or CSS aspect-ratio).** Any `<img>` without size hints causes Cumulative Layout Shift. All images must have `width` and `height` attributes matching the intrinsic size, or a `aspect-ratio` CSS rule. Use `next/image` or equivalent to enforce this automatically.

- [ ] **Fonts load without `font-display: swap` or `font-display: optional`.** Late-loading fonts cause invisible text (FOIT) or layout shift. Variable fonts must specify `font-display: swap` in the `@font-face` declaration. For critical display fonts (Fraunces), preload the WOFF2 file in `<head>`.

- [ ] **Route `/` JavaScript bundle exceeds 200kb gzipped.** Measure with `next build && next analyze` (or equivalent). If the bundle exceeds 200kb, audit what is being imported at the root route and move it to route-specific chunks.

- [ ] **3D hero canvas is the LCP element.** The Largest Contentful Paint must be a text element or a static image poster — never the WebGL canvas. Verify with Lighthouse. The canvas must be positioned after the poster image in the DOM and must not block text rendering.

- [ ] **`window.addEventListener('scroll', ...)` without throttling or passive flag.** Scroll listeners that run unthrottled will degrade scroll performance. Use `IntersectionObserver` instead of scroll listeners wherever possible. If a scroll listener is unavoidable, add `{ passive: true }` and throttle to one frame (16ms).

- [ ] **Per-project font imports loaded globally.** If a project page uses a custom display font weight or axis setting, that `@font-face` variant must be loaded only on that project's route — not globally. Use route-based code splitting for per-project font chunks.

- [ ] **Unoptimized SVGs inline in the bundle.** SVG files used for decorative backgrounds or icons must be optimized with SVGO. Run `npx svgo --multipass` on all SVGs before committing. Inline SVGs larger than 2kb should be loaded as `<img>` instead.

- [ ] **No resource hints for critical third-party assets.** Google Fonts (Fraunces) and Vercel's Geist font CDN must have `<link rel="preconnect">` and `<link rel="dns-prefetch">` in `<head>`. Without these, the first font request adds 100–400ms to initial load.

---

## Accessibility

- [ ] **Color is the only signal for a state or meaning.** No state — error, active, selected, disabled — may be communicated by color alone. Every color-coded state must also use an icon, text label, pattern, or ARIA attribute. Check the accent-colored active nav link: does it have `aria-current="page"`?

- [ ] **Contrast checked only in dark mode.** Per-project themes create six independent color systems. Each theme must pass 4.5:1 for normal text and 3:1 for large text in both dark and light modes independently. Run contrast checks using the OKLCH values — do not eyeball. Check: `--project-ink-1` on `--project-bg`, `--project-accent` on `--project-bg`, `--project-accent` on `--project-bg-raised`.

- [ ] **Focus is not returned after modal close or route change.** When a modal closes, focus must return to the element that opened it. When a route changes (SPA navigation), focus must move to the `<h1>` of the new page or a skip-navigation target. Test by keyboard-navigating to open a project, then pressing the browser's back button — where does focus land?

- [ ] **Nested interactive elements — button inside a link, or link inside a button.** This is invalid HTML and creates unpredictable keyboard behavior. If a card is clickable (link) and also has a button inside it (e.g., a bookmark action), the button must be positioned as a sibling of the link using absolute positioning — not nested inside it.

- [ ] **Placeholder text used as a label.** If any form inputs exist (e.g., a future search or a newsletter field), they must have visible `<label>` elements associated via `for`/`id`. Placeholder text disappears on focus and is not a label substitute. This currently applies to any filter or search inputs on the journal page.

- [ ] **`:focus-visible` is missing or suppressed.** The global CSS must not contain `*:focus { outline: none }` without a corresponding `:focus-visible` rule that provides an equivalent visible indicator. The focus ring is styled in the design system — it uses `--accent` as the outline color with a 2px offset. Do not remove it.

- [ ] **Fixed or sticky elements overlap the iOS home indicator or gesture area.** Fixed elements at the bottom of the screen must have `padding-bottom: env(safe-area-inset-bottom)` to avoid covering the iOS gesture strip. Test on a physical iPhone or Safari with the bottom bar visible. This commonly affects sticky nav bars and fixed CTAs.

- [ ] **WebGL canvas lacks `aria-hidden="true"` and `role="presentation"`.** The home page 3D canvas is decorative. It must be hidden from the accessibility tree with `aria-hidden="true"`. Screen readers should never encounter it, attempt to describe it, or tab into it.

- [ ] **Page landmarks are missing or duplicated.** Each page must have exactly one `<main>`, one `<header>`, and one `<footer>`. The navigation must use `<nav>` with a descriptive `aria-label` (e.g., `aria-label="Main navigation"`). The page must have no orphaned content outside landmarks. Validate with axe DevTools or Accessibility Insights.

- [ ] **Heading order is broken by per-project theming.** When a project page sets a large Fraunces headline, it must still be semantically `<h1>`. Do not use an `<h3>` because it looks visually smaller. Do not style an `<h1>` as if it were a paragraph. Heading order must be `h1 → h2 → h3` with no skips, regardless of how the elements are styled. Audit with a heading outline tool on every new project page added.

- [ ] **Form inputs lack associated labels.** Applies to any input on the site: search fields, toggles (e.g., light/dark mode switch). The theme toggle must have `aria-label="Switch to light mode"` (or dark, contextually) and must communicate the current state via `aria-pressed` or `aria-checked`.

- [ ] **Icon-only buttons lack `aria-label`.** Every button that contains only an icon (SVG, image, or emoji) must have a descriptive `aria-label`. This includes: the theme toggle, the "copy code" button in code blocks, the close button in any modal or drawer, and any social link icons in the footer. `aria-label` text should describe the action, not the icon — "Copy code" not "Clipboard icon."
