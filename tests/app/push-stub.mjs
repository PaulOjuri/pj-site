/**
 * A stand-in for a push service (Apple's or Google's), so the whole push path can be driven locally:
 * subscribe, send, and the 404/410 that means a subscription is gone for good.
 *
 *   node tests/app/push-stub.mjs [port]
 *
 *   POST /ok      accepts, like a real service (201)
 *   POST /gone    answers 410, which must delete the subscription
 *   GET  /health  what Playwright waits for
 *   GET  /seen    what it has received, so a test can check the headers and the body length
 */
import { createServer } from 'node:http'

const PORT = Number(process.argv[2] ?? 8792)
const seen = []

createServer((req, res) => {
  if (req.url === '/health') return res.writeHead(200).end('ok')
  if (req.url === '/seen') {
    res.writeHead(200, { 'content-type': 'application/json' })
    return res.end(JSON.stringify(seen))
  }
  if (req.url === '/reset') {
    seen.length = 0
    return res.writeHead(200).end('reset')
  }
  const chunks = []
  req.on('data', (c) => chunks.push(c))
  req.on('end', () => {
    const body = Buffer.concat(chunks)
    seen.push({
      path: req.url,
      encoding: req.headers['content-encoding'],
      ttl: req.headers.ttl,
      urgency: req.headers.urgency,
      topic: req.headers.topic ?? null,
      vapid: String(req.headers.authorization ?? '').startsWith('vapid t='),
      bytes: body.length,
      // The body must not be readable: it is encrypted for the subscriber's key.
      looksEncrypted: !body.toString('utf8').includes('"title"'),
    })
    res.writeHead(req.url.startsWith('/gone') ? 410 : 201).end()
  })
}).listen(PORT, '127.0.0.1', () => console.log(`push stub on ${PORT}`))
