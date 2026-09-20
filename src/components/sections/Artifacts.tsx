'use client'
import { useState } from 'react'
import Image from 'next/image'
import { motion, useReducedMotion } from 'framer-motion'
import { MediaImage } from '@/components/MediaImage'

const EASE = [0.22, 1, 0.36, 1] as const

interface TileConfig {
  type: 'personal' | 'picsum'
  src?: string
  seed?: string
  caption: string
  colSpan?: boolean
  rowSpan?: boolean
}

const TILES: TileConfig[] = [
  { type: 'personal', src: '/paul/gym-1.jpg', caption: 'TURNHOUT GYM, 2025', colSpan: false },
  { type: 'personal', src: '/paul/gym-2.jpg', caption: 'TRAINING LOG', colSpan: false },
  { type: 'personal', src: '/paul/family.jpg', caption: 'FAMILY, 2024', colSpan: false },
  { type: 'picsum', seed: 'artifact-4', caption: 'DESK SETUP', colSpan: true },
  { type: 'picsum', seed: 'artifact-5', caption: 'FIELD NOTE' },
  { type: 'picsum', seed: 'artifact-6', caption: 'MATERIAL LOGIC' },
  { type: 'picsum', seed: 'artifact-7', caption: 'COMPOSITION 07', colSpan: true },
  { type: 'picsum', seed: 'artifact-8', caption: 'PAPER PROOF' },
  { type: 'picsum', seed: 'artifact-9', caption: 'WORKING METHOD' },
]

interface TileProps {
  config: TileConfig
  index: number
}

function Tile({ config, index }: TileProps) {
  const [hovered, setHovered] = useState(false)
  const reduced = useReducedMotion()

  return (
    <motion.div
      initial={reduced ? { opacity: 0 } : { opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-10%' }}
      transition={{ duration: 0.6, ease: EASE, delay: index * 0.06 }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        gridColumn: config.colSpan ? 'span 2' : undefined,
        position: 'relative',
        overflow: 'hidden',
        cursor: 'pointer',
        aspectRatio: config.colSpan ? '2/1' : '1/1',
      }}
    >
      <div
        style={{
          width: '100%',
          height: '100%',
          transform: hovered ? 'scale(1.03)' : 'scale(1)',
          transition: 'transform 400ms ease-out',
          position: 'relative',
        }}
      >
        {config.type === 'personal' && config.src ? (
          <Image
            src={config.src}
            alt={config.caption}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            style={{ objectFit: 'cover' }}
          />
        ) : (
          <MediaImage
            seed={config.seed ?? 'artifact'}
            alt={config.caption}
            width={800}
            height={800}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        )}
      </div>

      {/* Caption overlay */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          padding: '1rem',
          background: 'linear-gradient(to top, rgba(8,8,7,0.75) 0%, transparent 100%)',
          opacity: hovered ? 1 : 0,
          transition: 'opacity 250ms',
        }}
      >
        <span
          className="font-mono"
          style={{
            fontSize: '0.8rem',
            letterSpacing: '0.12em',
            color: 'rgba(237,234,227,0.7)',
          }}
        >
          {config.caption}
        </span>
      </div>
    </motion.div>
  )
}

export function Artifacts() {
  return (
    <section
      id="artifacts"
      aria-label="Life Outside the Work"
      className="section-pad"
      style={{ background: 'var(--bg)' }}
    >
      <div className="container-site">
        {/* Eyebrow */}
        <p
          className="font-mono"
          style={{
            fontSize: '0.8rem',
            letterSpacing: '0.15em',
            color: 'var(--text-faint)',
            marginBottom: 'clamp(2rem, 4vw, 3.5rem)',
          }}
        >
          ARTIFACTS — LIFE OUTSIDE THE WORK
        </p>

        {/* Bento grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gridAutoRows: 'auto',
            gap: 'clamp(0.5rem, 1vw, 1rem)',
          }}
        >
          {/* Row 1: 1 + 1 + 1 (personal photos) */}
          <Tile config={TILES[0]} index={0} />
          <Tile config={TILES[1]} index={1} />
          <Tile config={TILES[2]} index={2} />

          {/* Row 2: 2-wide + 1 */}
          <Tile config={TILES[3]} index={3} />
          <Tile config={TILES[4]} index={4} />

          {/* Row 3: 1 + 1 */}
          <Tile config={TILES[5]} index={5} />
          <Tile config={TILES[6]} index={6} />

          {/* Row 4: 1 + 1 */}
          <Tile config={TILES[7]} index={7} />
          <Tile config={TILES[8]} index={8} />
        </div>
      </div>
    </section>
  )
}
