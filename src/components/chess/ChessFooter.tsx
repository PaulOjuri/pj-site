export function ChessFooter({ generatedAt }: { generatedAt?: string }) {
  return (
    <div className="chess-footnote" style={{ paddingBlock: '3rem' }}>
      <p>
        Game data from <a href="https://www.chess.com" rel="noopener">Chess.com</a> (Published-Data API) and{' '}
        <a href="https://lichess.org" rel="noopener">Lichess</a> (open API and CC0 database). Engine analysis by{' '}
        <a href="https://stockfishchess.org" rel="noopener">Stockfish</a>. Ratings from{' '}
        <a href="https://ratings.fide.com/profile/260703" rel="noopener">FIDE</a>. Board design is our own.
        {generatedAt ? ` Data generated ${generatedAt.slice(0, 16).replace('T', ' ')} UTC.` : ''}
      </p>
    </div>
  )
}
