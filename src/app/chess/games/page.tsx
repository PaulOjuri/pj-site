import type { Metadata } from 'next'
import { ChessNav } from '@/components/chess/ChessNav'
import { ChessFooter } from '@/components/chess/ChessFooter'
import { GameLink, ResultBadge, fmtDate } from '@/components/chess/shared'
import { getGameIndex } from '@/lib/chess/data'

export const metadata: Metadata = { title: 'Games' }
const PAGE = 300

export default function GamesPage() {
  const idx = getGameIndex()
  const games = idx.games.slice(0, PAGE)
  return (
    <>
      <ChessNav current="/chess/games" />
      <header style={{ paddingBlock: 'clamp(2rem, 5vw, 3rem)' }}>
        <h1 className="text-heading" style={{ fontSize: 'clamp(2rem, 4vw, 3rem)' }}>Games</h1>
        <p className="prose" style={{ marginTop: '1rem' }}>
          {idx.count} analysed games, newest first. Accuracy uses the Lichess formula on our own Stockfish analysis; ?? counts blunders
          (moves losing 30% or more win chance). Games with a full report are linked.
        </p>
      </header>
      <div className="chess-table-wrap">
        <table className="chess-table">
          <thead>
            <tr><th>Date</th><th>Speed</th><th>Col</th><th>Res</th><th>Opponent</th><th className="num">Rating</th><th>Opening</th><th className="num">Acc</th><th className="num">?!</th><th className="num">?</th><th className="num">??</th></tr>
          </thead>
          <tbody>
            {games.map((g) => (
              <tr key={g.id}>
                <td><GameLink id={g.id} published={g.published}>{fmtDate(g.played_at)}</GameLink></td>
                <td>{g.speed}</td>
                <td>{g.color === 'white' ? '○' : '●'}</td>
                <td><ResultBadge result={g.result} /></td>
                <td>{g.opponent}</td>
                <td className="num">{g.opponent_rating ?? '—'}</td>
                <td>{g.opening ? g.opening.slice(0, 40) : g.eco ?? '—'}</td>
                <td className="num">{g.accuracy?.toFixed(0) ?? '—'}</td>
                <td className="num">{g.inaccuracies}</td>
                <td className="num">{g.mistakes}</td>
                <td className="num">{g.blunders}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {idx.count > PAGE && <p className="chess-footnote" style={{ marginTop: '1rem' }}>Showing the {PAGE} most recent of {idx.count}.</p>}
      <ChessFooter generatedAt={idx.generated_at} />
    </>
  )
}
