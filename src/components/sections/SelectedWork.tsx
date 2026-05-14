import Link from 'next/link'
import { Divider } from '@/components/ui/Divider'

type WorkItem = {
  slug: string
  title: string
  category: string
  year: string
  description: string
}

// Placeholder data — replace with MDX frontmatter reads in Phase 3
const works: WorkItem[] = [
  {
    slug: 'prism',
    title: 'Prism',
    category: 'Product · Browser Extension',
    year: '2025',
    description:
      'Privacy-first browsing analytics that gives users ownership of their own data.',
  },
  {
    slug: 'alfera',
    title: 'Alfera Technik',
    category: 'Web · Brand',
    year: '2025',
    description:
      "Nigeria's first laptop brand. Built the digital presence from scratch — editorial site, product pages, e-commerce.",
  },
  {
    slug: 'carbonwise',
    title: 'CarbonWise',
    category: 'Product · SaaS',
    year: '2024',
    description:
      'Carbon footprint tracking and offset marketplace for SMEs across Europe.',
  },
]

export function SelectedWork() {
  return (
    <section className="container-page py-24" aria-labelledby="work-heading">
      <div className="flex items-end justify-between">
        <h2 id="work-heading" className="text-heading">
          Selected work
        </h2>
        <Link
          href="/work"
          className="label-caps text-muted underline underline-offset-4 hover:text-ink transition-colors"
        >
          All projects →
        </Link>
      </div>

      <Divider className="mt-8" />

      <ol className="divide-y divide-subtle" aria-label="Selected projects">
        {works.map((work, i) => (
          <li key={work.slug}>
            <Link
              href={`/work/${work.slug}`}
              className="group flex flex-col gap-4 py-10 md:flex-row md:items-start md:gap-16 md:py-12"
            >
              <div className="label-caps shrink-0 text-muted md:w-8">
                {String(i + 1).padStart(2, '0')}
              </div>

              <div className="flex flex-1 flex-col gap-2 md:flex-row md:items-start md:justify-between md:gap-12">
                <div className="flex-1">
                  <h3 className="text-subheading transition-colors duration-200 group-hover:text-accent">
                    {work.title}
                  </h3>
                  <p className="mt-3 max-w-prose text-muted">{work.description}</p>
                </div>

                <div className="shrink-0 text-right">
                  <p className="label-caps text-muted">{work.category}</p>
                  <p className="label-caps mt-1 text-subtle">{work.year}</p>
                </div>
              </div>
            </Link>
          </li>
        ))}
      </ol>
    </section>
  )
}
