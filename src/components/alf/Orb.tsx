'use client'

import { useEffect, useRef, type ReactElement } from 'react'
import { player } from '@/lib/alf/player'

/**
 * Alf's orb. It follows the analyser when one exists; when Web Audio is
 * unavailable it breathes slowly instead, so the orb is never dead while Alf
 * is talking. Under prefers-reduced-motion it holds still.
 */
export function Orb({
  rings = false,
  className,
  reduced,
}: {
  rings?: boolean
  className?: string
  reduced: boolean
}): ReactElement {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    let raf = 0
    let level = 0

    const draw = (t: number) => {
      raf = requestAnimationFrame(draw)
      const rect = canvas.getBoundingClientRect()
      if (!rect.width) return

      const reported = player.level()
      // -1 means no analyser: breathe while speaking, settle when quiet.
      const target =
        reported >= 0
          ? reported
          : player.speaking && !reduced
            ? 0.3 + Math.sin(t * 0.004) * 0.16
            : 0
      level += (target - level) * (reported >= 0 ? 0.35 : 0.08)

      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      const W = Math.max(1, Math.round(rect.width * dpr))
      const H = Math.max(1, Math.round(rect.height * dpr))
      if (canvas.width !== W || canvas.height !== H) {
        canvas.width = W
        canvas.height = H
      }
      const ctx = canvas.getContext('2d')
      if (!ctx) return

      const cx = W / 2
      const cy = H / 2
      const R = Math.min(W, H) * (rings ? 0.3 : 0.42)
      ctx.clearRect(0, 0, W, H)

      if (rings) {
        for (let i = 0; i < 4; i++) {
          ctx.beginPath()
          ctx.arc(cx, cy, R * (1.25 + i * 0.22 + (level * 0.25 * (i + 1)) / 2), 0, Math.PI * 2)
          ctx.strokeStyle = `rgba(201,168,76,${0.16 - i * 0.035 + level * 0.12})`
          ctx.lineWidth = Math.max(1, W * 0.003)
          ctx.stroke()
        }
      }

      const pts = 72
      const amp = R * (0.03 + level * 0.22)
      const sp = reduced ? 0 : t * 0.0012
      ctx.beginPath()
      for (let i = 0; i <= pts; i++) {
        const a = (i / pts) * Math.PI * 2
        const n =
          Math.sin(a * 3 + sp * 2.1) * 0.5 +
          Math.sin(a * 5 - sp * 1.7) * 0.3 +
          Math.sin(a * 7 + sp * 3.3) * 0.2
        const rr = R + n * amp
        const x = cx + Math.cos(a) * rr
        const y = cy + Math.sin(a) * rr
        if (i) ctx.lineTo(x, y)
        else ctx.moveTo(x, y)
      }
      const g = ctx.createRadialGradient(cx - R * 0.35, cy - R * 0.45, R * 0.1, cx, cy, R * 1.25)
      g.addColorStop(0, '#f3dda6')
      g.addColorStop(0.35, '#C9A84C')
      g.addColorStop(0.75, '#3446b8')
      g.addColorStop(1, '#1a2263')
      ctx.fillStyle = g
      ctx.shadowColor = `rgba(201,168,76,${0.35 + level * 0.4})`
      ctx.shadowBlur = R * (0.35 + level * 0.6)
      ctx.fill()
      ctx.shadowBlur = 0

      if (rings) {
        ctx.save()
        ctx.clip()
        ctx.fillStyle = 'rgba(255,255,255,0.10)'
        const step = R * 0.22
        for (let y = cy - R * 1.3; y < cy + R * 1.3; y += step) {
          for (let x = cx - R * 1.3; x < cx + R * 1.3; x += step) {
            ctx.beginPath()
            ctx.arc(x + (Math.round(y / step) % 2 ? step / 2 : 0), y, R * 0.025, 0, Math.PI * 2)
            ctx.fill()
          }
        }
        ctx.restore()
      }
    }

    raf = requestAnimationFrame(draw)
    return () => cancelAnimationFrame(raf)
  }, [rings, reduced])

  return <canvas ref={ref} className={className} aria-hidden="true" />
}
