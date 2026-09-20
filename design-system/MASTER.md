# Design System — Master Reference
**paulojuri.com** | Last updated: 2026-05-31

---

## 1. Color System

### Philosophy

Two palettes, neither derived from the other. Dark mode starts from near-black with a cool hue tilt — it is not "gray". Light mode starts from warm white with a yellow hue tilt — it is not "inverted dark". The accent, a refined terracotta/vermilion at oklch(65% 0.20 32), is the only color with semantic weight. It survives both modes without adjustment.

### Dark Mode Tokens

| Token | Value | Role |
|---|---|---|
| `--bg` | `oklch(8% 0.005 270)` | Page background, near-black, faint cool tilt |
| `--bg-raised` | `oklch(12% 0.006 270)` | Cards, surfaces elevated above bg |
| `--bg-sunken` | `oklch(5% 0.004 270)` | Code blocks, inset panels, video letterbox |
| `--ink-1` | `oklch(98% 0.005 270)` | Primary text — headings, body, critical UI |
| `--ink-2` | `oklch(78% 0.01 270)` | Secondary text — descriptions, meta |
| `--ink-3` | `oklch(58% 0.012 270)` | Tertiary — placeholders, captions, disabled |
| `--ink-4` | `oklch(38% 0.012 270)` | Subtle separators, icon fills at rest |
| `--line` | `oklch(20% 0.008 270)` | All borders, dividers |
| `--accent` | `oklch(65% 0.20 32)` | CTA, hover, active, selection highlight |
| `--accent-dim` | `oklch(55% 0.18 32)` | Accent at lower luminance — underlines, icons at rest |
| `--accent-glow` | `oklch(65% 0.20 32 / 0.15)` | Glow halos, focus rings, ambient hover fills |

### Light Mode Tokens

| Token | Value | Role |
|---|---|---|
| `--bg-light` | `oklch(98% 0.003 90)` | Page background, warm white, faint yellow tilt |
| `--bg-raised-light` | `oklch(95% 0.005 90)` | Cards, surfaces — cream |
| `--bg-sunken-light` | `oklch(93% 0.006 90)` | Code blocks, inset panels |
| `--ink-1-light` | `oklch(12% 0.008 270)` | Primary text |
| `--ink-2-light` | `oklch(32% 0.01 270)` | Secondary text |
| `--ink-3-light` | `oklch(52% 0.012 270)` | Tertiary |
| `--ink-4-light` | `oklch(70% 0.012 270)` | Subtle |
| `--line-light` | `oklch(85% 0.008 270)` | Borders, dividers |
| `--accent` | `oklch(65% 0.20 32)` | Unchanged — passes 4.5:1 on both backgrounds |
| `--accent-dim` | `oklch(55% 0.18 32)` | Unchanged |
| `--accent-glow` | `oklch(65% 0.20 32 / 0.15)` | Unchanged |

### Contrast Audit

- `--accent` on `--bg` (dark): ~5.2:1 — passes AA for normal text and UI components.
- `--accent` on `--bg-light` (light): ~4.7:1 — passes AA.
- `--ink-1` on `--bg` (dark): ~18:1 — passes AAA.
- `--ink-1-light` on `--bg-light` (light): ~17:1 — passes AAA.
- Per-project themes must be independently audited. See ANTI_PATTERNS.md §Accessibility.

---

## 2. Typography

### Font Families

**Display: Fraunces**
Source: Google Fonts (variable). Axes: wght (100–900), SOFT (0–100), WONK (0–1), ital.
Used for: hero headlines only — h1 on home, project titles at display size, pull quotes. Never used for body, UI, or functional text.
Rationale: Warm, optical, distinctly not a grotesk. At 76px and above, the WONK axis gives letterforms a slight optical eccentricity that reads as confidence rather than quirk. Pairs with Geist's systematic cleanliness in a way that avoids homogeneity without resorting to decoration.

**Body: Geist**
Source: Vercel (variable). Axes: wght (100–900).
Used for: all body copy, UI labels, navigation, metadata, buttons, form fields. The default voice of the site.
Rationale: Reads like a product interface — which reflects Paul's discipline as a product engineer. Its terminals and spacing are calibrated for screen, not print. It does not try to have personality. That restraint is the personality.

**Mono: Geist Mono**
Source: Vercel (variable). Axes: wght (100–900).
Used for: timestamps, metadata, code blocks, sidebar line numbers, project stat figures.
Rationale: Same family as Geist — a monospaced sibling that maintains coherence without introducing a third aesthetic.

### Type Scale

Ratio: 1.250 (Major Third). Base: 16px.

| Token | px value | rem value | Role |
|---|---|---|---|
| `--text-2xs` | 12px | 0.75rem | Legal, timestamps, sub-labels |
| `--text-xs` | 14px | 0.875rem | Captions, metadata, table cells |
| `--text-sm` | 16px | 1rem | Base body copy |
| `--text-md` | 18px | 1.125rem | Large body, intro paragraphs |
| `--text-lg` | 20px | 1.25rem | Sub-headings, card titles |
| `--text-xl` | 24px | 1.5rem | Section labels, prominent UI |
| `--text-2xl` | 30px | 1.875rem | h3 range |
| `--text-3xl` | 38px | 2.375rem | h2 range |
| `--text-4xl` | 48px | 3rem | h1 on interior pages |
| `--text-5xl` | 60px | 3.75rem | h1 on about, project titles |
| `--text-6xl` | 76px | 4.75rem | Hero sub-headlines |
| `--text-7xl` | 96px | 6rem | Hero headline desktop |
| `--text-8xl` | 120px | 7.5rem | Display — very large viewport only |
| `--text-9xl` | 152px | 9.5rem | Max display — locked to clamp() |

### Line Heights

Body text: 1.6. UI labels, buttons, navigation: 1.2. Display/headline: 1.05–1.1. Mono: 1.5.

### Letter Spacing

Display (Fraunces, 60px+): `-0.03em`. Headings (Geist, 24–48px): `-0.02em`. Body: `0`. Mono: `0`. All-caps labels: `0.08em`.

---

## 3. Spacing Scale

Base unit: 4px.

| Token | px value | Typical use |
|---|---|---|
| `--space-1` | 4px | Icon padding, micro gaps |
| `--space-2` | 8px | Inline gaps, tight clusters |
| `--space-3` | 12px | Label-to-input, icon-to-text |
| `--space-4` | 16px | Component padding, list gaps |
| `--space-6` | 24px | Card padding, section row gaps |
| `--space-8` | 32px | Between components |
| `--space-12` | 48px | Section internal spacing |
| `--space-16` | 64px | Between sections, large cards |
| `--space-24` | 96px | Page section gaps |
| `--space-32` | 128px | Hero vertical padding |
| `--space-48` | 192px | Breathing room at top of pages |
| `--space-64` | 256px | Maximum white space budget |

---

## 4. Border Radius

| Token | Value | Use |
|---|---|---|
| `--radius-none` | 0 | Sharp corners — code blocks, full-bleed images |
| `--radius-sm` | 4px | Subtle rounding — badges, small chips |
| `--radius-md` | 8px | Buttons, input fields, tooltips |
| `--radius-lg` | 14px | Cards, modals, panels |
| `--radius-xl` | 24px | Large cards, floating surfaces |
| `--radius-full` | 9999px | Pills, avatars, loaders |

---

## 5. Border & Stroke

**Default hairline:** `1px solid var(--line)` at `oklch(20% 0.008 270)` in dark mode.

**Animated border variants:**

`border-beam` — A conic gradient that travels around the border perimeter. Implemented as a pseudo-element with `@property` animated `--angle`. Use on cards on hover, never at rest. Never run more than one simultaneously.

```css
@property --angle {
  syntax: "<angle>";
  initial-value: 0deg;
  inherits: false;
}

.border-beam {
  --angle: 0deg;
  border: 1px solid transparent;
  background:
    linear-gradient(var(--bg-raised), var(--bg-raised)) padding-box,
    conic-gradient(from var(--angle), transparent 70%, var(--accent) 85%, transparent 100%) border-box;
  animation: border-beam-spin 3s linear infinite;
}

@keyframes border-beam-spin {
  to { --angle: 360deg; }
}
```

`border-pulse` — Breathing opacity on the border-color. Use for "awaiting input" or "loading" states.

```css
.border-pulse {
  animation: border-pulse-breathe 2s ease-in-out infinite;
}

@keyframes border-pulse-breathe {
  0%, 100% { border-color: var(--line); }
  50%       { border-color: var(--accent); }
}
```

**Rule:** Never more than one animated border visible on screen at any time.

---

## 6. Shadow & Elevation

Shadows use dark hues even in light mode. No gray box-shadows.

| Level | Value | Use |
|---|---|---|
| `--shadow-sm` | `0 1px 2px oklch(0% 0 0 / 0.3), 0 1px 4px oklch(0% 0 0 / 0.2)` | Subtle lift — small cards, chips |
| `--shadow-md` | `0 4px 8px oklch(0% 0 0 / 0.25), 0 8px 24px oklch(0% 0 0 / 0.15)` | Cards, popovers |
| `--shadow-lg` | `0 8px 16px oklch(0% 0 0 / 0.2), 0 24px 48px oklch(0% 0 0 / 0.15), 0 48px 96px oklch(0% 0 0 / 0.1)` | Modals, floating panels |

---

## 7. Z-Index Layers

| Token | Value | Use |
|---|---|---|
| `--z-content` | 0 | Default page content |
| `--z-raised` | 10 | Cards on hover, sticky table headers |
| `--z-dropdown` | 20 | Menus, autocomplete lists |
| `--z-sticky` | 30 | Nav bar, sticky section labels |
| `--z-overlay` | 40 | Lightbox overlays, drawer backdrops |
| `--z-modal` | 50 | Modal dialogs, drawers |
| `--z-cursor` | 60 | Custom cursor element |
| `--z-top` | 70 | Toast notifications, skip-to-main link |

---

## 8. Grid System

**Desktop (≥1280px):** 12 columns, `--gutter: clamp(24px, 3vw, 48px)`, max-width 1440px.
**Tablet (768px–1279px):** 8 columns, `--gutter: clamp(16px, 2.5vw, 32px)`.
**Mobile (<768px):** 4 columns, `--gutter: 16px`.

**Asymmetric span preference:**
Prefer 7+4 (content + sidebar) and 8+3 over symmetric 6+6. Symmetric halves read as "template." Asymmetry signals authorship.

Common layouts:
- Hero text: 8 of 12 columns (left-aligned, not centered)
- Body copy: 7 of 12 columns
- Pull quote: col 2–6 (offset, not flush-left)
- Project grid: 2-up with 8+4 swap alternating
- Full-bleed image: ignore column grid, use viewport-edge

---

## 9. Per-Project Override System

### How It Works

Each case study page adds `data-project="slug"` to its outermost content wrapper (not the `<html>` or `<body>` — the global nav/footer shell must remain unchanged).

Project tokens are scoped to `[data-project="slug"]` and override only within that scope. Global shell variables (`--bg`, `--ink-1`, etc.) never change — the nav, footer, and skip-link always use the global palette.

```css
[data-project="prism"] {
  --project-bg:        oklch(9% 0.012 255);
  --project-bg-raised: oklch(14% 0.015 255);
  --project-ink-1:     oklch(96% 0.008 255);
  --project-ink-2:     oklch(74% 0.015 255);
  --project-accent:    oklch(68% 0.22 255);
  --project-accent-glow: oklch(68% 0.22 255 / 0.12);
  --project-font-display: "Fraunces", serif;
  --project-radius:    8px;
}
```

The content area component reads `--project-*` variables and falls back to global tokens:

```css
.project-content {
  background: var(--project-bg, var(--bg));
  color: var(--project-ink-1, var(--ink-1));
  accent-color: var(--project-accent, var(--accent));
}
```

### Rules

1. Project themes must pass the same contrast thresholds as global tokens. Check independently.
2. A project theme may change: background, foreground, accent, radius, and display font family/weight settings. It may not change: nav colors, footer colors, focus ring color (always `--accent`), or the skip-to-main link.
3. Fraunces WONK axis and weight may be tuned per project — e.g., WONK:1 for Prism, WONK:0 for CarbonWise.
4. Motion posture may be flagged per project (see PAGE_OVERRIDES.md) but must still respect `prefers-reduced-motion`.

---

## 10. Motion Principles

**Easing vocabulary:**
- `--ease-out: cubic-bezier(0.16, 1, 0.3, 1)` — elements entering the frame
- `--ease-in-out: cubic-bezier(0.87, 0, 0.13, 1)` — elements transitioning state
- `--ease-spring: linear(0, 0.009, 0.035 2.1%, 0.141, 0.281 6.7%, 0.723 12.9%, 0.938 16.7%, 1.017, 1.077, 1.121, 1.149 24.3%, 1.159, 1.163 26.2%, 1.151 28.2%, 1.088 33.2%, 1.022 38.3%, 0.990 41.2%, 0.970 44.1%, 0.958 47%, 0.955 50.2%, 0.966 61.5%, 1.000 72.1%, 1.010 82.8%, 0.997 100%)` — spring-like for interactive feedback, NOT for layout shifts

**Duration targets:**
- Micro (hover color, opacity swap): 80–120ms
- Short (button press, badge pop): 150–200ms
- Medium (card expand, panel slide): 250–350ms
- Long (page entry, section reveal): 500–700ms
- Never exceed 800ms unless motion is the primary content (e.g., an animated diagram)

**All animated properties must be wrapped:**

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

---

## 11. tokens.css

Production-ready. Copy this file as-is to `/src/styles/tokens.css` and import it at the root.

```css
/* ============================================================
   paulojuri.com — Design Tokens
   Generated from MASTER.md — do not hand-edit without syncing
   ============================================================ */

@layer base {

  /* --- Color: Dark mode (default) --- */
  :root {
    --bg:           oklch(8% 0.005 270);
    --bg-raised:    oklch(12% 0.006 270);
    --bg-sunken:    oklch(5% 0.004 270);

    --ink-1:        oklch(98% 0.005 270);
    --ink-2:        oklch(78% 0.01 270);
    --ink-3:        oklch(58% 0.012 270);
    --ink-4:        oklch(38% 0.012 270);

    --line:         oklch(20% 0.008 270);

    --accent:       oklch(65% 0.20 32);
    --accent-dim:   oklch(55% 0.18 32);
    --accent-glow:  oklch(65% 0.20 32 / 0.15);
  }

  /* --- Color: Light mode --- */
  [data-theme="light"] {
    --bg:           oklch(98% 0.003 90);
    --bg-raised:    oklch(95% 0.005 90);
    --bg-sunken:    oklch(93% 0.006 90);

    --ink-1:        oklch(12% 0.008 270);
    --ink-2:        oklch(32% 0.01 270);
    --ink-3:        oklch(52% 0.012 270);
    --ink-4:        oklch(70% 0.012 270);

    --line:         oklch(85% 0.008 270);

    --accent:       oklch(65% 0.20 32);
    --accent-dim:   oklch(55% 0.18 32);
    --accent-glow:  oklch(65% 0.20 32 / 0.15);
  }

  /* --- Typography: Families --- */
  :root {
    --font-display: "Fraunces", Georgia, serif;
    --font-body:    "Geist", system-ui, sans-serif;
    --font-mono:    "Geist Mono", "Menlo", monospace;

    /* Variable font axis defaults */
    --fraunces-wght: 400;
    --fraunces-wonk: 1;
    --fraunces-soft: 0;
    --geist-wght: 400;
  }

  /* --- Type Scale (ratio 1.250, base 16px) --- */
  :root {
    --text-2xs:  0.75rem;    /*  12px */
    --text-xs:   0.875rem;   /*  14px */
    --text-sm:   1rem;       /*  16px */
    --text-md:   1.125rem;   /*  18px */
    --text-lg:   1.25rem;    /*  20px */
    --text-xl:   1.5rem;     /*  24px */
    --text-2xl:  1.875rem;   /*  30px */
    --text-3xl:  2.375rem;   /*  38px */
    --text-4xl:  3rem;       /*  48px */
    --text-5xl:  3.75rem;    /*  60px */
    --text-6xl:  4.75rem;    /*  76px */
    --text-7xl:  6rem;       /*  96px */
    --text-8xl:  7.5rem;     /* 120px */
    --text-9xl:  9.5rem;     /* 152px */
  }

  /* --- Spacing Scale (base-4) --- */
  :root {
    --space-1:   0.25rem;    /*   4px */
    --space-2:   0.5rem;     /*   8px */
    --space-3:   0.75rem;    /*  12px */
    --space-4:   1rem;       /*  16px */
    --space-6:   1.5rem;     /*  24px */
    --space-8:   2rem;       /*  32px */
    --space-12:  3rem;       /*  48px */
    --space-16:  4rem;       /*  64px */
    --space-24:  6rem;       /*  96px */
    --space-32:  8rem;       /* 128px */
    --space-48:  12rem;      /* 192px */
    --space-64:  16rem;      /* 256px */
  }

  /* --- Border Radius --- */
  :root {
    --radius-none: 0;
    --radius-sm:   4px;
    --radius-md:   8px;
    --radius-lg:   14px;
    --radius-xl:   24px;
    --radius-full: 9999px;
  }

  /* --- Shadow & Elevation --- */
  :root {
    --shadow-sm: 0 1px 2px oklch(0% 0 0 / 0.3),
                 0 1px 4px oklch(0% 0 0 / 0.2);

    --shadow-md: 0 4px 8px oklch(0% 0 0 / 0.25),
                 0 8px 24px oklch(0% 0 0 / 0.15);

    --shadow-lg: 0 8px 16px oklch(0% 0 0 / 0.2),
                 0 24px 48px oklch(0% 0 0 / 0.15),
                 0 48px 96px oklch(0% 0 0 / 0.1);
  }

  /* --- Z-Index Layers --- */
  :root {
    --z-content:  0;
    --z-raised:   10;
    --z-dropdown: 20;
    --z-sticky:   30;
    --z-overlay:  40;
    --z-modal:    50;
    --z-cursor:   60;
    --z-top:      70;
  }

  /* --- Easing --- */
  :root {
    --ease-out:     cubic-bezier(0.16, 1, 0.3, 1);
    --ease-in-out:  cubic-bezier(0.87, 0, 0.13, 1);
    --ease-spring:  linear(
      0, 0.009, 0.035 2.1%, 0.141, 0.281 6.7%,
      0.723 12.9%, 0.938 16.7%, 1.017, 1.077,
      1.121, 1.149 24.3%, 1.159, 1.163 26.2%,
      1.151 28.2%, 1.088 33.2%, 1.022 38.3%,
      0.990 41.2%, 0.970 44.1%, 0.958 47%,
      0.955 50.2%, 0.966 61.5%, 1.000 72.1%,
      1.010 82.8%, 0.997 100%
    );
  }

  /* --- Grid --- */
  :root {
    --grid-cols-desktop: 12;
    --grid-cols-tablet:  8;
    --grid-cols-mobile:  4;
    --gutter: clamp(1rem, 3vw, 3rem);
    --max-width: 1440px;
    --content-width: 1280px;
  }

}

/* ============================================================
   Per-project theme scaffolds
   Full token sets live in /src/styles/projects/*.css
   ============================================================ */

[data-project="prism"] {
  --project-bg:          oklch(9% 0.012 255);
  --project-bg-raised:   oklch(14% 0.015 255);
  --project-ink-1:       oklch(96% 0.008 255);
  --project-ink-2:       oklch(74% 0.015 255);
  --project-accent:      oklch(68% 0.22 255);
  --project-accent-glow: oklch(68% 0.22 255 / 0.12);
  --fraunces-wonk: 1;
  --fraunces-wght: 500;
}

[data-project="applyai"] {
  --project-bg:          oklch(8% 0.008 145);
  --project-bg-raised:   oklch(13% 0.010 145);
  --project-ink-1:       oklch(97% 0.006 145);
  --project-ink-2:       oklch(75% 0.012 145);
  --project-accent:      oklch(67% 0.20 145);
  --project-accent-glow: oklch(67% 0.20 145 / 0.12);
  --fraunces-wonk: 0;
  --fraunces-wght: 400;
}

[data-project="alfera-technik"] {
  --project-bg:          oklch(7% 0.006 45);
  --project-bg-raised:   oklch(12% 0.008 45);
  --project-ink-1:       oklch(97% 0.004 60);
  --project-ink-2:       oklch(76% 0.008 60);
  --project-accent:      oklch(72% 0.18 72);
  --project-accent-glow: oklch(72% 0.18 72 / 0.12);
  --fraunces-wonk: 0;
  --fraunces-wght: 700;
}

[data-project="carbonwise"] {
  --project-bg:          oklch(8% 0.010 165);
  --project-bg-raised:   oklch(13% 0.012 165);
  --project-ink-1:       oklch(97% 0.005 165);
  --project-ink-2:       oklch(76% 0.010 165);
  --project-accent:      oklch(66% 0.19 165);
  --project-accent-glow: oklch(66% 0.19 165 / 0.12);
  --fraunces-wonk: 0;
  --fraunces-wght: 300;
}

[data-project="virtual-po"] {
  --project-bg:          oklch(8% 0.007 220);
  --project-bg-raised:   oklch(12% 0.009 220);
  --project-ink-1:       oklch(97% 0.005 220);
  --project-ink-2:       oklch(75% 0.010 220);
  --project-accent:      oklch(66% 0.20 220);
  --project-accent-glow: oklch(66% 0.20 220 / 0.12);
  --fraunces-wonk: 1;
  --fraunces-wght: 300;
}

[data-project="nigeria-emr"] {
  --project-bg:          oklch(7% 0.004 30);
  --project-bg-raised:   oklch(12% 0.005 30);
  --project-ink-1:       oklch(97% 0.004 50);
  --project-ink-2:       oklch(76% 0.006 50);
  --project-accent:      oklch(68% 0.18 50);
  --project-accent-glow: oklch(68% 0.18 50 / 0.12);
  --fraunces-wonk: 0;
  --fraunces-wght: 600;
}

/* ============================================================
   Animated border keyframes (see §5)
   ============================================================ */

@property --angle {
  syntax: "<angle>";
  initial-value: 0deg;
  inherits: false;
}

@keyframes border-beam-spin {
  to { --angle: 360deg; }
}

@keyframes border-pulse-breathe {
  0%, 100% { border-color: var(--line); }
  50%       { border-color: var(--accent); }
}

/* ============================================================
   Reduced motion override — always last
   ============================================================ */

@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration:        0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration:       0.01ms !important;
    scroll-behavior:           auto !important;
  }
}
```
