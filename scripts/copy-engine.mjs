// Copies the Stockfish.js lite builds from the npm package into public/chess/engine/ at build time.
// Renamed to sf19-* so the served paths are ours (and so header/cache changes can be versioned by name).
import { copyFileSync, mkdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const src = join(root, 'node_modules', 'stockfish')
const dst = join(root, 'public', 'chess', 'engine')
mkdirSync(dst, { recursive: true })
for (const [from, to] of [
  ['bin/stockfish-19-lite.js', 'sf19-lite.js'],
  ['bin/stockfish-19-lite.wasm', 'sf19-lite.wasm'],
  ['bin/stockfish-19-lite-single.js', 'sf19-lite-single.js'],
  ['bin/stockfish-19-lite-single.wasm', 'sf19-lite-single.wasm'],
  ['Copying.txt', 'COPYING.txt'],
]) copyFileSync(join(src, from), join(dst, to))
console.log('engine files copied to public/chess/engine')
