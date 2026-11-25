/**
 * Generate a VAPID key pair for Web Push.
 *
 *   node scripts/vapid-keys.mjs
 *
 * The private key is a secret: it goes into Cloudflare with `wrangler secret put`, never into git.
 * The public key is handed to the browser by GET /api/app/config and is not sensitive.
 *
 * Keys are a P-256 pair, the same thing `web-push generate-vapid-keys` prints: the public key as the
 * uncompressed point (65 bytes) and the private key as the raw 32-byte scalar, both base64url.
 */
import { webcrypto } from 'node:crypto'

const b64url = (bytes) => Buffer.from(bytes).toString('base64url')

const pair = await webcrypto.subtle.generateKey({ name: 'ECDSA', namedCurve: 'P-256' }, true, [
  'sign',
  'verify',
])
const publicKey = b64url(await webcrypto.subtle.exportKey('raw', pair.publicKey))
const jwk = await webcrypto.subtle.exportKey('jwk', pair.privateKey)

console.log(`\nVAPID_PUBLIC_KEY   ${publicKey}`)
console.log(`VAPID_PRIVATE_KEY  ${jwk.d}\n`)
console.log('Set them on the Pages project and the reminders Worker (two separate secret stores):\n')
for (const [name, value] of [
  ['VAPID_PUBLIC_KEY', publicKey],
  ['VAPID_PRIVATE_KEY', jwk.d],
]) {
  console.log(`  echo -n '${value}' | npx wrangler pages secret put ${name} --project-name paulojuri`)
  console.log(`  echo -n '${value}' | npx wrangler secret put ${name} --config workers/reminders/wrangler.toml`)
}
console.log('\nFor local development, put the same two lines in .dev.vars (git-ignored).\n')
