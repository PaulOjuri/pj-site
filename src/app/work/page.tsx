import type { Metadata } from 'next'
import Link from 'next/link'
import { Nav } from '@/components/layout/Nav'
import { Footer } from '@/components/layout/Footer'
import { Tag } from '@/components/ui/Tag'
import { Divider } from '@/components/ui/Divider'
import { getAllWork } from '@/lib/content'

export const metadata: Metadata = {
  title: 'Work',
  description:
    'Selected projects — browser extensions, SaaS products, editorial websites, and more.',
}

export default function WorkPage() {
  const works = getAllWork()
  const featured = works.filter((w) => w.frontmatter.featured)
  const rest = works.filter((w) => !w.frontmatter.featured)

  return (
    <>
      <Nav />
      <main id="main-content" className="pt-32 pb-24">
        <div className="container-page">

          {/* Page header */}
          <header className="mb-16 max-w-2xl">
            <p className="label-caps text-muted mb-4">Selected work</p>
            <h1 className="text-heading">
              Things I&apos;ve built,{' '}
              <em>shipped, and learned from.</em>
            </h1>
          </header>

          <Divider />

          {/* Featured projects */}
          <ol
            className="divide-y divide-subtle"
            aria-label="Featured projects"
          >
            {featured.map((work, i) => (
              <li key={work.slug}>
                <Link
                  href={`/work/${work.slug}`}
                  className="group grid grid-cols-1 gap-6 py-12 md:grid-cols-[3rem_1fr_auto] md:gap-10 md:py-14"
                >
                  {/* Index */}
                  <span className="label-caps text-muted self-start pt-1 hidden md:block">
                    {String(i + 1).padStart(2, '0')}
                  </span>

                  {/* Body */}
                  <div className="flex flex-col gap-3">
                    <div className="flex flex-wrap items-center gap-3">
                      <h2 className="text-subheading transition-colors duration-200 group-hover:text-accent">
                        {work.frontmatter.title}
                      </h2>
                      <Tag>{work.frontmatter.status}</Tag>
                    </div>
                    <p className="max-w-prose text-muted">
                      {work.frontmatter.tagline}
                    </p>
                    <div className="flex flex-wrap gap-2 pt-1">
                      {work.frontmatter.stack.slice(0, 5).map((s) => (
                        <Tag key={s}>{s}</Tag>
                      ))}
                      {work.frontmatter.stack.length > 5 && (
                        <Tag>+{work.frontmatter.stack.length - 5} more</Tag>
                      )}
                    </div>
                  </div>

                  {/* Meta */}
                  <div className="flex flex-col items-start gap-1 md:items-end md:text-right self-start">
                    <p className="label-caps text-muted">
                      {work.frontmatter.category}
                    </p>
                    <p className="label-caps text-subtle">
                      {work.frontmatter.year}
                    </p>
                    <span className="label-caps text-accent mt-2 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                      Read case study →
                    </span>
                  </div>
                </Link>
              </li>
            ))}
          </ol>

          {/* Other projects */}
          {rest.length > 0 && (
            <>
              <div className="mt-16 mb-8">
                <p className="label-caps text-muted">Other projects</p>
              </div>
              <Divider />
              <ol className="divide-y divide-subtle" aria-label="Other projects">
                {rest.map((work) => (
                  <li key={work.slug}>
                    <Link
                      href={`/work/${work.slug}`}
                      className="group flex flex-col gap-3 py-8 md:flex-row md:items-center md:justify-between md:gap-12"
                    >
                      <div className="flex flex-col gap-1">
                        <h2 className="text-xl font-sans transition-colors duration-200 group-hover:text-accent">
                          {work.frontmatter.title}
                        </h2>
                        <p className="text-muted">{work.frontmatter.tagline}</p>
                      </div>
                      <div className="label-caps shrink-0 text-muted md:text-right">
                        <span>{work.frontmatter.category}</span>
                        <span className="mx-2 text-subtle">·</span>
                        <span>{work.frontmatter.year}</span>
                      </div>
                    </Link>
                  </li>
                ))}
              </ol>
            </>
          )}

        </div>
      </main>
      <Footer />
    </>
  )
}
