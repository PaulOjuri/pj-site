'use client'

import { Button } from '@/components/ui/Button'
import { useScrollReveal } from '@/hooks/useScrollReveal'

export function AboutTeaser() {
  const ref = useScrollReveal<HTMLElement>({ y: 30 })

  return (
    <section
      ref={ref}
      className="bg-ink text-paper"
      aria-labelledby="about-teaser-heading"
    >
      <div className="container-page py-24 md:py-32">
        <div className="grid gap-12 md:grid-cols-2 md:gap-24">
          <div>
            <h2 id="about-teaser-heading" className="text-heading text-paper">
              Engineer by training,&nbsp;
              <em>designer by conviction.</em>
            </h2>
          </div>

          <div className="flex flex-col justify-end gap-8">
            <p className="text-lg leading-relaxed text-paper/70">
              I build products end-to-end — from the first sketch to production
              code. My work sits at the edge where systems thinking meets
              aesthetic precision.
            </p>
            <p className="text-lg leading-relaxed text-paper/70">
              Six years of shipping across fintech, healthtech, and consumer
              apps. I care about the 1% of details that make 100% of the
              difference.
            </p>
            <Button
              href="/about"
              variant="outline"
              size="md"
              className="self-start border-paper/30 text-paper hover:bg-paper hover:text-ink"
            >
              More about me →
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
