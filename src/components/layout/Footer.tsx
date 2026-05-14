import Link from 'next/link'

const socials = [
  { label: 'Twitter', href: 'https://twitter.com/paulojuri', external: true },
  { label: 'GitHub', href: 'https://github.com/paulojuri', external: true },
  { label: 'LinkedIn', href: 'https://linkedin.com/in/paulojuri', external: true },
]

const pages = [
  { label: 'Work', href: '/work' },
  { label: 'Journal', href: '/journal' },
  { label: 'Library', href: '/library' },
  { label: 'Contact', href: '/contact' },
]

export function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="border-t border-subtle">
      <div className="container-page py-12">
        <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">

          {/* Brand */}
          <div className="flex flex-col gap-2">
            <p className="label-caps text-ink">Paulo Juri</p>
            <p className="label-caps text-muted">
              Product engineer & designer
            </p>
          </div>

          {/* Page links */}
          <nav aria-label="Footer site links">
            <ul className="flex flex-wrap gap-x-6 gap-y-2" role="list">
              {pages.map(({ label, href }) => (
                <li key={label}>
                  <Link
                    href={href}
                    className="label-caps text-muted transition-colors duration-200 hover:text-ink"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Social links */}
          <nav aria-label="Social links">
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

        <div className="mt-10 pt-6 border-t border-subtle">
          <p className="label-caps text-subtle">
            © {year} Paulo Juri. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
