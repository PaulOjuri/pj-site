/**
 * Renders the agent app's icons from one SVG, with sharp (already a dependency of this repo).
 *
 *   node scripts/app-icons.mjs
 *
 * The mark is the agent network itself: one orchestrator node delegating to two specialists. It is drawn
 * with geometry only — no text — because the icon renderer here has no access to the site's display font,
 * and an icon that falls back to Helvetica would look like a different app.
 *
 * The PNGs are committed, so a normal build and deploy needs nothing from this script.
 */
import { mkdir, writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import sharp from 'sharp'

const OUT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'public', 'app')

const BG = '#0A0A0A'
const GOLD = '#C9A84C'

/**
 * @param {object} options
 * @param {number} options.inset  how far the art is held off the edge, as a fraction (maskable needs more)
 * @param {string} options.bg     background colour, or 'none' for transparency
 * @param {string} options.ink    line and node colour
 * @param {number} options.radius corner radius as a fraction of the side
 */
function markSvg({ inset = 0.18, bg = BG, ink = GOLD, radius = 0.22 } = {}) {
  const S = 512
  const pad = S * inset
  const top = { x: S / 2, y: pad + S * 0.04 }
  const left = { x: pad + S * 0.03, y: S - pad - S * 0.04 }
  const right = { x: S - pad - S * 0.03, y: S - pad - S * 0.04 }
  const r = S * 0.062
  const stroke = S * 0.028
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${S}" height="${S}" viewBox="0 0 ${S} ${S}">
  ${bg === 'none' ? '' : `<rect width="${S}" height="${S}" rx="${S * radius}" fill="${bg}"/>`}
  <g stroke="${ink}" stroke-width="${stroke}" stroke-linecap="round" fill="none" opacity="0.85">
    <path d="M${top.x} ${top.y} L${left.x} ${left.y}"/>
    <path d="M${top.x} ${top.y} L${right.x} ${right.y}"/>
    <path d="M${left.x} ${left.y} L${right.x} ${right.y}" opacity="0.35"/>
  </g>
  <g fill="${ink}">
    <circle cx="${top.x}" cy="${top.y}" r="${r * 1.25}"/>
    <circle cx="${left.x}" cy="${left.y}" r="${r}"/>
    <circle cx="${right.x}" cy="${right.y}" r="${r}"/>
  </g>
</svg>`
}

const targets = [
  { file: 'icon-192.png', size: 192, svg: markSvg() },
  { file: 'icon-512.png', size: 512, svg: markSvg() },
  // Maskable: Android crops to a circle of 80%, so the art sits well inside a full-bleed square.
  { file: 'icon-maskable-512.png', size: 512, svg: markSvg({ inset: 0.28, radius: 0 }) },
  // iOS applies its own rounding and dislikes transparency, so this one is square and opaque.
  { file: 'apple-touch-icon.png', size: 180, svg: markSvg({ radius: 0 }) },
  // The Android notification badge is tinted by the system: white on transparent.
  { file: 'badge-96.png', size: 96, svg: markSvg({ bg: 'none', ink: '#FFFFFF', inset: 0.12 }) },
]

await mkdir(OUT, { recursive: true })
for (const { file, size, svg } of targets) {
  const png = await sharp(Buffer.from(svg)).resize(size, size).png({ compressionLevel: 9 }).toBuffer()
  await writeFile(path.join(OUT, file), png)
  console.log(`${file}  ${size}x${size}  ${(png.length / 1024).toFixed(1)} kB`)
}
