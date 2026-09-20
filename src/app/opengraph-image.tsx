import { ImageResponse } from 'next/og'

export const dynamic = 'force-static'

export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function Image() {
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
            fontSize: '14px',
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: '#6B6B6B',
            fontFamily: 'sans-serif',
          }}
        >
          paulojuri.com
        </div>

        <p
          style={{
            fontSize: '22px',
            color: '#6B6B6B',
            margin: '0 0 16px',
            fontFamily: 'sans-serif',
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
          }}
        >
          Product Engineer & Designer
        </p>

        <h1
          style={{
            fontSize: '80px',
            fontWeight: 400,
            color: '#0A0A0A',
            margin: 0,
            lineHeight: 1.05,
            letterSpacing: '-0.03em',
          }}
        >
          Paul Ojuri
        </h1>
      </div>
    ),
    { ...size },
  )
}
