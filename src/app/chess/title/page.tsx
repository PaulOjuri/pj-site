import type { Metadata } from 'next'
import { ChessNav } from '@/components/chess/ChessNav'
import { ChessFooter } from '@/components/chess/ChessFooter'
import { getTitle } from '@/lib/chess/data'

export const metadata: Metadata = { title: 'Title route' }

export default function TitlePage() {
  const t = getTitle()
  if (!t) return <><ChessNav current="/chess/title" /><p style={{ marginTop: '2rem' }}>No tracker data published yet.</p></>
  const mc = t.monte_carlo.scenario
  const mcc = t.monte_carlo.calendar
  const w = t.routes.wacc_u2000
  return (
    <>
      <ChessNav current="/chess/title" />
      <header style={{ paddingBlock: 'clamp(2rem, 5vw, 3rem)' }}>
        <h1 className="text-heading" style={{ fontSize: 'clamp(2rem, 4vw, 3rem)' }}>Route to a title</h1>
        <p className="prose" style={{ marginTop: '1rem' }}>
          Target: {t.goal.title} by {t.goal.program_end}. Two ways in: a published rating (CM 2200, FM 2300, no norms) or a podium in the
          World Amateur U2000 section (gold FM, silver or bronze CM). Every number below is recomputed from the current FIDE list and
          the calendar; the regulations are cited from the FIDE handbook and the 2026 WACC regulations.
        </p>
        {t.warnings.map((x) => <div key={x} className="chess-warning" style={{ marginTop: '1rem' }}>{x}</div>)}
      </header>

      <section className="chess-grid chess-grid-4">
        <div className="chess-card stat"><span className="label-caps">FIDE standard</span><span className="stat-value">{t.fide.standard ?? '—'}</span><span className="stat-note">{t.fide.standard_inactive ? 'inactive' : 'active'} · list {t.fide.period ?? '—'} · K = {t.fide.k}</span></div>
        <div className="chess-card stat"><span className="label-caps">Gap to CM</span><span className="stat-value">{t.fide.standard ? 2200 - t.fide.standard : '—'}</span><span className="stat-note">points to 2200</span></div>
        <div className="chess-card stat"><span className="label-caps">WACC registration</span><span className="stat-value">{w.days_to_registration}<span style={{ fontSize: '1rem', color: 'var(--text-muted)' }}> days</span></span><span className="stat-note">closes {w.registration_deadline} · event starts in {w.days_to_start} days</span></div>
        <div className="chess-card stat"><span className="label-caps">Rated classical games, 12 months</span><span className="stat-value">{t.fide.rated_games_12m_on_record}</span><span className="stat-note">{t.fide.games_to_restore_activity} game restores activity</span></div>
      </section>

      <section style={{ marginTop: '2.5rem' }} className="chess-grid chess-grid-2">
        <div className="chess-card">
          <h2 style={{ fontFamily: 'var(--font-display-stack)', fontWeight: 400, fontSize: '1.25rem', color: 'var(--text)', marginBottom: '0.5rem' }}>Route B · World Amateur U2000</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: 1.7 }}>
            {w.event.name}, {w.event.city}, {w.event.start} to {w.event.end}. {w.event.rounds}-round Swiss, {w.event.time_control}, fee {w.event.fee_eur} EUR.
            Eligible now: <b style={{ color: w.eligible_now ? '#8fbf7f' : '#d08a7a' }}>{w.eligible_now ? 'yes' : 'no'}</b>. Requirement: no published standard rating ≥ 2000 between {w.lookback_window[0]} and {w.lookback_window[1]}, no title above CM.
            Podium: gold {w.titles.gold}, silver or bronze {w.titles.silver_bronze}.
          </p>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>{w.note} Sources: <a className="link-accent" href={String(w.event.source)} rel="noopener">regulations</a>, <a className="link-accent" href={String(w.event.titles_source)} rel="noopener">direct titles table</a>.</p>
        </div>
        <div className="chess-card">
          <h2 style={{ fontFamily: 'var(--font-display-stack)', fontWeight: 400, fontSize: '1.25rem', color: 'var(--text)', marginBottom: '0.5rem' }}>Route A · rating</h2>
          {t.routes.rating.map((r) => (
            <p key={r.route} style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: 1.7 }}>
              <b style={{ color: 'var(--text)' }}>{r.title} at {r.threshold}</b>: {r.gap} points away. Probability of getting there by {t.goal.program_end} under the scenario below: <b style={{ color: 'var(--text)' }}>{r.p_reach_by_horizon != null ? `${Math.round(r.p_reach_by_horizon * 100)}%` : '—'}</b>.
            </p>
          ))}
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Rules: K = {t.fide.k}, rating differences capped at 400, K·n ≤ 700 per period (FIDE B.02, 2024).</p>
        </div>
      </section>

      <section style={{ marginTop: '2.5rem' }} className="chess-card">
        <h2 style={{ fontFamily: 'var(--font-display-stack)', fontWeight: 400, fontSize: '1.25rem', color: 'var(--text)', marginBottom: '0.5rem' }}>Monte Carlo · {mc.runs.toLocaleString()} simulated careers</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: 1.7 }}>
          Scenario: {t.monte_carlo.scenario_assumption}. Performance model: {mc.performance.source} ({mc.performance.n_games} games), offset {mc.performance.offset_mean > 0 ? '+' : ''}{mc.performance.offset_mean} ± {mc.performance.offset_sd}, draw rate {Math.round(mc.performance.draw_rate * 100)}%.
        </p>
        <div className="chess-grid chess-grid-4" style={{ marginTop: '1rem' }}>
          <div className="stat"><span className="label-caps">median</span><span className="stat-value">{mc.final.p50}</span></div>
          <div className="stat"><span className="label-caps">10th–90th pct</span><span className="stat-value" style={{ fontSize: '1.5rem' }}>{mc.final.p10}–{mc.final.p90}</span></div>
          <div className="stat"><span className="label-caps">P(≥ 2000)</span><span className="stat-value">{Math.round(mc.p_reach['2000'] * 100)}%</span></div>
          <div className="stat"><span className="label-caps">P(≥ 2200)</span><span className="stat-value">{Math.round(mc.p_reach['2200'] * 100)}%</span></div>
        </div>
        {mcc && <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '1rem' }}>Calendar-only run ({t.monte_carlo.registered_events} registered events, {mcc.events.length} listed): median {mcc.final.p50}, P(≥2000) {Math.round(mcc.p_reach['2000'] * 100)}%.</p>}
        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.75rem' }}>The rating route needs roughly eight to ten opens a year performing 150–250 points above rating, sustained for two years. The amateur route needs one podium in one week. That asymmetry is the whole strategy.</p>
      </section>

      <section style={{ marginTop: '2.5rem' }}>
        <h2 className="label-caps" style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>Calendar</h2>
        <div className="chess-table-wrap">
          <table className="chess-table">
            <thead><tr><th>Event</th><th>Dates</th><th>Where</th><th>Format</th><th className="num">Days</th><th className="num">Deadline</th><th className="num">Gain @+150</th><th className="num">@+250</th><th>Status</th></tr></thead>
            <tbody>
              {t.calendar.map((e) => (
                <tr key={e.name}>
                  <td>{e.url ? <a href={String(e.url)} rel="noopener">{e.name}</a> : e.name}{e.title_relevance ? <span className="font-mono" style={{ marginLeft: '0.5rem', fontSize: '0.7rem', color: 'var(--accent)' }}>{String(e.title_relevance)}</span> : null}</td>
                  <td>{e.start}{e.end ? ` → ${e.end}` : ''}</td>
                  <td>{e.city ?? ''}{e.country ? `, ${e.country}` : ''}</td>
                  <td>{e.format ?? ''}</td>
                  <td className="num">{e.days_until}</td>
                  <td className="num">{e.deadline ? `${e.deadline}${e.days_to_deadline != null ? ` (${e.days_to_deadline}d)` : ''}` : '—'}</td>
                  <td className="num">{e.expected_gain_at_plus150 > 0 ? '+' : ''}{e.expected_gain_at_plus150}</td>
                  <td className="num">{e.expected_gain_at_plus250 > 0 ? '+' : ''}{e.expected_gain_at_plus250}</td>
                  <td>{e.registered ? 'registered' : e.assumed ? 'not registered (auto-added)' : 'not registered'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="chess-footnote" style={{ marginTop: '0.75rem' }}>Add events to chess-coach/config/calendar.yaml. Expected gain assumes K = {t.fide.k}, the listed rounds and average opposition, and a performance 150 or 250 points above rating.</p>
      </section>
      <ChessFooter generatedAt={t.generated_at} />
    </>
  )
}
