'use client'
// Win% graph across the game from White's perspective, errors marked; click to jump.
import type { MoveOut } from '@/lib/chess/types'

function winPct(cp: number): number {
  const c = Math.max(-1000, Math.min(1000, cp))
  return 50 + 50 * (2 / (1 + Math.exp(-0.00368208 * c)) - 1)
}

export function EvalGraph({ moves, current, onSelect }: { moves: MoveOut[]; current: number; onSelect: (ply: number) => void }) {
  const W = 800, H = 160
  const n = moves.length
  if (!n) return null
  // White-POV win% after each move: mover pov eval_after -> flip for black moves.
  const pts = moves.map((m, i) => {
    const whitePov = i % 2 === 0 ? m.ea : -m.ea
    return [((i + 1) / n) * W, H - (winPct(whitePov) / 100) * H] as const
  })
  const path = `M0,${H / 2} ` + pts.map(([x, y]) => `L${x},${y}`).join(' ') + ` L${W},${H} L0,${H} Z`
  const cx = ((current + 1) / n) * W
  return (
    <svg className="evalgraph" viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Evaluation over the game, white's winning chances">
      <rect className="bg" x={0} y={0} width={W} height={H} />
      <path className="area" d={path} />
      <line className="mid" x1={0} x2={W} y1={H / 2} y2={H / 2} />
      {moves.map((m, i) =>
        m.c === 'blunder' || m.c === 'mistake' ? (
          <circle
            key={i}
            className="marker"
            cx={pts[i][0]}
            cy={pts[i][1]}
            r={m.c === 'blunder' ? 6 : 4}
            fill={m.c === 'blunder' ? '#d08a7a' : '#d9a45b'}
            onClick={() => onSelect(i)}
          >
            <title>{`${Math.floor(i / 2) + 1}${i % 2 ? '…' : '.'} ${m.s}: ${m.c}, −${m.wl.toFixed(0)}% win chance`}</title>
          </circle>
        ) : null,
      )}
      {current >= 0 && <line className="cursor" x1={cx} x2={cx} y1={0} y2={H} />}
    </svg>
  )
}
