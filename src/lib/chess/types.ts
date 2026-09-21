// Types mirror chess-coach/src/coach/publish/schemas.py. Keep in sync.

export interface FideRatings {
  standard: number | null
  rapid: number | null
  blitz: number | null
  standard_inactive: boolean
  blitz_inactive: boolean
  title: string | null
  as_of: string
  source: string
}

export interface RecentGame {
  id: string
  played_at: string
  speed: string
  source: string
  result: 'win' | 'loss' | 'draw' | 'unknown'
  color: 'white' | 'black'
  opponent_rating: number | null
  accuracy: number | null
  blunders: number
  url: string | null
}

export interface Summary {
  generated_at: string
  player: { name: string; fide_id: number; federation: string; birth_year: number | null; chesscom: string; lichess: string }
  fide: FideRatings
  online: Record<string, { username: string; fetched_at: string; ratings: Record<string, { rating: number | null; games?: number | null; record?: Record<string, number> | null }> }>
  pool: { analysed: number; by_speed: Record<string, number>; weighted: number }
  recent_form: RecentGame[]
  focus: { tag: string; description: string; status: string; n: number; frequency_per_100: number; severity: number }[]
  activity: { fide_rated_games_12m: number; last_otb_game: string | null; route: string; target_title: string }
  warnings: string[]
}

export interface GameIndexRow {
  id: string
  played_at: string
  speed: string
  source: string
  result: RecentGame['result']
  color: 'white' | 'black'
  opponent: string
  opponent_rating: number | null
  accuracy: number | null
  acpl: number | null
  blunders: number
  mistakes: number
  inaccuracies: number
  eco: string | null
  opening: string | null
  url: string | null
  published: boolean
}

export interface GameIndex { generated_at: string; count: number; games: GameIndexRow[] }

export interface MoveOut {
  p: number; s: string; u: string; f: string
  eb: number; ea: number; wl: number; c: 'best' | 'good' | 'inaccuracy' | 'mistake' | 'blunder'
  b: string | null; pv: string[]
  t: number | null; k: number | null; om: boolean | null; cx: number | null; cr: boolean | null
}

export interface MotifHit {
  ply: number; motif: string; attribution: string; fen: string; line: string[]
  detail: string | null; win_lost: number; classification: string; phase: string | null
}

export interface GameOut {
  id: string
  meta: {
    played_at: string; speed: string; source: string; result: RecentGame['result']; color: 'white' | 'black'
    white: { name: string; rating: number | null }; black: { name: string; rating: number | null }
    time_control: string | null; eco: string | null; opening: string | null; url: string | null
    event: string | null; round: string | null; fide_rated: boolean; termination: string | null; ply_count: number
  }
  analysis: { version: string; accuracy: { white: number | null; black: number | null }; acpl: { white: number | null; black: number | null }; counts: Record<string, Record<string, number>> }
  moves: MoveOut[]
  motifs: MotifHit[]
  features: { drift?: { from_ply: number; to_ply: number; total_win_lost: number; fen: string }[]; endgame?: Record<string, unknown> | null; conversion?: Record<string, unknown> | null; error_plies?: number[] }
}

export interface Evidence {
  game_id: string; ply: number; win_lost: number; played_at: string; url: string | null; fen: string | null; speed: string
  played?: string; best?: string; line?: string[]; detail?: string; classification?: string; phase?: string | null
  to_ply?: number; max_eval?: number; min_eval?: number
}

export interface Leak {
  tag: string; description: string; validated: boolean
  n: number; n_effective: number; games_with: number
  frequency_per_100: number; rate_ci: [number, number]
  severity: number; recency: number; leak_score: number
  status: 'confirmed' | 'provisional' | 'watch'
  trend: { state: string; recent: number | null; previous: number | null; change_pct?: number | null; n_recent: number; n_previous: number }
  evidence: Evidence[]
}

export interface Leaks {
  generated_at: string; pool_games: number; pool_weighted: number; pool_by_speed: Record<string, number>
  rules: Record<string, unknown>; leaks: Leak[]
}

export interface PlanTarget {
  tag: string; description: string; status: string; role: string; share: number; kind: string; response: string
  n: number; frequency_per_100: number; severity: number
  success: { metric: string; baseline: number; target: number; window: { from: string; to: string }; min_games: number; rule: string
    outcome: { verdict: string; measured: number | null; games: number } | null }
}

export interface PlanSession {
  id: string; day: string; duration_min: number; type: string; title: string; leak_targets: string[]
  assets: Record<string, unknown>; success_criterion: string; notes: string; done: boolean | null
}

export interface Plan {
  generated_at: string; week_start: string; week_index: number
  phase: { name: string; months: string; month_index: number; description: string }
  meso_block: number; deload: boolean; taper: { name: string; start: string; days_until: number } | null
  hours_planned: number; hours_available: number; blitz_cap_per_week: number
  targets: PlanTarget[]; sessions: PlanSession[]; warnings: string[]; rationale: string[]
  fsrs: { due_today: number; escalations: number; cards_created?: number }; seed: boolean; inputs_hash: string
}

export interface PlanHistory { generated_at: string; plans: Plan[] }

export interface DrillItem {
  id: string; fen: string; solution?: string[]; prompt?: string; rating?: number; themes?: string[]; url?: string | null
  game_id?: string; ply?: number; tag?: string; goal?: 'win' | 'hold'; signature?: string; eval_at_entry?: number; color?: 'white' | 'black'
  gap_cp?: number | null; found_in_game?: boolean
}

export interface TrainData {
  generated_at: string; week_start: string
  due_cards: { id: string; kind: string; payload: DrillItem; due: string; reps: number; lapses: number }[]
  sessions: { id: string; day: string; type: string; title: string; assets: Record<string, unknown> }[]
}
