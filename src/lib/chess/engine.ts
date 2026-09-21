// Stockfish in a Web Worker. Lite single-threaded build by default; upgrades to the
// multi-threaded lite build when the page is cross-origin isolated (COOP/COEP on /chess/train).
// Never blocks the UI: the caller renders fully while `ready` is false.

export type EngineMode = 'multi' | 'single' | 'none'

export class Engine {
  private worker: Worker | null = null
  private listeners: ((line: string) => void)[] = []
  mode: EngineMode = 'none'
  ready = false
  name = ''

  async init(): Promise<void> {
    const isolated = typeof crossOriginIsolated !== 'undefined' && crossOriginIsolated && typeof SharedArrayBuffer !== 'undefined'
    // The worker script must carry COEP itself on a cross-origin-isolated page (see
    // public/_headers); the multi-threaded build's pthread workers re-fetch this same URL.
    // The hash tells stockfish.js where its wasm lives.
    const base = isolated ? '/chess/engine/sf19-lite' : '/chess/engine/sf19-lite-single'
    const file = `${base}.js#${base}.wasm`
    this.mode = isolated ? 'multi' : 'single'
    this.worker = new Worker(file)
    this.worker.onmessage = (e: MessageEvent) => {
      const line = typeof e.data === 'string' ? e.data : String(e.data)
      if (line.startsWith('id name')) this.name = line.slice(8)
      for (const l of this.listeners) l(line)
    }
    await this.send('uci', (l) => l === 'uciok')
    const threads = isolated ? Math.max(1, Math.min(4, (navigator.hardwareConcurrency || 2) - 1)) : 1
    const hash = Math.min(64, Math.max(16, Math.floor(((navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 2) * 16)))
    this.post(`setoption name Threads value ${threads}`)
    this.post(`setoption name Hash value ${hash}`)
    await this.send('isready', (l) => l === 'readyok')
    this.ready = true
  }

  post(cmd: string): void { this.worker?.postMessage(cmd) }

  private send(cmd: string, until: (line: string) => boolean): Promise<string[]> {
    return new Promise((resolve) => {
      const buf: string[] = []
      const l = (line: string) => { buf.push(line); if (until(line)) { this.listeners = this.listeners.filter((x) => x !== l); resolve(buf) } }
      this.listeners.push(l)
      this.post(cmd)
    })
  }

  /** Best move for a FEN at a fixed depth. Returns UCI move and last reported score (cp, white pov not applied). */
  async bestMove(fen: string, depth = 16): Promise<{ move: string; cp: number | null; mate: number | null }> {
    this.post('ucinewgame')
    this.post(`position fen ${fen}`)
    let cp: number | null = null, mate: number | null = null
    const lines = await this.send(`go depth ${depth}`, (l) => l.startsWith('bestmove'))
    for (const l of lines) {
      const m = l.match(/score (cp|mate) (-?\d+)/)
      if (m) { if (m[1] === 'cp') { cp = Number(m[2]); mate = null } else { mate = Number(m[2]); cp = null } }
    }
    const bm = lines[lines.length - 1].split(' ')[1]
    return { move: bm, cp, mate }
  }

  stop(): void { this.post('stop') }
  quit(): void { this.post('quit'); this.worker?.terminate(); this.worker = null; this.ready = false; this.mode = 'none' }
}
