'use client'
// OTB game entry (spec §6.4). Posts PGN + metadata to /api/chess/log/game with the write-back
// token; the nightly sync writes it into chess-coach/data/otb/ where it is ingested as
// source=otb, fide_rated per the checkbox, and analysed at maximum depth.
import { useState } from 'react'
import { postJson } from '@/lib/chess/token'
import { TokenBox } from './TokenBox'

const field: React.CSSProperties = { width: '100%', background: 'var(--bg-inset)', border: '1px solid var(--line-strong)', color: 'var(--text)', padding: '0.5rem 0.6rem', borderRadius: 2, font: 'inherit', fontSize: '0.9rem' }
const label: React.CSSProperties = { display: 'block', fontSize: '0.75rem', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.3rem', fontFamily: 'var(--font-mono-stack)' }

export function LogForm() {
  const [pgn, setPgn] = useState('')
  const [meta, setMeta] = useState({ event: '', date: '', round: '', opponent: '', opponent_rating: '', color: 'white', time_control: '90+30', result: '1-0', fide_rated: true, note: '' })
  const [status, setStatus] = useState<string>('')
  const set = (k: string, v: string | boolean) => setMeta((m) => ({ ...m, [k]: v }))
  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (pgn.trim().length < 20) { setStatus('Paste the PGN first.'); return }
    setStatus('Saving…')
    const r = await postJson('/api/chess/log/game', { pgn, meta: { ...meta, opponent_rating: meta.opponent_rating ? Number(meta.opponent_rating) : null, submitted_at: new Date().toISOString() } })
    setStatus(r.ok ? 'Saved. It will be ingested and analysed on the next pipeline run.' : r.status === 401 || r.status === 0 ? 'Needs the write-back token (below).' : `Failed (${r.status}).`)
    if (r.ok) setPgn('')
  }
  return (
    <form onSubmit={submit} className="chess-grid" style={{ maxWidth: 760 }} aria-describedby="log-status">
      <div>
        <label htmlFor="pgn" style={label}>PGN</label>
        <textarea id="pgn" value={pgn} onChange={(e) => setPgn(e.target.value)} rows={12} required style={{ ...field, fontFamily: 'var(--font-mono-stack)' }}
          placeholder={'[Event "..."]\n[White "Ojuri, Paul"]\n...\n1. e4 e5 ...'} />
      </div>
      <div className="chess-grid chess-grid-3">
        <div><label htmlFor="event" style={label}>Event</label><input id="event" style={field} value={meta.event} onChange={(e) => set('event', e.target.value)} /></div>
        <div><label htmlFor="date" style={label}>Date</label><input id="date" type="date" style={field} value={meta.date} onChange={(e) => set('date', e.target.value)} /></div>
        <div><label htmlFor="round" style={label}>Round</label><input id="round" style={field} value={meta.round} onChange={(e) => set('round', e.target.value)} /></div>
        <div><label htmlFor="opp" style={label}>Opponent</label><input id="opp" style={field} value={meta.opponent} onChange={(e) => set('opponent', e.target.value)} /></div>
        <div><label htmlFor="opprating" style={label}>Opponent rating</label><input id="opprating" type="number" inputMode="numeric" style={field} value={meta.opponent_rating} onChange={(e) => set('opponent_rating', e.target.value)} /></div>
        <div><label htmlFor="tc" style={label}>Time control</label><input id="tc" style={field} value={meta.time_control} onChange={(e) => set('time_control', e.target.value)} placeholder="90+30" /></div>
        <div><label htmlFor="color" style={label}>My colour</label><select id="color" style={field} value={meta.color} onChange={(e) => set('color', e.target.value)}><option value="white">white</option><option value="black">black</option></select></div>
        <div><label htmlFor="result" style={label}>Result</label><select id="result" style={field} value={meta.result} onChange={(e) => set('result', e.target.value)}><option>1-0</option><option>0-1</option><option>1/2-1/2</option></select></div>
        <div style={{ alignSelf: 'end' }}><label style={{ display: 'inline-flex', gap: '0.5rem', alignItems: 'center', color: 'var(--text-muted)', fontSize: '0.9rem' }}><input type="checkbox" checked={meta.fide_rated} onChange={(e) => set('fide_rated', e.target.checked)} /> FIDE rated</label></div>
      </div>
      <div>
        <label htmlFor="note" style={label}>How the game felt (private, never published)</label>
        <textarea id="note" value={meta.note} onChange={(e) => set('note', e.target.value)} rows={3} style={field} />
      </div>
      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
        <button type="submit" className="font-mono" style={{ border: '1px solid var(--accent)', background: 'transparent', color: 'var(--accent)', padding: '0.6rem 1.2rem', borderRadius: 2, cursor: 'pointer' }}>Save game</button>
        <span id="log-status" role="status" style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{status}</span>
      </div>
      <TokenBox />
    </form>
  )
}
