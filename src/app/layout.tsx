import type { Metadata, Viewport } from 'next'
import { fontEditorial, fontUI, fontMono } from '@/lib/fonts'
import { LenisProvider } from '@/components/layout/LenisProvider'
import '@/app/globals.css'

export const metadata: Metadata = {
  metadataBase: new URL('https://paulojuri.com'),
  title: {
    default: 'Paulo Juri — Product Engineer & Designer',
    template: '%s · Paulo Juri',
  },
  description:
    'Product engineer and designer building at the intersection of code, craft, and culture.',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://paulojuri.com',
    siteName: 'Paulo Juri',
    images: [{ url: '/opengraph-image', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    creator: '@paulojuri',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}

export const viewport: Viewport = {
  themeColor: '#F5F4EF',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html
      lang="en"
      className={`${fontEditorial.variable} ${fontUI.variable} ${fontMono.variable}`}
    >
      <body>
        {/* Skip to main content — keyboard accessibility */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[--z-top] focus:px-4 focus:py-2 focus:bg-ink focus:text-paper focus:label-caps"
        >
          Skip to content
        </a>
        <LenisProvider>{children}</LenisProvider>
      </body>
    </html>
  )
}
