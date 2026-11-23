'use client'

/**
 * The tab icons, as inline SVG.
 *
 * Drawn rather than set in a font: a glyph like ✉ or ⏰ renders as a colour emoji on iOS and as a thin
 * outline on a Mac, which makes the tab bar look like two different apps. These are 20px, 1.4px stroke,
 * currentColor, so the active tab's gold comes from CSS.
 */

const base = {
  width: 20,
  height: 20,
  viewBox: '0 0 20 20',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.4,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  'aria-hidden': true,
}

export function InboxIcon() {
  return (
    <svg {...base}>
      <path d="M2.5 11.5 5 4.5h10l2.5 7" />
      <path d="M2.5 11.5h4l1 2h5l1-2h4v4h-15z" />
    </svg>
  )
}

export function ClockIcon() {
  return (
    <svg {...base}>
      <circle cx="10" cy="10" r="7" />
      <path d="M10 6v4.3l2.8 1.7" />
    </svg>
  )
}

export function ChatIcon() {
  return (
    <svg {...base}>
      <path d="M3 8.5a4 4 0 0 1 4-4h6a4 4 0 0 1 4 4v2a4 4 0 0 1-4 4H8.8L5 17v-2.8A4 4 0 0 1 3 10.5z" />
    </svg>
  )
}

export function FeedIcon() {
  return (
    <svg {...base}>
      <path d="M4 5.5h12M4 10h12M4 14.5h8" />
    </svg>
  )
}

export function SettingsIcon() {
  return (
    <svg {...base}>
      <circle cx="10" cy="10" r="2.6" />
      <path d="M10 2.5v2M10 15.5v2M3.7 6.2l1.7 1M14.6 12.8l1.7 1M3.7 13.8l1.7-1M14.6 7.2l1.7-1" />
    </svg>
  )
}

export function RefreshIcon() {
  return (
    <svg {...base}>
      <path d="M16 10a6 6 0 1 1-1.9-4.4" />
      <path d="M16 3.5V6h-2.5" />
    </svg>
  )
}
