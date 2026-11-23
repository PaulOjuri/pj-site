/**
 * Reminders: creating them, editing them, and the atomic claim the cron Worker fires them with.
 *
 * Shared by the Pages Functions (the app's form and the agents' endpoint) and workers/reminders, so
 * there is one definition of what "due" means and one place that computes the next occurrence.
 */
import { BadInput, dateString, integer, oneOf, slug, text, timeString } from './validate'
import { brusselsToUtc, brusselsLabel, nextOccurrence, toWall, REPEATS, type Repeat } from './time'

export type ReminderState = 'pending' | 'firing' | 'fired' | 'done' | 'cancelled'

export interface ReminderRow {
  id: string
  what: string
  due_at: string
  notify_at: string
  lead_minutes: number
  repeat: Repeat
  state: ReminderState
  project: string | null
  source: string
  claimed_at: string | null
  fired_at: string | null
  done_at: string | null
  snooze_count: number
  created_at: string
  updated_at: string
}

/** What the app shows: the row plus the Brussels wall clock, so the client does no timezone maths. */
export interface ReminderView extends ReminderRow {
  due_date: string
  due_time: string
  due_label: string
  notify_label: string
}

export function toView(row: ReminderRow): ReminderView {
  const wall = toWall(row.due_at)
  return {
    ...row,
    due_date: wall.date,
    due_time: wall.time,
    due_label: brusselsLabel(row.due_at),
    notify_label: brusselsLabel(row.notify_at),
  }
}

export const MAX_WHAT = 200

export interface ReminderInput {
  what: string
  dueAt: string
  leadMinutes: number
  repeat: Repeat
  project?: string
  source: string
}

/**
 * Read a create/edit body. Either a Brussels `date` + `time`, or a `due_at` instant (which is how the
 * agents send one). Lead time is how many minutes before `due_at` the push goes out.
 */
export function readReminderInput(body: Record<string, unknown>, source: string): ReminderInput {
  const what = text(body.what, 'what', { max: MAX_WHAT })
  let dueAt: string
  if (body.due_at != null && body.due_at !== '') {
    const t = Date.parse(text(body.due_at, 'due_at', { max: 40 }))
    if (Number.isNaN(t)) throw new BadInput('due_at must be an ISO timestamp')
    dueAt = new Date(t).toISOString()
  } else {
    dueAt = brusselsToUtc(dateString(body.date), timeString(body.time))
  }
  return {
    what,
    dueAt,
    leadMinutes: integer(body.lead_minutes, 'lead_minutes', { min: 0, max: 7 * 24 * 60, fallback: 0 }),
    repeat: oneOf(body.repeat, 'repeat', REPEATS, 'none'),
    project: slug(body.project, 'project'),
    source,
  }
}

export const notifyAtFor = (dueAt: string, leadMinutes: number): string =>
  new Date(Date.parse(dueAt) - leadMinutes * 60_000).toISOString()

export async function createReminder(db: D1Database, input: ReminderInput): Promise<ReminderView> {
  const now = new Date().toISOString()
  const id = crypto.randomUUID()
  const row: ReminderRow = {
    id,
    what: input.what,
    due_at: input.dueAt,
    notify_at: notifyAtFor(input.dueAt, input.leadMinutes),
    lead_minutes: input.leadMinutes,
    repeat: input.repeat,
    state: 'pending',
    project: input.project ?? null,
    source: input.source,
    claimed_at: null,
    fired_at: null,
    done_at: null,
    snooze_count: 0,
    created_at: now,
    updated_at: now,
  }
  await db
    .prepare(
      `INSERT INTO app_reminders
         (id, what, due_at, notify_at, lead_minutes, repeat, state, project, source, snooze_count, created_at, updated_at)
       VALUES (?1,?2,?3,?4,?5,?6,'pending',?7,?8,0,?9,?9)`,
    )
    .bind(
      row.id,
      row.what,
      row.due_at,
      row.notify_at,
      row.lead_minutes,
      row.repeat,
      row.project,
      row.source,
      now,
    )
    .run()
  return toView(row)
}

export async function getReminder(db: D1Database, id: string): Promise<ReminderRow | null> {
  return db.prepare('SELECT * FROM app_reminders WHERE id=?1').bind(id).first<ReminderRow>()
}

/**
 * Claim every reminder that is due, atomically.
 *
 * One UPDATE ... RETURNING: SQLite applies it as a single statement, so two overlapping Worker runs
 * cannot both take the same row, and whichever one gets it is the only one that pushes. A row that is
 * claimed but never finishes is picked up again after STUCK_MINUTES.
 */
export const STUCK_MINUTES = 10

export async function claimDue(db: D1Database, now: Date = new Date(), limit = 50): Promise<ReminderRow[]> {
  const nowIso = now.toISOString()
  const stuckBefore = new Date(now.getTime() - STUCK_MINUTES * 60_000).toISOString()
  const claimed = await db
    .prepare(
      `UPDATE app_reminders
          SET state='firing', claimed_at=?1, updated_at=?1
        WHERE id IN (
          SELECT id FROM app_reminders
           WHERE notify_at <= ?1
             AND (state='pending' OR (state='firing' AND claimed_at < ?2))
           ORDER BY notify_at
           LIMIT ?3
        )
        RETURNING *`,
    )
    .bind(nowIso, stuckBefore, limit)
    .all<ReminderRow>()
  return claimed.results ?? []
}

/**
 * After a reminder has been pushed: mark it fired, and if it repeats, queue the next one.
 * Returns the new reminder's id, when there is one.
 */
export async function completeFiring(db: D1Database, row: ReminderRow): Promise<string | null> {
  const now = new Date()
  const nowIso = now.toISOString()
  await db
    .prepare("UPDATE app_reminders SET state='fired', fired_at=?2, updated_at=?2 WHERE id=?1")
    .bind(row.id, nowIso)
    .run()
  const next = nextOccurrence(row.due_at, row.repeat, now)
  if (!next) return null
  const created = await createReminder(db, {
    what: row.what,
    dueAt: next,
    leadMinutes: row.lead_minutes,
    repeat: row.repeat,
    project: row.project ?? undefined,
    source: row.source,
  })
  return created.id
}
