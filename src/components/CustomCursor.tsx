'use client'
import { useEffect, useRef, useState } from 'react'

export function CustomCursor() {
  const [mounted, setMounted] = useState(false)
  const dotRef = useRef<HTMLDivElement>(null)
  const ringRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Don't render on touch devices
    if (window.matchMedia('(hover: none)').matches) return
    // Respect prefers-reduced-motion
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    setMounted(true)

    const dot = dotRef.current
    const ring = ringRef.current
    if (!dot || !ring) return

    let mouseX = -100
    let mouseY = -100
    let ringX = -100
    let ringY = -100
    let rafId: number

    const lerp = (a: number, b: number, t: number) => a + (b - a) * t

    const onMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX
      mouseY = e.clientY
      dot.style.transform = `translate(calc(${mouseX}px - 50%), calc(${mouseY}px - 50%))`
    }

    const loop = () => {
      ringX = lerp(ringX, mouseX, 0.1)
      ringY = lerp(ringY, mouseY, 0.1)
      ring.style.transform = `translate(calc(${ringX}px - 50%), calc(${ringY}px - 50%))`
      rafId = requestAnimationFrame(loop)
    }

    const onEnterInteractive = () => {
      ring.style.width = `${36 * 2.2}px`
      ring.style.height = `${36 * 2.2}px`
      ring.style.background = 'color-mix(in srgb, var(--accent) 15%, transparent)'
      ring.style.borderColor = 'var(--accent)'
      ring.style.opacity = '1'
    }

    const onLeaveInteractive = () => {
      ring.style.width = '36px'
      ring.style.height = '36px'
      ring.style.background = 'transparent'
      ring.style.borderColor = 'var(--accent)'
      ring.style.opacity = '0.5'
    }

    const onEnterImage = () => {
      ring.style.width = `${36 * 1.8}px`
      ring.style.height = `${36 * 1.8}px`
      ring.style.opacity = '0.85'
    }

    const onLeaveImage = () => {
      ring.style.width = '36px'
      ring.style.height = '36px'
      ring.style.opacity = '0.5'
    }

    const interactiveSelector = 'a, button, [role="button"]'

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as Element
      if (target.closest(interactiveSelector)) {
        onEnterInteractive()
      } else if (target.closest('img')) {
        onEnterImage()
      }
    }

    const handleMouseOut = (e: MouseEvent) => {
      const target = e.target as Element
      if (target.closest(interactiveSelector)) {
        onLeaveInteractive()
      } else if (target.closest('img')) {
        onLeaveImage()
      }
    }

    window.addEventListener('mousemove', onMouseMove)
    document.addEventListener('mouseover', handleMouseOver)
    document.addEventListener('mouseout', handleMouseOut)
    rafId = requestAnimationFrame(loop)

    return () => {
      window.removeEventListener('mousemove', onMouseMove)
      document.removeEventListener('mouseover', handleMouseOver)
      document.removeEventListener('mouseout', handleMouseOut)
      cancelAnimationFrame(rafId)
    }
  }, [])

  if (!mounted) return null

  return (
    <>
      {/* Dot — snaps immediately */}
      <div
        ref={dotRef}
        aria-hidden="true"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '5px',
          height: '5px',
          borderRadius: '50%',
          background: 'var(--accent)',
          pointerEvents: 'none',
          zIndex: 9998,
          willChange: 'transform',
        }}
      />
      {/* Ring — lags behind via lerp */}
      <div
        ref={ringRef}
        aria-hidden="true"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '36px',
          height: '36px',
          borderRadius: '50%',
          border: '1px solid var(--accent)',
          background: 'transparent',
          pointerEvents: 'none',
          zIndex: 9997,
          opacity: 0.5,
          willChange: 'transform',
          transition:
            'width 300ms, height 300ms, opacity 300ms, border-color 300ms, background 300ms',
        }}
      />
    </>
  )
}
