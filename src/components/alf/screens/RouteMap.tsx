/**
 * The Yorùbá route map, drawn inline so it scales with the device frame.
 * Alf's route draws itself in with stroke-dashoffset once `.revealed` or
 * `.show` lands on an ancestor (see alf.css).
 */
import type { ReactElement } from 'react'

export function RouteMap({
  labels,
  compact = false,
}: {
  labels?: Record<string, string>
  compact?: boolean
}): ReactElement {
  return (
    <svg viewBox="0 0 640 360" preserveAspectRatio="xMidYMid slice" role="presentation">
      <rect width="640" height="360" fill="#e7ecf6" />
      <path d="M360 360 C 420 300, 520 285, 640 300 L 640 360 Z" fill="#bcd3f2" />
      <path d="M0 330 C 80 320, 160 340, 240 360 L 0 360 Z" fill="#bcd3f2" />
      <rect x="170" y="150" width="90" height="60" rx="10" fill="#d6ead8" />
      <rect x="430" y="170" width="70" height="50" rx="10" fill="#dfe5f0" />
      <g fill="none" strokeLinecap="round">
        <g stroke="#cfd6e4" strokeWidth="18">
          <path d="M0 250 C 160 250, 260 300, 400 300 S 600 250, 640 240" />
          <path d="M0 115 C 180 108, 320 88, 460 98 S 600 128, 640 118" />
          <path d="M130 360 L 150 0" />
          <path d="M300 360 C 310 250, 300 150, 320 0" />
          <path d="M530 360 C 515 260, 505 160, 525 0" />
        </g>
        <g stroke="#ffffff" strokeWidth="12">
          <path d="M0 250 C 160 250, 260 300, 400 300 S 600 250, 640 240" />
          <path d="M0 115 C 180 108, 320 88, 460 98 S 600 128, 640 118" />
          <path d="M130 360 L 150 0" />
          <path d="M300 360 C 310 250, 300 150, 320 0" />
          <path d="M530 360 C 515 260, 505 160, 525 0" />
        </g>
        {/* The usual route: dashed, through the stretch that floods. */}
        <path
          d="M110 268 C 200 285, 300 305, 400 300 S 520 250, 548 132"
          stroke="#7d84a6"
          strokeWidth="6"
          strokeDasharray="10 9"
        />
        {/* Alf's route: drawn in on reveal. */}
        <path
          className="alf-route-line"
          d="M110 268 C 120 200, 140 140, 230 113 S 420 92, 548 108"
          stroke="#a8781f"
          strokeWidth="8"
        />
      </g>
      <g transform="translate(400 300)">
        <circle r="19" fill="#1f5fc4" />
        <path
          d="M0 -10 C 6 -2, 8 2, 8 5 a8 8 0 0 1 -16 0 c0 -3 2 -7 8 -15z"
          fill="#fff"
        />
      </g>
      <g transform="translate(110 268)">
        <circle r="15" fill="#26318a" />
        <path d="M-7 1 L0 -6 L7 1 V7 H-7 Z" fill="#fff" />
      </g>
      <g transform="translate(548 108)">
        <circle r="15" fill="#26318a" />
        <rect x="-7" y="-4" width="14" height="10" rx="2" fill="#fff" />
        <rect x="-3" y="-7" width="6" height="4" rx="1" fill="none" stroke="#fff" strokeWidth="2" />
      </g>
      {!compact && labels && (
        <g fontFamily="var(--alf-font-ui)" fontSize="15" fontWeight="600">
          <g transform="translate(420 330)">
            <rect x="-6" y="-17" width="196" height="26" rx="13" fill="#1f5fc4" />
            <text x="8" y="1" fill="#fff">
              {labels.flood}
            </text>
          </g>
          <g className="alf-route-tag" transform="translate(236 70)">
            <rect x="-6" y="-17" width="186" height="26" rx="13" fill="#a8781f" />
            <text x="8" y="1" fill="#fff">
              {labels.alf_route}
            </text>
          </g>
          <text x="74" y="306" fill="#26318a">
            {labels.home}
          </text>
          <text x="520" y="150" fill="#26318a">
            {labels.work}
          </text>
        </g>
      )}
    </svg>
  )
}
