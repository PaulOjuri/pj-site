'use client'

import Lenis from 'lenis'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { createContext, useContext, useEffect, useRef } from 'react'

gsap.registerPlugin(ScrollTrigger)

type MotionCtx = { lenis: Lenis | null }
const MotionContext = createContext<MotionCtx>({ lenis: null })
export const useLuxcitiLenis = () => useContext(MotionContext)

export function LuxcitiMotionProvider({ children }: { children: React.ReactNode }) {
  const lenisRef = useRef<Lenis | null>(null)

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduced) return

    const lenis = new Lenis({ lerp: 0.08, smoothWheel: true })
    lenisRef.current = lenis

    lenis.on('scroll', ScrollTrigger.update)

    let rafId: number
    function raf(time: number) {
      lenis.raf(time)
      rafId = requestAnimationFrame(raf)
    }
    rafId = requestAnimationFrame(raf)

    gsap.ticker.lagSmoothing(0)

    return () => {
      cancelAnimationFrame(rafId)
      lenis.destroy()
      lenisRef.current = null
    }
  }, [])

  return (
    <MotionContext.Provider value={{ lenis: lenisRef.current }}>
      {children}
    </MotionContext.Provider>
  )
}
