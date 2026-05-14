import type { Metadata } from 'next'
import { Nav } from '@/components/layout/Nav'
import { Footer } from '@/components/layout/Footer'
import { Divider } from '@/components/ui/Divider'
import { ContactForm } from '@/components/sections/ContactForm'

export const metadata: Metadata = {
  title: 'Contact',
  description:
    "Let's work together. Tell me about your project and I'll get back to you within a day or two.",
}

const faqs = [
  {
    q: 'How quickly do you reply?',
    a: 'Within one business day. If the project sounds like a good fit I\'ll suggest a short call to talk through the details.',
  },
  {
    q: 'Do you work with clients outside Belgium?',
    a: 'Yes — most of my work is remote. I\'ve worked with teams in Nigeria, Switzerland, Germany, and the Netherlands.',
  },
  {
    q: 'What\'s your minimum engagement?',
    a: 'No hard minimum. A focused two-week audit can be as valuable as a six-month build. Tell me what you need and we\'ll figure out what makes sense.',
  },
  {
    q: 'Do you do equity or deferred payment?',
    a: 'Occasionally, for the right project. It has to be something I genuinely believe in.',
  },
]

export default function ContactPage() {
  return (
    <>
      <Nav />
      <main id="main-content">

        {/* Header */}
        <section className="pt-32 pb-16 border-b border-subtle">
          <div className="container-page grid gap-12 md:grid-cols-2 md:gap-24">
            <div>
              <p className="label-caps text-muted mb-4">Contact</p>
              <h1 className="text-heading">
                Let&apos;s build{' '}
                <em>something good.</em>
              </h1>
            </div>
            <div className="flex flex-col justify-end gap-4">
              <p className="text-lg leading-relaxed text-muted">
                I take on a small number of projects each quarter. Tell me what
                you&apos;re working on and I&apos;ll let you know if I can help.
              </p>
              <div className="flex flex-col gap-2 mt-4">
                <a
                  href="mailto:hello@paulojuri.com"
                  className="label-caps text-ink hover:text-accent transition-colors"
                >
                  hello@paulojuri.com
                </a>
                <a
                  href="https://linkedin.com/in/paulojuri"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="label-caps text-muted hover:text-ink transition-colors"
                >
                  LinkedIn →
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Form + FAQ */}
        <div className="container-page py-16 md:py-24">
          <div className="grid gap-16 md:grid-cols-2 md:gap-24">

            {/* Form */}
            <div>
              <p className="label-caps text-muted mb-8">Send a message</p>
              <ContactForm />
            </div>

            {/* FAQ */}
            <div>
              <p className="label-caps text-muted mb-8">FAQ</p>
              <dl className="divide-y divide-subtle">
                {faqs.map(({ q, a }) => (
                  <div key={q} className="py-6 flex flex-col gap-2">
                    <dt className="font-medium text-ink">{q}</dt>
                    <dd className="text-muted leading-relaxed">{a}</dd>
                  </div>
                ))}
              </dl>
            </div>

          </div>
        </div>

        <Divider />

        {/* Availability note */}
        <div className="container-page py-12">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3">
              <span
                className="inline-block w-2 h-2 rounded-full bg-green-500"
                aria-hidden="true"
              />
              <p className="label-caps text-muted">
                Available for new projects — Q3 2025
              </p>
            </div>
            <p className="label-caps text-subtle">
              Response time: &lt; 24 hours
            </p>
          </div>
        </div>

      </main>
      <Footer />
    </>
  )
}
