/**
 * Motion configuration shared across components.
 * Import these instead of hardcoding values in components.
 */

import type { MotionSignature, ProjectMotion } from '@/lib/theme/types'
import { easings, durations, springs } from './variants'

/* ─── Per-signature motion profiles ───────────────────────────── */

/**
 * Returns a ProjectMotion config for a given signature.
 * Used as the default when no per-project override is provided.
 */
export function getMotionProfile(signature: MotionSignature): ProjectMotion {
  switch (signature) {
    case 'spring':
      return {
        signature: 'spring',
        easeOut: 'cubic-bezier(0.16, 1, 0.3, 1)',
        easeIn:  'cubic-bezier(0.7, 0, 0.84, 0)',
        duration: { fast: 160, base: 360, slow: 700 },
      }
    case 'inertia':
      return {
        signature: 'inertia',
        easeOut: 'cubic-bezier(0.05, 0.7, 0.1, 1.0)',
        easeIn:  'cubic-bezier(0.7, 0, 0.84, 0)',
        duration: { fast: 200, base: 400, slow: 800 },
      }
    case 'mechanical':
      return {
        signature: 'mechanical',
        easeOut: 'cubic-bezier(0.0, 0.0, 0.2, 1)',
        easeIn:  'cubic-bezier(0.4, 0.0, 1.0, 1)',
        duration: { fast: 80, base: 200, slow: 400 },
      }
    case 'organic':
      return {
        signature: 'organic',
        easeOut: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
        easeIn:  'cubic-bezier(0.7, 0, 0.84, 0)',
        duration: { fast: 240, base: 480, slow: 880 },
      }
  }
}

/* ─── Re-exports for convenience ──────────────────────────────── */

export { easings, durations, springs }

/* ─── Viewport detection (SSR-safe) ───────────────────────────── */

/**
 * Returns true if the device is likely low-powered.
 * Used to decide between hi-fi WebGL and lo-fi CSS fallback.
 * Safe to call only in browser context (useEffect / event handlers).
 */
export function isLowPowerDevice(): boolean {
  if (typeof navigator === 'undefined') return false
  const cores = (navigator as Navigator & { hardwareConcurrency?: number })
    .hardwareConcurrency ?? 4
  const memory = (navigator as Navigator & { deviceMemory?: number })
    .deviceMemory ?? 4
  return cores < 4 || memory < 4
}

/**
 * Returns true if the user prefers reduced motion.
 * Safe to call in browser context only.
 */
export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}
