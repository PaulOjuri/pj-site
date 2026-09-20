import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { MDXRemote } from 'next-mdx-remote/rsc'
import { SiteFooter as Footer } from '@/components/sections/SiteFooter'
import { getJournalPost, getJournalSlugs, getAllJournal } from '@/lib/content'
import { proseComponents } from '@/lib/prose-components'
import { JsonLd, articleSchema } from '@/lib/jsonld'
import { JournalPostNav } from '@/components/sections/JournalPostNav'

type Props = { params: Promise<{ slug: string }> }

/* ─── Tag colour — mirrors JournalMasthead ───────────────── */
const tagAccents: Record<string, string> = {
  product:        '#1D4ED8',
  design:         '#C8553D',
  engineering:    '#059669',
  strategy:       '#7C3AED',
  ai:             '#9333EA',
  writing:        '#B45309',
  tools:          '#0891B2',
  indie:          '#C8553D',
  building:       '#059669',
  privacy:        '#059669',
  career:         '#7C3AED',
  'mental health': '#059669',
}
function tagColor(tag: string): string {
  const t = tag.toLowerCase()
  const key = Object.keys(tagAccents).find((k) => t.includes(k) || k.includes(t))
  return key ? tagAccents[key] : '#6B6457'
}

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

  const all  = getAllJournal()
  const idx  = all.findIndex((p) => p.slug === slug)
  const prev = idx < all.length - 1 ? all[idx + 1] : null
  const next = idx > 0             ? all[idx - 1] : null

  const primary = frontmatter.tags[0] ?? ''
  const color   = tagColor(primary)

  const formattedDate = new Date(frontmatter.date).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'long', year: 'numeric',
  })

  /* Post number within the archive (1-indexed, newest = 1) */
  const postNumber = String(idx + 1).padStart(2, '0')

  return (
    <>
      <JsonLd data={articleSchema({
        title:   frontmatter.title,
        excerpt: frontmatter.excerpt,
        slug,
        date:    frontmatter.date,
        tags:    frontmatter.tags,
      })} />

      <main id="main-content" style={{ background: 'var(--bg)', color: 'var(--text)' }}>

        {/* ══════════════════════════════════════════════════════
            HEADER
            ══════════════════════════════════════════════════════ */}
        <header style={{ background: 'var(--bg-elevated)' }}>

          {/* Category colour accent bar — same as grid card hover */}
          <div style={{ height: 3, background: color }} />

          <div
            className="container-page"
            style={{
              paddingTop: '2.5rem',
              paddingBottom: 0,
            }}
          >
            {/* ── Back link ── */}
            <Link
              href="/journal"
              className="label-caps transition-colors duration-200 hover:text-paper inline-flex items-center gap-2"
              style={{
                color: 'rgba(244,236,224,0.3)',
                fontSize: '0.75rem',
                marginBottom: '2.5rem',
                display: 'inline-flex',
              }}
            >
              ← Journal
            </Link>

            {/* ── Two-column layout — mirrors FeaturedCard ── */}
            <div
              className="grid gap-10 md:gap-20 items-end"
              style={{ gridTemplateColumns: '1fr auto' }}
            >
              {/* Left: content */}
              <div className="flex flex-col gap-5 pb-10">

                {/* Eyebrow row */}
                <div className="flex items-center gap-3 flex-wrap">
                  {frontmatter.tags.map((tag, i) => (
                    <span
                      key={tag}
                      className="label-caps"
                      style={{
                        fontSize: '0.75rem',
                        letterSpacing: '0.12em',
                        padding: '3px 10px',
                        borderRadius: 99,
                        color: i === 0 ? tagColor(tag) : 'rgba(244,236,224,0.4)',
                        background: i === 0
                          ? `${tagColor(tag)}18`
                          : 'rgba(244,236,224,0.06)',
                        border: `1px solid ${i === 0 ? `${tagColor(tag)}30` : 'rgba(244,236,224,0.1)'}`,
                      }}
                    >
                      {tag}
                    </span>
                  ))}
                  <span
                    aria-hidden="true"
                    style={{
                      width: 1,
                      height: 12,
                      background: 'rgba(244,236,224,0.15)',
                      display: 'inline-block',
                    }}
                  />
                  <span
                    className="label-caps"
                    style={{ color: 'rgba(244,236,224,0.3)', fontSize: '0.6rem' }}
                  >
                    {formattedDate}
                  </span>
                  <span
                    aria-hidden="true"
                    style={{
                      width: 1,
                      height: 12,
                      background: 'rgba(244,236,224,0.15)',
                      display: 'inline-block',
                    }}
                  />
                  <span
                    className="label-caps"
                    style={{ color: 'rgba(244,236,224,0.3)', fontSize: '0.6rem' }}
                  >
                    {frontmatter.readingTime}
                  </span>
                </div>

                {/* Title */}
                <h1
                  className="font-sans font-normal"
                  style={{
                    fontSize: 'clamp(2.25rem, 5vw, 4rem)',
                    letterSpacing: '-0.05em',
                    lineHeight: 1.03,
                    color: 'var(--text)',
                  }}
                >
                  {frontmatter.title}
                </h1>

                {/* Excerpt */}
                <p
                  style={{
                    fontSize: 'var(--text-lg)',
                    lineHeight: 1.65,
                    color: 'rgba(244,236,224,0.45)',
                    maxWidth: '52ch',
                  }}
                >
                  {frontmatter.excerpt}
                </p>

                {/* Author row */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    paddingTop: '1.5rem',
                    borderTop: '1px solid rgba(244,236,224,0.08)',
                    marginTop: 4,
                  }}
                >
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: '50%',
                      background: `linear-gradient(135deg, ${color}, ${color}99)`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 11,
                      fontWeight: 700,
                      color: '#fff',
                      flexShrink: 0,
                      fontFamily: 'var(--font-ui)',
                      letterSpacing: '0.05em',
                    }}
                  >
                    PO
                  </div>
                  <div>
                    <p
                      className="label-caps"
                      style={{ color: 'rgba(244,236,224,0.7)', fontSize: '0.65rem' }}
                    >
                      Paul Ojuri
                    </p>
                    <p
                      className="label-caps"
                      style={{ color: 'rgba(244,236,224,0.3)', fontSize: '0.7rem', marginTop: 2 }}
                    >
                      Product engineer &amp; designer
                    </p>
                  </div>
                </div>
              </div>

              {/* Right: ghost number */}
              <div
                className="hidden md:flex flex-col items-end justify-end pb-10 gap-3 shrink-0"
                aria-hidden="true"
              >
                <span
                  className="font-sans select-none"
                  style={{
                    fontSize: 'clamp(6rem, 14vw, 11rem)',
                    lineHeight: 1,
                    letterSpacing: '-0.06em',
                    fontWeight: 400,
                    color: 'rgba(244,236,224,0.04)',
                  }}
                >
                  {postNumber}
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* ══════════════════════════════════════════════════════
            ARTICLE BODY
            ══════════════════════════════════════════════════════ */}
        <article
          style={{
            background: 'var(--bg)',
            padding: 'clamp(3rem, 5vw, 5rem) 0 clamp(4rem, 7vw, 6rem)',
          }}
        >
          <div style={{ maxWidth: 720, margin: '0 auto', padding: '0 1.5rem' }}>
            <MDXRemote source={content} components={proseComponents} />
          </div>
        </article>

        {/* ══════════════════════════════════════════════════════
            PREV / NEXT — grid cards matching the index
            ══════════════════════════════════════════════════════ */}
        <JournalPostNav prev={prev} next={next} />

        {/* ══════════════════════════════════════════════════════
            FOOTER STRIP
            ══════════════════════════════════════════════════════ */}
        <div
          style={{
            borderTop: '1px solid var(--subtle)',
            padding: '1.5rem 0',
          }}
        >
          <div
            style={{
              maxWidth: 720,
              margin: '0 auto',
              padding: '0 1.5rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <Link
              href="/journal"
              className="label-caps text-muted hover:text-ink transition-colors duration-200"
              style={{ fontSize: '0.6rem' }}
            >
              ← All essays
            </Link>
            <Link
              href="/contact"
              className="label-caps transition-colors duration-200 hover:text-ink"
              style={{ fontSize: '0.75rem', color: color }}
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
