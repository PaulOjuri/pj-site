'use client'

import { useRef } from 'react'

const items = [
  'Currently building Prism — privacy-first browser analytics',
  'Available for product design & engineering work',
  'Based in Belgium · Working globally',
  'Interested in AI, privacy tech, and spatial computing',
]

export function NowStrip() {
  const trackRef = useRef<HTMLDivElement>(null)

  return (
    <div
      className="overflow-hidden border-y border-subtle bg-cream py-3"
      aria-label="Current status"
    >
      <div
        ref={trackRef}
        className="flex gap-16 whitespace-nowrap"
        style={{
          animation: 'marquee 40s linear infinite',
          width: 'max-content',
        }}
      >
        {[...items, ...items].map((item, i) => (
          <span key={i} className="label-caps text-muted shrink-0">
            {item}
            <span className="ml-16 text-subtle" aria-hidden="true">
              ◆
            </span>
          </span>
        ))}
      </div>

      <style>{`
        @keyframes marquee {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
        @media (prefers-reduced-motion: reduce) {
          [style*="marquee"] { animation: none; }
        }
      `}</style>
    </div>
  )
}
