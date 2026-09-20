'use client'
import { useEffect, useState } from 'react'

interface WorkProgressBarProps {
  accentColor?: string
  title: string
}

export function WorkProgressBar({ accentColor = 'var(--accent)', title }: WorkProgressBarProps) {
  const [progress, setProgress] = useState(0)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    function onScroll() {
      const scrolled = window.scrollY
      const total = document.documentElement.scrollHeight - window.innerHeight
      const pct = total > 0 ? (scrolled / total) * 100 : 0
      setProgress(pct)
      setVisible(scrolled > 100)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <>
      {/* Progress bar */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          height: '2px',
          width: `${progress}%`,
          background: accentColor,
          zIndex: 150,
          transition: 'width 50ms linear',
          pointerEvents: 'none',
        }}
        aria-hidden="true"
      />

      {/* Mini sticky title */}
      {visible && (
        <div
          style={{
            position: 'fixed',
            top: '72px',
            left: 0,
            right: 0,
            height: '40px',
            background: 'rgba(13,12,11,0.9)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            borderBottom: '1px solid var(--line)',
            display: 'flex',
            alignItems: 'center',
            zIndex: 90,
            padding: '0 clamp(1.25rem, 5vw, 6rem)',
          }}
        >
          <span
            className="font-mono"
            style={{ fontSize: '0.8rem', letterSpacing: '0.1em', color: 'var(--text-faint)' }}
          >
            {title}
          </span>
        </div>
      )}
    </>
  )
}
