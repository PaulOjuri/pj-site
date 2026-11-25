'use client'

/**
 * Every mark the app draws, as inline SVG.
 *
 * Drawn rather than set in a font: a glyph like ✉ or ⏰ renders as a colour emoji on iOS and as a thin
 * outline on a Mac, which makes the tab bar look like two different apps. These are 20px, 1.4px stroke,
 * currentColor, so the active tab's gold and a badge's tone both come from CSS.
 *
 * There is no <img> anywhere in /app — the tests hold that down — so this file is also where the app
 * icon and the empty-state marks live.
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

/* ── Tab bar ── */

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

export function BackIcon() {
  return (
    <svg {...base} width={16} height={16}>
      <path d="M12 4.5 6.5 10l5.5 5.5" />
    </svg>
  )
}

export function PlusIcon() {
  return (
    <svg {...base} width={16} height={16} strokeWidth={1.6}>
      <path d="M10 4.5v11M4.5 10h11" />
    </svg>
  )
}

export function SendIcon() {
  return (
    <svg {...base} width={17} height={17}>
      <path d="M3 10 17 3.5 13 17l-3.2-4.6z" />
      <path d="M9.8 12.4 17 3.5" />
    </svg>
  )
}

/* ── Card kinds ──
   One mark per kind in src/lib/app/kinds.ts. A kind with no mark here falls back to the dot, exactly
   as an unknown kind falls back to GENERIC: the app must stay readable when the agents ship first. */

const badge = { ...base, width: 15, height: 15, strokeWidth: 1.5 }

function DecisionMark() {
  // A fork in the road, read downwards: one way in, two ways out, and only Paul picks.
  return (
    <svg {...badge}>
      <path d="M10 3v4.2" />
      <path d="M10 7.2 4.6 12.6v3.8" />
      <path d="M10 7.2l5.4 5.4v3.8" />
      <circle cx="4.6" cy="16.8" r="1.3" />
      <circle cx="15.4" cy="16.8" r="1.3" />
    </svg>
  )
}

function ResearchMark() {
  return (
    <svg {...badge}>
      <circle cx="8.6" cy="8.6" r="5.1" />
      <path d="M12.4 12.4 17 17" />
    </svg>
  )
}

function ReminderMark() {
  return (
    <svg {...badge}>
      <path d="M5.2 13.5V9a4.8 4.8 0 0 1 9.6 0v4.5l1.2 1.8H4z" />
      <path d="M8.3 17.3a1.9 1.9 0 0 0 3.4 0" />
    </svg>
  )
}

function ReplyMark() {
  return (
    <svg {...badge}>
      <path d="M8 4.5 3 9l5 4.5" />
      <path d="M3 9h7.5A5.5 5.5 0 0 1 16 14.5V16" />
    </svg>
  )
}

function RunMark() {
  return (
    <svg {...badge}>
      <path d="M6.5 4.3 15.5 10l-9 5.7z" />
    </svg>
  )
}

function AlertMark() {
  return (
    <svg {...badge}>
      <path d="M10 3.2 17.6 16.4H2.4z" />
      <path d="M10 8v3.4" />
      <path d="M10 13.9h.01" strokeWidth={1.9} />
    </svg>
  )
}

function NoteMark() {
  return (
    <svg {...badge}>
      <circle cx="10" cy="10" r="2.4" />
      <circle cx="10" cy="10" r="6.6" opacity={0.45} />
    </svg>
  )
}

const KIND_MARKS: Record<string, () => React.JSX.Element> = {
  decision: DecisionMark,
  research: ResearchMark,
  reminder: ReminderMark,
  chat: ReplyMark,
  run: RunMark,
  alert: AlertMark,
  note: NoteMark,
}

export function KindMark({ kind }: { kind: string }) {
  const Mark = KIND_MARKS[kind] ?? NoteMark
  return <Mark />
}

/* ── Marks with nothing to do ── */

/** The empty state's mark: a signal that found nothing, drawn as quiet concentric arcs. */
export function QuietMark() {
  return (
    <svg
      width={42}
      height={42}
      viewBox="0 0 42 42"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      aria-hidden="true"
    >
      <circle cx="21" cy="21" r="2.2" strokeWidth={1.2} />
      <path d="M13.9 13.9a10 10 0 0 0 0 14.2" strokeWidth={1.1} opacity={0.6} />
      <path d="M28.1 13.9a10 10 0 0 1 0 14.2" strokeWidth={1.1} opacity={0.6} />
      <path d="M8.6 8.6a17.5 17.5 0 0 0 0 24.8" strokeWidth={1} opacity={0.3} />
      <path d="M33.4 8.6a17.5 17.5 0 0 1 0 24.8" strokeWidth={1} opacity={0.3} />
    </svg>
  )
}

/**
 * The app's own mark, drawn for the install screen: the Home Screen icon, before it exists.
 *
 * The same geometry as scripts/app-icons.mjs — one orchestrator delegating to two specialists — so what
 * the screen promises is what lands on the Home Screen.
 */
export function AppMark({ size = 68 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 512 512" fill="none" aria-hidden="true" className="app-mark">
      <rect width="512" height="512" rx="113" fill="url(#mark-bg)" />
      <g stroke="var(--accent)" strokeWidth="14" strokeLinecap="round" fill="none" opacity="0.85">
        <path d="M256 113 L115 399" />
        <path d="M256 113 L397 399" />
        <path d="M115 399 L397 399" opacity="0.35" />
      </g>
      <g fill="var(--accent)">
        <circle cx="256" cy="113" r="40" />
        <circle cx="115" cy="399" r="32" />
        <circle cx="397" cy="399" r="32" />
      </g>
      <rect x="0.5" y="0.5" width="511" height="511" rx="112.5" fill="none" stroke="url(#mark-edge)" />
      <defs>
        <linearGradient id="mark-bg" x1="0" y1="0" x2="512" y2="512" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#15140D" />
          <stop offset="1" stopColor="#080807" />
        </linearGradient>
        <linearGradient id="mark-edge" x1="256" y1="0" x2="256" y2="512" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="rgba(201,168,76,0.5)" />
          <stop offset="1" stopColor="rgba(240,236,226,0.05)" />
        </linearGradient>
      </defs>
    </svg>
  )
}
