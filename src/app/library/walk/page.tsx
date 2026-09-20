import type { Metadata } from 'next'
import { WalkClient } from './WalkClient'

export const metadata: Metadata = {
  title: 'Library · Walk in',
  description: 'A 3D walkable library. Eleven shelves, sixty-six books, one warm room.',
}

export default function WalkPage() {
  return <WalkClient />
}
