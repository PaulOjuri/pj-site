/**
 * Centralised GSAP import — import from here, not directly from 'gsap'.
 * Add plugin registrations here as needed.
 */
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { Flip } from 'gsap/Flip'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger, Flip)
}

export { gsap, ScrollTrigger, Flip }
