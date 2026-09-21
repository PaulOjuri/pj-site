import Link from 'next/link'
import { ChessNav } from '@/components/chess/ChessNav'
import { ChessFooter } from '@/components/chess/ChessFooter'
import { ResultBadge, GameLink, StatusPill, fmtDate } from '@/components/chess/shared'
import { getSummary, getLeaks } from '@/lib/chess/data'

export default function ChessOverview() {
  const s = getSummary()
  const leaks = getLeaks()
  if (!s) {
    return (
      <>
        <ChessNav current="/chess" />
        <p style={{ marginTop: '2rem', color: 'var(--text-muted)' }}>No published data yet. Run <code>coach publish</code>.</p>
      </>
    )
  }
  const cc = s.online.chesscom?.ratings ?? {}
  const li = s.online.lichess?.ratings ?? {}
  const confirmed = (leaks?.leaks ?? []).filter((l) => l.status === 'confirmed').slice(0, 3)
  return (
    <>
      <ChessNav current="/chess" />
      <header style={{ paddingBlock: 'clamp(2rem, 5vw, 4rem)' }}>
        <p className="label-caps" style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>Chess · FIDE {s.player.fide_id} · {s.player.federation}</p>
        <h1 className="text-heading" style={{ fontSize: 'clamp(2.25rem, 5vw, 4rem)' }}>A coach that has to show its work.</h1>
        <p className="prose" style={{ marginTop: '1.25rem' }}>
          Every game I play online or over the board goes through Stockfish, gets tagged for what went wrong, and feeds a ranked
          list of weaknesses with sample sizes and confidence. The plan changes when the evidence does. Target: a FIDE title.
        </p>
      </header>

      {s.warnings.length > 0 && (
        <div className="chess-grid" style={{ marginBottom: '2rem' }}>
          {s.warnings.map((w) => <div key={w} className="chess-warning">{w}</div>)}
        </div>
      )}

      <section className="chess-grid chess-grid-4" aria-label="Ratings">
        <div className="chess-card stat">
          <span className="label-caps">FIDE standard</span>
          <span className="stat-value">{s.fide.standard ?? '—'}</span>
          <span className="stat-note">{s.fide.standard_inactive ? 'flagged inactive' : 'active'} · as of {s.fide.as_of}</span>
        </div>
        <div className="chess-card stat">
          <span className="label-caps">FIDE blitz</span>
          <span className="stat-value">{s.fide.blitz ?? '—'}</span>
          <span className="stat-note">{s.fide.blitz_inactive ? 'flagged inactive' : 'active'} · rapid {s.fide.rapid ?? 'unrated'}</span>
        </div>
        <div className="chess-card stat">
          <span className="label-caps">Chess.com</span>
          <span className="stat-value">{cc.rapid?.rating ?? '—'}<span style={{ fontSize: '1rem', color: 'var(--text-muted)' }}> rapid</span></span>
          <span className="stat-note">blitz {cc.blitz?.rating ?? '—'} · bullet {cc.bullet?.rating ?? '—'}</span>
        </div>
        <div className="chess-card stat">
          <span className="label-caps">Lichess</span>
          <span className="stat-value">{li.blitz?.rating ?? '—'}<span style={{ fontSize: '1rem', color: 'var(--text-muted)' }}> blitz</span></span>
          <span className="stat-note">bullet {li.bullet?.rating ?? '—'} · puzzles {li.puzzle?.rating ?? '—'}</span>
        </div>
      </section>

      <section style={{ marginTop: '3rem' }} className="chess-grid chess-grid-2">
        <div>
          <h2 className="label-caps" style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>Current focus</h2>
          {confirmed.length === 0 && <p style={{ color: 'var(--text-muted)' }}>No confirmed leaks yet; the pool is still being analysed.</p>}
          <div className="chess-grid">
            {confirmed.map((l) => (
              <div key={l.tag} className="chess-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', alignItems: 'baseline' }}>
                  <h3>{l.description}</h3>
                  <StatusPill status={l.status} />
                </div>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  {l.frequency_per_100.toFixed(0)} per 100 weighted games · costs {l.severity.toFixed(0)}% win chance each · n = {l.n}
                </p>
              </div>
            ))}
          </div>
          <p style={{ marginTop: '1rem' }}><Link href="/chess/leaks" className="link-accent">All leaks with evidence →</Link></p>
        </div>
        <div>
          <h2 className="label-caps" style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>Recent form · {s.pool.analysed} games analysed</h2>
          <div className="chess-table-wrap">
            <table className="chess-table">
              <thead><tr><th>Date</th><th>Speed</th><th>Res</th><th className="num">Opp</th><th className="num">Acc</th><th className="num">??</th></tr></thead>
              <tbody>
                {s.recent_form.slice(0, 10).map((g) => (
                  <tr key={g.id}>
                    <td><GameLink id={g.id} published={true}>{fmtDate(g.played_at)}</GameLink></td>
                    <td>{g.speed}</td>
                    <td><ResultBadge result={g.result} /></td>
                    <td className="num">{g.opponent_rating ?? '—'}</td>
                    <td className="num">{g.accuracy?.toFixed(0) ?? '—'}</td>
                    <td className="num">{g.blunders}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p style={{ marginTop: '1rem' }}><Link href="/chess/games" className="link-accent">All games →</Link></p>
        </div>
      </section>

      <section style={{ marginTop: '3rem' }} className="chess-card">
        <h3><Link href="/chess/title" className="link-accent">Route to a title →</Link></h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: 1.7 }}>
          Primary route: a podium in the FIDE World Amateur Championship U2000 section (gold = FM, silver or bronze = CM). Eligibility requires no
          published rating ≥ 2000 in the prior year, so the window closes if the rating climbs first. Secondary: reach 2200 for CM directly.
          FIDE-rated classical games in the last 12 months on record here: <b style={{ color: 'var(--text)' }}>{s.activity.fide_rated_games_12m}</b>.
        </p>
      </section>
      <ChessFooter generatedAt={s.generated_at} />
    </>
  )
}
