export const dynamic = 'force-static'
import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/design-system'],
      },
      // Explicitly allow AI crawlers so the site shows up in AI searches
      { userAgent: 'GPTBot', allow: '/' },
      { userAgent: 'ClaudeBot', allow: '/' },
      { userAgent: 'Applebot-Extended', allow: '/' },
      { userAgent: 'PerplexityBot', allow: '/' },
    ],
    sitemap: 'https://paulojuri.com/sitemap.xml',
  }
}
