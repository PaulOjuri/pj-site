// Build-time loaders over the artifacts chess-coach publishes into public/chess/data.
// Everything here runs in server components during `next build` (static export).
import fs from 'node:fs'
import path from 'node:path'
import type { GameIndex, GameOut, Leaks, Plan, PlanHistory, Summary, TrainData } from './types'

const DATA_DIR = path.join(process.cwd(), 'public', 'chess', 'data')

function readJson<T>(rel: string): T | null {
  const p = path.join(DATA_DIR, rel)
  if (!fs.existsSync(p)) return null
  return JSON.parse(fs.readFileSync(p, 'utf8')) as T
}

export function getSummary(): Summary | null {
  return readJson<Summary>('summary.json')
}

export function getGameIndex(): GameIndex {
  return readJson<GameIndex>('games/index.json') ?? { generated_at: '', count: 0, games: [] }
}

export function gameFile(id: string): string {
  return `games/${id.replace(':', '_')}.json`
}

export function getGame(id: string): GameOut | null {
  return readJson<GameOut>(gameFile(id))
}

export function getLeaks(): Leaks | null {
  return readJson<Leaks>('leaks.json')
}

export function publishedGameIds(): string[] {
  return getGameIndex().games.filter((g) => g.published).map((g) => g.id)
}

export function slugify(id: string): string {
  return id.replace(':', '_')
}

export function unslug(slug: string): string {
  return slug.replace('_', ':')
}

export function getPlan(): Plan | null {
  return readJson<Plan>('plan/current.json')
}

export function getPlanHistory(): Plan[] {
  return readJson<PlanHistory>('plan/history.json')?.plans ?? []
}

export function getTrain(): TrainData | null {
  return readJson<TrainData>('train.json')
}
