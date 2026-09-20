import type { Metadata } from 'next'
import { SiteFooter } from '@/components/sections/SiteFooter'
import { getAllJournal } from '@/lib/content'
import { JournalMasthead } from '@/components/sections/JournalMasthead'

export const metadata: Metadata = {
  title: 'Journal',
  description: 'Writing on product, design, engineering, and building things people actually use.',
}

export default function JournalPage() {
  const posts = getAllJournal()

  const allTags = Array.from(
    new Set(posts.flatMap((p) => p.frontmatter.tags)),
  ).sort()

  const entries = posts.map((p) => ({
    slug: p.slug,
    frontmatter: {
      title:       p.frontmatter.title,
      date:        p.frontmatter.date,
      excerpt:     p.frontmatter.excerpt,
      tags:        p.frontmatter.tags,
      readingTime: p.frontmatter.readingTime,
    },
  }))

  return (
    <>
      <JournalMasthead
        posts={entries}
        allTags={allTags}
        issueNumber={posts.length}
      />
      <SiteFooter />
    </>
  )
}
