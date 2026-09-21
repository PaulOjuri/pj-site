import type { Metadata } from 'next'
import { ChessNav } from '@/components/chess/ChessNav'
import { ChessFooter } from '@/components/chess/ChessFooter'
import { LogForm } from '@/components/chess/LogForm'

export const metadata: Metadata = { title: 'Log a game', robots: { index: false, follow: false } }

export default function LogPage() {
  return (
    <>
      <ChessNav current="/chess/log" />
      <header style={{ paddingBlock: 'clamp(2rem, 5vw, 3rem)' }}>
        <h1 className="text-heading" style={{ fontSize: 'clamp(2rem, 4vw, 3rem)' }}>Log an over-the-board game</h1>
        <p className="prose" style={{ marginTop: '1rem' }}>
          FIDE-rated classical games are the ground truth and exist in no API. Paste the PGN, add what the scoresheet says, and it goes
          through the pipeline at maximum depth and full weight. The free-text note stays private.
        </p>
      </header>
      <LogForm />
      <ChessFooter />
    </>
  )
}
