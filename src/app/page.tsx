import { Hero } from '@/components/sections/Hero'
import { About } from '@/components/sections/About'
import { FeaturedWork } from '@/components/sections/FeaturedWork'
import { Services } from '@/components/sections/Services'
import { Essays } from '@/components/sections/Essays'
import { LibraryTeaser } from '@/components/sections/LibraryTeaser'
import { Contact } from '@/components/sections/Contact'
import { SiteFooter } from '@/components/sections/SiteFooter'

export default function Home() {
  return (
    <>
      <Hero />
      <About />
      <FeaturedWork />
      <Services />
      <Essays />
      <LibraryTeaser />
      <Contact />
      <SiteFooter />
    </>
  )
}
