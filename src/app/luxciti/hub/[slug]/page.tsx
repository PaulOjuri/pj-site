import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { hubPosts } from '@/content/luxciti/hub-posts'
import { PlaceholderImage } from '@/components/luxciti/PlaceholderImage'

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  return hubPosts.map((post) => ({ slug: post.slug }))
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const post = hubPosts.find((p) => p.slug === slug)
  if (!post) return {}
  return {
    title: post.title,
    description: post.excerpt,
  }
}

// Long-form body copy for each post
const bodyContent: Record<string, string[]> = {
  'yoruba-introduction-ceremony-guide': [
    'The introduction ceremony — known variously as the Igbeyawo, the traditional engagement, or simply "the introduction" — is the formal moment when two families meet, when the groom&apos;s family presents themselves before the bride&apos;s family, and when the union is sanctified in the eyes of tradition. It is not a warm-up act for the white wedding. For many Yoruba families, it is the wedding.',
    'The ceremony begins long before the day itself. Weeks in advance, a delegation from the groom&apos;s family — usually senior male relatives — visits the bride&apos;s family home to make a formal request. This is the \u00CCf\u0131l\u1ECDl\u1EB9, or knocking on the door. It is a highly formalised process involving letters, lists, and the presentation of specified items. Nothing happens casually.',
    'On the day of the ceremony, the bride&apos;s compound comes alive with colour — rich Aso-oke fabric in coordinated tones, fresh flowers, elaborate food. The groom&apos;s party arrives with gifts, often including kola nuts, obi abata, orogbo, obi, orin, salt, and palm wine. Each item carries symbolic meaning — the kola nut is the most important of all, used to bless the union and welcome visitors.',
    'The central moment of the ceremony is the palm wine. The bride, wearing her traditional finery, carries a calabash or glass of palm wine through the gathered crowd, eyes lowered, searching for her groom. When she finds him and kneels before him to present the wine, and he drinks — it is done. They are married, in the eyes of tradition and in the hearts of everyone in the room.',
    'Planning this ceremony requires a coordinator who understands the sequence of protocols. The lists for the Eru Iyawo — the bride&apos;s trousseau — must be presented, negotiated, and fulfilled. The Aso-oke colour scheme must be coordinated across family groups. The seating of the families must reflect hierarchy without causing offence. It is, in other words, exactly the kind of work that Luxciti was built for.',
  ],
  'igbo-traditional-wedding-igo-mmanya': [
    'In Igbo tradition, the marriage process begins not with a single ceremony but with a sequence of meetings, negotiations, and rituals that may unfold over months. The Igo Mmanya — the wine-carrying ceremony — is the most visible and celebrated of these rituals, but it sits within a larger cultural architecture that must be understood and respected.',
    'Before the Igo Mmanya, the groom&apos;s family must make a formal visit to the bride&apos;s family. This is the Iku Aka, or knocking on the door — analogous to the Yoruba \u00CCf\u0131l\u1ECDl\u1EB9, but with its own specific protocols and items. The bride&apos;s family evaluates the proposal, and if accepted, the process of Ime ego begins — the bride price negotiation, conducted with a formality and gravity that reflects its significance.',
    'The Igo Mmanya ceremony itself is a joyful, communal celebration. The bride, dressed in her traditional George wrapper and coral jewellery, carries a calabash of palm wine through the gathered crowd, her eyes searching for her groom. When she finds him — and tradition allows her friends to misdirect and tease — she kneels and presents the wine. He drinks. They are married.',
    'The role of the coordinator here is to navigate the relationship between the two families with sensitivity and intelligence. Seating must reflect family hierarchy. The sequence of gift presentations must be observed. The Master of Ceremonies must understand both what to say and what not to say. These are not incidental details. They are the event.',
  ],
}

function getBodyContent(slug: string): string[] {
  if (bodyContent[slug]) return bodyContent[slug]
  return [
    'This is a comprehensive guide covering everything you need to know about this aspect of Nigerian wedding culture. Written with genuine knowledge and deep respect for the traditions involved.',
    'Nigerian celebrations are among the most joyful and culturally rich in the world — not because of the money spent, but because of the meaning carried into every gesture, every fabric choice, every moment of ceremony.',
    'Whether you are planning your own celebration or simply learning more about a culture that has produced some of the most extraordinary weddings in Britain, this guide is designed to be your authoritative, respectful reference.',
    'At Luxciti, we believe that cultural knowledge is not a bonus — it is a prerequisite. Every coordinator on our team brings a genuine understanding of the traditions they help to produce. Not research. Lived experience.',
  ]
}

export default async function HubPostPage({ params }: PageProps) {
  const { slug } = await params
  const post = hubPosts.find((p) => p.slug === slug)
  if (!post) notFound()

  const relatedPosts = hubPosts
    .filter((p) => p.slug !== slug && (p.tribe === post.tribe || p.category === post.category))
    .slice(0, 3)

  const body = getBodyContent(slug)

  return (
    <>
      {/* ── Full-bleed header ── */}
      <div style={{ position: 'relative', paddingTop: '5rem' }}>
        <PlaceholderImage
          aspectRatio="21/9"
          caption={`${post.tribe.toUpperCase()} · ${post.category.toUpperCase()}`}
        />
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(to bottom, rgba(60,53,48,0.2) 0%, rgba(60,53,48,0.7) 100%)',
            display: 'flex',
            alignItems: 'flex-end',
            padding: '3rem 2rem',
          }}
        >
          <div style={{ maxWidth: '64rem' }}>
            <p
              className="lc-eyebrow"
              style={{ color: 'var(--lc-ivory)', marginBottom: '0.75rem' }}
            >
              {post.tribe} · {post.category} · {post.readTime} min read
            </p>
            <h1
              className="lc-serif"
              style={{
                fontSize: 'clamp(1.6rem, 3.5vw, 3rem)',
                fontWeight: 300,
                fontStyle: 'italic',
                color: 'var(--lc-ivory)',
                lineHeight: 1.2,
              }}
            >
              {post.title}
            </h1>
          </div>
        </div>
      </div>

      {/* ── Article Body ── */}
      <article
        style={{
          maxWidth: '48rem',
          margin: '0 auto',
          padding: 'clamp(3rem, 6vw, 5rem) 2rem',
        }}
      >
        {/* Share row */}
        <div
          style={{
            display: 'flex',
            gap: '1.5rem',
            alignItems: 'center',
            marginBottom: '3rem',
            paddingBottom: '1.5rem',
            borderBottom: '1px solid var(--lc-gold-hair)',
          }}
        >
          {['Pin', 'Share', 'Save'].map((action) => (
            <button
              key={action}
              style={{
                background: 'none',
                border: '1px solid var(--lc-gold)',
                fontFamily: 'var(--lc-font-sans)',
                fontWeight: 300,
                fontSize: '0.65rem',
                letterSpacing: '0.25em',
                textTransform: 'uppercase',
                color: 'var(--lc-charcoal)',
                padding: '0.4rem 1rem',
                cursor: 'pointer',
              }}
            >
              {action}
            </button>
          ))}
        </div>

        {/* Body */}
        {body.map((paragraph, i) => (
          <p
            key={i}
            className={i === 0 ? 'lc-serif lc-drop-cap' : ''}
            style={{
              fontFamily: i === 0 ? 'var(--lc-font-serif)' : 'var(--lc-font-sans)',
              fontWeight: 300,
              fontSize: i === 0 ? 'clamp(1rem, 1.5vw, 1.2rem)' : '0.95rem',
              lineHeight: 1.85,
              color: 'var(--lc-charcoal)',
              marginBottom: '1.75rem',
            }}
            dangerouslySetInnerHTML={{ __html: paragraph }}
          />
        ))}

        {/* Planning CTA */}
        <div
          style={{
            marginTop: '3rem',
            padding: '2.5rem',
            backgroundColor: 'var(--lc-ivory-hi)',
            borderLeft: '2px solid var(--lc-rose)',
          }}
        >
          <p className="lc-eyebrow" style={{ marginBottom: '0.75rem' }}>
            Planning your own?
          </p>
          <p
            className="lc-serif"
            style={{
              fontSize: '1.1rem',
              fontStyle: 'italic',
              marginBottom: '1.25rem',
              lineHeight: 1.5,
            }}
          >
            We plan celebrations exactly like this one. If you are thinking about yours,
            we would love to hear about it.
          </p>
          <Link href="/luxciti/enquire" className="lc-btn">
            <span>Speak to Gift</span>
          </Link>
        </div>
      </article>

      {/* ── Related Posts ── */}
      {relatedPosts.length > 0 && (
        <section
          style={{
            padding: 'clamp(3rem, 6vw, 5rem) 2rem',
            backgroundColor: 'var(--lc-blush)',
          }}
        >
          <div style={{ maxWidth: '80rem', margin: '0 auto' }}>
            <p className="lc-eyebrow" style={{ marginBottom: '0.75rem', textAlign: 'center' }}>
              Continue reading
            </p>
            <h2
              className="lc-serif"
              style={{
                fontSize: 'clamp(1.5rem, 3vw, 2.5rem)',
                fontWeight: 300,
                fontStyle: 'italic',
                textAlign: 'center',
                marginBottom: '2.5rem',
              }}
            >
              Related Articles
            </h2>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                gap: '1.5rem',
              }}
            >
              {relatedPosts.map((related) => (
                <Link
                  key={related.id}
                  href={`/luxciti/hub/${related.slug}`}
                  style={{ textDecoration: 'none', color: 'inherit' }}
                >
                  <article
                    style={{
                      backgroundColor: 'var(--lc-ivory-hi)',
                      padding: '2rem',
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.75rem',
                    }}
                  >
                    <p className="lc-eyebrow">{related.tribe} · {related.category}</p>
                    <h3
                      className="lc-serif"
                      style={{ fontSize: '1.1rem', fontWeight: 400, lineHeight: 1.3, flex: 1 }}
                    >
                      {related.title}
                    </h3>
                    <p
                      style={{
                        fontFamily: 'var(--lc-font-sans)',
                        fontWeight: 200,
                        fontSize: '0.7rem',
                        letterSpacing: '0.15em',
                        color: 'var(--lc-ink-70)',
                        textTransform: 'uppercase',
                      }}
                    >
                      {related.readTime} min read
                    </p>
                  </article>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  )
}
