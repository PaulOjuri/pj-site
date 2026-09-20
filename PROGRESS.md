# Session Progress — June 2026

Everything built or changed in this session. The site before this session had working structure and real content in many areas, but several surface-level issues made it read as unfinished. This session addressed all of them.

---

## What Changed

### 1. Custom Cursor — `src/components/CustomCursor.tsx`

A purely DOM-driven custom cursor: a 5px filled dot that snaps to the mouse immediately, and a 36px hollow ring that lags behind via a `lerp(a, b, 0.1)` RAF loop. No canvas, no WebGL, no CSS transitions on position.

**Behaviors:**
- On `a`, `button`, `[role="button"]`: ring scales to `36 * 2.2px`, fills with 15% accent background, border shifts to `--accent`, opacity goes to 1
- On `img`: ring scales to `36 * 1.8px`, opacity 0.85
- Default state: 36px ring, 50% opacity, amber border

**Guards:**
- `window.matchMedia('(hover: none)').matches` — returns null on touch devices, the native cursor remains
- `window.matchMedia('(prefers-reduced-motion: reduce)').matches` — returns null, no cursor rendered
- Only mounts after first render (`useState(false)` with `setMounted(true)` in `useEffect`) to avoid SSR mismatch

The cursor is registered in `SiteEffects.tsx` and thus available globally. The global CSS hides the default cursor on `(hover: hover) and (pointer: fine)` media only.

---

### 2. Text Scramble Hook — `src/hooks/useTextScramble.ts`

A hook that cycles characters through random glyphs from `ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%` before locking in left-to-right.

```ts
useTextScramble(text: string, startDelay = 0, speed = 40)
// returns { display: string, done: boolean }
```

**How it works:**
- `revealed` starts at 0 and increments by 0.35 per interval tick (every `speed`ms)
- Characters at index `< Math.floor(revealed)` are locked to the real character
- Characters at index `>= Math.floor(revealed)` show a random glyph each tick
- Spaces, `/`, and `.` are always preserved (they read as intentional punctuation)
- On `prefers-reduced-motion`, the hook immediately sets `display = text` with no animation

**In the Hero**, three lines use this hook with staggered `startDelay` values:
- Line 1 — `'I BUILD /'` — 400ms delay
- Line 2 — `'THINGS PEOPLE /'` — 700ms delay
- Line 3 — `'WANT TO USE.'` — 950ms delay

The slashes in lines 1 and 2 read as rhythm breaks during the scramble — they stay fixed while everything else resolves around them.

The 404 page uses a local version of the same pattern for the ghost "404" number (implemented inline, not via the hook).

---

### 3. Hero Headline Size

The headline font size was enlarged from its previous value to `clamp(4rem, 12.5vw, 14rem)`. At 1440px viewport width this renders at approximately 180px. At 375px it renders at 64px. The line-height is 0.92, letter-spacing is -0.01em.

---

### 4. Marquee Ticker — `src/components/sections/Ticker.tsx`

A horizontal scrolling text strip placed between the Hero and About sections. Content:

```
PRODUCT ENGINEER & DESIGNER · TURNHOUT, BELGIUM · AVAILABLE NOW · PRISM · APPLYAI · ALFERA TECHNIK · SIX YEARS ·
```

Repeated 8 times (4 repeats × 2 for seamless loop). Animated with a CSS `@keyframes marquee` (defined in `globals.css`) running at 30s linear infinite. The strip is `--bg-elevated` background, bounded by hairline borders top and bottom. Font is Space Mono at 0.65rem, 0.15em letter-spacing, `--text-faint` color.

---

### 5. SiteEffects — `src/components/SiteEffects.tsx`

A wrapper component rendered in `layout.tsx` that houses global client-side effects. Currently includes:

- `<ConsoleMessage />` — fires `console.log` on mount with styled developer messages using `%c` CSS formatting
- `<CustomCursor />` — the cursor component
- Konami code easter egg via `useKonami(callback)` hook

**Console message text:**
```
Hello, fellow developer.
You opened the tools. I respect that.

This site was built by hand — Next.js, Framer Motion, GSAP, Lenis.
If you spot something worth stealing, steal it. That's how this works.

→ hello@paulojuri.com
```
Styled in amber (`#D4A255`) for the first line, muted (`#8A857C`) for the rest.

**Konami code** (`↑↑↓↓←→←→BA`): Creates a full-screen overlay with a dark background and amber centered text:
```
↑↑↓↓←→←→BA
You found the konami code. Not bad.
Now go build something.
```
The overlay fades out after 2.8 seconds. The background `--bg` CSS variable is briefly overridden to a dark amber-tinted value (`#1a120a`) and then restored.

---

### 6. Nav Menu — `src/components/SiteHeader.tsx`

All nav links now point to real destinations, organized into three groups:

| Group | Label | Destination |
|---|---|---|
| WORK | Selected Projects | `/#work` |
| WORK | Prism | `/prism` |
| WORK | ApplyAI | `/applyai` |
| ABOUT | About | `/#about` |
| ABOUT | Services | `/#services` |
| ABOUT | Library | `/library` |
| CONNECT | Journal | `/journal` |
| CONNECT | Contact | `/#contact` |
| CONNECT | LinkedIn | `https://linkedin.com/in/paulojuri` |

External links (`https://`) get `target="_blank" rel="noopener noreferrer"` applied automatically via conditional logic in the JSX.

**Menu animation** changed from opacity fade to clip-path curtain wipe:
- Enter: `clipPath: 'inset(0 0 100% 0)'` → `'inset(0 0 0% 0)'`
- Exit: `'inset(0 0 0% 0)'` → `'inset(0 0 100% 0)'`
- Duration: 0.5s, ease `[0.22, 1, 0.36, 1]`

The menu also has a focus trap (`handleMenuKeyDown`), Escape key to close, and body scroll lock while open. These were already present; the link destinations and animation are what changed.

---

### 7. Header — Available Status, No Theme Toggle

The non-functional dark mode toggle button was removed. In its place: an `● AVAILABLE` text link pointing to `/#contact`. It is hidden when the header is in its scrolled state (background appears on scroll past 80px) to reduce clutter. On hover it turns amber.

The header uses a glassmorphism background (`rgba(13,12,11,0.85)` + `blur(12px)`) when scrolled, transparent when at the top.

---

### 8. Services — HTML Entity Fix and Availability Update

The availability strip previously rendered `&lt;24 HOURS` as a literal string due to a JSX encoding issue. Fixed to read `RESPONSE TIME: 24 HOURS`.

`Q3 2026` availability references removed. The strip now reads: `AVAILABLE NOW · hello@paulojuri.com · RESPONSE TIME: 24 HOURS`.

---

### 9. About — Availability Copy

Changed "Available Q3 2026" to "Available for new projects now" in the second text paragraph.

---

### 10. Essays Section — Redesign

The Essays section (`src/components/sections/Essays.tsx`) was rebuilt from a list of broken links into an honest status board.

**Before:** Essay titles as `<a href="#">` links implying they were published. No status indication. Clicking anything did nothing.

**After:**
- Section label changed to `WRITING — IN PROGRESS`
- Subtitle: "Essays in progress. Publishing when they're ready — not before."
- Each essay row shows: date (or COMING in accent color), title, excerpt, tags, read time estimate, and a status badge
- Status badge is `DRAFT` (faint border) for dated essays, `SOON` (amber border, 70% opacity) for essays with `date: 'COMING'`
- No links — nothing is clickable unless there's something to click
- A `VISIT THE JOURNAL →` link at the bottom points to `/journal` where the actual MDX posts live

The six essays and their statuses:

| Title | Date | Status |
|---|---|---|
| The product engineer is not a myth | FEB 2025 | DRAFT |
| On building in public without burning out | MAR 2025 | DRAFT |
| Why privacy is a design problem | APR 2025 | DRAFT |
| The AI that forgets you | COMING | SOON |
| The cookie banner comedy: a dark pattern in three acts | COMING | SOON |
| Your browser is a stock exchange (and you're not the trader) | COMING | SOON |

Note: All six of these essays also exist as MDX files in `/content/journal/` with full content. The Essays section on the homepage is a teaser/status view — not the canonical reading experience.

---

### 11. Footer — Closing Statement

Changed the footer headline from `THANK YOU FOR VISITING` to:

```
LET'S BUILD
SOMETHING
REAL.
```

Font size: `clamp(3rem, 9vw, 11rem)`, Anton display font, line-height 0.88. `SOMETHING` is colored `var(--accent)`. Followed by a subtitle paragraph with `hello@paulojuri.com` as a `link-accent` anchor.

---

### 12. 404 Page — Full Redesign (`src/app/not-found.tsx`)

Completely replaced the Next.js default error page.

**Layout:** Full-viewport dark background, left-aligned content, with a giant scrambling "404" ghost number positioned on the right edge at 35vw font size and 4% opacity.

**Content:**
- Mono label: `ERROR — PAGE NOT FOUND` in amber
- Headline: `THIS PAGE / DOESN'T EXIST. / YET.` — "YET." in amber
- Body paragraph acknowledging the broken link without being dismissive
- Two CTAs: `GO HOME →` (filled text button, turns amber on hover) and `SEE MY WORK` (outlined button)
- Hidden metadata line at the bottom with `title="You found the hidden message. Nice instinct."` as a tooltip for the curious

**Entrance:** Content fades in with a `translateY(20px) → 0` transition after a 100ms delay, using inline CSS transitions (not Framer Motion).

---

### 13. Accent Color Change

Replaced `#C2A878` with `#D4A255`.

- Old: `oklch(~70% 0.13 68)` — desaturated, brownish, generic
- New: `oklch(73% 0.19 58)` — more chroma, cleaner amber, reads as intentional

The hover variant became `#E5B96A`. Both are updated in `globals.css` and in `SiteEffects.tsx` (where the color is hardcoded in the console message and Konami overlay).

---

### 14. ApplyAI Landing Page — `src/app/applyai/page.tsx`

A standalone landing page for the ApplyAI Chrome extension. Uses its own color system (green-tinted dark theme) defined as inline constants:

```ts
const AI_ACCENT    = 'oklch(72% 0.19 165)'  // mint green
const AI_BG        = 'oklch(8% 0.008 165)'   // near-black with green tint
const AI_BG_RAISED = 'oklch(13% 0.010 165)'
const AI_INK_1     = 'oklch(97% 0.005 165)'  // near-white
const AI_INK_2     = 'oklch(72% 0.012 165)'  // muted
const AI_GLOW      = 'oklch(72% 0.19 165 / 0.12)'
```

Sections: hero (with radial gradient glow at top), stats bar (12+ ATS, 30+ classifiers, 47 min saved, 0 servers), features grid (6 items with icon glyphs), how it works (3 steps), CTA. Uses `<Footer />` from `src/components/layout/Footer.tsx`.

---

### 15. Library Teaser — `src/components/sections/LibraryTeaser.tsx`

A new section added to the homepage between Essays and Contact. Shows the total book count and shelf count pulled live from `src/lib/library.ts`, plus a preview of the first book from each of the first 5 shelves. Links to `/library`.

This section existed in the component directory but was not included in the homepage page order before this session.

---

## Design Decisions and Rationale

**Text scramble on the hero headline** is the primary signature moment. The visual metaphor — characters cycling through noise before locking into signal — maps directly to the engineer's process. It communicates precision without saying the word.

**Custom cursor** is the single highest-impact premium signal on a desktop experience. It requires no external libraries, adds no bundle weight, and is purely behavioral. The lagging ring creates the illusion of physical mass. Disabled on touch devices and for reduced-motion users, so it is a pure enhancement.

**Clip-path menu animation** is architecturally cleaner than opacity fade. A curtain wipe from the bottom reads as the page being revealed, not just fading in. It pairs well with the Anton display font's vertical rhythm.

**"AVAILABLE" pill in the header** replaces a decorative or broken element with a real signal. Potential clients scanning the header get the most important piece of availability information without scrolling.

**Essays redesigned as honest status board.** Fake links to unpublished content erode trust immediately. DRAFT and SOON badges communicate progress without pretending completion. The framing "Publishing when they're ready — not before." is itself a statement about craft.

**Accent color saturation increase.** The old `#C2A878` is the default "premium dark site" amber that appears on roughly half of developer portfolios with dark themes. `#D4A255` is close enough to read as the same family but far enough to feel considered.

---

## Rejected Ideas

**WebGL image distortion on project images.** Would have created a distortion effect on hover over the FeaturedWork images. Rejected because Three.js is already in the bundle for `/library/walk` but lazy-loaded — pulling it into the main homepage bundle would increase initial JS payload significantly.

**Dark/light mode toggle.** `next-themes` is installed and the toggle was in the header. Removed because no light mode design exists. A broken or ugly light mode is worse than having no toggle at all.

**Fraunces or other serif for contrast.** Considered adding a second display font (serif) to pair with Anton for more range. Rejected because a second display font requires a light mode design to justify the added complexity; Anton alone is strong enough.
