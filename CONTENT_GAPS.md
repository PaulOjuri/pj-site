# Content Gaps

Everything here requires input from Paul. Grouped by how much it blocks the site from feeling complete.

---

## Priority 1 — Publish to Unlock the Essays Section

The six essays in `src/components/sections/Essays.tsx` show as DRAFT or SOON with real excerpts. The full essay text exists as MDX files in `/content/journal/` — they just need to be treated as ready to publish (or actually finished and revised).

**What to do:** For each essay, decide if the MDX content in `/content/journal/` is ready to go live. If yes, add `href: '/journal/[slug]'` to the corresponding essay object in `Essays.tsx` and update the status from `'draft'` to `'published'`. The journal route already renders MDX posts correctly.

**The files:**

| Essay title | MDX file | Notes |
|---|---|---|
| The product engineer is not a myth | `/content/journal/the-product-engineer.mdx` | Has frontmatter + body content |
| On building in public without burning out | `/content/journal/building-in-public.mdx` | Has frontmatter + body content |
| Why privacy is a design problem | `/content/journal/why-privacy-is-a-design-problem.mdx` | Has frontmatter + body content |
| The AI that forgets you | `/content/journal/the-ai-that-forgets-you.mdx` | Has frontmatter + body content |
| The cookie banner comedy: a dark pattern in three acts | `/content/journal/the-cookie-banner-comedy.mdx` | Has frontmatter + body content |
| Your browser is a stock exchange (and you're not the trader) | `/content/journal/your-browser-is-a-stock-exchange.mdx` | Has frontmatter + body content |

To publish an essay, in `Essays.tsx` update the entry:
```ts
{
  date: 'FEB 2025',      // real date
  status: 'published',   // was 'draft'
  href: '/journal/the-product-engineer',  // add this
  // ... rest unchanged
}
```

Then in the JSX, wrap the title in an `<a href={essay.href}>` when `essay.href` is defined.

---

## Priority 2 — Replace Placeholder Project Images

This is the most visually obvious gap. Several project images in `FeaturedWork.tsx` are Unsplash hotlinks. They look fine at a glance but break the authenticity of the work section — these are supposed to be your projects.

**Prism** (`images` array in `FEATURED_PROJECTS`):
- Slide 1: `/images/work/prism-dashboard.png` — real, exists in `/public/images/work/`
- Slide 2: `/images/work/prism-popup.png` — real, exists in `/public/images/work/`
- Slide 3: `https://images.unsplash.com/photo-1614064641938-...` — placeholder, replace with a third Prism screenshot (the insight panel, the tracker list, the settings screen, anything)
- Detail image 1: Unsplash laptop photo — replace with a Prism feature detail shot
- Detail image 2: Unsplash code photo — replace with a Prism feature detail shot

**ApplyAI** (`images` array):
- Slide 1: `/images/work/applyai-icon.png` — real icon, exists in `/public/images/work/`
- Slide 2: Unsplash job application photo — replace with a screenshot of the popup filling a form field
- Slide 3: Unsplash resume photo — replace with the profile setup screen or the application log
- Detail image 1: Unsplash laptop photo — replace with ApplyAI screenshot
- Detail image 2: Unsplash code photo — replace with ApplyAI screenshot

**Alfera** (`images` array):
- All three carousel images are Unsplash laptop/MacBook photos
- Both detail images are Unsplash photos
- Replace with screenshots from `alferatechnik.com`, brand photography, or product renders from the project

**Where to put new images:** `/public/images/work/` — already exists. Follow the naming pattern: `alfera-hero.png`, `alfera-brand.png`, etc. Update the `images` and `detailImages` arrays in `FEATURED_PROJECTS` in `FeaturedWork.tsx`.

---

## Priority 3 — Social Links

In `SiteFooter.tsx`, the `SOCIAL_LINKS` array has two placeholder entries:

```ts
const SOCIAL_LINKS = [
  { label: 'Instagram', href: '#' },       // placeholder
  { label: 'LinkedIn', href: 'https://linkedin.com/in/paulojuri' },  // real
  { label: 'X', href: '#' },               // placeholder
]
```

Two options:
1. Add the real URLs for Instagram and X/Twitter.
2. Remove those two entries from the array. Three social links with two doing nothing is worse than one real link.

If you don't use those platforms publicly, just remove them. One working LinkedIn link is better than three links where two go nowhere.

---

## Priority 4 — Work Detail Pages

The `/work/[slug]` route exists and reads from `/content/work/`. All six case study MDX files exist with real frontmatter and body content:

```
/content/work/prism.mdx
/content/work/applyai.mdx
/content/work/alfera.mdx
/content/work/carbonwise.mdx
/content/work/nigeria-emr.mdx
/content/work/virtual-po.mdx
```

**What's missing:** The work detail pages are not linked from anywhere on the homepage. The `FeaturedWork.tsx` project blocks have a "See the project →" link that points to `/prism` or `/applyai` (dedicated landing pages), not to the case study at `/work/prism`.

For Alfera, CarbonWise, Nigeria EMR, and Virtual PO — which do not have standalone landing pages — the work detail pages are the only way to read more. Consider adding a "Case study →" link alongside or instead of the live URL link in the project block.

The `MORE_PROJECTS` list (items 04–07) has no links except TradeEasy. CarbonWise, Virtual PO, and Nigeria EMR all have MDX case studies. Add `link: '/work/carbonwise'` etc. to those entries.

---

## Priority 5 — Open Graph Image

`src/app/layout.tsx` references `/og.png`:
```ts
openGraph: {
  images: [{ url: '/og.png', width: 1200, height: 630 }],
}
```

This file does not exist. The `/public/og/` directory is empty. Every link preview (Slack, iMessage, Twitter, LinkedIn) will show no image.

**What to create:** A 1200×630 PNG at `/public/og.png`. Suggested treatment: dark background (`#0D0C0B`), "PAUL OJURI" in Anton at large size, "Product Engineer & Designer" in Space Mono below, the amber accent color (`#D4A255`) used for the name or a horizontal rule.

You can generate this in Figma, export it, and drop it at `/public/og.png`. No code changes needed — the metadata is already wired up.

---

## Priority 6 — Footer Logomark

In `SiteFooter.tsx`:
```tsx
<MediaImage
  seed="logomark"
  alt="Paul Ojuri logomark"
  width={48}
  height={48}
/>
```

`MediaImage` with a `seed` prop resolves to a Picsum placeholder image. There is no real logomark. The header uses an inline SVG `<LogoMark />` component that renders a `PO` monogram in a rounded rectangle — that same SVG could be extracted and used here instead of the `MediaImage`.

**What to do:** Either export the `LogoMark` function from `SiteHeader.tsx` into its own file (e.g., `src/components/LogoMark.tsx`) and import it in the footer, or create a proper SVG logomark file at `/public/images/logomark.svg` and use a standard `<Image>` tag.

---

## Lower Priority

**`/public/paul/portrait.jpg`** — this file exists and is used in the About section. The About section looks complete as a result. No action needed unless the photo needs updating.

**`/public/paul/hero-video.mp4`** — used as the Hero background at 20% opacity. Exists. The specific content doesn't matter much at this opacity level, but if the video is unrelated to Paul's work it's worth replacing eventually.

**`/app/work/page.tsx`** — no `/work` index page exists. Visiting `/work` directly returns a 404. Either create an index page that lists all case studies, or add `redirect('/work', '/')` to redirect visitors back to the homepage work section.

**TradeEasy (`/tradeeasy`)** — a page exists at `src/app/tradeeasy/page.tsx` and the link in `MORE_PROJECTS` (`link: '/tradeeasy'`) is already wired up. No action needed.
