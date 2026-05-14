import { DM_Mono, DM_Sans, Playfair_Display } from 'next/font/google'

/**
 * Editorial serif — Playfair Display (swap for self-hosted woff2 later).
 * To use a custom font: replace with localFont from 'next/font/local'
 * pointing to /public/fonts/editorial.woff2
 */
export const fontEditorial = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-editorial',
  display: 'swap',
  weight: ['400', '500', '600', '700'],
  style: ['normal', 'italic'],
})

/** UI sans-serif — DM Sans */
export const fontUI = DM_Sans({
  subsets: ['latin'],
  variable: '--font-ui-stack',
  display: 'swap',
  weight: ['300', '400', '500', '600'],
})

/** Monospace — DM Mono */
export const fontMono = DM_Mono({
  subsets: ['latin'],
  variable: '--font-mono-stack',
  display: 'swap',
  weight: ['300', '400', '500'],
})
