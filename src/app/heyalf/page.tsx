import type { Metadata } from 'next'
import { Footer } from '@/components/layout/Footer'
import { MeetAlf } from '@/components/alf/MeetAlf'
import { fontTranscript } from '@/lib/alf/font'
import './alf.css'

const DESCRIPTION =
  'A concept demo of Alf, a voice assistant for Alfera phones and laptops that speaks Yorùbá, Igbo, Hausa and Nigerian Pidgin — and adds the local picture to every answer.'

export const metadata: Metadata = {
  title: 'Meet Alf',
  description: DESCRIPTION,
  openGraph: {
    title: 'Meet Alf — a voice assistant that speaks your language',
    description: DESCRIPTION,
    url: 'https://paulojuri.com/heyalf',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Meet Alf — a voice assistant that speaks your language',
    description: DESCRIPTION,
  },
  alternates: { canonical: '/heyalf' },
}

export default function HeyAlfPage() {
  return (
    <div className={`alf-page ${fontTranscript.variable}`}>
      <MeetAlf />
      <Footer />
    </div>
  )
}
