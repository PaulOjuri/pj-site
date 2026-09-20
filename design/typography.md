# Typography
paulojuri.com — Phase 2
Fonts: Playfair Display Variable (editorial/serif) + DM Sans Variable (UI/body) + DM Mono (code)

---

## Type ramp

Each role shown with real copy from the site, followed by exact specifications.

---

### Display
> "Building at the intersection of code, craft, and culture."

| Property | Value |
|----------|-------|
| Font | Playfair Display Variable |
| Size | `clamp(3.5rem, 2.5rem + 5vw, 8rem)` — 56px → 128px |
| Weight | 400 (regular — Playfair's regular has inherent optical boldness) |
| Line height | 1.05 |
| Letter spacing | −0.04em |
| Color (light) | `color.light.text` (#1A1815) |
| Color (dark) | `color.dark.text` (#E5DDD2) |
| Usage | Homepage h1 only. One instance per site. |
| Tailwind class | `.text-display` |

**Rationale:** −0.04em tracking pulls the wide-set Playfair letterforms together. 1.05 leading prevents double-line headlines from creating a river of white between lines. The 5vw fluid coefficient means the type scales gracefully from mobile (56px) to large desktop (128px) — no abrupt breakpoint jump.

---

### Heading — H1 (page titles)
> "Products, tools, and systems I've built or helped build."

| Property | Value |
|----------|-------|
| Font | Playfair Display Variable |
| Size | `clamp(2.75rem, 2rem + 3.75vw, 5.5rem)` — 44px → 88px |
| Weight | 400 |
| Line height | 1.05 |
| Letter spacing | −0.04em |
| Color (light) | `color.light.text` |
| Usage | One per page. Work, about, services, contact, library, journal page titles. |
| Tailwind class | `.text-heading` (maps to `--text-4xl`) |

**Issue found (P0-2):** The /work page h1 currently renders at `clamp(1.1rem, 2vw, 1.5rem)` due to a container override. This must be fixed in Phase 4 — the h1 should render at the full heading scale.

---

### Heading — H2 (section titles)
> "Selected work." / "Have a project in mind?" / "Engineer by training, designer by conviction."

| Property | Value |
|----------|-------|
| Font | Playfair Display Variable |
| Size | `clamp(1.5rem, 1.25rem + 1.25vw, 2.25rem)` — 24px → 36px |
| Weight | 400 |
| Line height | 1.25 |
| Letter spacing | −0.02em |
| Color (light) | `color.light.text` |
| Usage | Section headings on homepage and within pages. |
| Tailwind class | `.text-subheading` (maps to `--text-2xl`) |

---

### Heading — H3 (sub-section, card titles)
> "Prism" / "Clarity before code." / "Product Engineering"

| Property | Value |
|----------|-------|
| Font | Playfair Display Variable (or DM Sans for UI contexts) |
| Size | `clamp(1.25rem, 1.1rem + 0.75vw, 1.75rem)` — 20px → 28px |
| Weight | 400 (Playfair) / 500 (DM Sans) |
| Line height | 1.25 |
| Letter spacing | −0.02em |
| Color (light) | `color.light.text` |
| Usage | Project titles, principle headings, experience item titles. |
| Note | About page currently uses h2 for experience items — **fix to h3 in Phase 4** (audit finding). |

---

### Body — Lead paragraph
> "Product engineer and designer. I turn ambiguous ideas into software people actually want to use."

| Property | Value |
|----------|-------|
| Font | DM Sans Variable |
| Size | `clamp(1.0625rem, 1rem + 0.4vw, 1.25rem)` — 17px → 20px |
| Weight | 400 |
| Line height | 1.7 |
| Letter spacing | 0 |
| Color (light) | `color.light.text-muted` (#6E665D — FIXED from #6B6457) |
| Color (dark) | `color.dark.text-muted` (#AEA89F) |
| Usage | Intro paragraphs directly following an h1. One per page. |

---

### Body — Default
> "I care about the details most people ship past. The scroll jank. The loading state. The empty state nobody designed."

| Property | Value |
|----------|-------|
| Font | DM Sans Variable |
| Size | `clamp(0.9375rem, 0.875rem + 0.35vw, 1rem)` — 15px → 16px |
| Weight | 400 |
| Line height | 1.7 |
| Letter spacing | 0 |
| Color (light) | `color.light.text` or `color.light.text-muted` |
| Color (dark, full opacity) | `color.dark.text` (#E5DDD2) — FIXED: no more rgba(244,236,224,0.45) |
| Max width | 65ch (`--prose-max`) |
| Usage | All body copy. |

---

### Small / Caption
> "Apr 2026 · 6 min read" / "Brussels · Belgium"

| Property | Value |
|----------|-------|
| Font | DM Sans Variable |
| Size | `clamp(0.75rem, 0.7rem + 0.3vw, 0.875rem)` — 12px → 14px |
| Weight | 400 |
| Line height | 1.5 |
| Letter spacing | 0 |
| Color (light) | `color.light.text-muted` |
| Usage | Metadata, captions, timestamps, secondary info. |

---

### Label Caps
> "Selected work" / "Open to collaborate" / "Live"

| Property | Value |
|----------|-------|
| Font | DM Sans Variable |
| Size | `clamp(0.625rem, 0.55rem + 0.25vw, 0.75rem)` — 10px → 12px |
| Weight | 500 |
| Line height | 1.5 |
| Letter spacing | 0.12em |
| Text transform | uppercase |
| Color — **critical rule** | NEVER use label-caps below 4.5:1 contrast. On dark bg: use `color.dark.text-muted` (#AEA89F) minimum. On light bg: use `color.light.text` (#1A1815) or `color.light.text-muted` (#6E665D). The opacity-based labels (`rgba(244,236,224,0.3)`) **fail WCAG** and must be replaced in Phase 4. |
| Usage | Status tags, eyebrow labels, section annotations, form labels. |
| Tailwind class | `.label-caps` |

**Note:** At 10–12px, even 4.5:1 contrast is borderline. Wherever possible, prefer 7:1 (AAA) for this size. Do not use this size for informational text on low-contrast backgrounds.

---

### Mono
> "`npm run dev`" / "component.tsx"

| Property | Value |
|----------|-------|
| Font | DM Mono |
| Size | 0.875em (relative to context) |
| Weight | 400 |
| Line height | 1.6 |
| Letter spacing | 0 |
| Color (light) | `color.light.text` with `color.light.bg-raised` background |
| Usage | Inline code, code blocks, technical identifiers in journal posts. |

---

## Pairing rationale

**Playfair Display + DM Sans** is a classic editorial pairing: high-contrast serif for hierarchy and character, low-contrast grotesk for legibility at small sizes. The contrast between the two families is the design — Playfair's thick/thin strokes and ink-trap details make it feel crafted; DM Sans's neutral geometry disappears at body size, which is exactly what body text should do.

The pairing reads identically to how The Atlantic, Wired, or New York Magazine structure their digital typography — editorial authority without feeling academic or stiff.

**What to avoid:**
- Never set body copy in Playfair Display. It becomes illegible below 18px.
- Never set display headings in DM Sans. It loses all personality at large sizes.
- Never mix weights promiscuously. Playfair 400 is the correct weight for all display use — the optical boldness comes from the stroke contrast, not the weight setting.

---

## Dark theme type notes

Dark mode does not change the type scale or font families. It changes only color values:

| Role | Light | Dark |
|------|-------|------|
| Primary text | #1A1815 (neutral.1) | #E5DDD2 (neutral.10) |
| Muted text | #6E665D (neutral.6) | #AEA89F (neutral.8) |
| Headings | same as primary | same as primary (dark) |
| Accent text | #C8553D | accent.400 (lighter tint for dark bg) |
| Code bg | neutral.11 | neutral.0 |

Key fix: body copy inside dark sections (`AboutTeaser`, `ContactCTA`) currently uses `rgba(244,236,224,0.45)` which fails WCAG AA at ~4.2:1. Replace with the fully-opaque `color.dark.text-muted` (#AEA89F) which achieves 6.2:1 on `#1A1815`.

---

## Heading hierarchy rules (from audit)

1. **One h1 per page** — already correct on all pages. Do not change.
2. **h2 for section headings** — "Selected work", "Journal", "Have a project in mind?" etc. ✓
3. **h3 for items within sections** — project titles, principle items, experience entries. Currently broken on /about (uses h2 for items). Fix in Phase 4.
4. **No skipped levels** — h1 → h2 → h3. Never h1 → h3.
5. **Visually small ≠ semantically small** — the /work page h1 is visually tiny because of a CSS override, not because it's semantically a lower-level heading. Fix the CSS, not the heading level.
