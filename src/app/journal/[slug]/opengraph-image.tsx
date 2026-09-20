import { ImageResponse } from 'next/og'

export const dynamic = 'force-static'
import { getJournalPost, getJournalSlugs } from '@/lib/content'

export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export async function generateStaticParams() {
  return getJournalSlugs().map((slug) => ({ slug }))
}

export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const post = getJournalPost(slug)
  if (!post) return new ImageResponse(<div>Not found</div>, size)

  const { title, excerpt, date, readingTime } = post.frontmatter

  const formattedDate = new Date(date).toLocaleDateString('en-GB', {
    month: 'long',
    year: 'numeric',
  })

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-end',
          padding: '72px 80px',
          background: '#F5F4EF',
          fontFamily: 'serif',
        }}
      >
        {/* Accent line */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '4px',
            background: '#C8773A',
          }}
        />

        {/* Site label */}
        <div
          style={{
            position: 'absolute',
            top: '48px',
            left: '80px',
            fontSize: '13px',
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: '#6B6B6B',
            fontFamily: 'sans-serif',
          }}
        >
          paulojuri.com / journal
        </div>

        {/* Date + reading time */}
        <div
          style={{
            display: 'flex',
            gap: '16px',
            marginBottom: '20px',
            fontFamily: 'sans-serif',
          }}
        >
          <span
            style={{
              fontSize: '13px',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: '#6B6B6B',
            }}
          >
            {formattedDate}
          </span>
          <span style={{ color: '#D4D2CB', fontSize: '13px' }}>·</span>
          <span
            style={{
              fontSize: '13px',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: '#6B6B6B',
            }}
          >
            {readingTime}
          </span>
        </div>

        <h1
          style={{
            fontSize: '68px',
            fontWeight: 400,
            color: '#0A0A0A',
            margin: '0 0 20px',
            lineHeight: 1.08,
            letterSpacing: '-0.03em',
            maxWidth: '960px',
          }}
        >
          {title}
        </h1>

        <p
          style={{
            fontSize: '22px',
            color: '#6B6B6B',
            margin: 0,
            lineHeight: 1.5,
            maxWidth: '800px',
            fontFamily: 'sans-serif',
          }}
        >
          {excerpt}
        </p>
      </div>
    ),
    { ...size },
  )
}
