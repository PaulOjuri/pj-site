import type { Metadata } from 'next'
import Link from 'next/link'
import { ChessNav } from '@/components/chess/ChessNav'
import { ChessFooter } from '@/components/chess/ChessFooter'
import { Board } from '@/components/chess/Board'
import { StatusPill } from '@/components/chess/shared'
import { DoneToggle } from '@/components/chess/PlanChecklist'
import { TokenBox } from '@/components/chess/TokenBox'
import { getPlan, getPlanHistory, slugify } from '@/lib/chess/data'

export const metadata: Metadata = { title: 'Plan' }
const DAY: Record<string, string> = { mon: 'Monday', tue: 'Tuesday', wed: 'Wednesday', thu: 'Thursday', fri: 'Friday', sat: 'Saturday', sun: 'Sunday' }

function Assets({ a }: { a: Record<string, unknown> }) {
  const items: React.ReactNode[] = []
  const list = (k: string) => (Array.isArray(a[k]) ? (a[k] as Record<string, unknown>[]) : [])
  if (a.rule) items.push(<li key="rule">Rule: {String(a.rule)}</li>)
  if (Array.isArray(a.where)) items.push(<li key="where">Where: {(a.where as string[]).join(' · ')}</li>)
  if (Array.isArray(a.instructions)) (a.instructions as string[]).forEach((s, i) => items.push(<li key={`i${i}`}>{s}</li>))
  if (a.annotation && typeof a.annotation === 'object') {
    const g = a.annotation as { game_id: string; white: string; black: string; played_at: string }
    items.push(<li key="ann">Game to annotate: <Link className="link-accent" href={`/chess/games/${slugify(g.game_id)}`}>{g.white} – {g.black}, {g.played_at.slice(0, 10)}</Link></li>)
  }
  for (const k of ['puzzles', 'own_positions', 'calculation', 'endgame_drills', 'due_cards']) {
    const l = list(k)
    if (l.length) items.push(<li key={k}>{l.length} {k.replace('_', ' ')} · <Link className="link-accent" href="/chess/train">open in trainer</Link></li>)
  }
  if (!items.length) return null
  return <ul style={{ fontSize: '0.85rem', color: 'var(--text-muted)', paddingLeft: '1.2rem', lineHeight: 1.7 }}>{items}</ul>
}

export default function PlanPage() {
  const plan = getPlan()
  const history = getPlanHistory()
  if (!plan) return <><ChessNav current="/chess/plan" /><p style={{ marginTop: '2rem' }}>No plan published yet.</p></>
  const boards = plan.sessions.flatMap((s) => {
    const a = s.assets as Record<string, unknown>
    const first = (['own_positions', 'calculation', 'endgame_drills'] as const).map((k) => (Array.isArray(a[k]) ? (a[k] as { fen: string }[])[0] : null)).find(Boolean)
    return first ? [{ id: s.id, title: s.title, fen: first.fen }] : []
  }).slice(0, 3)
  return (
    <>
      <ChessNav current="/chess/plan" />
      <header style={{ paddingBlock: 'clamp(2rem, 5vw, 3rem)' }}>
        <p className="label-caps" style={{ color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
          Week {plan.week_index} · from {plan.week_start} · phase: {plan.phase.name} (month {plan.phase.month_index}) · block {plan.meso_block}
          {plan.deload ? ' · deload' : ''}{plan.taper ? ` · taper for ${plan.taper.name}` : ''}
        </p>
        <h1 className="text-heading" style={{ fontSize: 'clamp(2rem, 4vw, 3rem)' }}>This week</h1>
        <p className="prose" style={{ marginTop: '1rem' }}>{plan.phase.description} {plan.hours_planned} of {plan.hours_available} hours planned. Blitz cap {plan.blitz_cap_per_week} games.</p>
        {plan.warnings.map((w) => <div key={w} className="chess-warning" style={{ marginTop: '1rem' }}>{w}</div>)}
      </header>

      <section className="chess-grid chess-grid-2" style={{ marginBottom: '2.5rem' }}>
        {plan.targets.map((t) => (
          <div key={t.tag} className="chess-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', alignItems: 'baseline' }}>
              <h3>{t.description}</h3>
              <StatusPill status={t.status} />
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{t.role} target · {Math.round(t.share * 100)}% of the week · n = {t.n} · {t.frequency_per_100.toFixed(1)}/100 games</p>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginTop: '0.5rem', lineHeight: 1.6 }}>{t.response}</p>
            <p style={{ fontSize: '0.85rem', color: 'var(--text)', marginTop: '0.75rem' }}>
              Pre-registered success: {t.success.metric} from {t.success.baseline} to ≤ {t.success.target} by {t.success.window.to}, on ≥ {t.success.min_games} games.
              {t.success.outcome ? ` Outcome: ${t.success.outcome.verdict} (measured ${t.success.outcome.measured}, ${t.success.outcome.games} games).` : ''}
            </p>
          </div>
        ))}
        {plan.targets.length === 0 && <div className="chess-card"><h3>Seed week</h3><p style={{ color: 'var(--text-muted)' }}>No confirmed leaks yet; this is the baseline week from the spec.</p></div>}
      </section>

      <section>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
          <h2 className="label-caps" style={{ color: 'var(--text-muted)' }}>Sessions</h2>
          <TokenBox />
        </div>
        <div className="chess-grid">
          {plan.sessions.map((s) => (
            <article key={s.id} className="chess-card" id={s.id}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap', alignItems: 'baseline' }}>
                <h3><span className="font-mono" style={{ color: 'var(--accent)', fontSize: '0.8rem', marginRight: '0.75rem' }}>{DAY[s.day]} · {s.duration_min} min · {s.type}</span>{s.title}</h3>
                <DoneToggle sessionId={s.id} />
              </div>
              {s.leak_targets.length > 0 && <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>targets: {s.leak_targets.join(', ')}</p>}
              <Assets a={s.assets as Record<string, unknown>} />
              <p style={{ fontSize: '0.85rem', color: 'var(--text)', marginTop: '0.5rem' }}>Done when: {s.success_criterion}</p>
              {s.notes && <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>{s.notes}</p>}
            </article>
          ))}
        </div>
      </section>

      {boards.length > 0 && (
        <section style={{ marginTop: '2.5rem' }}>
          <h2 className="label-caps" style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>From your own games this week</h2>
          <div className="chess-grid chess-grid-3">
            {boards.map((b) => <figure key={b.id} style={{ margin: 0 }}><Board fen={b.fen} size="mini" title={b.title} /><figcaption style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.4rem' }}>{b.title}</figcaption></figure>)}
          </div>
        </section>
      )}

      <section style={{ marginTop: '2.5rem' }}>
        <h2 className="label-caps" style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>Why this week looks like this</h2>
        <ul style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.7, paddingLeft: '1.2rem' }}>
          {plan.rationale.map((r, i) => <li key={i}>{r}</li>)}
          {plan.rationale.length === 0 && <li>Seed plan: no data-driven targets yet.</li>}
        </ul>
        {history.length > 1 && (
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '1rem' }}>
            Previous weeks: {history.slice(1, 6).map((p) => `${p.week_start} (${p.targets.map((t) => t.tag).join(', ') || 'seed'})`).join(' · ')}
          </p>
        )}
      </section>
      <ChessFooter generatedAt={plan.generated_at} />
    </>
  )
}
