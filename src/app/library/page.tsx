import type { Metadata } from 'next'
import { Nav } from '@/components/layout/Nav'
import { Footer } from '@/components/layout/Footer'
import { Divider } from '@/components/ui/Divider'
import { library } from '@/lib/library'

export const metadata: Metadata = {
  title: 'Library',
  description:
    "Books I've read, am reading, or keep on the shelf because they earned the space.",
}

export default function LibraryPage() {
  const totalBooks = library.reduce((n, c) => n + c.books.length, 0)

  return (
    <>
      <Nav />
      <main id="main-content">

        {/* Header */}
        <section className="pt-32 pb-16 border-b border-subtle">
          <div className="container-page grid gap-12 md:grid-cols-2 md:gap-24">
            <div>
              <p className="label-caps text-muted mb-4">Library</p>
              <h1 className="text-heading">
                {totalBooks} books,{' '}
                <em>{library.length} shelves.</em>
              </h1>
            </div>
            <div className="flex flex-col justify-end gap-4">
              <p className="text-lg leading-relaxed text-muted">
                Books I've read, am reading, or keep around because they changed
                how I think about something. No ratings — if it's here, it was
                worth the time.
              </p>
              {/* Category jump links */}
              <nav aria-label="Jump to category">
                <ul className="flex flex-wrap gap-x-6 gap-y-2">
                  {library.map((cat) => (
                    <li key={cat.id}>
                      <a
                        href={`#${cat.id}`}
                        className="label-caps text-muted hover:text-ink transition-colors underline underline-offset-4 decoration-subtle hover:decoration-ink"
                      >
                        {cat.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </nav>
            </div>
          </div>
        </section>

        {/* Categories */}
        <div className="container-page py-16 md:py-24 space-y-24">
          {library.map((category, catIdx) => (
            <section
              key={category.id}
              id={category.id}
              aria-labelledby={`cat-${category.id}`}
              className="scroll-mt-24"
            >
              {/* Category header */}
              <div className="grid gap-4 md:grid-cols-[1fr_2fr] md:gap-16 mb-10">
                <div>
                  <p className="label-caps text-subtle mb-1">
                    {String(catIdx + 1).padStart(2, '0')}
                  </p>
                  <h2
                    id={`cat-${category.id}`}
                    className="text-subheading"
                  >
                    {category.label}
                  </h2>
                  <p className="label-caps text-subtle mt-2">
                    {category.books.length}{' '}
                    {category.books.length === 1 ? 'book' : 'books'}
                  </p>
                </div>
                <p className="text-muted leading-relaxed md:pt-7">
                  {category.description}
                </p>
              </div>

              <Divider />

              {/* Book list */}
              <ol className="divide-y divide-subtle">
                {category.books.map((book) => (
                  <li
                    key={`${book.title}-${book.author}`}
                    className="grid grid-cols-1 gap-3 py-8 md:grid-cols-[1fr_auto] md:gap-16 md:items-start"
                  >
                    <div className="flex flex-col gap-1.5">
                      <h3 className="text-lg font-sans font-medium text-ink">
                        {book.title}
                      </h3>
                      <p className="label-caps text-accent">{book.author}</p>
                      {book.note && (
                        <p className="mt-2 text-muted leading-relaxed max-w-prose">
                          {book.note}
                        </p>
                      )}
                    </div>
                  </li>
                ))}
              </ol>
            </section>
          ))}
        </div>

        <Divider />

        {/* Footer note */}
        <div className="container-page py-12">
          <p className="label-caps text-subtle max-w-prose">
            This list is pulled from my shelves — two photos, taken May 2025.
            I add to it as I finish things.
          </p>
        </div>

      </main>
      <Footer />
    </>
  )
}
