import type { Metadata } from 'next'
import './chess.css'

export const metadata: Metadata = {
  title: { default: 'Chess', template: '%s · Chess · Paul Ojuri' },
  description: 'A closed-loop chess training system: games in, engine analysis, recurring weaknesses out, evidence for every claim.',
}

export default function ChessLayout({ children }: { children: React.ReactNode }) {
  return <div className="container-page" style={{ paddingTop: 'clamp(6rem, 12vw, 9rem)', paddingBottom: '4rem' }}>{children}</div>
}
