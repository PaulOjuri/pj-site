'use client'
// Interactive game viewer: board, move list with classification badges, eval graph.
// Keyboard: ← → step, Home/End jump, ↑ ↓ jump between errors. All positions are precomputed
// (one FEN per ply) so no chess library ships to the browser.
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Board } from './Board'
import { EvalGraph } from './EvalGraph'
import type { GameOut, MoveOut } from '@/lib/chess/types'

const START = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1'
const BADGE: Record<MoveOut['c'], string> = { best: '', good: '', inaccuracy: '?!', mistake: '?', blunder: '??' }

function fmtEval(cp: number, whitePov: boolean): string {
  const v = whitePov ? cp : -cp
  if (Math.abs(v) >= 90000) return (v > 0 ? '+M' : '−M') + (100000 - Math.abs(v))
  return (v >= 0 ? '+' : '−') + (Math.abs(v) / 100).toFixed(2)
}

export function GameViewer({ game }: { game: GameOut }) {
  const { moves, meta, motifs } = game
  const [ply, setPly] = useState<number>(-1) // -1 = start position
  const flipped = meta.color === 'black'
  const errorPlies = useMemo(() => moves.filter((m) => m.c === 'blunder' || m.c === 'mistake').map((m) => m.p), [moves])
  const fen = ply < 0 ? START : moves[ply].f
  const last = ply < 0 ? null : moves[ply].u
  const motifsHere = motifs.filter((h) => h.ply === ply)

  const go = useCallback((p: number) => setPly(Math.max(-1, Math.min(moves.length - 1, p))), [moves.length])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return
      if (e.key === 'ArrowRight') { go(ply + 1); e.preventDefault() }
      else if (e.key === 'ArrowLeft') { go(ply - 1); e.preventDefault() }
      else if (e.key === 'Home') { go(-1); e.preventDefault() }
      else if (e.key === 'End') { go(moves.length - 1); e.preventDefault() }
      else if (e.key === 'ArrowDown') { const nx = errorPlies.find((p) => p > ply); if (nx !== undefined) go(nx); e.preventDefault() }
      else if (e.key === 'ArrowUp') { const pv = [...errorPlies].reverse().find((p) => p < ply); if (pv !== undefined) go(pv); e.preventDefault() }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [ply, go, errorPlies, moves.length])

  const cur = ply >= 0 ? moves[ply] : null
  const rows: MoveOut[][] = []
  for (let i = 0; i < moves.length; i += 2) rows.push(moves.slice(i, i + 2))

  return (
    <div className="chess-grid chess-grid-2" style={{ alignItems: 'start' }}>
      <div>
        <Board fen={fen} lastMove={last} flipped={flipped} />
        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem', flexWrap: 'wrap' }} role="group" aria-label="Move navigation">
          {[['⇤', -1, 'Start'], ['←', ply - 1, 'Previous move'], ['→', ply + 1, 'Next move'], ['⇥', moves.length - 1, 'End']].map(([t, p, label]) => (
            <button key={String(label)} onClick={() => go(Number(p))} aria-label={String(label)} className="font-mono"
              style={{ border: '1px solid var(--line-strong)', background: 'transparent', color: 'var(--text)', padding: '0.4rem 0.8rem', borderRadius: 2, cursor: 'pointer' }}>
              {t}
            </button>
          ))}
          <span className="label-caps" style={{ alignSelf: 'center', color: 'var(--text-muted)' }}>← → keys · ↑ ↓ jump errors</span>
        </div>
        <div style={{ marginTop: '1rem' }}>
          <EvalGraph moves={moves} current={ply} onSelect={go} />
        </div>
      </div>
      <div>
        <div aria-live="polite" style={{ minHeight: '5.5rem', marginBottom: '1rem', fontSize: '0.95rem', color: 'var(--text-muted)' }}>
          {cur ? (
            <>
              <div>
                <span className="font-mono" style={{ color: 'var(--text)' }}>{Math.floor(cur.p / 2) + 1}{cur.p % 2 ? '…' : '.'} {cur.s}</span>
                {cur.c !== 'best' && cur.c !== 'good' && <span className={`cls-${cur.c}`}> {cur.c}, −{cur.wl.toFixed(0)}% win chance</span>}
                <span className="font-mono" style={{ marginLeft: '0.75rem', color: 'var(--text-muted)' }}>eval {fmtEval(cur.ea, cur.p % 2 === 0)}</span>
              </div>
              {cur.b && cur.c !== 'best' && <div>Engine preferred <span className="font-mono" style={{ color: 'var(--text)' }}>{cur.b}</span>{cur.pv.length > 1 ? ` (${cur.pv.slice(0, 5).join(' ')})` : ''}</div>}
              {cur.t != null && <div style={{ fontSize: '0.85rem' }}>Thought {cur.t}s{cur.k != null ? `, ${Math.round(cur.k)}s left` : ''}{cur.om ? ' · only move' : ''}{cur.cr ? ' · critical position' : ''}</div>}
              {motifsHere.map((h, i) => (
                <div key={i} style={{ fontSize: '0.85rem', color: 'var(--accent)' }}>
                  {h.attribution.replace(/_/g, ' ')}: {h.motif.replace(/_/g, ' ')}{h.detail ? ` — ${h.detail}` : ''}
                </div>
              ))}
            </>
          ) : (
            <div>Starting position. Use the arrow keys or click a move.</div>
          )}
        </div>
        <div className="moves" role="list" aria-label="Moves">
          {rows.map((pair, i) => (
            <div key={i} style={{ display: 'contents' }} role="listitem">
              <span className="mv-no">{i + 1}.</span>
              {pair.map((m) => (
                <button key={m.p} onClick={() => go(m.p)} aria-current={m.p === ply ? 'true' : undefined}>
                  {m.s}
                  {BADGE[m.c] && <span className={`badge cls-${m.c}`}>{BADGE[m.c]}</span>}
                </button>
              ))}
              {pair.length === 1 && <span />}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
