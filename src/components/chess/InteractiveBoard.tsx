'use client'
// Click-to-move board. Legality comes from chess.js (only loaded on /chess/train).
import { useState } from 'react'
import type { Chess, Square } from 'chess.js'
import { Board } from './Board'

export function InteractiveBoard({ chess, flipped, onMove, disabled, lastMove }: {
  chess: Chess; flipped: boolean; onMove: (uci: string) => void; disabled?: boolean; lastMove?: string | null
}) {
  const [sel, setSel] = useState<Square | null>(null)
  const S = 100
  const files = 'abcdefgh'
  const squareAt = (e: React.MouseEvent<SVGSVGElement>): Square => {
    const rect = e.currentTarget.getBoundingClientRect()
    let f = Math.floor(((e.clientX - rect.left) / rect.width) * 8)
    let r = Math.floor(((e.clientY - rect.top) / rect.height) * 8)
    f = Math.max(0, Math.min(7, f)); r = Math.max(0, Math.min(7, r))
    if (flipped) { f = 7 - f; r = 7 - r }
    return `${files[f]}${8 - r}` as Square
  }
  const targets = sel ? chess.moves({ square: sel, verbose: true }).map((m) => m.to) : []
  const click = (e: React.MouseEvent<SVGSVGElement>) => {
    if (disabled) return
    const sq = squareAt(e)
    if (sel && targets.includes(sq)) {
      const mv = chess.moves({ square: sel, verbose: true }).find((m) => m.to === sq)!
      onMove(mv.from + mv.to + (mv.promotion ? 'q' : ''))
      setSel(null)
      return
    }
    const p = chess.get(sq)
    setSel(p && p.color === chess.turn() ? sq : null)
  }
  const idx = (sq: string) => { let f = files.indexOf(sq[0]); let r = 8 - Number(sq[1]); if (flipped) { f = 7 - f; r = 7 - r } return [f, r] }
  return (
    <div style={{ position: 'relative' }}>
      <svg viewBox="0 0 800 800" onClick={click} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', cursor: disabled ? 'default' : 'pointer', zIndex: 2 }} aria-hidden="true">
        {sel && (() => { const [f, r] = idx(sel); return <rect x={f * S} y={r * S} width={S} height={S} fill="rgba(201,168,76,0.35)" /> })()}
        {targets.map((t) => { const [f, r] = idx(t); return <circle key={t} cx={f * S + S / 2} cy={r * S + S / 2} r={14} fill="rgba(201,168,76,0.7)" /> })}
      </svg>
      <Board fen={chess.fen()} flipped={flipped} lastMove={lastMove} />
    </div>
  )
}
