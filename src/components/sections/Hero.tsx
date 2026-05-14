'use client'

import dynamic from 'next/dynamic'
import { useRef, useEffect } from 'react'
import { gsap } from '@/lib/gsap'
import { Button } from '@/components/ui/Button'

const HeroGL = dynamic(
  () => import('@/components/three/HeroGL').then((m) => ({ default: m.HeroGL })),
  { ssr: false },
)

export function Hero() {
  const headingRef = useRef<HTMLHeadingElement>(null)
  const subRef     = useRef<HTMLParagraphElement>(null)
  const ctaRef     = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        defaults: { ease: 'expo.out', duration: 1.2 },
        delay: 0.2,
      })

      tl.fromTo(headingRef.current, { opacity: 0, y: 40 }, { opacity: 1, y: 0 })
        .fromTo(subRef.current,     { opacity: 0, y: 24 }, { opacity: 1, y: 0 }, '-=0.8')
        .fromTo(ctaRef.current,     { opacity: 0, y: 16 }, { opacity: 1, y: 0 }, '-=0.7')
    })

    return () => ctx.revert()
  }, [])

  return (
    <section
      className="relative flex min-h-dvh flex-col justify-end pb-16 pt-32"
      aria-labelledby="hero-heading"
    >
      {/* WebGL background — lazy-loaded, SSR-safe */}
      <HeroGL />

      {/* Gradient overlay so text stays legible over the shader */}
      <div
        className="pointer-events-none absolute inset-0 z-[1]"
        style={{
          background:
            'linear-gradient(to top, rgba(245,244,239,0.96) 0%, rgba(245,244,239,0.3) 50%, rgba(245,244,239,0.05) 100%)',
        }}
        aria-hidden="true"
      />

      <div className="container-page relative z-10">
        <h1
          ref={headingRef}
          id="hero-heading"
          className="text-display max-w-5xl"
          style={{ opacity: 0 }}
        >
          Building at the&nbsp;
          <em>intersection</em>
          <br className="hidden md:block" /> of code, craft,
          <br className="hidden md:block" /> and&nbsp;culture.
        </h1>

        <p
          ref={subRef}
          className="mt-8 max-w-lg text-lg text-muted md:text-xl"
          style={{ opacity: 0 }}
        >
          Product engineer and designer. I turn ambiguous ideas into software
          people actually want to use.
        </p>

        <div
          ref={ctaRef}
          className="mt-10 flex flex-wrap items-center gap-4"
          style={{ opacity: 0 }}
        >
          <Button href="/work" variant="primary" size="lg">
            View work
          </Button>
          <Button href="/contact" variant="ghost" size="lg">
            Get in touch →
          </Button>
        </div>
      </div>
    </section>
  )
}
