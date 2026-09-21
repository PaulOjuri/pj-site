// Static SVG board from a FEN. Own palette and glyph-based pieces; no third-party assets.
// Renders without JavaScript. The checkerboard is one patterned rect so the markup stays small
// (these boards are embedded many times per page). `lastMove` is a UCI string to highlight.

const GLYPH: Record<string, string> = { k: '♚', q: '♛', r: '♜', b: '♝', n: '♞', p: '♟' }
const S = 100

function parseFen(fen: string): (string | null)[][] {
  return fen.split(' ')[0].split('/').map((row) => {
    const out: (string | null)[] = []
    for (const ch of row) {
      if (/\d/.test(ch)) for (let i = 0; i < Number(ch); i++) out.push(null)
      else out.push(ch)
    }
    return out
  })
}

function sqIndex(name: string): [number, number] {
  return [name.charCodeAt(0) - 97, 8 - Number(name[1])]
}

let patternSeq = 0

export function Board({
  fen, lastMove, flipped = false, size = 'full', title,
}: { fen: string; lastMove?: string | null; flipped?: boolean; size?: 'full' | 'mini'; title?: string }) {
  const grid = parseFen(fen)
  const from = lastMove ? sqIndex(lastMove.slice(0, 2)) : null
  const to = lastMove ? sqIndex(lastMove.slice(2, 4)) : null
  const pid = `ck${(patternSeq++ % 1000)}`
  const view = (f: number, r: number): [number, number] => [flipped ? 7 - f : f, flipped ? 7 - r : r]
  const pieces = []
  for (let r = 0; r < 8; r++) for (let f = 0; f < 8; f++) {
    const p = grid[r][f]
    if (!p) continue
    const [vf, vr] = view(f, r)
    pieces.push(
      <text key={`${r}${f}`} x={vf * S + S / 2} y={vr * S + S / 2 + 2} className={`piece ${p === p.toUpperCase() ? 'piece-w' : 'piece-b'}`}>{GLYPH[p.toLowerCase()]}</text>,
    )
  }
  const hl = [from, to].filter(Boolean).map((sq, i) => {
    const [vf, vr] = view(sq![0], sq![1])
    return <rect key={i} x={vf * S} y={vr * S} width={S} height={S} className={i === 0 ? 'sq-from' : 'sq-to'} />
  })
  const label = title ?? `Chess position, ${flipped ? 'black' : 'white'} at the bottom`
  return (
    <svg className="board" viewBox={`0 0 ${8 * S} ${8 * S}`} role="img" aria-label={label} style={size === 'mini' ? { maxWidth: 220 } : undefined}>
      <title>{label}</title>
      <defs>
        <pattern id={pid} width={2 * S} height={2 * S} patternUnits="userSpaceOnUse">
          <rect width={2 * S} height={2 * S} className="sq-light" />
          <rect x={S} width={S} height={S} className="sq-dark" />
          <rect y={S} width={S} height={S} className="sq-dark" />
        </pattern>
      </defs>
      <rect width={8 * S} height={8 * S} fill={`url(#${pid})`} />
      {hl}
      {pieces}
      {size === 'full' && (
        <g className="coord">
          {Array.from({ length: 8 }, (_, i) => <text key={`r${i}`} x={4} y={i * S + 16}>{flipped ? i + 1 : 8 - i}</text>)}
          {Array.from({ length: 8 }, (_, i) => <text key={`f${i}`} x={i * S + S - 12} y={8 * S - 5}>{'abcdefgh'[flipped ? 7 - i : i]}</text>)}
        </g>
      )}
    </svg>
  )
}
