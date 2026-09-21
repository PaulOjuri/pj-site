'use client'
import { useEffect, useState } from 'react'
import { getToken, setToken } from '@/lib/chess/token'

export function TokenBox() {
  const [t, setT] = useState('')
  const [saved, setSaved] = useState(false)
  useEffect(() => { setT(getToken()); setSaved(Boolean(getToken())) }, [])
  return (
    <details style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
      <summary style={{ cursor: 'pointer' }}>{saved ? 'Write-back token set' : 'No write-back token (results stay in this browser)'}</summary>
      <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
        <input type="password" value={t} onChange={(e) => setT(e.target.value)} placeholder="CHESS_TOKEN" aria-label="Write-back token"
          style={{ background: 'var(--bg-inset)', border: '1px solid var(--line-strong)', color: 'var(--text)', padding: '0.4rem 0.6rem', borderRadius: 2, minWidth: 260 }} />
        <button onClick={() => { setToken(t); setSaved(Boolean(t)) }} className="font-mono"
          style={{ border: '1px solid var(--line-strong)', background: 'transparent', color: 'var(--text)', padding: '0.4rem 0.8rem', borderRadius: 2, cursor: 'pointer' }}>Save</button>
      </div>
    </details>
  )
}
