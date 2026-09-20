import type { Metadata } from 'next'
import { fontDisplay, fontBody, fontMono } from '@/lib/fonts'
import { SiteHeader } from '@/components/SiteHeader'
import { SiteLenis } from '@/components/SiteLenis'
import '@/app/globals.css'

export const metadata: Metadata = {
  metadataBase: new URL('https://paulojuri.com'),
  title: {
    default: 'Paul Ojuri — Product Engineer & Designer',
    template: '%s · Paul Ojuri',
  },
  description: 'Product engineer and designer building software people actually want to use.',
  openGraph: {
    type: 'website',
    url: 'https://paulojuri.com',
    images: [{ url: '/og.png', width: 1200, height: 630 }],
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${fontDisplay.variable} ${fontBody.variable} ${fontMono.variable}`}
    >
      <body>
        <a href="#main-content" className="skip-link">
          Skip to content
        </a>
        <SiteLenis>
          <SiteHeader />
          <main id="main-content">{children}</main>
        </SiteLenis>
      </body>
    </html>
  )
}
