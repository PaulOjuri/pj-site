/**
 * Minimal static server for the `out/` export, so Playwright can drive the
 * built site. No dependencies: the repo ships none for this.
 *
 *   node scripts/serve-out.mjs [port]
 */
import { createServer } from 'node:http'
import { createReadStream } from 'node:fs'
import { stat } from 'node:fs/promises'
import { extname, join, normalize } from 'node:path'

const ROOT = new URL('../out/', import.meta.url).pathname
const PORT = Number(process.argv[2] ?? 4321)

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.mp3': 'audio/mpeg',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.woff2': 'font/woff2',
  '.txt': 'text/plain; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
}

async function resolve(pathname) {
  const clean = normalize(decodeURIComponent(pathname)).replace(/^(\.\.[/\\])+/, '')
  for (const candidate of [clean, `${clean}.html`, join(clean, 'index.html')]) {
    const file = join(ROOT, candidate)
    if (!file.startsWith(ROOT)) continue
    try {
      if ((await stat(file)).isFile()) return file
    } catch {
      // try the next shape
    }
  }
  return null
}

createServer(async (req, res) => {
  const file = await resolve(new URL(req.url, 'http://x').pathname)
  if (!file) {
    res.writeHead(404, { 'content-type': 'text/plain' })
    res.end('not found')
    return
  }
  res.writeHead(200, {
    'content-type': TYPES[extname(file)] ?? 'application/octet-stream',
    'cache-control': 'no-store',
  })
  createReadStream(file).pipe(res)
}).listen(PORT, () => console.log(`serving out/ on http://localhost:${PORT}`))
