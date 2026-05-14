import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { MDXRemote } from 'next-mdx-remote/rsc'
import { Nav } from '@/components/layout/Nav'
import { Footer } from '@/components/layout/Footer'
import { Tag } from '@/components/ui/Tag'
import { Button } from '@/components/ui/Button'
import { getWork, getWorkSlugs } from '@/lib/content'
import { proseComponents } from '@/lib/prose-components'
import { JsonLd, workSchema } from '@/lib/jsonld'

type Props = { params: Promise<{ slug: string }> }

export async function generateStaticParams() {
  return getWorkSlugs().map((slug) => ({ slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const post = getWork(slug)
  if (!post) return {}
  return {
    title: post.frontmatter.title,
    description: post.frontmatter.tagline,
    openGraph: {
      title: post.frontmatter.title,
      description: post.frontmatter.tagline,
    },
  }
}

export default async function CaseStudyPage({ params }: Props) {
  const { slug } = await params
  const post = getWork(slug)
  if (!post) notFound()

  const { frontmatter, content } = post

  return (
    <>
      <JsonLd data={workSchema({ title: frontmatter.title, tagline: frontmatter.tagline, slug, year: frontmatter.year })} />
      <Nav />
      <main id="main-content">

        {/* Hero header */}
        <header className="pt-32 pb-16 border-b border-subtle">
          <div className="container-page">
            <div className="flex flex-wrap items-center gap-3 mb-6">
              <Tag>{frontmatter.category}</Tag>
              <Tag>{frontmatter.year}</Tag>
              <Tag>{frontmatter.status}</Tag>
            </div>

            <h1 className="text-display max-w-4xl mb-4">
              {frontmatter.title}
            </h1>
            <p className="text-xl text-muted max-w-2xl">
              {frontmatter.tagline}
            </p>
          </div>
        </header>

        {/* Meta strip */}
        <div className="border-b border-subtle">
          <div className="container-page py-8">
            <dl className="grid grid-cols-2 gap-8 md:grid-cols-4">
              <div>
                <dt className="label-caps text-subtle mb-1">Role</dt>
                <dd className="text-sm text-ink">{frontmatter.role}</dd>
              </div>
              {frontmatter.client && (
                <div>
                  <dt className="label-caps text-subtle mb-1">Client</dt>
                  <dd className="text-sm text-ink">{frontmatter.client}</dd>
                </div>
              )}
              <div>
                <dt className="label-caps text-subtle mb-1">Year</dt>
                <dd className="text-sm text-ink">{frontmatter.year}</dd>
              </div>
              <div>
                <dt className="label-caps text-subtle mb-1">Stack</dt>
                <dd className="text-sm text-ink leading-relaxed">
                  {frontmatter.stack.join(', ')}
                </dd>
              </div>
            </dl>
          </div>
        </div>

        {/* MDX content */}
        <article className="container-page py-16 md:py-24">
          <div className="max-w-[--prose-max] mx-auto">
            <MDXRemote source={content} components={proseComponents} />
          </div>
        </article>

        {/* Footer CTA */}
        <div className="border-t border-subtle">
          <div className="container-page py-16 flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="label-caps text-muted mb-1">Next</p>
              <p className="text-subheading">Liked what you saw?</p>
            </div>
            <div className="flex flex-wrap gap-4">
              {frontmatter.liveUrl && (
                <Button href={frontmatter.liveUrl} variant="primary" size="md" external>
                  View live site →
                </Button>
              )}
              <Button href="/work" variant="outline" size="md">
                ← All work
              </Button>
              <Button href="/contact" variant="ghost" size="md">
                Start a project
              </Button>
            </div>
          </div>
        </div>

      </main>
      <Footer />
    </>
  )
}
