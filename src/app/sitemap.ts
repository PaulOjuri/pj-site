export const dynamic = 'force-static'
import type { MetadataRoute } from 'next'
import { getWorkSlugs, getJournalSlugs } from '@/lib/content'

const BASE = 'https://paulojuri.com'

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date()

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: BASE, lastModified: now, changeFrequency: 'weekly', priority: 1 },
    { url: `${BASE}/work`, lastModified: now, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${BASE}/journal`, lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${BASE}/library`, lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${BASE}/about`, lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE}/services`, lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE}/contact`, lastModified: now, changeFrequency: 'yearly', priority: 0.6 },
  ]

  const workRoutes: MetadataRoute.Sitemap = getWorkSlugs().map((slug) => ({
    url: `${BASE}/work/${slug}`,
    lastModified: now,
    changeFrequency: 'monthly',
    priority: 0.8,
  }))

  const journalRoutes: MetadataRoute.Sitemap = getJournalSlugs().map((slug) => ({
    url: `${BASE}/journal/${slug}`,
    lastModified: now,
    changeFrequency: 'yearly',
    priority: 0.7,
  }))

  return [...staticRoutes, ...workRoutes, ...journalRoutes]
}
