'use client'

import Link from 'next/link'
import { Divider } from '@/components/ui/Divider'
import { useScrollReveal } from '@/hooks/useScrollReveal'

type Post = {
  slug: string
  title: string
  date: string
  readingTime: string
}

const posts: Post[] = [
  {
    slug: 'why-privacy-is-a-design-problem',
    title: 'Why privacy is a design problem',
    date: 'Apr 2025',
    readingTime: '7 min',
  },
  {
    slug: 'building-in-public',
    title: 'On building in public without burning out',
    date: 'Mar 2025',
    readingTime: '5 min',
  },
  {
    slug: 'the-product-engineer',
    title: 'The product engineer is not a myth',
    date: 'Feb 2025',
    readingTime: '6 min',
  },
]

export function JournalTeaser() {
  const ref = useScrollReveal<HTMLElement>({ y: 24 })

  return (
    <section
      ref={ref}
      className="container-page py-24"
      aria-labelledby="journal-heading"
    >
      <div className="flex items-end justify-between">
        <h2 id="journal-heading" className="text-heading">
          Journal
        </h2>
        <Link
          href="/journal"
          className="label-caps text-muted underline underline-offset-4 hover:text-ink transition-colors"
        >
          All posts →
        </Link>
      </div>

      <Divider className="mt-8" />

      <ul className="divide-y divide-subtle" aria-label="Recent posts">
        {posts.map((post) => (
          <li key={post.slug}>
            <Link
              href={`/journal/${post.slug}`}
              className="group flex flex-col gap-2 py-8 md:flex-row md:items-center md:justify-between md:gap-12"
            >
              <h3 className="text-xl font-sans transition-colors duration-200 group-hover:text-accent">
                {post.title}
              </h3>
              <div className="label-caps shrink-0 text-muted">
                <span>{post.date}</span>
                <span className="mx-3 text-subtle">·</span>
                <span>{post.readingTime}</span>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}
