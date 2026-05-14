'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const links = [
  { href: '/work', label: 'Work' },
  { href: '/services', label: 'Services' },
  { href: '/journal', label: 'Journal' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
]

export function Nav() {
  const pathname = usePathname()

  return (
    <header className="fixed top-0 left-0 right-0 z-[--z-nav] mix-blend-multiply">
      <nav
        className="container-page flex h-14 items-center justify-between"
        aria-label="Main navigation"
      >
        <Link
          href="/"
          className="label-caps text-ink hover:text-accent transition-colors duration-200"
          aria-label="Paulo Juri — home"
        >
          PJ
        </Link>

        <ul className="flex items-center gap-6 md:gap-8" role="list">
          {links.map(({ href, label }) => {
            const active = pathname === href || pathname.startsWith(href + '/')
            return (
              <li key={href}>
                <Link
                  href={href}
                  className={`label-caps transition-colors duration-200 ${
                    active ? 'text-ink' : 'text-muted hover:text-ink'
                  }`}
                  aria-current={active ? 'page' : undefined}
                >
                  {label}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>
    </header>
  )
}
