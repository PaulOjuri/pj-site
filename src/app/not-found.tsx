import type { Metadata } from 'next'
import Link from 'next/link'
import { Nav } from '@/components/layout/Nav'
import { Footer } from '@/components/layout/Footer'
import { Button } from '@/components/ui/Button'

export const metadata: Metadata = {
  title: '404 — Page not found',
}

export default function NotFound() {
  return (
    <>
      <Nav />
      <main className="flex min-h-dvh flex-col items-center justify-center px-6 text-center">
        <p className="label-caps text-muted mb-4">404</p>
        <h1 className="text-heading max-w-xl mb-6">
          This page doesn&apos;t exist.{' '}
          <em>Yet.</em>
        </h1>
        <p className="text-lg text-muted max-w-sm mb-10">
          You might have followed a broken link, or the page has moved. Either
          way, nothing to see here.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Button href="/" variant="primary" size="md">
            Go home
          </Button>
          <Button href="/work" variant="outline" size="md">
            See my work
          </Button>
        </div>

        {/* Large ghost number */}
        <p
          className="absolute inset-0 flex items-center justify-center text-[20rem] font-sans font-bold text-subtle/20 select-none pointer-events-none -z-10 leading-none"
          aria-hidden="true"
        >
          404
        </p>
      </main>
      <Footer />
    </>
  )
}
