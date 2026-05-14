'use client'

import { useEffect, useRef } from 'react'
import { gsap, ScrollTrigger } from '@/lib/gsap'

type Options = {
  y?: number
  duration?: number
  stagger?: number
  start?: string
}

/**
 * Attach a scroll-triggered fade-up reveal to `ref`.
 * If `ref` contains multiple children, they stagger in sequence.
 *
 * Usage:
 *   const ref = useScrollReveal<HTMLElement>()
 *   <section ref={ref}>…</section>
 */
export function useScrollReveal<T extends HTMLElement>(opts: Options = {}) {
  const {
    y        = 32,
    duration = 0.9,
    stagger  = 0.12,
    start    = 'top 85%',
  } = opts

  const ref = useRef<T>(null)

  useEffect(() => {
    if (!ref.current) return

    const el = ref.current
    const targets = el.querySelectorAll('[data-reveal]')
    const animTarget = targets.length > 0 ? Array.from(targets) : el

    const ctx = gsap.context(() => {
      gsap.fromTo(
        animTarget,
        { opacity: 0, y },
        {
          opacity: 1,
          y: 0,
          duration,
          stagger,
          ease: 'expo.out',
          scrollTrigger: {
            trigger: el,
            start,
            once: true,
          },
        },
      )
    })

    return () => ctx.revert()
  }, [y, duration, stagger, start])

  return ref
}
