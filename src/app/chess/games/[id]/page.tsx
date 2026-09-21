import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { ChessNav } from '@/components/chess/ChessNav'
import { ChessFooter } from '@/components/chess/ChessFooter'
import { GameViewer } from '@/components/chess/GameViewer'
import { Board } from '@/components/chess/Board'
import { getGame, publishedGameIds, slugify, unslug } from '@/lib/chess/data'

export const dynamicParams = false

export function generateStaticParams() {
  return publishedGameIds().map((id) => ({ id: slugify(id) }))
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params
  const g = getGame(unslug(id))
  if (!g) return { title: 'Game' }
  return { title: `${g.meta.white.name} – ${g.meta.black.name}, ${g.meta.played_at.slice(0, 10)}` }
}

export default async function GamePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const g = getGame(unslug(id))
  if (!g) notFound()
  const me = g.meta.color
  const myCounts = g.analysis.counts[me]
  const oppCounts = g.analysis.counts[me === 'white' ? 'black' : 'white']
  const errors = g.moves.filter((m) => (m.c === 'blunder' || m.c === 'mistake') && (m.p % 2 === 0) === (me === 'white'))
  const lastFen = g.moves.length ? g.moves[g.moves.length - 1].f : undefined
  return (
    <>
      <ChessNav current="/chess/games" />
      <header style={{ paddingBlock: 'clamp(2rem, 5vw, 3rem)' }}>
        <p className="label-caps" style={{ color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
          {g.meta.played_at.slice(0, 10)} · {g.meta.speed} {g.meta.time_control ?? ''} · {g.meta.source}{g.meta.fide_rated ? ' · FIDE rated' : ''}{g.meta.event ? ` · ${g.meta.event}` : ''}
        </p>
        <h1 className="text-heading" style={{ fontSize: 'clamp(1.75rem, 3.5vw, 2.75rem)' }}>
          {g.meta.white.name} ({g.meta.white.rating ?? '?'}) – {g.meta.black.name} ({g.meta.black.rating ?? '?'})
        </h1>
        <p style={{ color: 'var(--text-muted)', marginTop: '0.75rem' }}>
          {g.meta.opening ?? g.meta.eco ?? ''}{g.meta.opening && g.meta.eco ? ` (${g.meta.eco})` : ''} · result {g.meta.result} for me as {me}
          {g.meta.termination ? ` · ${g.meta.termination}` : ''}{g.meta.url ? <> · <a className="link-accent" href={g.meta.url} rel="noopener">source</a></> : null}
        </p>
      </header>

      <section className="chess-grid chess-grid-4" style={{ marginBottom: '2rem' }}>
        <div className="chess-card stat"><span className="label-caps">My accuracy</span><span className="stat-value">{g.analysis.accuracy[me]?.toFixed(0) ?? '—'}</span><span className="stat-note">opponent {g.analysis.accuracy[me === 'white' ? 'black' : 'white']?.toFixed(0) ?? '—'}</span></div>
        <div className="chess-card stat"><span className="label-caps">My ACPL</span><span className="stat-value">{g.analysis.acpl[me]?.toFixed(0) ?? '—'}</span><span className="stat-note">capped centipawn loss</span></div>
        <div className="chess-card stat"><span className="label-caps">My errors</span><span className="stat-value">{myCounts.blunder}<span style={{ fontSize: '1rem', color: 'var(--text-muted)' }}> ??</span> {myCounts.mistake}<span style={{ fontSize: '1rem', color: 'var(--text-muted)' }}> ?</span></span><span className="stat-note">{myCounts.inaccuracy} inaccuracies</span></div>
        <div className="chess-card stat"><span className="label-caps">Opponent errors</span><span className="stat-value">{oppCounts.blunder}<span style={{ fontSize: '1rem', color: 'var(--text-muted)' }}> ??</span> {oppCounts.mistake}<span style={{ fontSize: '1rem', color: 'var(--text-muted)' }}> ?</span></span><span className="stat-note">{oppCounts.inaccuracy} inaccuracies</span></div>
      </section>

      <GameViewer game={g} />

      <noscript>
        <div style={{ marginTop: '2rem' }}>
          {lastFen && <Board fen={lastFen} flipped={me === 'black'} title="Final position" />}
          <p className="font-mono" style={{ marginTop: '1rem', fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: 1.8 }}>
            {g.moves.map((m) => (m.p % 2 === 0 ? `${m.p / 2 + 1}. ` : '') + m.s + (m.c === 'blunder' ? '?? ' : m.c === 'mistake' ? '? ' : m.c === 'inaccuracy' ? '?! ' : ' ')).join('')}
          </p>
        </div>
      </noscript>

      {errors.length > 0 && (
        <section style={{ marginTop: '3rem' }}>
          <h2 className="label-caps" style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>Where it went wrong</h2>
          <div className="chess-grid chess-grid-3">
            {errors.map((m) => {
              const before = m.p === 0 ? 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1' : g.moves[m.p - 1].f
              const hits = g.motifs.filter((h) => h.ply === m.p)
              return (
                <figure key={m.p} className="chess-card" style={{ margin: 0 }}>
                  <Board fen={before} flipped={me === 'black'} size="mini" title={`Position before move ${Math.floor(m.p / 2) + 1}`} />
                  <figcaption style={{ marginTop: '0.75rem', fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
                    <b style={{ color: 'var(--text)' }}>{Math.floor(m.p / 2) + 1}{m.p % 2 ? '…' : '.'} {m.s}</b> <span className={`cls-${m.c}`}>{m.c}</span>, −{m.wl.toFixed(0)}% ·
                    best <span className="font-mono">{m.b}</span>{m.pv.length > 1 ? ` ${m.pv.slice(1, 5).join(' ')}` : ''}
                    {hits.map((h, i) => <div key={i} style={{ color: 'var(--accent)' }}>{h.attribution.replace(/_/g, ' ')}: {h.motif.replace(/_/g, ' ')}</div>)}
                    {m.t != null && <div>thought {m.t}s{m.k != null ? `, ${Math.round(m.k)}s left` : ''}</div>}
                  </figcaption>
                </figure>
              )
            })}
          </div>
        </section>
      )}
      <ChessFooter />
    </>
  )
}
