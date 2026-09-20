import type { Metadata } from 'next'
import { lcSerif, lcSans, lcScript } from '@/lib/luxciti-fonts'
import { LuxcitiHeader } from '@/components/luxciti/LuxcitiHeader'
import { LuxcitiFooter } from '@/components/luxciti/LuxcitiFooter'
import { LuxcitiMotionProvider } from '@/components/luxciti/LuxcitiMotionProvider'
import './luxciti.css'

export const metadata: Metadata = {
  metadataBase: new URL('https://paulojuri.com'),
  title: {
    default: 'Luxciti Luxury Events — Nigerian Wedding Coordinator London',
    template: '%s · Luxciti Luxury Events',
  },
  description:
    'Premium British-African event production by Gift Anighoro. Specialising in Nigerian weddings, luxury celebrations and lifestyle events across London and the UK.',
}

export default function LuxcitiLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={`luxciti lc-grain ${lcSerif.variable} ${lcSans.variable} ${lcScript.variable}`}>
      <LuxcitiMotionProvider>
        <LuxcitiHeader />
        <main id="main-content">{children}</main>
        <LuxcitiFooter />
      </LuxcitiMotionProvider>
    </div>
  )
}
