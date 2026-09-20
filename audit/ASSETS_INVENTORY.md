# Assets Inventory — paulojuri.com
Phase 0 · May 2026

---

## Images (public/images/)

| Path | Type | Approx. Size | Used Where |
|---|---|---|---|
| `public/images/paul-mud-masters.jpg` | JPEG photo | ~300 KB est. | Available but not currently rendered in any route |
| `public/images/work/applyai-icon.png` | PNG | ~50 KB est. | ApplyAI case study |
| `public/images/work/prism-dashboard.png` | PNG | ~200 KB est. | Prism case study |
| `public/images/work/prism-popup.png` | PNG | ~150 KB est. | Prism case study |

**Note:** No cover images for Alfera, CarbonWise, Virtual PO, Nigeria EMR, or any journal article.
Paul's portrait (`paul-mud-masters.jpg`) is present but not rendered on the current About page.

---

## Audio

| Path | Type | Approx. Size | Used Where |
|---|---|---|---|
| `public/sounds/library/ambient.mp3` | MP3 | ~2 MB est. | `/library/walk` 3D room ambient audio |

---

## SVG Icons (public/)

| Path | Used Where |
|---|---|
| `public/file.svg` | Next.js default asset |
| `public/globe.svg` | Next.js default asset |
| `public/next.svg` | Next.js default asset |
| `public/vercel.svg` | Next.js default asset |
| `public/window.svg` | Next.js default asset |

*All public/*.svg files are Next.js template defaults — none are in active use by the site.*

---

## Fonts

No local font files found in `public/`. Fonts loaded via:
- `next/font/google`: **Geist**, **Geist Mono** (inferred from layout)
- Custom editorial font: **Playfair Display** or similar serif (inferred from `--font-sans` token pointing to editorial face)
- UI font: **DM Sans** or similar (inferred from `--font-ui` token)

*Exact font identifiers are in `src/app/layout.tsx` — to be confirmed in Phase 2.*

---

## Content Files (MDX)

| Path | Words (est.) |
|---|---|
| `content/work/prism.mdx` | ~600 |
| `content/work/alfera.mdx` | ~500 |
| `content/work/applyai.mdx` | ~800 |
| `content/work/carbonwise.mdx` | ~400 |
| `content/work/virtual-po.mdx` | ~400 |
| `content/work/nigeria-emr.mdx` | ~500 |
| `content/journal/the-ai-that-forgets-you.mdx` | ~700 |
| `content/journal/the-prompt-you-never-typed.mdx` | ~700 |
| `content/journal/the-cookie-banner-comedy.mdx` | ~700 |
| `content/journal/your-browser-is-a-stock-exchange.mdx` | ~700 |
| `content/journal/why-privacy-is-a-design-problem.mdx` | ~600 |
| `content/journal/building-in-public.mdx` | ~500 |
| `content/journal/the-product-engineer.mdx` | ~500 |

---

## Notable Gaps (content needed before or during rebuild)

1. **No hero images / cover images** for 4 of 6 projects (Alfera, CarbonWise, Virtual PO, Nigeria EMR). The rebuild's per-project hero components will substitute for static images, but hi-res product screenshots are still needed for the case study body.
2. **No portrait of Paul** rendered on the site (image exists at `paul-mud-masters.jpg` but is unused). The About page rebuild needs it.
3. **No testimonials** — none exist on the live site. Per §9.3 of the brief, do not fabricate. Slot is reserved with `// TODO: needs real content`.
4. **No awards, press, or talks** — none listed on the current site. Same rule applies.
5. **No OG images** for `/about`, `/services`, `/contact`, `/library`, `/journal` (only `/` and work/journal slugs have them).
6. **No `now.json`** — the sidebar spec (§4) calls for a `now.json` file Paulo edits. Does not currently exist. Must be created.
7. **No resume / PDF download** — none referenced on the current site.
8. **No video assets** — the brief calls for short `<video>` preview clips per project card (max 600 KB AVIF poster). None currently exist.
9. **3D library room** at `/library/walk` uses `public/sounds/library/ambient.mp3` — audio is preserved; the WebGL scene code is in `src/app/library/walk/` (to be reviewed in Phase 2).

---

## Screenshots

*Automated screenshots not captured (would require Playwright install + headless browser run). The current site can be visually verified at https://paulojuri.com. The rebuild will produce QA screenshots in `qa/visual/` as part of Phase 6.*
