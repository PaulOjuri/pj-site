import type { Metadata } from 'next'
import Link from 'next/link'
import { Nav } from '@/components/layout/Nav'
import { Footer } from '@/components/layout/Footer'
import { Divider } from '@/components/ui/Divider'
import { Tag } from '@/components/ui/Tag'
import { getAllJournal } from '@/lib/content'

export const metadata: Metadata = {
  title: 'Journal',
  description:
    'Writing on product, design, engineering, and building things people actually use.',
}

export default function JournalPage() {
  const posts = getAllJournal()

  // Collect all unique tags
  const allTags = Array.from(
    new Set(posts.flatMap((p) => p.frontmatter.tags)),
  ).sort()

  return (
    <>
      <Nav />
      <main id="main-content">

        {/* Header */}
        <section className="pt-32 pb-16 border-b border-subtle">
          <div className="container-page grid gap-12 md:grid-cols-2 md:gap-24">
            <div>
              <p className="label-caps text-muted mb-4">Journal</p>
              <h1 className="text-heading">
                Thinking out loud,{' '}
                <em>in writing.</em>
              </h1>
            </div>
            <div className="flex flex-col justify-end gap-4">
              <p className="text-lg leading-relaxed text-muted">
                Essays on product thinking, design craft, engineering tradeoffs,
                and what it actually looks like to build software that works.
              </p>
              <div className="flex flex-wrap gap-2 pt-2">
                {allTags.map((tag) => (
                  <Tag key={tag}>{tag}</Tag>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Posts list */}
        <div className="container-page py-8">
          <ol
            className="divide-y divide-subtle"
            aria-label="Journal posts"
          >
            {posts.map((post) => (
              <li key={post.slug}>
                <Link
                  href={`/journal/${post.slug}`}
                  className="group grid grid-cols-1 gap-4 py-10 md:grid-cols-[1fr_auto] md:gap-16 md:py-12"
                >
                  <div className="flex flex-col gap-3">
                    <h2 className="text-subheading transition-colors duration-200 group-hover:text-accent">
                      {post.frontmatter.title}
                    </h2>
                    <p className="max-w-prose text-muted leading-relaxed">
                      {post.frontmatter.excerpt}
                    </p>
                    <div className="flex flex-wrap gap-2 pt-1">
                      {post.frontmatter.tags.map((tag) => (
                        <Tag key={tag}>{tag}</Tag>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-col items-start gap-1 shrink-0 md:items-end md:text-right md:pt-1">
                    <p className="label-caps text-muted">
                      {new Date(post.frontmatter.date).toLocaleDateString(
                        'en-GB',
                        { month: 'short', year: 'numeric' },
                      )}
                    </p>
                    <p className="label-caps text-subtle">
                      {post.frontmatter.readingTime}
                    </p>
                    <span className="label-caps text-accent mt-2 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                      Read →
                    </span>
                  </div>
                </Link>
              </li>
            ))}
          </ol>
        </div>

      </main>
      <Footer />
    </>
  )
}
