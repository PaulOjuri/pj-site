import { ImageResponse } from 'next/og'

export const dynamic = 'force-static'
import { getWork, getWorkSlugs } from '@/lib/content'

export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export async function generateStaticParams() {
  return getWorkSlugs().map((slug) => ({ slug }))
}

export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const post = getWork(slug)
  if (!post) return new ImageResponse(<div>Not found</div>, size)

  const { title, tagline, category, year } = post.frontmatter

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
          background: '#0A0A0A',
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
          paulojuri.com / work
        </div>

        {/* Category + year */}
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
              color: '#C8773A',
            }}
          >
            {category}
          </span>
          <span style={{ color: '#444', fontSize: '13px' }}>·</span>
          <span
            style={{
              fontSize: '13px',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: '#6B6B6B',
            }}
          >
            {year}
          </span>
        </div>

        <h1
          style={{
            fontSize: '72px',
            fontWeight: 400,
            color: '#F5F4EF',
            margin: '0 0 20px',
            lineHeight: 1.05,
            letterSpacing: '-0.03em',
            maxWidth: '900px',
          }}
        >
          {title}
        </h1>

        <p
          style={{
            fontSize: '24px',
            color: '#6B6B6B',
            margin: 0,
            lineHeight: 1.4,
            maxWidth: '800px',
            fontFamily: 'sans-serif',
          }}
        >
          {tagline}
        </p>
      </div>
    ),
    { ...size },
  )
}
