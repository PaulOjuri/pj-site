import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { MDXRemote } from 'next-mdx-remote/rsc'
import Link from 'next/link'
import { SiteFooter as Footer } from '@/components/sections/SiteFooter'
import { getWork, getAllWork, getWorkSlugs } from '@/lib/content'
import { proseComponents } from '@/lib/prose-components'
import { JsonLd, workSchema } from '@/lib/jsonld'
import { WorkHero } from '@/components/sections/WorkHero'
import { WorkProgressBar } from '@/components/sections/WorkProgressBar'
import { WorkCTALinks } from '@/components/sections/WorkCTALinks'

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
  const accent = frontmatter.accentColor ?? '#C8553D'

  // Prev / next work items
  const allWork = getAllWork()
  const idx  = allWork.findIndex((w) => w.slug === slug)
  const prev = idx > 0 ? allWork[idx - 1] : null
  const next = idx < allWork.length - 1 ? allWork[idx + 1] : null

  return (
    <>
      <JsonLd data={workSchema({ title: frontmatter.title, tagline: frontmatter.tagline, slug, year: frontmatter.year })} />

      {/* Reading progress + sticky mini-header */}
      <WorkProgressBar
        accentColor={accent}
        title={frontmatter.title}
      />

      <main id="main-content" data-project={slug}>

        {/* Immersive hero with accent color */}
        <WorkHero frontmatter={frontmatter} slug={slug} />

        {/* MDX article body */}
        <article
          className="container-page"
          style={{ paddingTop: '5rem', paddingBottom: '5rem' }}
        >
          {/* Accent divider */}
          <div
            aria-hidden="true"
            style={{
              width: 48,
              height: 3,
              background: accent,
              borderRadius: 9999,
              marginBottom: '3.5rem',
            }}
          />
          <div style={{ maxWidth: '68ch' }}>
            <MDXRemote source={content} components={proseComponents} />
          </div>
        </article>

        {/* "See it live" CTA section — accent-tinted, with large buttons */}
        <WorkCTALinks
          accentColor={accent}
          productPageUrl={frontmatter.productPageUrl}
        />

        {/* Prev / Next navigation */}
        {(prev || next) && (
          <div style={{ borderTop: '1px solid var(--subtle)' }}>
            <div
              className="grid md:grid-cols-2"
              style={{ gap: 1, background: 'var(--subtle)' }}
            >
              {prev ? (
                <Link
                  href={`/work/${prev.slug}`}
                  className="group flex flex-col gap-3 hover:bg-cream transition-colors duration-200"
                  style={{
                    padding: 'clamp(2rem, 5vw, 3.5rem)',
                    background: 'var(--paper)',
                    textDecoration: 'none',
                    borderTop: `3px solid ${prev.frontmatter.accentColor ?? 'var(--accent)'}`,
                  }}
                >
                  <span
                    className="label-caps"
                    style={{
                      fontSize: '0.55rem',
                      color: prev.frontmatter.accentColor ?? 'var(--accent)',
                    }}
                  >
                    ← Previous
                  </span>
                  <span
                    className="font-sans font-normal"
                    style={{
                      fontSize: 'clamp(1.2rem, 2.5vw, 1.8rem)',
                      letterSpacing: '-0.03em',
                      lineHeight: 1.15,
                      color: 'var(--ink)',
                    }}
                  >
                    {prev.frontmatter.title}
                  </span>
                  <span className="label-caps" style={{ fontSize: '0.55rem', color: 'var(--muted)' }}>
                    {prev.frontmatter.category}
                  </span>
                </Link>
              ) : (
                <div style={{ background: 'var(--paper)' }} />
              )}

              {next ? (
                <Link
                  href={`/work/${next.slug}`}
                  className="group flex flex-col items-end gap-3 hover:bg-cream transition-colors duration-200"
                  style={{
                    padding: 'clamp(2rem, 5vw, 3.5rem)',
                    background: 'var(--paper)',
                    textDecoration: 'none',
                    borderTop: `3px solid ${next.frontmatter.accentColor ?? 'var(--accent)'}`,
                  }}
                >
                  <span
                    className="label-caps"
                    style={{
                      fontSize: '0.55rem',
                      color: next.frontmatter.accentColor ?? 'var(--accent)',
                    }}
                  >
                    Next →
                  </span>
                  <span
                    className="font-sans font-normal"
                    style={{
                      fontSize: 'clamp(1.2rem, 2.5vw, 1.8rem)',
                      letterSpacing: '-0.03em',
                      lineHeight: 1.15,
                      color: 'var(--ink)',
                      textAlign: 'right',
                    }}
                  >
                    {next.frontmatter.title}
                  </span>
                  <span className="label-caps" style={{ fontSize: '0.55rem', color: 'var(--muted)' }}>
                    {next.frontmatter.category}
                  </span>
                </Link>
              ) : (
                <div style={{ background: 'var(--paper)' }} />
              )}
            </div>

            {/* Back link */}
            <div
              style={{
                background: 'var(--paper)',
                borderTop: '1px solid var(--subtle)',
                display: 'flex',
                justifyContent: 'center',
                padding: '1.75rem',
              }}
            >
              <Link
                href="/work"
                className="label-caps transition-colors duration-200 hover:text-ink"
                style={{ fontSize: '0.75rem', color: 'var(--muted)' }}
              >
                ← View all work
              </Link>
            </div>
          </div>
        )}

      </main>
      <Footer />
    </>
  )
}
