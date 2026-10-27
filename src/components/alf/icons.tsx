/** Line icons for the concept screens. Ported from the reference demo. */
import type { ReactElement } from 'react'

const paths = {
  signal: 'M4 20v-3M9 20v-7M14 20V9M19 20V4',
  phone:
    'M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2',
  msg: 'M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12z',
  map: 'M9 4 3 6v14l6-2 6 2 6-2V4l-6 2zM9 4v14M15 6v14',
  rain: 'M7 15a4 4 0 1 1 .8-7.9A6 6 0 0 1 19 9a3.5 3.5 0 0 1-1 6.9M8 18l-1 2M12 18l-1 2M16 18l-1 2',
  haze: 'M3 9h12M3 13h18M3 17h10',
  bell: 'M6 8a6 6 0 1 1 12 0c0 7 3 8 3 8H3s3-1 3-8M10 21a2 2 0 0 0 4 0',
  moon: 'M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z',
  shield: 'M12 3l8 3v6c0 4.5-3.4 8.3-8 9-4.6-.7-8-4.5-8-9V6zM12 8v5M12 16h.01',
  mic: 'M5 11a7 7 0 0 0 14 0M12 18v3',
  route: 'M8 19h7a3 3 0 0 0 0-6H9a3 3 0 0 1 0-6h7',
  music: 'M9 18V5l12-2v13',
  gear: 'M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z',
  cam: 'M3 8h4l2-3h6l2 3h4v11H3z',
  clock: 'M12 7v5l3 2',
  cal: 'M3 10h18M8 3v4M16 3v4',
  wifi: 'M2 9a15 15 0 0 1 20 0M5 12.5a10 10 0 0 1 14 0M8.5 16a5 5 0 0 1 7 0',
  battery: 'M22 10.5v3',
  play: 'M8 5.5v13a1 1 0 0 0 1.5.86l11-6.5a1 1 0 0 0 0-1.72l-11-6.5A1 1 0 0 0 8 5.5z',
  wave: 'M4 10v4M8 7v10M12 4v16M16 8v8M20 11v2',
  stop: 'M7 7h10v10H7z',
  phoneDevice: 'M11 18.5h2',
  laptopDevice: 'M2 19h20',
} as const

export type IconName = keyof typeof extras | keyof typeof paths

/** Extra shapes that cannot be expressed as one path. */
const extras = {
  wifi: (
    <>
      <path d={paths.wifi} />
      <circle cx="12" cy="19.5" r="1" />
    </>
  ),
  battery: (
    <>
      <rect x="2.5" y="7" width="17" height="10" rx="2" />
      <path d={paths.battery} />
      <rect x="4.5" y="9" width="10" height="6" rx="1" fill="currentColor" stroke="none" />
    </>
  ),
  cam: (
    <>
      <path d={paths.cam} />
      <circle cx="12" cy="13" r="3.5" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d={paths.clock} />
    </>
  ),
  cal: (
    <>
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d={paths.cal} />
    </>
  ),
  gear: (
    <>
      <circle cx="12" cy="12" r="3" />
      <path d={paths.gear} />
    </>
  ),
  haze: (
    <>
      <path d={paths.haze} />
      <circle cx="18" cy="8" r="3" />
    </>
  ),
  music: (
    <>
      <path d={paths.music} />
      <circle cx="6" cy="18" r="3" />
      <circle cx="18" cy="16" r="3" />
    </>
  ),
  mic: (
    <>
      <rect x="9" y="3" width="6" height="11" rx="3" />
      <path d={paths.mic} />
    </>
  ),
  route: (
    <>
      <circle cx="6" cy="19" r="2" />
      <circle cx="18" cy="5" r="2" />
      <path d={paths.route} />
    </>
  ),
  phoneDevice: (
    <>
      <rect x="6" y="2.5" width="12" height="19" rx="3" />
      <path d={paths.phoneDevice} />
    </>
  ),
  laptopDevice: (
    <>
      <rect x="4" y="4" width="16" height="11" rx="2" />
      <path d={paths.laptopDevice} />
    </>
  ),
} as const

/** Solid icons drawn with a fill rather than a stroke. */
const filled = new Set<string>(['play', 'stop'])

export function Icon({ name, className }: { name: IconName; className?: string }): ReactElement {
  const solid = filled.has(name)
  const body =
    name in extras
      ? extras[name as keyof typeof extras]
      : <path d={paths[name as keyof typeof paths]} />
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill={solid ? 'currentColor' : 'none'}
      stroke={solid ? 'none' : 'currentColor'}
      strokeWidth={solid ? undefined : 2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {body}
    </svg>
  )
}

/** Icon used by a scene's widget, keyed by the `icon` field in the JSON. */
export const widgetIcon: Record<string, IconName> = {
  rain: 'rain',
  haze: 'haze',
  clock: 'clock',
  phone: 'phone',
  bell: 'bell',
  route: 'route',
  shield: 'shield',
}
