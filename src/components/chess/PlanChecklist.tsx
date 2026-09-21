'use client'
import { useEffect, useState } from 'react'
import { postJson } from '@/lib/chess/token'

export function DoneToggle({ sessionId }: { sessionId: string }) {
  const [done, setDone] = useState<boolean | null>(null)
  const [err, setErr] = useState('')
  useEffect(() => {
    fetch('/api/chess/plan/done').then((r) => (r.ok ? r.json() : null)).then((d) => {
      const row = d?.sessions?.find((s: { session_id: string; done: number }) => s.session_id === sessionId)
      setDone(row ? Boolean(row.done) : false)
    }).catch(() => setDone(false))
  }, [sessionId])
  const toggle = async () => {
    const next = !done
    setDone(next)
    const r = await postJson('/api/chess/plan/done', { session_id: sessionId, done: next })
    if (!r.ok) { setErr(r.status === 401 || r.status === 0 ? 'needs token' : 'save failed'); setDone(!next) } else setErr('')
  }
  return (
    <label style={{ display: 'inline-flex', gap: '0.5rem', alignItems: 'center', cursor: 'pointer', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
      <input type="checkbox" checked={Boolean(done)} onChange={toggle} disabled={done === null} aria-label="Mark session done" />
      {done ? 'done' : 'not done'}{err ? ` · ${err}` : ''}
    </label>
  )
}
