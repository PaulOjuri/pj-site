import { Playfair_Display, Inter, JetBrains_Mono } from 'next/font/google'

export const fontDisplay = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-display-stack',
  display: 'swap',
  weight: ['400', '500', '600', '700'],
})

export const fontBody = Inter({
  subsets: ['latin'],
  variable: '--font-body-stack',
  display: 'swap',
  weight: ['300', '400', '500'],
})

export const fontMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono-stack',
  display: 'swap',
  weight: ['400'],
})
