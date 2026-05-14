import Link from 'next/link'

const socials = [
  { label: 'Twitter', href: 'https://twitter.com/paulojuri' },
  { label: 'GitHub', href: 'https://github.com/paulojuri' },
  { label: 'LinkedIn', href: 'https://linkedin.com/in/paulojuri' },
]

export function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="border-t border-subtle">
      <div className="container-page flex flex-col gap-6 py-12 md:flex-row md:items-center md:justify-between">
        <p className="label-caps text-muted">
          © {year} Paulo Juri. All rights reserved.
        </p>

        <nav aria-label="Footer navigation">
          <ul className="flex items-center gap-6" role="list">
            {socials.map(({ label, href }) => (
              <li key={label}>
                <a
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="label-caps text-muted transition-colors duration-200 hover:text-ink"
                >
                  {label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </footer>
  )
}
