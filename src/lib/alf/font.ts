import { Charis_SIL } from 'next/font/google'

/**
 * Transcript face for /heyalf. Charis SIL carries the dot-below letters
 * (ẹ ị ọ ụ ṣ), the hooked k (ƙ) and the mark positioning that stacks a
 * combining accent on top of them — ẹ́, ọ̀ — which the UI faces do not.
 *
 * Declared here rather than in `src/lib/fonts.ts` so next/font preloads it on
 * this route only, not on every page of the site.
 */
export const fontTranscript = Charis_SIL({
  subsets: ['latin', 'latin-ext', 'vietnamese'],
  variable: '--font-alf-transcript',
  display: 'swap',
  weight: ['400', '700'],
})
