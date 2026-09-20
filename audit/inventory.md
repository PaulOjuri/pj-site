# Site Inventory
Generated: 2026-05-22

---

## Pages

| URL | Title | Purpose |
|-----|-------|---------|
| / | Paul Ojuri, Product Engineer & Designer | Homepage — intro, work, about teaser, journal teaser, contact form |
| /work | Work · Paul Ojuri | Portfolio — featured + secondary + table of all 6 projects |
| /work/prism | (dynamic) | Case study: Prism browser extension |
| /work/alfera | (dynamic) | Case study: Alfera Technik |
| /work/applyai | (dynamic) | Case study: ApplyAI |
| /work/carbonwise | (dynamic) | Case study: CarbonWise |
| /work/virtual-po | (dynamic) | Case study: Virtual PO |
| /work/nigeria-emr | (dynamic) | Case study: Nigeria EMR |
| /about | About · Paul Ojuri | About page — intro, stats, timeline, skills, principles |
| /services | Services · Paul Ojuri | Services — 4 service types with interactive hover rows |
| /contact | Contact · Paul Ojuri | Contact page — form, FAQ, availability |
| /journal | Journal · Paul Ojuri | Journal index — 7 posts with tag filtering |
| /journal/[slug] | (dynamic per post) | Individual journal post |
| /library | Library · Paul Ojuri | Book library — 165 books across 11 shelves |
| /library/walk | (no meta) | 3D WebGL interactive library room |
| /design-system | (internal, disallowed in robots.txt) | Design system preview |
| /api/contact | (API route) | Contact form submission → Resend email |
| /api/rosie | (API route) | Rosie AI character chat endpoint |

---

## Sections per page

### Homepage (/)
1. `<Hero>` — h1, subheading, 2 CTAs, location badge
2. `<NowStrip>` — scrolling marquee ticker with 4 status items
3. `<SelectedWork>` — h2 + ordered list of 3 featured projects
4. `<Divider>` — horizontal rule UI element
5. `<AboutTeaser>` — dark section: h2 + 2 paras + stats sidebar
6. `<JournalTeaser>` — h2 + list of 3 recent posts
7. section-gap spacer
8. `<ContactCTA>` — dark section: h2 + inline contact form + availability strip
9. `<Footer>` — brand, nav, copyright

### /work
1. Masthead — h1, eyebrow, project count stats
2. Hero card — first featured project (Prism) in dark/color split
3. Secondary cards grid — 2 featured (Alfera, ApplyAI) in color-block cards
4. Other work table — 3 projects (CarbonWise, Virtual PO, Nigeria EMR)
5. Footer strip — count summary + "Start a project" CTA

### /about
1. Opening — dark bg, h1, 2-col body copy
2. Stats row — 4 animated counters (6+, 20+, 4, 100%)
3. Experience timeline — 5 items with dot connector
4. Capabilities — 3 skill groups as tag clouds
5. Principles — 3 items alternating layout
6. CTA — dark closing strip with contact/work links

### /services
1. Header — h1, subtext, hover instruction
2. ServicesShowcase — 4 interactive rows with floating cursor preview card

### /contact
1. Masthead — h1, email, LinkedIn link
2. Body intro
3. ContactForm — 4 fields + submit
4. FAQ — 4 items in dl/dt/dd
5. Availability strip

### /journal
1. JournalMasthead — h1, issue number, tag filter, post list

### /library
1. Header — h1, intro, Walk-in CTA, jump nav
2. BookShelf sections — 11 categories (BookShelf component each)
3. Footer note

### /library/walk
1. Preloader
2. Full-screen 3D Scene (Three.js room with books, Rosie character, lighting, post-processing)
3. SoundController
4. BookPanel (book detail side panel)
5. RosieDialog (AI chat)
6. Overlays (UI overlays on canvas)

---

## Components

### Layout
- `Nav` — fixed header, scroll-aware border, mobile hamburger+overlay, `aria-label="Main navigation"`, `aria-current="page"` active state
- `Footer` — brand link, footer nav, copyright
- `LenisProvider` — wraps app in Lenis smooth scroll

### Sections
- `Hero` — homepage hero
- `NowStrip` — marquee status ticker
- `SelectedWork` — work list with GSAP scroll entrance
- `AboutTeaser` — dark about section
- `JournalTeaser` — journal post list with GSAP entrance
- `ContactCTA` — dark contact form section (homepage variant)
- `ContactForm` — light contact form (contact page variant)
- `JournalMasthead` — journal page header + tag filter + post grid
- `JournalGrid` — (exists as file, likely used inside JournalMasthead)
- `JournalPostNav` — prev/next navigation for journal posts
- `ServicesShowcase` — interactive service rows with GSAP cursor tracking
- `ServicesAccordion` — (file exists, may be unused/alternate)
- `ServicesEngagement` — (file exists, likely engagement/process section)
- `WorkHero` — work detail page hero
- `WorkProgressBar` — reading progress bar for work case studies
- `WorkCTALinks` — next/prev links on work pages
- `AboutTimeline` — (file exists, alternate timeline component)
- `AboutHorizontalTimeline` — (file exists, alternate horizontal variant)
- `BookShelf` — single shelf section on library page

### Three.js / 3D
- `HeroGL` — WebGL hero background (with `WebGLErrorBoundary` + `HeroFallback`)
- `HeroFallback` — canvas fallback when WebGL unavailable
- `WebGLErrorBoundary` — error boundary for WebGL context
- `Scene` — main 3D library room scene
- `Room` — 3D room geometry
- `BookShelf3D` — 3D bookshelf geometry
- `Book3D` — individual 3D book object
- `BookViewer` — book detail panel
- `BookPanel` — side panel UI
- `CameraRig` — camera controller
- `Atmosphere` — fog/ambient atmosphere
- `Lights` — lighting setup
- `Ladder` — decorative ladder object
- `PostProcessing` — bloom/DOF effects
- `Preloader` — loading screen
- `RosieCharacter` — AI character 3D model
- `RosieDialog` — chat UI for Rosie AI
- `SoundController` — Howler.js audio manager
- `Overlays` — canvas UI overlays

### UI Primitives
- `Button` — 4 variants (primary, ghost, outline, text), 3 sizes (sm, md, lg), renders as `<button>` or `<Link>` or `<a target="_blank">`
- `Divider` — horizontal rule
- `Tag` — tag/badge element
- `POLogo` — logo SVG component
- `AnimatedCounter` — scroll-triggered number count-up animation

### Library-walk specific
- `dialog-tree.ts` — Rosie dialog content tree
- `libraryData.ts` — book data for 3D scene
- `gpuTier.ts` — GPU tier detection for quality scaling
- `sound.ts` — sound asset definitions
- `store.ts` — Zustand state for library walk

---

## Fonts

| Font | Provider | Usage | Weights |
|------|----------|-------|---------|
| Playfair Display | Google Fonts (next/font) | Headings, display text (--font-editorial) | 400, 500, 600, 700 (normal + italic) |
| DM Sans | Google Fonts (next/font) | Body text, UI labels (--font-ui-stack) | 300, 400, 500, 600 |
| DM Mono | Google Fonts (next/font) | Code, monospace (--font-mono-stack) | 300, 400, 500 |

All loaded via `next/font/google` with `display: 'swap'`, Latin subset only.

---

## Color tokens (from globals.css)

| Token | Value | Usage |
|-------|-------|-------|
| --ink | #1A1815 | Primary text, dark backgrounds |
| --paper | #F4ECE0 | Page background, light text on dark |
| --cream | #EFE5D6 | Alternate bg, form inputs |
| --muted | #6B6457 | Secondary text |
| --subtle | rgba(26,24,21,0.28) | Borders, dividers |
| --accent | #C8553D | Terracotta — CTAs, emphasis, highlights |
| --accent-alt | #B2422E | Darker accent (hover states) |
| --white | #FFFFFF | Pure white |
| --ink-faint | rgba(26,24,21,0.28) | Placeholder/disabled text |
| --ink-line | rgba(26,24,21,0.12) | Hairline borders |
| --paper-2 | rgba(26,24,21,0.04) | Subtle bg fills |

---

## Typography scale

| Token | Min | Fluid | Max |
|-------|-----|-------|-----|
| --text-xs | 0.625rem | clamp | 0.75rem |
| --text-sm | 0.75rem | clamp | 0.875rem |
| --text-base | 0.9375rem | clamp | 1rem |
| --text-lg | 1.0625rem | clamp | 1.25rem |
| --text-xl | 1.25rem | clamp | 1.75rem |
| --text-2xl | 1.5rem | clamp | 2.25rem |
| --text-3xl | 2rem | clamp | 3.5rem |
| --text-4xl | 2.75rem | clamp | 5.5rem |
| --text-hero | 3.5rem | clamp | 8rem |

---

## External dependencies (package.json)

### Production
| Package | Version | Purpose |
|---------|---------|---------|
| next | 16.2.6 | Framework |
| react | 19.2.4 | UI |
| react-dom | 19.2.4 | DOM rendering |
| three | ^0.184.0 | 3D graphics |
| @react-three/fiber | ^9.6.1 | React Three.js renderer |
| @react-three/drei | ^10.7.7 | Three.js helpers |
| @react-three/postprocessing | ^3.0.4 | Post-processing effects |
| @react-spring/three | ^10.0.3 | Spring animations for 3D |
| react-spring | ^10.0.3 | Spring animations |
| gsap | ^3.15.0 | Animation (ScrollTrigger, tweens) |
| lenis | ^1.3.23 | Smooth scrolling |
| howler | ^2.2.4 | Audio (library walk) |
| zustand | ^5.0.13 | State management (library walk) |
| gray-matter | ^4.0.3 | MDX frontmatter parsing |
| @mdx-js/loader | ^3.1.1 | MDX webpack loader |
| @mdx-js/react | ^3.1.1 | MDX React components |
| @next/mdx | ^16.2.6 | Next.js MDX integration |
| next-mdx-remote | ^6.0.0 | Remote MDX rendering |
| rehype-autolink-headings | ^7.1.0 | Auto-link headings in MDX |
| rehype-pretty-code | ^0.14.3 | Code syntax highlighting |
| rehype-slug | ^6.0.0 | Heading IDs in MDX |
| remark-gfm | ^4.0.1 | GFM markdown in MDX |
| resend | ^6.12.3 | Email sending (contact form) |
| sharp | ^0.34.5 | Image optimization |

### Dev
| Package | Version | Purpose |
|---------|---------|---------|
| tailwindcss | ^4 | CSS framework |
| @tailwindcss/postcss | ^4 | PostCSS integration |
| @cloudflare/next-on-pages | ^1.13.16 | Cloudflare Pages adapter |
| @opennextjs/cloudflare | ^1.19.10 | OpenNext Cloudflare adapter |
| wrangler | ^4.92.0 | Cloudflare CLI |
| typescript | ^5 | TypeScript |
| eslint | ^9 | Linting |
| prettier | ^3.8.3 | Formatting |
| prettier-plugin-tailwindcss | ^0.8.0 | Tailwind class sorting |

---

## Forms

| Form | Location | Fields | Submission |
|------|----------|--------|------------|
| Contact CTA | Homepage (ContactCTA) | Name*, Email*, Subject, Message* + honeypot | POST /api/contact (Resend) |
| Contact form | /contact (ContactForm) | Name*, Email*, Subject*, Message* + honeypot | POST /api/contact (Resend) |

Note: On /contact, "subject" is marked `required` in ContactForm but not in ContactCTA.

---

## External links

| Anchor text | URL | Location |
|------------|-----|---------|
| @paulojuri (implied) | https://twitter.com/paulojuri | JSON-LD sameAs, footer implied |
| GitHub | https://github.com/paulojuri | JSON-LD sameAs |
| LinkedIn | https://linkedin.com/in/paulojuri | JSON-LD sameAs, contact page |
| hello@paulojuri.com | mailto:hello@paulojuri.com | Homepage footer, contact page, CTAs |

No external links found in nav or page body content beyond social/email above.

---

## JSON-LD structured data

| Schema type | Location | Key fields |
|-------------|----------|-----------|
| Person | Homepage | name, jobTitle, url, sameAs (Twitter, GitHub, LinkedIn) |
| WebSite | Homepage | name, url, author |
| Article | Journal post pages | headline, description, datePublished, keywords, author, publisher |
| CreativeWork | Work post pages | name, description, url, dateCreated, creator |
