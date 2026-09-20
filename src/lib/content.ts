import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'

const CONTENT_ROOT = path.join(process.cwd(), 'content')

export type WorkFrontmatter = {
  title: string
  tagline: string
  category: string
  year: string
  role: string
  client?: string
  stack: string[]
  status: 'live' | 'shipped' | 'archived'
  liveUrl?: string
  productPageUrl?: string
  coverImage?: string
  accentColor?: string
  order: number
  featured: boolean
}

export type JournalFrontmatter = {
  title: string
  date: string
  excerpt: string
  tags: string[]
  readingTime: string
}

export type WorkPost = {
  slug: string
  frontmatter: WorkFrontmatter
  content: string
}

export type JournalPost = {
  slug: string
  frontmatter: JournalFrontmatter
  content: string
}

function getSlugs(dir: string): string[] {
  const full = path.join(CONTENT_ROOT, dir)
  if (!fs.existsSync(full)) return []
  return fs
    .readdirSync(full)
    .filter((f) => f.endsWith('.mdx'))
    .map((f) => f.replace(/\.mdx$/, ''))
}

function readMdx(dir: string, slug: string) {
  const filePath = path.join(CONTENT_ROOT, dir, `${slug}.mdx`)
  const raw = fs.readFileSync(filePath, 'utf-8')
  return matter(raw)
}

/* ─── Work ───────────────────────────────────────────────────── */

export function getAllWork(): WorkPost[] {
  return getSlugs('work')
    .map((slug) => {
      const { data, content } = readMdx('work', slug)
      return { slug, frontmatter: data as WorkFrontmatter, content }
    })
    .sort((a, b) => a.frontmatter.order - b.frontmatter.order)
}

export function getWork(slug: string): WorkPost | null {
  try {
    const { data, content } = readMdx('work', slug)
    return { slug, frontmatter: data as WorkFrontmatter, content }
  } catch {
    return null
  }
}

export function getWorkSlugs(): string[] {
  return getSlugs('work')
}

/* ─── Journal ────────────────────────────────────────────────── */

export function getAllJournal(): JournalPost[] {
  return getSlugs('journal')
    .map((slug) => {
      const { data, content } = readMdx('journal', slug)
      return { slug, frontmatter: data as JournalFrontmatter, content }
    })
    .sort(
      (a, b) =>
        new Date(b.frontmatter.date).getTime() -
        new Date(a.frontmatter.date).getTime(),
    )
}

export function getJournalPost(slug: string): JournalPost | null {
  try {
    const { data, content } = readMdx('journal', slug)
    return { slug, frontmatter: data as JournalFrontmatter, content }
  } catch {
    return null
  }
}

export function getJournalSlugs(): string[] {
  return getSlugs('journal')
}
