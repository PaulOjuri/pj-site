/**
 * Per-project theme configuration.
 * Each project at /work/[slug]/ exports one of these from theme.config.ts.
 * The ProjectShell component reads it and applies tokens + font scoping.
 */

export type GoogleFontRef = {
  type: 'google'
  family: string
  variable: string   // CSS variable name, e.g. "--font-project-display"
  weights?: number[]
  axes?: string[]
}

export type LocalFontRef = {
  type: 'local'
  src: string        // path relative to project assets/
  variable: string
}

export type FontRef = GoogleFontRef | LocalFontRef

/**
 * OKLCH string helper type — enforces the format at the call site.
 * Example: "oklch(65% 0.20 32)" or "oklch(65% 0.20 32 / 0.15)"
 */
export type OklchString = `oklch(${string})`

export type ProjectTokens = {
  bg:          OklchString
  bgRaised:    OklchString
  ink1:        OklchString
  ink2:        OklchString
  accent:      OklchString
  accentGlow:  OklchString
  line?:       OklchString
  /** Fraunces WONK axis 0–1 (1 = full optical eccentricity) */
  frauncesWonk?: number
  /** Fraunces weight 100–900 */
  frauncesWght?: number
}

export type MotionSignature =
  | 'spring'      // Elastic, bouncy — products with personality
  | 'inertia'     // Momentum-decay — physical, weighty products
  | 'mechanical'  // Snappy, linear-ish — precision / data products
  | 'organic'     // Slow, breathing — health / calm products

export type ProjectMotion = {
  signature: MotionSignature
  easeOut:   string   // CSS cubic-bezier string
  easeIn:    string
  duration: {
    fast:   number    // ms
    base:   number
    slow:   number
  }
}

export type HeroVariant =
  | '3d-scene'    // react-three-fiber scene
  | 'shader'      // GLSL fragment shader canvas
  | 'video'       // muted looping video (last resort)
  | 'sequence'    // crossfading image sequence
  | 'editorial'   // CSS-only: large type + texture/gradient

export type ProjectHero = {
  variant: HeroVariant
  /**
   * Dynamic import of the hero component.
   * Keeps the global bundle small — hero code is project-specific.
   * Example: () => import('./components/PrismHero')
   */
  component: () => Promise<{ default: React.ComponentType }>
  /** AVIF path. Used as LCP element and reduced-motion fallback. */
  poster: string
}

export type ProjectLayout =
  | 'standard'    // Default: hero + scrolling sections
  | 'editorial'   // Magazine-style: big type, narrow prose
  | 'gallery'     // Image-first: full-bleed, sparse text
  | 'longform'    // Extended reading: tracing beam, side anchors
  | 'split'       // Two-pane: fixed visual left, scroll right

export type ProjectTheme = {
  slug:    string
  name:    string
  client:  string
  year:    number
  role:    string[]
  tags:    string[]
  /** One sentence. Used in the sidebar breadcrumb chip and SEO. */
  summary: string

  tokens: ProjectTokens

  fonts: {
    display: FontRef
    body:    FontRef
    mono?:   FontRef
  }

  motion: ProjectMotion

  hero: ProjectHero

  cursor?: {
    /** Overrides the global cursor accent color within this project */
    color?: OklchString
    /** Short label shown inside the cursor (e.g. "view →") */
    label?: string
  }

  layout: ProjectLayout

  /**
   * Per-project MDX components.
   * Keys match the JSX component names used in content.mdx.
   * Example: { Demo: PrismInteractiveDemo, Chart: PrismChart }
   */
  components?: Record<string, React.ComponentType<unknown>>
}
