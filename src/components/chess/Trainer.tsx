'use client'
// Drill runner (spec §8.5, §10.1 /chess/train). Three modes:
//   solve      puzzle / own-game position: make the moves; the solution's replies auto-play
//   calculate  no board movement: write the variation, reveal, self-grade (judgment calibration)
//   playout    endgame vs Stockfish from your own failed conversion, from the entry position
// Results post to /api/chess/drill/result with the write-back token and are mirrored to localStorage.
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Chess } from 'chess.js'
import { Engine } from '@/lib/chess/engine'
import { postJson } from '@/lib/chess/token'
import type { DrillItem, TrainData } from '@/lib/chess/types'
import { InteractiveBoard } from './InteractiveBoard'
import { TokenBox } from './TokenBox'

type Mode = 'solve' | 'calculate' | 'playout'
interface Item { id: string; kind: string; mode: Mode; item: DrillItem; session?: string; label: string }

function buildQueue(d: TrainData): Item[] {
  const q: Item[] = []
  for (const c of d.due_cards) q.push({ id: c.id, kind: c.kind, mode: c.id.startsWith('calc:') ? 'calculate' : 'solve', item: c.payload, label: `due card (${c.kind.replace('_', ' ')})` })
  for (const s of d.sessions) {
    const a = s.assets as Record<string, DrillItem[] | undefined>
    for (const p of a.puzzles ?? []) q.push({ id: p.id, kind: 'puzzle', mode: 'solve', item: p, session: s.id, label: s.title })
    for (const p of a.own_positions ?? []) q.push({ id: p.id, kind: 'leak_position', mode: 'solve', item: p, session: s.id, label: s.title })
    for (const p of a.calculation ?? []) q.push({ id: p.id, kind: 'calculation', mode: 'calculate', item: p, session: s.id, label: s.title })
    for (const p of a.endgame_drills ?? []) q.push({ id: p.id, kind: 'endgame', mode: 'playout', item: p, session: s.id, label: s.title })
  }
  const seen = new Set<string>()
  return q.filter((x) => (seen.has(x.id) ? false : (seen.add(x.id), true)))
}

function turnOf(fen: string): 'white' | 'black' { return fen.split(' ')[1] === 'w' ? 'white' : 'black' }

const btn: React.CSSProperties = { border: '1px solid var(--line-strong)', background: 'transparent', color: 'var(--text)', padding: '0.5rem 0.9rem', borderRadius: 2, cursor: 'pointer', font: 'inherit', fontSize: '0.85rem' }

export function Trainer({ data }: { data: TrainData }) {
  const queue = useMemo(() => buildQueue(data), [data])
  const [i, setI] = useState(0)
  const [done, setDone] = useState<Record<string, { grade: number; correct: boolean }>>({})
  const [engine, setEngine] = useState<Engine | null>(null)
  const [engineMode, setEngineMode] = useState<string>('loading')
  useEffect(() => {
    const e = new Engine()
    e.init().then(() => { setEngine(e); setEngineMode(`${e.mode === 'multi' ? 'multi-threaded' : 'single-threaded'} · ${e.name}`) }).catch(() => setEngineMode('unavailable'))
    return () => e.quit()
  }, [])
  useEffect(() => { try { const s = localStorage.getItem('chess_drills'); if (s) setDone(JSON.parse(s)) } catch { /* ignore */ } }, [])

  const record = useCallback(async (it: Item, grade: number, correct: boolean, elapsed_ms: number, detail?: unknown) => {
    const next = { ...done, [it.id]: { grade, correct } }
    setDone(next)
    try { localStorage.setItem('chess_drills', JSON.stringify(next)) } catch { /* ignore */ }
    await postJson('/api/chess/drill/result', { card_id: it.id, kind: it.kind, grade, correct, elapsed_ms, session_id: it.session, detail })
  }, [done])

  const cur = queue[i]
  const remaining = queue.filter((q) => !done[q.id]).length
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', alignItems: 'center', marginBottom: '1rem' }}>
        <p className="label-caps" style={{ color: 'var(--text-muted)' }}>{queue.length} items · {remaining} left · engine: {engineMode}</p>
        <TokenBox />
      </div>
      {!cur && <p style={{ color: 'var(--text-muted)' }}>Nothing queued. Run the weekly plan to generate drills.</p>}
      {cur && (
        <div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
            {i + 1}/{queue.length} · {cur.label}{cur.item.tag ? ` · ${cur.item.tag}` : ''}{cur.item.rating ? ` · puzzle ${cur.item.rating}` : ''}
            {cur.item.game_id ? <> · <a className="link-accent" href={`/chess/games/${cur.item.game_id.replace(':', '_')}`}>from your game</a></> : null}
            {done[cur.id] ? ` · done (grade ${done[cur.id].grade})` : ''}
          </p>
          {cur.mode === 'solve' && <Solve key={cur.id} it={cur} onDone={(g, c, ms, d) => record(cur, g, c, ms, d)} />}
          {cur.mode === 'calculate' && <Calculate key={cur.id} it={cur} onDone={(g, c, ms, d) => record(cur, g, c, ms, d)} />}
          {cur.mode === 'playout' && <Playout key={cur.id} it={cur} engine={engine} onDone={(g, c, ms, d) => record(cur, g, c, ms, d)} />}
          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
            <button style={btn} onClick={() => setI(Math.max(0, i - 1))}>← previous</button>
            <button style={btn} onClick={() => setI(Math.min(queue.length - 1, i + 1))}>next →</button>
            <button style={btn} onClick={() => { const n = queue.findIndex((q, j) => j > i && !done[q.id]); if (n >= 0) setI(n) }}>next undone</button>
          </div>
        </div>
      )}
    </div>
  )
}

type OnDone = (grade: number, correct: boolean, elapsed_ms: number, detail?: unknown) => void

function MoveInput({ chess, onMove, disabled }: { chess: Chess; onMove: (uci: string) => void; disabled?: boolean }) {
  // Keyboard alternative to clicking the board: type a move in SAN or UCI.
  const [v, setV] = useState('')
  const [err, setErr] = useState('')
  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    const t = v.trim()
    if (!t) return
    try {
      const probe = new Chess(chess.fen())
      const m = probe.move(t) ?? null
      if (!m) throw new Error('illegal')
      onMove(m.from + m.to + (m.promotion ?? ''))
      setV(''); setErr('')
    } catch { setErr('Not a legal move here.') }
  }
  return (
    <form onSubmit={submit} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginTop: '0.5rem', flexWrap: 'wrap' }}>
      <label htmlFor="move-input" className="label-caps" style={{ color: 'var(--text-muted)' }}>Type a move</label>
      <input id="move-input" value={v} onChange={(e) => setV(e.target.value)} disabled={disabled} placeholder="Nf3 or g1f3" autoComplete="off"
        style={{ background: 'var(--bg-inset)', border: '1px solid var(--line-strong)', color: 'var(--text)', padding: '0.4rem 0.6rem', borderRadius: 2, width: 120, font: 'inherit' }} />
      <button type="submit" style={btn} disabled={disabled}>play</button>
      {err && <span role="alert" style={{ fontSize: '0.8rem', color: '#d08a7a' }}>{err}</span>}
    </form>
  )
}

function Solve({ it, onDone }: { it: Item; onDone: OnDone }) {
  const solution = it.item.solution ?? []
  const [chess] = useState(() => new Chess(it.item.fen))
  const [, force] = useState(0)
  const [step, setStep] = useState(0)
  const [state, setState] = useState<'playing' | 'wrong' | 'solved' | 'revealed'>('playing')
  const [last, setLast] = useState<string | null>(null)
  const t0 = useRef(Date.now())
  const me = turnOf(it.item.fen)
  const mistakes = useRef(0)
  const finish = (ok: boolean) => {
    const ms = Date.now() - t0.current
    const grade = !ok ? 1 : mistakes.current > 0 ? 2 : ms < 15000 ? 4 : 3
    onDone(grade, ok, ms, { mistakes: mistakes.current })
  }
  const onMove = (uci: string) => {
    if (state !== 'playing') return
    const expected = solution[step]
    if (uci !== expected && !(expected && uci.slice(0, 4) === expected.slice(0, 4))) {
      mistakes.current += 1
      setState('wrong')
      return
    }
    chess.move({ from: uci.slice(0, 2), to: uci.slice(2, 4), promotion: uci[4] as 'q' | undefined })
    setLast(uci)
    let s = step + 1
    if (s < solution.length) {
      const reply = solution[s]
      chess.move({ from: reply.slice(0, 2), to: reply.slice(2, 4), promotion: reply[4] as 'q' | undefined })
      setLast(reply); s += 1
    }
    setStep(s); force((x) => x + 1)
    if (s >= solution.length) { setState('solved'); finish(true) }
  }
  const reveal = () => {
    for (let s = step; s < solution.length; s++) { const m = solution[s]; try { chess.move({ from: m.slice(0, 2), to: m.slice(2, 4), promotion: m[4] as 'q' | undefined }) } catch { break } }
    setLast(solution[solution.length - 1] ?? null); setState('revealed'); force((x) => x + 1); finish(false)
  }
  return (
    <div className="chess-grid chess-grid-2" style={{ alignItems: 'start' }}>
      <div>
        <InteractiveBoard chess={chess} flipped={me === 'black'} onMove={onMove} disabled={state !== 'playing' && state !== 'wrong'} lastMove={last} />
        <MoveInput chess={chess} onMove={onMove} disabled={state !== 'playing' && state !== 'wrong'} />
      </div>
      <div>
        <p style={{ color: 'var(--text)', marginBottom: '0.5rem' }}>{it.item.prompt ?? `${me === 'white' ? 'White' : 'Black'} to move. Find the best continuation.`}</p>
        <div role="status" aria-live="polite">
        {state === 'wrong' && <p className="cls-blunder" style={{ marginBottom: '0.5rem' }}>Not that. Try again, or reveal.</p>}
        {state === 'solved' && <p className="cls-best" style={{ marginBottom: '0.5rem' }}>Solved{mistakes.current ? ` with ${mistakes.current} wrong tries` : ' first time'}.</p>}
        {state === 'revealed' && <p style={{ color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Solution: <span className="font-mono">{solution.join(' ')}</span></p>}
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {(state === 'playing' || state === 'wrong') && <button style={btn} onClick={() => setState('playing')} disabled={state === 'playing'}>keep trying</button>}
          {(state === 'playing' || state === 'wrong') && <button style={btn} onClick={reveal}>reveal solution</button>}
          {it.item.url && <a style={{ ...btn, textDecoration: 'none', display: 'inline-block' }} href={it.item.url} rel="noopener">open source</a>}
        </div>
        {it.item.themes && <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.75rem' }}>{state === 'playing' ? 'themes hidden until solved' : it.item.themes.join(' · ')}</p>}
      </div>
    </div>
  )
}

function Calculate({ it, onDone }: { it: Item; onDone: OnDone }) {
  const [text, setText] = useState('')
  const [revealed, setRevealed] = useState(false)
  const t0 = useRef(Date.now())
  const me = turnOf(it.item.fen)
  const chess = useMemo(() => new Chess(it.item.fen), [it.item.fen])
  const sanLine = useMemo(() => { const c = new Chess(it.item.fen); const out: string[] = []; for (const u of it.item.solution ?? []) { try { out.push(c.move({ from: u.slice(0, 2), to: u.slice(2, 4), promotion: u[4] as 'q' | undefined }).san) } catch { break } } return out }, [it.item])
  return (
    <div className="chess-grid chess-grid-2" style={{ alignItems: 'start' }}>
      <InteractiveBoard chess={chess} flipped={me === 'black'} onMove={() => undefined} disabled />
      <div>
        <p style={{ color: 'var(--text)', marginBottom: '0.5rem' }}>{me === 'white' ? 'White' : 'Black'} to move. This was an only-move position{it.item.gap_cp ? ` (second best is ${(it.item.gap_cp / 100).toFixed(1)} worse)` : ''}. No board movement: write the full variation, then reveal.</p>
        <textarea value={text} onChange={(e) => setText(e.target.value)} rows={5} placeholder="1. ... " aria-label="Your variation" disabled={revealed}
          style={{ width: '100%', background: 'var(--bg-inset)', border: '1px solid var(--line-strong)', color: 'var(--text)', padding: '0.6rem', borderRadius: 2, fontFamily: 'var(--font-mono-stack)', fontSize: '0.9rem' }} />
        {!revealed && <button style={{ ...btn, marginTop: '0.5rem' }} onClick={() => setRevealed(true)} disabled={text.trim().length < 2}>reveal engine line</button>}
        {revealed && (
          <div style={{ marginTop: '0.75rem' }}>
            <p style={{ color: 'var(--text-muted)' }}>Engine: <span className="font-mono" style={{ color: 'var(--text)' }}>{sanLine.join(' ')}</span>{it.item.found_in_game === false ? ' · you did not find this in the game' : it.item.found_in_game ? ' · you found it in the game' : ''}</p>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '0.5rem 0' }}>Grade yourself honestly. This feeds judgment_calibration.</p>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {[[1, 'missed it'], [2, 'first move only'], [3, 'main line'], [4, 'line + why']].map(([g, l]) => (
                <button key={g} style={btn} onClick={() => onDone(Number(g), Number(g) >= 3, Date.now() - t0.current, { written: text })}>{l}</button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function Playout({ it, engine, onDone }: { it: Item; engine: Engine | null; onDone: OnDone }) {
  const [chess] = useState(() => new Chess(it.item.fen))
  const [, force] = useState(0)
  const [thinking, setThinking] = useState(false)
  const [last, setLast] = useState<string | null>(null)
  const [over, setOver] = useState<string | null>(null)
  const me = it.item.color ?? turnOf(it.item.fen)
  const t0 = useRef(Date.now())
  const goal = it.item.goal ?? 'win'
  const engineTurn = useCallback(async () => {
    if (!engine || chess.isGameOver()) return
    setThinking(true)
    const { move } = await engine.bestMove(chess.fen(), 16)
    if (move && move !== '(none)') { chess.move({ from: move.slice(0, 2), to: move.slice(2, 4), promotion: move[4] as 'q' | undefined }); setLast(move) }
    setThinking(false); force((x) => x + 1)
    check()
  }, [engine, chess])
  const result = () => chess.isCheckmate() ? (chess.turn() === (me === 'white' ? 'w' : 'b') ? 'loss' : 'win') : chess.isDraw() ? 'draw' : null
  const check = () => { const r = result(); if (r) finish(r) }
  const finish = (r: string) => {
    setOver(r)
    const ok = goal === 'win' ? r === 'win' : r !== 'loss'
    onDone(ok ? 3 : 1, ok, Date.now() - t0.current, { result: r, goal, signature: it.item.signature })
  }
  useEffect(() => { if (turnOf(chess.fen()) !== me && engine && !over) engineTurn() }, [engine]) // eslint-disable-line react-hooks/exhaustive-deps
  const onMove = (uci: string) => {
    if (over || thinking) return
    chess.move({ from: uci.slice(0, 2), to: uci.slice(2, 4), promotion: uci[4] as 'q' | undefined }); setLast(uci); force((x) => x + 1)
    const r = result(); if (r) { finish(r); return }
    engineTurn()
  }
  return (
    <div className="chess-grid chess-grid-2" style={{ alignItems: 'start' }}>
      <div>
        <InteractiveBoard chess={chess} flipped={me === 'black'} onMove={onMove} disabled={Boolean(over) || thinking || !engine} lastMove={last} />
        <MoveInput chess={chess} onMove={onMove} disabled={Boolean(over) || thinking || !engine} />
      </div>
      <div>
        <p style={{ color: 'var(--text)', marginBottom: '0.5rem' }}>
          {it.item.signature} · you are {me} · goal: <b>{goal === 'win' ? 'win it' : 'hold the draw'}</b>{it.item.eval_at_entry != null ? ` (engine said ${(it.item.eval_at_entry / 100).toFixed(1)} at entry)` : ''}.
        </p>
        <p role="status" aria-live="polite" style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{!engine ? 'Engine loading…' : thinking ? 'Engine thinking…' : over ? `Game over: ${over}.` : 'Your move. Stockfish lite replies at depth 16.'}</p>
        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem', flexWrap: 'wrap' }}>
          {!over && <button style={btn} onClick={() => finish(goal === 'win' ? 'draw' : 'loss')}>give up</button>}
          {!over && <button style={btn} onClick={() => finish('draw')} disabled={goal === 'win'}>claim draw</button>}
          {it.item.url && <a style={{ ...btn, textDecoration: 'none', display: 'inline-block' }} href={it.item.url} rel="noopener">original game</a>}
        </div>
        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '1rem' }}>Stockfish is GPL-3.0; the engine files served here are unmodified builds from the stockfish npm package (source: github.com/official-stockfish/Stockfish).</p>
      </div>
    </div>
  )
}
