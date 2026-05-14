import { Button } from '@/components/ui/Button'
import { Tag } from '@/components/ui/Tag'
import { Divider } from '@/components/ui/Divider'

export const metadata = {
  title: 'Design System',
  robots: { index: false },
}

export default function DesignSystemPage() {
  return (
    <div className="min-h-dvh bg-paper">
      <div className="container-page py-16 space-y-20">

        {/* Header */}
        <header>
          <p className="label-caps text-muted mb-2">Internal · Not indexed</p>
          <h1 className="text-heading">Design System</h1>
        </header>

        <Divider />

        {/* Colour */}
        <section>
          <h2 className="label-caps text-muted mb-6">Colour tokens</h2>
          <div className="flex flex-wrap gap-4">
            {[
              ['--ink', '#0A0A0A', 'bg-[#0A0A0A] text-paper'],
              ['--paper', '#F5F4EF', 'bg-[#F5F4EF] border border-subtle'],
              ['--cream', '#FAF9F6', 'bg-[#FAF9F6] border border-subtle'],
              ['--muted', '#6B6B6B', 'bg-[#6B6B6B] text-paper'],
              ['--subtle', '#D4D2CB', 'bg-[#D4D2CB]'],
              ['--accent', '#C8773A', 'bg-[#C8773A] text-paper'],
              ['--accent-alt', '#3A6BC8', 'bg-[#3A6BC8] text-paper'],
            ].map(([name, hex, cls]) => (
              <div key={name} className="flex flex-col gap-2">
                <div className={`h-16 w-28 rounded-md ${cls}`} />
                <p className="label-caps text-muted">{name}</p>
                <p className="text-xs text-subtle">{hex}</p>
              </div>
            ))}
          </div>
        </section>

        <Divider />

        {/* Typography */}
        <section className="space-y-10">
          <h2 className="label-caps text-muted">Typography</h2>

          <div className="space-y-6">
            <div>
              <p className="label-caps text-subtle mb-2">Display (hero)</p>
              <p className="text-display leading-[1.05]">The quick brown fox</p>
            </div>
            <div>
              <p className="label-caps text-subtle mb-2">Heading</p>
              <p className="text-heading">The quick brown fox</p>
            </div>
            <div>
              <p className="label-caps text-subtle mb-2">Subheading</p>
              <p className="text-subheading">The quick brown fox</p>
            </div>
            <div>
              <p className="label-caps text-subtle mb-2">Body large</p>
              <p className="text-xl text-muted leading-relaxed max-w-prose">
                The quick brown fox jumps over the lazy dog. Pack my box with five
                dozen liquor jugs.
              </p>
            </div>
            <div>
              <p className="label-caps text-subtle mb-2">Body base</p>
              <p className="text-base text-muted leading-relaxed max-w-prose">
                The quick brown fox jumps over the lazy dog. Pack my box with five
                dozen liquor jugs.
              </p>
            </div>
            <div>
              <p className="label-caps text-subtle mb-2">Label caps</p>
              <p className="label-caps">Label caps — all caps small</p>
            </div>
            <div>
              <p className="label-caps text-subtle mb-2">Italic (editorial)</p>
              <p className="text-subheading font-sans italic">
                <em>Editorial italic serif</em>
              </p>
            </div>
          </div>
        </section>

        <Divider />

        {/* Buttons */}
        <section className="space-y-8">
          <h2 className="label-caps text-muted">Buttons</h2>

          <div className="flex flex-wrap gap-4 items-center">
            <Button variant="primary" size="lg">Primary large</Button>
            <Button variant="primary" size="md">Primary</Button>
            <Button variant="primary" size="sm">Primary sm</Button>
          </div>

          <div className="flex flex-wrap gap-4 items-center">
            <Button variant="outline" size="lg">Outline large</Button>
            <Button variant="outline" size="md">Outline</Button>
            <Button variant="outline" size="sm">Outline sm</Button>
          </div>

          <div className="flex flex-wrap gap-4 items-center">
            <Button variant="ghost" size="lg">Ghost large</Button>
            <Button variant="ghost" size="md">Ghost</Button>
            <Button variant="ghost" size="sm">Ghost sm</Button>
          </div>

          <div className="flex flex-wrap gap-4 items-center">
            <Button variant="text" size="md">Text button</Button>
          </div>

          <div className="flex flex-wrap gap-4 items-center">
            <Button href="/work" variant="primary" size="md">Link button</Button>
            <Button href="https://example.com" variant="outline" size="md" external>
              External link →
            </Button>
          </div>
        </section>

        <Divider />

        {/* Tags */}
        <section className="space-y-4">
          <h2 className="label-caps text-muted">Tags</h2>
          <div className="flex flex-wrap gap-3">
            <Tag>Product</Tag>
            <Tag>Design</Tag>
            <Tag>Engineering</Tag>
            <Tag>2025</Tag>
            <Tag>React</Tag>
          </div>
        </section>

        <Divider />

        {/* Dark section preview */}
        <section className="space-y-4">
          <h2 className="label-caps text-muted">Dark surface</h2>
          <div className="bg-ink text-paper p-12 rounded-none">
            <h3 className="text-subheading text-paper mb-4">
              Engineer by training,{' '}
              <em>designer by conviction.</em>
            </h3>
            <p className="text-base text-paper/70 max-w-prose">
              Dark surface text — body copy reads at 70% opacity on ink.
            </p>
            <div className="mt-8 flex gap-4">
              <Button variant="outline" size="md" className="border-paper/30 text-paper hover:bg-paper hover:text-ink">
                Outline on dark
              </Button>
              <Button variant="ghost" size="md" className="text-paper hover:text-accent">
                Ghost on dark
              </Button>
            </div>
          </div>
        </section>

        <Divider />

        {/* Spacing */}
        <section className="space-y-4">
          <h2 className="label-caps text-muted">Spacing scale (8pt)</h2>
          <div className="flex items-end gap-4">
            {[1, 2, 3, 4, 6, 8, 12, 16].map((n) => (
              <div key={n} className="flex flex-col items-center gap-1">
                <div
                  className="bg-accent/30 border border-accent"
                  style={{ width: `${n * 4}px`, height: `${n * 4}px` }}
                />
                <p className="text-xs text-muted">{n * 4}px</p>
              </div>
            ))}
          </div>
        </section>

      </div>
    </div>
  )
}
