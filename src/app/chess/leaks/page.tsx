import type { Metadata } from 'next'
import { ChessNav } from '@/components/chess/ChessNav'
import { ChessFooter } from '@/components/chess/ChessFooter'
import { Board } from '@/components/chess/Board'
import { GameLink, StatusPill } from '@/components/chess/shared'
import { getLeaks, getGameIndex } from '@/lib/chess/data'
import type { Leak } from '@/lib/chess/types'

export const metadata: Metadata = { title: 'Leaks' }

function trendText(l: Leak): string {
  const t = l.trend
  if (t.state === 'not_enough_data') return `trend: not enough data (${t.n_recent} recent / ${t.n_previous} prior)`
  const sign = t.change_pct != null && t.change_pct > 0 ? '+' : ''
  return `trend: ${t.state} (${sign}${t.change_pct}% vs previous 60 days, n ${t.n_recent}/${t.n_previous})`
}

export default function LeaksPage() {
  const data = getLeaks()
  const index = getGameIndex()
  const published = new Set(index.games.filter((g) => g.published).map((g) => g.id))
  if (!data) return <><ChessNav current="/chess/leaks" /><p style={{ marginTop: '2rem' }}>No leak data published yet.</p></>
  const list = data.leaks.slice(0, 20)
  return (
    <>
      <ChessNav current="/chess/leaks" />
      <header style={{ paddingBlock: 'clamp(2rem, 5vw, 3rem)' }}>
        <h1 className="text-heading" style={{ fontSize: 'clamp(2rem, 4vw, 3rem)' }}>Leaks</h1>
        <p className="prose" style={{ marginTop: '1rem' }}>
          Ranked by frequency × severity × recency over {data.pool_games} analysed games (weighted {data.pool_weighted}: over-the-board
          counts fully, blitz a fifth, bullet almost nothing). <b>Confirmed</b> needs 12 or more occurrences; <b>provisional</b> 5 to 11;
          fewer is a <b>watch</b>. Only confirmed leaks may drive more than a fifth of a week&apos;s training. Tactical motifs shown here passed
          validation against the Lichess puzzle database at 70% precision or better; the rest are tracked but hidden until they do.
        </p>
      </header>
      <div className="chess-grid">
        {list.map((l, i) => (
          <article key={l.tag} className="leak" id={l.tag.replace(':', '-')}>
            <div className="leak-head">
              <h2><span style={{ color: "var(--text-muted)", marginRight: "0.75rem" }}>{String(i + 1).padStart(2, "0")}</span>{l.description}</h2>
              <StatusPill status={l.status} />
            </div>
            <div className="leak-meta">
              <span><b>{l.frequency_per_100.toFixed(1)}</b> per 100 games (95% CI {l.rate_ci[0].toFixed(0)}–{l.rate_ci[1].toFixed(0)} of games)</span>
              <span>severity <b>{l.severity.toFixed(0)}%</b> win chance per occurrence</span>
              <span>n = <b>{l.n}</b> in {l.games_with} games (weighted {l.n_effective.toFixed(1)})</span>
              <span>score <b>{l.leak_score.toFixed(1)}</b></span>
              <span>{trendText(l)}</span>
            </div>
            {l.status !== 'confirmed' && (
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                {l.status === 'provisional'
                  ? 'Provisional: seen often enough to look at, not often enough to train against. It gets a small diagnostic allocation only.'
                  : 'Watch: too few observations to say anything. Listed so it can be tracked, not acted on.'}
              </p>
            )}
            <div className="leak-evidence">
              {l.evidence.filter((e) => e.fen).slice(0, 3).map((e, j) => (
                <figure key={j}>
                  <Board fen={e.fen!} size="mini" title={`Evidence position ${j + 1} for ${l.description}`} />
                  <figcaption>
                    <GameLink id={e.game_id} published={published.has(e.game_id)}>
                      {e.played_at.slice(0, 10)} · {e.speed}{e.ply >= 0 ? ` · move ${Math.floor(e.ply / 2) + 1}` : ''}
                    </GameLink>
                    <br />
                    {e.played ? <>played <span className="font-mono">{e.played}</span>, best <span className="font-mono">{e.best}</span>, </> : null}
                    −{e.win_lost.toFixed(0)}%{e.detail ? ` · ${e.detail}` : ''}
                  </figcaption>
                </figure>
              ))}
            </div>
            <details>
              <summary style={{ cursor: 'pointer', fontSize: '0.85rem', color: 'var(--text-muted)' }}>All {l.evidence.length} strongest examples</summary>
              <ul style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.5rem', paddingLeft: '1.25rem' }}>
                {l.evidence.map((e, j) => (
                  <li key={j}>
                    <GameLink id={e.game_id} published={published.has(e.game_id)}>{e.game_id}</GameLink>
                    {e.ply >= 0 ? ` ply ${e.ply}` : ''} · −{e.win_lost.toFixed(0)}%{e.url ? <> · <a href={e.url} rel="noopener">source</a></> : null}
                  </li>
                ))}
              </ul>
            </details>
          </article>
        ))}
      </div>
      <ChessFooter generatedAt={data.generated_at} />
    </>
  )
}
