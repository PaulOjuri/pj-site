/**
 * Per-project theme registry.
 * The full ProjectTheme objects live in each project's theme.config.ts.
 * This file provides the lightweight metadata used by the sidebar,
 * index pages, and the page transition curtain color.
 */

export type ProjectMeta = {
  slug:        string
  name:        string
  accent:      string   /* OKLCH string — used for sidebar pill, curtain */
  category:    string
  year:        number
  status:      'live' | 'shipped' | 'archived'
  order:       number   /* Controls display order on index pages */
  featured:    boolean
}

/**
 * Ordered list — matches the MDX frontmatter `order` field.
 * Update here when adding new projects.
 */
export const projects: ProjectMeta[] = [
  {
    slug:     'prism',
    name:     'Prism',
    accent:   'oklch(68% 0.22 255)',
    category: 'Product · Browser Extension',
    year:     2025,
    status:   'live',
    order:    1,
    featured: true,
  },
  {
    slug:     'alfera',
    name:     'Alfera Technik',
    accent:   'oklch(72% 0.18 72)',
    category: 'Web · Brand · E-commerce',
    year:     2025,
    status:   'live',
    order:    2,
    featured: true,
  },
  {
    slug:     'applyai',
    name:     'ApplyAI',
    accent:   'oklch(67% 0.20 145)',
    category: 'Product · Browser Extension',
    year:     2025,
    status:   'live',
    order:    3,
    featured: true,
  },
  {
    slug:     'carbonwise',
    name:     'CarbonWise',
    accent:   'oklch(66% 0.19 165)',
    category: 'Product · SaaS',
    year:     2024,
    status:   'shipped',
    order:    4,
    featured: false,
  },
  {
    slug:     'virtual-po',
    name:     'Virtual PO',
    accent:   'oklch(66% 0.20 220)',
    category: 'Product · AI · SaaS',
    year:     2024,
    status:   'shipped',
    order:    5,
    featured: false,
  },
  {
    slug:     'nigeria-emr',
    name:     'Nigeria EMR',
    accent:   'oklch(68% 0.18 50)',
    category: 'Product · Healthcare · Web',
    year:     2023,
    status:   'shipped',
    order:    6,
    featured: false,
  },
]

export function getProjectMeta(slug: string): ProjectMeta | undefined {
  return projects.find((p) => p.slug === slug)
}

export function getFeaturedProjects(): ProjectMeta[] {
  return projects.filter((p) => p.featured).sort((a, b) => a.order - b.order)
}
