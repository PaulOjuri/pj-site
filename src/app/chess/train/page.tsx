import type { Metadata } from 'next'
import { ChessNav } from '@/components/chess/ChessNav'
import { ChessFooter } from '@/components/chess/ChessFooter'
import { Trainer } from '@/components/chess/Trainer'
import { getTrain } from '@/lib/chess/data'

export const metadata: Metadata = { title: 'Train', robots: { index: false, follow: false } }

export default function TrainPage() {
  const data = getTrain()
  return (
    <>
      <ChessNav current="/chess/train" />
      <header style={{ paddingBlock: 'clamp(2rem, 5vw, 3rem)' }}>
        <h1 className="text-heading" style={{ fontSize: 'clamp(2rem, 4vw, 3rem)' }}>Train</h1>
        <p className="prose" style={{ marginTop: '1rem' }}>
          Due cards first, then this week&apos;s sets: puzzles and your own positions to solve, calculation positions to write out
          before revealing, and endgames to play against the engine. Results feed the scheduler and next week&apos;s plan.
        </p>
      </header>
      {data ? <Trainer data={data} /> : <p style={{ color: 'var(--text-muted)' }}>No training data published yet.</p>}
      <ChessFooter generatedAt={data?.generated_at} />
    </>
  )
}
