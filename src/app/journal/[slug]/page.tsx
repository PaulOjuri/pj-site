import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { MDXRemote } from 'next-mdx-remote/rsc'
import { Nav } from '@/components/layout/Nav'
import { Footer } from '@/components/layout/Footer'
import { Tag } from '@/components/ui/Tag'
import { Divider } from '@/components/ui/Divider'
import { getJournalPost, getJournalSlugs, getAllJournal } from '@/lib/content'
import { proseComponents } from '@/lib/prose-components'

type Props = { params: Promise<{ slug: string }> }

export async function generateStaticParams() {
  return getJournalSlugs().map((slug) => ({ slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const post = getJournalPost(slug)
  if (!post) return {}
  return {
    title: post.frontmatter.title,
    description: post.frontmatter.excerpt,
    openGraph: {
      title: post.frontmatter.title,
      description: post.frontmatter.excerpt,
    },
  }
}

export default async function JournalPostPage({ params }: Props) {
  const { slug } = await params
  const post = getJournalPost(slug)
  if (!post) notFound()

  const { frontmatter, content } = post

  // Adjacent posts for prev/next navigation
  const all = getAllJournal()
  const idx = all.findIndex((p) => p.slug === slug)
  const prev = idx < all.length - 1 ? all[idx + 1] : null
  const next = idx > 0 ? all[idx - 1] : null

  const formattedDate = new Date(frontmatter.date).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  return (
    <>
      <Nav />
      <main>

        {/* Article header */}
        <header className="pt-32 pb-16 border-b border-subtle">
          <div className="container-page max-w-3xl">
            <Link
              href="/journal"
              className="label-caps text-muted hover:text-ink transition-colors mb-8 inline-block"
            >
              ← Journal
            </Link>

            <h1 className="text-heading mt-4 mb-6">
              {frontmatter.title}
            </h1>

            <p className="text-lg text-muted leading-relaxed mb-8 max-w-prose">
              {frontmatter.excerpt}
            </p>

            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-4">
                <time
                  dateTime={frontmatter.date}
                  className="label-caps text-muted"
                >
                  {formattedDate}
                </time>
                <span className="text-subtle" aria-hidden="true">·</span>
                <span className="label-caps text-muted">
                  {frontmatter.readingTime}
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {frontmatter.tags.map((tag) => (
                  <Tag key={tag}>{tag}</Tag>
                ))}
              </div>
            </div>
          </div>
        </header>

        {/* Prose */}
        <article className="container-page py-16 md:py-24">
          <div className="max-w-[--prose-max] mx-auto">
            <MDXRemote source={content} components={proseComponents} />
          </div>
        </article>

        <Divider />

        {/* Prev / Next navigation */}
        <nav
          className="container-page py-12"
          aria-label="Post navigation"
        >
          <div className="grid gap-8 md:grid-cols-2">
            {prev ? (
              <Link
                href={`/journal/${prev.slug}`}
                className="group flex flex-col gap-2 p-6 border border-subtle hover:border-ink transition-colors duration-200"
              >
                <span className="label-caps text-muted">← Previous</span>
                <span className="text-lg font-sans transition-colors duration-200 group-hover:text-accent">
                  {prev.frontmatter.title}
                </span>
                <span className="label-caps text-subtle">
                  {prev.frontmatter.readingTime}
                </span>
              </Link>
            ) : (
              <div />
            )}

            {next ? (
              <Link
                href={`/journal/${next.slug}`}
                className="group flex flex-col gap-2 p-6 border border-subtle hover:border-ink transition-colors duration-200 md:text-right"
              >
                <span className="label-caps text-muted">Next →</span>
                <span className="text-lg font-sans transition-colors duration-200 group-hover:text-accent">
                  {next.frontmatter.title}
                </span>
                <span className="label-caps text-subtle">
                  {next.frontmatter.readingTime}
                </span>
              </Link>
            ) : (
              <div />
            )}
          </div>
        </nav>

        {/* Back to journal */}
        <div className="border-t border-subtle">
          <div className="container-page py-10 flex items-center justify-between">
            <Link
              href="/journal"
              className="label-caps text-muted hover:text-ink transition-colors"
            >
              ← All posts
            </Link>
            <Link
              href="/contact"
              className="label-caps text-muted hover:text-ink transition-colors"
            >
              Work with me →
            </Link>
          </div>
        </div>

      </main>
      <Footer />
    </>
  )
}
