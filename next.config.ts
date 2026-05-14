import type { NextConfig } from 'next'
import createMDX from '@next/mdx'

const withMDX = createMDX({
  // Plugins are added via mdx-components.tsx and next-mdx-remote for content pages
})

const nextConfig: NextConfig = {
  pageExtensions: ['js', 'jsx', 'md', 'mdx', 'ts', 'tsx'],
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [],
  },
}

export default withMDX(nextConfig)
