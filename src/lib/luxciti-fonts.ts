import { Cormorant_Garamond, Jost, Pinyon_Script } from 'next/font/google'

export const lcSerif = Cormorant_Garamond({
  subsets: ['latin'],
  variable: '--font-lc-serif',
  display: 'swap',
  weight: ['300', '400', '500', '600'],
  style: ['normal', 'italic'],
})

export const lcSans = Jost({
  subsets: ['latin'],
  variable: '--font-lc-sans',
  display: 'swap',
  weight: ['200', '300', '400', '500'],
})

export const lcScript = Pinyon_Script({
  subsets: ['latin'],
  variable: '--font-lc-script',
  display: 'swap',
  weight: ['400'],
})
