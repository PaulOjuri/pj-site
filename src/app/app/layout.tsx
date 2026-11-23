import type { Metadata, Viewport } from 'next'
import './app.css'

/**
 * /app — the agent app.
 *
 * The manifest, the icons and the Apple meta tags are declared on this segment only, so no public page
 * gains an app manifest or starts offering itself for installation. `robots: noindex` because the whole
 * route sits behind Cloudflare Access and there is nothing to crawl.
 */
export const metadata: Metadata = {
  title: 'Agent',
  description: "Paul's agents reach him here.",
  manifest: '/app/manifest.webmanifest',
  robots: { index: false, follow: false, nocache: true },
  appleWebApp: {
    capable: true,
    title: 'Agent',
    // The app paints its own background behind the status bar, so the bar blends into the header.
    statusBarStyle: 'black-translucent',
  },
  icons: {
    icon: [
      { url: '/app/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/app/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [{ url: '/app/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }],
  },
}

export const viewport: Viewport = {
  themeColor: '#0A0A0A',
  width: 'device-width',
  initialScale: 1,
  // Standalone on a notched iPhone: the app draws into the safe areas and pads itself with env().
  viewportFit: 'cover',
  // The keyboard must not push the fixed tab bar off screen.
  interactiveWidget: 'resizes-content',
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return children
}
