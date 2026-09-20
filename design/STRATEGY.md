# Strategy
paulojuri.com — Phase 1
Based on: audit/CURRENT_STATE.md, audit/scorecard.md, live site analysis

---

## 1. Who is this site for?

**Primary audience: Early-stage founders and product leads at small-to-mid-sized companies.**

Evidence from content: the work portfolio (Prism, Alfera, ApplyAI, CarbonWise) skews toward 0→1 products and VC-adjacent startups. The services page explicitly names "You have an idea but no product yet" and "You need to ship faster than your current team allows." The about page calls out "early-stage founders and ambitious teams." The FAQ on /contact addresses equity payment and deferred compensation — signals that the visitor is likely a cash-constrained founder, not a large enterprise procurement team.

**Secondary audience: Design/product peers and hiring managers at product-led companies.**

The journal (AI, privacy, ethics) and library (books, ideas) position Paul as someone with intellectual depth beyond execution. These sections serve a slower, softer path to trust — people who read, share his writing, and later want to work together.

**Who this site is NOT for:** agencies, enterprise procurement, or anyone who needs RFPs, case study PDFs, or hourly billing transparency. The site does not need to serve that audience and the current writing voice would actively repel them.

---

## 2. Jobs to be done

**Primary job:** Evaluate whether Paul Ojuri is the right person to build or improve my product — and, if yes, start a conversation.

**Secondary job:** Get a feel for how Paul thinks and works before reaching out (through journal, library, case study depth), reducing the cold-contact anxiety.

The funnel is: land on homepage → believe this person can do the job → have enough trust to contact. The audit confirmed the site executes the first step well (the craft signals competence) and fails the second (no social proof, no outcome evidence). The rebuild must close that gap.

---

## 3. Desired action

**Primary:** Send a contact message or book a call — the `/contact` form is the conversion event.

**Secondary:** Navigate to `/work` and read a case study deeply enough to form an opinion.

Everything else (journal, library, about) is trust-building infrastructure. It should never distract from the primary action, but it justifies taking it.

---

## 4. Voice: three adjectives

**Sharp.** The copy does not hedge. "I turn ambiguous ideas into software people actually want to use" is a direct claim, not a list of skills. "Prototypes lie" is a provocation that signals a point of view. Every sentence earns its place. We will not water this down.

**Grounded.** Paul writes in the first person, from experience, with specific detail. The principles on the about page ("Clarity before code," "Ship to learn") read as hard-won, not aspirational. The site has no stock imagery, no generic "passionate about digital solutions" language. Grounded means: no inflated claims, no vague value propositions, no borrowed credibility.

**Precise.** The design itself is the argument — tight spacing, deliberate scale, nothing left by accident. Precision extends to content: specific tools, real project names, honest status labels (Live / Shipped / Building). The voice and the design say the same thing.

---

## 5. Design direction: editorial / serif-led

This is already the site's direction and it is correct. Playfair Display carrying the display weight against DM Sans is a strong, distinctive pairing. The terracotta/paper palette is warm without being generic. We will not change the design language. We will fix its execution.

**Why not the alternatives:**

- **Technical / grotesk-and-mono:** Would suit an infra or tooling engineer. Paul's work is product-shaped — human-facing software, design-led. Grotesk-heavy reads as "backend developer," which undersells the design half.
- **Expressive / asymmetric:** High maintenance, high skill to execute well. The current approach is already opinionated without being risky. Asymmetry here would read as student work.
- **Minimal / Swiss:** Too cold for a personal site where trust comes from personality, not institutional authority. Would erase the warmth that makes the current site memorable.
- **Maximal / brutalist:** Wrong for the audience. Early-stage founders evaluating a freelancer need legibility and credibility, not provocation.

**What changes in Phase 4:**
- Fix the execution gaps (broken hierarchy, contrast failures, empty hero, missing CTAs) — not the direction.
- Make the hero section feel complete rather than abandoned now that the photo/card is gone.
- Add one structural signature moment — a deliberate compositional choice that makes the site feel designed, not assembled.

---

## 6. Three reference sites

**Linear.app (https://linear.app)**
We are stealing: the way motion is earned — every animation on Linear has a spatial logic (things move in from where they came from, not arbitrarily). Also: the confidence of a very long scroll that stays legible because spacing and hierarchy do all the work.

**Rauno Freiberg (https://rauno.me)**
We are stealing: the economy of means — a personal site that says almost nothing but communicates extreme craft through the quality of every detail. Typography at scale, no decoration, very tight line heights. Proof that restraint at the detail level reads as sophistication, not austerity.

**Paco Coursey (https://paco.me)**
We are stealing: the way a personal site can have a clear intellectual character through curation (reading list, changelog, now) without feeling like a blog. The personality comes through the choices, not biographical description.

---

## 7. Five design principles

**1. We will let the typography carry the visual weight.**
We will not add images, gradients, or background textures to fill empty space. If a section feels light, the answer is stronger copy or better spacing — not decoration.

**2. We will make trust visible.**
We will not ship the services or work pages without at least one credible third-party signal per page. Testimonials with names, measurable outcomes, named clients. If the content doesn't exist yet, placeholder markup will make it structurally present so it's filled in, not forgotten.

**3. We will design every interactive state.**
We will not leave hover-only interactions as the only way to access contextual information. Every reveal, tooltip, or progressive disclosure must have a keyboard-accessible and touch-accessible equivalent.

**4. We will fix contrast before we ship.**
We will not leave rgba(244,236,224,0.45) on dark backgrounds in production. The warm palette is beautiful and accessible contrast is achievable within it. This is not a trade-off.

**5. We will earn every CTA.**
We will not place a contact form above the trust-building content. The homepage sequence is: establish identity → show evidence → invite contact. The contact section should feel like a natural conclusion, not an interruption.

---

## What we are NOT doing in Phase 4

- Changing the URL structure (existing pages stay at their current paths)
- Rebuilding the library walk (it is a deliberate, acceptable performance trade-off)
- Translating copy (it is already in English)
- Inventing social proof (if testimonials don't exist, we add structural slots with `// TODO: real content`)
- Changing the stack (Next.js 16 + Tailwind 4 + Cloudflare Pages — already deployed and working)
- Touching journal/library content (out of scope for the rebuild)
