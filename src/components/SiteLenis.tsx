'use client'
import Lenis from 'lenis'
import { useEffect } from 'react'

export function SiteLenis({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduced) return

    const lenis = new Lenis({ lerp: 0.1, smoothWheel: true })
    let raf: number

    function loop(t: number) {
      lenis.raf(t)
      raf = requestAnimationFrame(loop)
    }

    raf = requestAnimationFrame(loop)

    return () => {
      cancelAnimationFrame(raf)
      lenis.destroy()
    }
  }, [])

  return <>{children}</>
}
