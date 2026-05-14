const BASE = 'https://paulojuri.com'

export function personSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: 'Paulo Juri',
    url: BASE,
    jobTitle: 'Product Engineer & Designer',
    sameAs: [
      'https://twitter.com/paulojuri',
      'https://github.com/paulojuri',
      'https://linkedin.com/in/paulojuri',
    ],
  }
}

export function websiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Paulo Juri',
    url: BASE,
    author: { '@type': 'Person', name: 'Paulo Juri' },
  }
}

export function articleSchema({
  title,
  excerpt,
  slug,
  date,
  tags,
}: {
  title: string
  excerpt: string
  slug: string
  date: string
  tags: string[]
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: title,
    description: excerpt,
    url: `${BASE}/journal/${slug}`,
    datePublished: date,
    keywords: tags.join(', '),
    author: { '@type': 'Person', name: 'Paulo Juri', url: BASE },
    publisher: { '@type': 'Person', name: 'Paulo Juri', url: BASE },
  }
}

export function workSchema({
  title,
  tagline,
  slug,
  year,
}: {
  title: string
  tagline: string
  slug: string
  year: string
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'CreativeWork',
    name: title,
    description: tagline,
    url: `${BASE}/work/${slug}`,
    dateCreated: year,
    creator: { '@type': 'Person', name: 'Paulo Juri', url: BASE },
  }
}

/** Renders a JSON-LD script tag — use in page <head> via Next.js script injection */
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  )
}
