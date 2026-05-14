import { Nav } from '@/components/layout/Nav'
import { Footer } from '@/components/layout/Footer'
import { Hero } from '@/components/sections/Hero'
import { NowStrip } from '@/components/sections/NowStrip'
import { SelectedWork } from '@/components/sections/SelectedWork'
import { AboutTeaser } from '@/components/sections/AboutTeaser'
import { JournalTeaser } from '@/components/sections/JournalTeaser'
import { ContactCTA } from '@/components/sections/ContactCTA'
import { Divider } from '@/components/ui/Divider'

export default function HomePage() {
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <NowStrip />
        <SelectedWork />
        <Divider />
        <AboutTeaser />
        <JournalTeaser />
        <Divider />
        <ContactCTA />
      </main>
      <Footer />
    </>
  )
}
