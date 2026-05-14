import { Button } from '@/components/ui/Button'

export function ContactCTA() {
  return (
    <section
      className="container-page py-24 text-center md:py-32"
      aria-labelledby="cta-heading"
    >
      <p className="label-caps text-muted">Let&apos;s build something</p>
      <h2
        id="cta-heading"
        className="text-heading mx-auto mt-4 max-w-2xl"
      >
        Have a project in mind?
      </h2>
      <p className="mx-auto mt-6 max-w-prose text-lg text-muted">
        I take on a small number of projects each quarter. If yours sounds like
        a good fit, I&apos;d love to hear about it.
      </p>
      <div className="mt-10 flex flex-wrap justify-center gap-4">
        <Button href="/contact" variant="primary" size="lg">
          Start a conversation
        </Button>
        <Button
          href="mailto:hello@paulojuri.com"
          variant="ghost"
          size="lg"
          external
        >
          hello@paulojuri.com
        </Button>
      </div>
    </section>
  )
}
