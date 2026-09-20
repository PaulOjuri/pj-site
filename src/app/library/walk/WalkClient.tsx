'use client'

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { Preloader } from '@/components/library-walk/Preloader'
import { Overlays } from '@/components/library-walk/Overlays'
import { BookPanel } from '@/components/library-walk/BookPanel'
import { RosieDialog, RosieButton } from '@/components/library-walk/RosieDialog'
import { useWalkStore } from '@/components/library-walk/store'
import { getBook } from '@/components/library-walk/libraryData'
import { stopAll } from '@/components/library-walk/sound'

// Three.js can't run server-side — load it only on the client
const WalkScene = dynamic(
  () => import('@/components/library-walk/Scene'),
  { ssr: false, loading: () => <Preloader /> },
)

function detectWebGL(): boolean {
  try {
    const canvas = document.createElement('canvas')
    const ctx =
      canvas.getContext('webgl2') ??
      canvas.getContext('webgl') ??
      canvas.getContext('experimental-webgl')
    return !!ctx
  } catch {
    return false
  }
}

// ── No-WebGL fallback ──────────────────────────────────────────────
function NoWebGL() {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(160deg, #0E0A06 70%, #1A1208 100%)',
        gap: '2rem',
        padding: '2rem',
        textAlign: 'center',
      }}
    >
      <p
        style={{
          fontFamily: '"Instrument Serif", Georgia, serif',
          fontStyle: 'italic',
          fontSize: 'clamp(1.5rem, 3vw, 2.25rem)',
          color: '#D4C4A8',
          letterSpacing: '-0.02em',
          lineHeight: 1.2,
          maxWidth: '28ch',
        }}
      >
        This library needs a window.
      </p>
      <p
        style={{
          fontFamily: 'system-ui, sans-serif',
          fontSize: '0.85rem',
          color: 'rgba(212,196,168,0.4)',
          maxWidth: '36ch',
          lineHeight: 1.7,
        }}
      >
        Your browser does not support WebGL, or hardware acceleration is
        disabled. Try enabling it in your browser settings, or view the
        library as a list instead.
      </p>
      <Link
        href="/library"
        style={{
          fontFamily: '"DM Mono", "Menlo", monospace',
          fontSize: '0.6rem',
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          color: 'rgba(212,196,168,0.55)',
          textDecoration: 'none',
          borderBottom: '1px solid rgba(212,196,168,0.2)',
          paddingBottom: '2px',
        }}
      >
        ← View library as list
      </Link>
    </div>
  )
}

// ── URL hash → open book on load ───────────────────────────────────
function useHashDeepLink() {
  const setActiveBook = useWalkStore((s) => s.setActiveBook)

  useEffect(() => {
    const hash = window.location.hash.slice(1)
    if (!hash) return
    const book = getBook(hash)
    if (!book) return
    const timer = setTimeout(() => {
      setActiveBook(
        book.id,
        { x: 0, y: 1.45, z: 0 },
        { x: 0, y: 1.45, z: 0.8 },
      )
      window.history.replaceState(null, '', `/library/walk#${hash}`)
    }, 800)
    return () => clearTimeout(timer)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
}

// ── Auto-greet Rosie on first visit ────────────────────────────────
function useRosieAutoGreet() {
  const rosieGreeted    = useWalkStore((s) => s.rosieGreeted)
  const setRosieGreeted = useWalkStore((s) => s.setRosieGreeted)
  const openDialog      = useWalkStore((s) => s.openDialog)

  useEffect(() => {
    if (rosieGreeted) return
    const key = 'rosie_greeted'
    if (typeof sessionStorage !== 'undefined' && sessionStorage.getItem(key)) {
      setRosieGreeted()
      return
    }
    const timer = setTimeout(() => {
      openDialog('greet_first')
      setRosieGreeted()
      if (typeof sessionStorage !== 'undefined') sessionStorage.setItem(key, '1')
    }, 1500)
    return () => clearTimeout(timer)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
}

// ── Main client entry ──────────────────────────────────────────────
export function WalkClient() {
  const [webglState, setWebglState] = useState<'checking' | 'supported' | 'unsupported'>('checking')

  useEffect(() => {
    setWebglState(detectWebGL() ? 'supported' : 'unsupported')
    return () => { stopAll() }
  }, [])

  useHashDeepLink()
  useRosieAutoGreet()

  if (webglState === 'checking') return <Preloader />
  if (webglState === 'unsupported') return <NoWebGL />

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        width: '100vw',
        height: '100vh',
        overflow: 'hidden',
        background: '#0E0A06',
      }}
    >
      <WalkScene />
      <Overlays />
      <BookPanel />
      <RosieDialog />
      <RosieButton />
    </div>
  )
}
