# Motion Grammar — paulojuri.com

Defines every timing token, easing curve, motion role, and reduced-motion contract used across the site. All animation code must reference these tokens — no magic numbers.

---

## 1. Easing Tokens

```css
/* tokens.css already imports these — reference by name in JS via the arrays in variants.ts */

--ease-out:        cubic-bezier(0.16, 1, 0.3, 1);   /* default exit / settle */
--ease-in-out:     cubic-bezier(0.87, 0, 0.13, 1);   /* page transitions */
--ease-spring:     cubic-bezier(0.34, 1.56, 0.64, 1); /* overshoot / playful */
--ease-linear:     linear;                            /* marquees, progress bars */
--ease-mechanical: cubic-bezier(0.25, 0.46, 0.45, 0.94); /* precise / no overshoot */
```

JS arrays in `src/lib/motion/variants.ts`:

| Name | Array | Use |
|------|-------|-----|
| `easeOut` | `[0.16, 1, 0.3, 1]` | Entrances, reveals |
| `easeInOut` | `[0.87, 0, 0.13, 1]` | Page curtain, morphs |
| `easeSpring` | `[0.34, 1.56, 0.64, 1]` | Cursor, playful hover |
| `easeLinear` | `linear` | Marquee, skeleton pulse |
| `easeMechanical` | `[0.25, 0.46, 0.45, 0.94]` | Command bar, precise UI |

---

## 2. Duration Scale

All durations in seconds. Never hardcode — import from `src/lib/motion/variants.ts → duration`.

| Token | Value | Use |
|-------|-------|-----|
| `duration.instant` | `0.08s` | Hover state switches |
| `duration.fast` | `0.15s` | Micro-interactions, tooltips |
| `duration.base` | `0.25s` | Most UI transitions |
| `duration.medium` | `0.4s` | Modal open, card expand |
| `duration.slow` | `0.6s` | Hero entrance, page reveal |
| `duration.xslow` | `1.0s` | Ambient background animation |
| `duration.crawl` | `40s` | Marquee ticker |

---

## 3. Spring Presets

Defined in `src/lib/motion/config.ts`. Use springs for anything that feels physical.

| Preset | stiffness | damping | mass | Feel |
|--------|-----------|---------|------|------|
| `spring.gentle` | 120 | 14 | 1 | Floating, slow settle |
| `spring.crisp` | 400 | 30 | 1 | Snappy, responsive |
| `spring.rubber` | 600 | 20 | 1 | Bouncy, playful |

---

## 4. Motion Signatures

Each project has a motion personality that overrides defaults for its case-study pages. Set via `[data-project]` + `ProjectTheme.motion.signature`.

| Signature | Easing | Spring | Stagger | Personality |
|-----------|--------|--------|---------|-------------|
| `spring` | `easeSpring` | `rubber` | `0.07s` | Alive, playful — Alfera |
| `inertia` | `easeOut` | `gentle` | `0.12s` | Heavy, slow-settle — Carbonwise |
| `mechanical` | `easeMechanical` | `crisp` | `0.04s` | Precise, clock-like — ApplyAI |
| `organic` | `easeOut` | `gentle` | `0.09s` | Soft, breathing — Sova / default |

---

## 5. Six Motion Roles

Every animated element maps to exactly one role. Do not mix roles on a single element.

### 5.1 Reveal
**When:** Content entering the viewport for the first time.
**Variant:** `fadeUp` — translate Y 24px → 0, opacity 0 → 1.
**Trigger:** Intersection Observer via `<RevealOnScroll>` wrapper.
**Duration:** `slow (0.6s)` with `easeOut`.
**Rule:** One stagger group per section — not per word.

### 5.2 Transition
**When:** Route-level page changes.
**Variant:** `pageCurtainIn` / `pageCurtainOut` — full-viewport overlay wipes.
**Implementation:** `<PageTransition>` in root layout wrapping `{children}`.
**Duration:** `medium (0.4s)` each half with `easeInOut`.
**Rule:** Must complete before new page content is painted.

### 5.3 Hover
**When:** Interactive elements (cards, buttons, links) receive pointer or focus.
**Variants:** Scale 1 → 1.02, subtle translate, border color shift.
**Duration:** `fast (0.15s)` in, `base (0.25s)` out.
**Rule:** Never animate layout-affecting properties (width, height, padding). Use `transform` only.

### 5.4 Scroll-choreography
**When:** Hero sequences, pinned scroll, parallax depth.
**Tool:** GSAP + ScrollTrigger (not Motion).
**Rule:** Always `invalidateOnRefresh: true`. Destroy on unmount. Never fight Lenis.

### 5.5 Ambient
**When:** Background textures, noise shaders, idle states.
**Tool:** CSS animation or Three.js loop — never Motion for loops.
**Duration:** `xslow (1s)` to `crawl (40s)`.
**Rule:** Must respect `prefers-reduced-motion` — freeze or hide, never just slow down.

### 5.6 Feedback
**When:** Form submit, copy-to-clipboard, error state.
**Variants:** `scaleIn` for success checkmarks, shake (translate X ±4px) for errors.
**Duration:** `fast (0.15s)` for success, `base (0.25s)` for error shake.
**Rule:** Must not auto-dismiss — user controls when to proceed.

---

## 6. Reduced-Motion Contract

**Non-negotiable.** Every animation must have a reduced-motion fallback.

```css
@media (prefers-reduced-motion: reduce) {
  /* Ambient and marquee animations stop entirely */
  .marquee-track,
  [data-animate="ambient"] { animation: none !important; }

  /* Scroll choreography collapses — GSAP handled via prefersReducedMotion() check */

  /* Motion/Framer: use the `useReducedMotion()` hook */
}
```

In Motion components:

```tsx
import { useReducedMotion } from 'motion/react'

const reduceMotion = useReducedMotion()
const variants = reduceMotion ? {} : fadeUp
```

In GSAP:
```ts
import { prefersReducedMotion } from '@/lib/motion/config'

if (!prefersReducedMotion()) {
  gsap.to(el, { ... })
}
```

Three.js — disable continuous render loop when reduced-motion is set:
```ts
if (prefersReducedMotion()) {
  gl.setAnimationLoop(null)
  gl.render(scene, camera) // single frame
}
```

---

## 7. 3D Hero Plan

Three WebGL heroes planned across the 6 projects. All use `react-three-fiber` + `@react-three/drei`.

### Hero Variants

| Project | Variant | Description |
|---------|---------|-------------|
| Alfera | `3d-scene` | Soft geometry / orbs in OKLCH accent coral — spring signature |
| ApplyAI | `shader` | Animated noise/grid GLSL shader — mechanical signature |
| Sova | `editorial` | Layered SVG + parallax — no WebGL, organic signature |
| Carbonwise | `video` | Looping ambient video BG — inertia signature |
| Elise | `editorial` | Typography-first, no 3D |
| Holis | `sequence` | Image sequence / lottie |

### Lo-fi CSS fallbacks (required for all WebGL heroes)

```tsx
// Device capability detection in src/lib/motion/config.ts
export function isLowPowerDevice(): boolean {
  if (typeof navigator === 'undefined') return false
  return navigator.hardwareConcurrency <= 4 ||
    (navigator as any).deviceMemory <= 2 ||
    window.matchMedia('(max-width: 768px)').matches
}
```

Fallback: static `<img>` or CSS gradient with the project's accent OKLCH color. Never a broken canvas.

### Three.js setup rules

- Use `<Suspense fallback={<HeroFallback />}>` wrapping every `<Canvas>`
- `frameloop="demand"` by default — only animate on interaction or scroll
- `dpr={[1, 1.5]}` — cap pixel ratio for performance
- Dispose geometries and materials in `useEffect` cleanup
- Maximum **one Canvas per page**

---

## 8. Cursor Layer

A global custom cursor that adapts to context. Implemented in `src/components/shell/Cursor.tsx`.

### States

| State | Shape | Trigger |
|-------|-------|---------|
| `default` | 12px circle | Idle |
| `hover` | 40px ring, label | `data-cursor="hover"` elements |
| `drag` | 48px arrows | Drag-capable elements |
| `text` | I-beam | Text areas, inputs |
| `project` | Accent-colored fill | Project card hover |
| `video` | Play icon | Video embeds |

### Implementation rules

- Cursor dot follows pointer via `useMotionValue` + `useSpring({ stiffness: 500, damping: 28 })`
- Larger ring follows with slower spring `{ stiffness: 150, damping: 20 }`
- On mobile: cursor component returns `null` (touch devices have no cursor)
- `aria-hidden="true"` always — cursor is purely decorative
- Never block pointer events — `pointer-events: none` on cursor root

---

## 9. Lenis Smooth Scroll Setup

Lenis is already installed. Initialize in root layout, expose via context.

```tsx
// src/components/shell/SmoothScroll.tsx
'use client'
import Lenis from 'lenis'
import { useEffect, useRef } from 'react'
import { prefersReducedMotion } from '@/lib/motion/config'

export function SmoothScroll({ children }: { children: React.ReactNode }) {
  const lenisRef = useRef<Lenis | null>(null)

  useEffect(() => {
    if (prefersReducedMotion()) return // no smooth scroll for reduced-motion

    const lenis = new Lenis({ lerp: 0.1, smoothWheel: true })
    lenisRef.current = lenis

    function raf(time: number) {
      lenis.raf(time)
      requestAnimationFrame(raf)
    }
    requestAnimationFrame(raf)

    return () => lenis.destroy()
  }, [])

  return <>{children}</>
}
```

GSAP + Lenis integration: use `lenis.on('scroll', ScrollTrigger.update)` and `gsap.ticker.add(lenis.raf)`.

---

## 10. Command Bar (Cmd-K)

`src/components/shell/CommandBar.tsx` — keyboard-navigable global search/nav.

- Opens on `Cmd+K` / `Ctrl+K`
- Closes on `Escape`
- Items: pages, projects, journal articles, theme toggle
- Animation: `scaleIn` from 0.95, opacity 0→1, `medium (0.4s)`, `easeMechanical`
- Focus trap when open — return focus to trigger on close
- `role="dialog"` + `aria-modal="true"` + `aria-label="Command bar"`

---

## Anti-patterns (motion-specific)

- **No** `transition: all` — always specify the property
- **No** opacity + layout change together — they fight
- **No** `will-change` by default — add only on measured jank
- **No** JS animation on scroll without GSAP ScrollTrigger — use CSS or GSAP, never `onScroll` + `requestAnimationFrame` manually
- **No** simultaneous Motion + GSAP on the same element
- **No** Lenis + native scroll event listeners — use `lenis.on('scroll', cb)` instead
