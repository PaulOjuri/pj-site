/**
 * Canonical motion vocabulary for paulojuri.com.
 * Source of truth: design-system/MASTER.md §10 and design-system/MOTION.md
 *
 * Usage:
 *   import { easings, durations, springs, fadeUp } from '@/lib/motion/variants'
 *   <motion.div variants={fadeUp} initial="hidden" animate="visible" />
 */

import type { Variants, Transition } from 'motion/react'

/* ─── Easing ───────────────────────────────────────────────────── */

export const easings = {
  /** Elements entering the frame */
  out: [0.16, 1, 0.3, 1] as [number, number, number, number],
  /** Elements transitioning state */
  inOut: [0.87, 0, 0.13, 1] as [number, number, number, number],
} as const

/* ─── Duration scale (ms → seconds for Motion) ────────────────── */

export const durations = {
  micro:  0.08,   /* 80ms  — hover color, opacity swap */
  short:  0.16,   /* 160ms — button press, badge pop */
  base:   0.24,   /* 240ms — card expand, panel slide */
  long:   0.36,   /* 360ms — section reveal */
  slow:   0.56,   /* 560ms — page entry, hero */
  slower: 0.88,   /* 880ms — shared-element morph */
} as const

/* ─── Spring presets ───────────────────────────────────────────── */

export const springs = {
  gentle: {
    type: 'spring',
    stiffness: 120,
    damping: 20,
    mass: 1,
  },
  crisp: {
    type: 'spring',
    stiffness: 300,
    damping: 28,
    mass: 1,
  },
  rubber: {
    type: 'spring',
    stiffness: 200,
    damping: 14,
    mass: 1,
  },
} as const satisfies Record<string, Transition>

/* ─── Base transitions ─────────────────────────────────────────── */

const base: Transition = {
  duration: durations.base,
  ease: easings.out,
}

const long: Transition = {
  duration: durations.long,
  ease: easings.out,
}

/* ─── Reusable variant sets ────────────────────────────────────── */

/**
 * Fade + rise from below. The default reveal.
 * Apply to the container; use staggerChildren for lists.
 */
export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: long,
  },
}

/** Fade only — for elements where movement would be distracting */
export const fade: Variants = {
  hidden:  { opacity: 0 },
  visible: { opacity: 1, transition: base },
}

/** Slide in from the left — for sidebar, drawers */
export const slideInLeft: Variants = {
  hidden:  { opacity: 0, x: -32 },
  visible: { opacity: 1, x: 0, transition: long },
}

/** Slide in from the right */
export const slideInRight: Variants = {
  hidden:  { opacity: 0, x: 32 },
  visible: { opacity: 1, x: 0, transition: long },
}

/** Scale up from center — modals, tooltips */
export const scaleIn: Variants = {
  hidden:  { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { ...base, duration: durations.short },
  },
}

/**
 * Stagger container — wrap a list in this, give children fadeUp.
 * staggerChildren and delayChildren are in the "visible" transition.
 */
export const staggerContainer: Variants = {
  hidden:  {},
  visible: {
    transition: {
      staggerChildren:  0.06,
      delayChildren:    0.1,
    },
  },
}

/**
 * Stagger item — use as child of staggerContainer.
 * Inherits parent's stagger delay automatically.
 */
export const staggerItem: Variants = {
  hidden:  { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: long },
}

/**
 * Page transition — curtain wipe from top.
 * Used in AnimatePresence on route changes.
 */
export const pageCurtainIn: Variants = {
  initial: { scaleY: 1, transformOrigin: 'top' },
  animate: {
    scaleY: 0,
    transformOrigin: 'bottom',
    transition: { duration: durations.slow, ease: easings.inOut },
  },
}

export const pageCurtainOut: Variants = {
  initial: { scaleY: 0, transformOrigin: 'top' },
  animate: {
    scaleY: 1,
    transformOrigin: 'top',
    transition: { duration: durations.slow, ease: easings.inOut },
  },
}

/**
 * Character-by-character mask reveal for display headlines.
 * Each character gets this variant; parent sets staggerChildren: 0.04.
 */
export const charReveal: Variants = {
  hidden:  { y: '105%', opacity: 0 },
  visible: {
    y: '0%',
    opacity: 1,
    transition: { duration: durations.slow, ease: easings.out },
  },
}
