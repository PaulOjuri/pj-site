/**
 * Reminders are entered and shown in Brussels time and stored in UTC.
 *
 * Adding 24 hours in UTC is not "the same time tomorrow": Brussels moves between CET and CEST twice a
 * year, so a daily 08:00 reminder would drift to 07:00 or 09:00 across the change. Everything here works
 * on the Brussels wall clock and converts at the end, which keeps 08:00 at 08:00.
 */
export const TZ = 'Europe/Brussels'

export type Repeat = 'none' | 'daily' | 'weekdays' | 'weekly'
export const REPEATS: readonly Repeat[] = ['none', 'daily', 'weekdays', 'weekly']

const partsFormat = new Intl.DateTimeFormat('en-GB', {
  timeZone: TZ,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  hour12: false,
  weekday: 'short',
})

export interface Wall {
  date: string // YYYY-MM-DD in Brussels
  time: string // HH:MM in Brussels
  weekday: number // 1 = Monday ... 7 = Sunday
}

const WEEKDAYS: Record<string, number> = { Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6, Sun: 7 }

/** The Brussels wall clock at a UTC instant. */
export function toWall(iso: string | Date): Wall {
  const parts = partsFormat.formatToParts(typeof iso === 'string' ? new Date(iso) : iso)
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? ''
  const hour = get('hour') === '24' ? '00' : get('hour') // some engines render midnight as 24
  return {
    date: `${get('year')}-${get('month')}-${get('day')}`,
    time: `${hour}:${get('minute')}`,
    weekday: WEEKDAYS[get('weekday')] ?? 1,
  }
}

/** How far Brussels is ahead of UTC at a given instant, in minutes (60 in winter, 120 in summer). */
function offsetMinutes(instantMs: number): number {
  const w = toWall(new Date(instantMs))
  const [h, m] = w.time.split(':').map(Number)
  const asUtc = Date.parse(`${w.date}T${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:00Z`)
  // Seconds are dropped by toWall, so compare on whole minutes.
  return Math.round((asUtc - Math.floor(instantMs / 60_000) * 60_000) / 60_000)
}

/**
 * The UTC instant for a Brussels wall-clock date and time.
 *
 * Two passes: guess with the offset at the naive instant, then re-check the offset where the guess
 * actually lands, which is what makes the hours either side of a clock change come out right.
 */
export function brusselsToUtc(date: string, time: string): string {
  const naive = Date.parse(`${date}T${time}:00Z`)
  if (Number.isNaN(naive)) throw new Error(`not a date and time: ${date} ${time}`)
  let instant = naive - offsetMinutes(naive) * 60_000
  const corrected = naive - offsetMinutes(instant) * 60_000
  if (corrected !== instant) instant = corrected
  return new Date(instant).toISOString()
}

const addDays = (date: string, days: number): string =>
  new Date(Date.parse(`${date}T00:00:00Z`) + days * 86_400_000).toISOString().slice(0, 10)

/** 1 = Monday ... 7 = Sunday, for a YYYY-MM-DD date. */
const weekdayOf = (date: string): number => ((new Date(`${date}T00:00:00Z`).getUTCDay() + 6) % 7) + 1

/**
 * When a repeating reminder is next due, as a UTC instant, or null when it does not repeat.
 * `after` lets a reminder that fired late (or was snoozed past its next slot) skip to the future.
 */
export function nextOccurrence(dueAtIso: string, repeat: Repeat, after: Date = new Date()): string | null {
  if (repeat === 'none') return null
  const start = toWall(dueAtIso)
  let date = start.date
  for (let i = 0; i < 400; i++) {
    date = addDays(date, repeat === 'weekly' ? 7 : 1)
    if (repeat === 'weekdays' && weekdayOf(date) > 5) continue
    const candidate = brusselsToUtc(date, start.time)
    if (Date.parse(candidate) > after.getTime()) return candidate
  }
  return null
}

/** "Mon 24 Nov, 08:30" in Brussels, for notification text and the list. */
export function brusselsLabel(iso: string): string {
  return new Intl.DateTimeFormat('en-GB', {
    timeZone: TZ,
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(new Date(iso))
}
