import { Nav } from '@/components/layout/Nav'
import { Footer } from '@/components/layout/Footer'
import { Hero } from '@/components/sections/Hero'
import { NowStrip } from '@/components/sections/NowStrip'
import { SelectedWork } from '@/components/sections/SelectedWork'
import { AboutTeaser } from '@/components/sections/AboutTeaser'
import { JournalTeaser } from '@/components/sections/JournalTeaser'
import { ContactCTA } from '@/components/sections/ContactCTA'
import { Divider } from '@/components/ui/Divider'
import { getAllWork, getAllJournal } from '@/lib/content'
import { JsonLd, personSchema, websiteSchema } from '@/lib/jsonld'

export default function HomePage() {
  const featuredWorks = getAllWork()
    .filter((w) => w.frontmatter.featured)
    .map((w) => ({
      slug: w.slug,
      title: w.frontmatter.title,
      category: w.frontmatter.category,
      year: w.frontmatter.year,
      description: w.frontmatter.tagline,
    }))

  const recentPosts = getAllJournal()
    .slice(0, 3)
    .map((p) => ({
      slug: p.slug,
      title: p.frontmatter.title,
      date: p.frontmatter.date,
      readingTime: p.frontmatter.readingTime,
    }))

  return (
    <>
      <JsonLd data={personSchema()} />
      <JsonLd data={websiteSchema()} />
      <Nav />
      <main id="main-content">
        <Hero />
        <NowStrip />
        <SelectedWork works={featuredWorks} />
        <Divider />
        <AboutTeaser />
        <JournalTeaser posts={recentPosts} />
        <Divider />
        <ContactCTA />
      </main>
      <Footer />
    </>
  )
}
