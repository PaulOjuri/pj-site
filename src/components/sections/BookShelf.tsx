interface Book {
  title: string
  author: string
  note?: string
  isbn?: string
  affiliateUrl?: string
}

interface BookShelfCategory {
  id: string
  label: string
  description?: string
  books: Book[]
}

interface BookShelfProps {
  category: BookShelfCategory
  index: number
}

export function BookShelf({ category, index: _index }: BookShelfProps) {
  return (
    <div style={{ borderTop: '1px solid var(--line)', paddingTop: '2rem', paddingBottom: '2rem' }}>
      <h2
        style={{
          fontSize: '1.1rem',
          fontWeight: 400,
          color: 'var(--text)',
          marginBottom: '0.5rem',
        }}
      >
        {category.label}
      </h2>
      {category.description && (
        <p
          style={{
            fontSize: '0.85rem',
            color: 'var(--text-muted)',
            lineHeight: 1.65,
            marginBottom: '1.5rem',
          }}
        >
          {category.description}
        </p>
      )}
      <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', listStyle: 'none' }}>
        {category.books.map((book, i) => (
          <li key={`${book.title}-${i}`} style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            <span style={{ color: 'var(--text)' }}>{book.title}</span>
            {' — '}
            {book.author}
            {book.note && (
              <p style={{ fontSize: '0.8rem', color: 'var(--text-faint)', marginTop: '0.25rem' }}>
                {book.note}
              </p>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}
