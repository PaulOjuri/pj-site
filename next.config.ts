import type { NextConfig } from 'next'
import createMDX from '@next/mdx'

const withMDX = createMDX({
  // MDX plugins configured in mdx-components.tsx; next-mdx-remote used for content pages
})

const nextConfig: NextConfig = {
  /**
   * Static export for Cloudflare Pages.
   * API routes run as Cloudflare Pages Functions via @opennextjs/cloudflare.
   */
  output: 'export',

  pageExtensions: ['js', 'jsx', 'md', 'mdx', 'ts', 'tsx'],

  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [],
    unoptimized: true, // required for static export
  },

  /**
   * Performance: pre-tree-shake heavy packages.
   * Three.js / r3f are lazy-imported in project hero components.
   * Performance budgets from design-system/MASTER.md:
   *   / ≤ 180 KB gzip · /work/[slug] ≤ 220 KB gzip · 3D chunk ≤ 90 KB gzip
   */
  experimental: {
    optimizePackageImports: [
      'motion',
      'gsap',
      'three',
      '@react-three/fiber',
      '@react-three/drei',
    ],
  },

  typescript:  { ignoreBuildErrors: false },

  webpack(config) {
    // Allow GLSL shader files to be imported as raw strings
    config.module.rules.push({
      test: /\.(glsl|vs|fs|vert|frag)$/,
      use: 'raw-loader',
      exclude: /node_modules/,
    })
    return config
  },
}

export default withMDX(nextConfig)
