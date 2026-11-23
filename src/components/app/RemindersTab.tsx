'use client'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { api, ApiError } from '@/lib/app/api'
import type { Reminder, RemindersResponse } from '@/lib/app/types'
import { Empty, ErrorNote, KindBadge, Meta, Spinner } from './ui'

/**
 * Reminders. Everything on screen is Brussels time; the endpoint stores UTC and hands back both, so
 * there is no timezone arithmetic in the browser.
 *
 * Snooze and Done are the same calls the notification's own buttons make (public/app/sw.js), so a
 * reminder can be dealt with without opening the app at all.
 */

const REPEATS: Array<{ value: Reminder['repeat']; label: string }> = [
  { value: 'none', label: 'Once' },
  { value: 'daily', label: 'Daily' },
  { value: 'weekdays', label: 'Weekdays' },
  { value: 'weekly', label: 'Weekly' },
]

const LEADS = [0, 5, 10, 15, 30, 60, 120, 1440]

interface Props {
  focus: string | null
  onFocus: (id: string | null) => void
  reloadToken: number
}

/** Now, in Brussels, as the two values the form's date and time inputs want. */
function brusselsNow(offsetMinutes = 0): { date: string; time: string } {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Europe/Brussels',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).formatToParts(new Date(Date.now() + offsetMinutes * 60_000))
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? '00'
  return {
    date: `${get('year')}-${get('month')}-${get('day')}`,
    time: `${get('hour') === '24' ? '00' : get('hour')}:${get('minute')}`,
  }
}

export function RemindersTab({ focus, onFocus, reloadToken }: Props) {
  const [data, setData] = useState<RemindersResponse | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [editing, setEditing] = useState<Reminder | null>(null)
  const [showForm, setShowForm] = useState(false)

  const load = useCallback(async () => {
    setError(null)
    try {
      setData(await api.reminders())
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'could not load reminders')
    }
  }, [])

  useEffect(() => {
    // Loading on mount: a static export has no server component to preload this, and the
    // state lands after an await rather than during the render pass.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load()
  }, [load, reloadToken])

  // A deep link from a notification: open that reminder's own card.
  const focused = useMemo(
    () => (focus ? [...(data?.upcoming ?? []), ...(data?.done ?? [])].find((r) => r.id === focus) ?? null : null),
    [focus, data],
  )

  async function act(id: string, payload: Record<string, unknown>) {
    setError(null)
    try {
      await api.updateReminder(id, payload)
      await load()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'that did not work')
    }
  }

  async function remove(id: string) {
    setError(null)
    try {
      await api.deleteReminder(id)
      if (focus === id) onFocus(null)
      await load()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'could not delete that')
    }
  }

  if (!data && !error) return <Spinner label="Loading reminders" />

  return (
    <>
      {error && <ErrorNote error={error} onRetry={load} />}

      {focus && (
        <div className="app-row">
          <button className="app-btn small quiet" onClick={() => onFocus(null)}>
            ← All reminders
          </button>
        </div>
      )}

      {focused ? (
        <ReminderCard
          reminder={focused}
          onAct={act}
          onDelete={remove}
          onEdit={() => {
            setEditing(focused)
            setShowForm(true)
          }}
        />
      ) : (
        <>
          {showForm || editing ? (
            <ReminderForm
              reminder={editing}
              onDone={async () => {
                setEditing(null)
                setShowForm(false)
                await load()
              }}
              onCancel={() => {
                setEditing(null)
                setShowForm(false)
              }}
            />
          ) : (
            <button className="app-btn primary" onClick={() => setShowForm(true)}>
              + New reminder
            </button>
          )}

          <h3 className="app-section-title">Upcoming</h3>
          {(data?.upcoming ?? []).length === 0 && <Empty>Nothing scheduled.</Empty>}
          {(data?.upcoming ?? []).map((reminder) => (
            <ReminderCard
              key={reminder.id}
              reminder={reminder}
              onAct={act}
              onDelete={remove}
              onEdit={() => {
                setEditing(reminder)
                setShowForm(true)
              }}
            />
          ))}

          {(data?.done ?? []).length > 0 && (
            <>
              <h3 className="app-section-title">Done and fired</h3>
              {(data?.done ?? []).map((reminder) => (
                <ReminderCard key={reminder.id} reminder={reminder} onAct={act} onDelete={remove} past />
              ))}
            </>
          )}
        </>
      )}
    </>
  )
}

function ReminderCard({
  reminder,
  onAct,
  onDelete,
  onEdit,
  past = false,
}: {
  reminder: Reminder
  onAct: (id: string, payload: Record<string, unknown>) => Promise<void>
  onDelete: (id: string) => Promise<void>
  onEdit?: () => void
  past?: boolean
}) {
  const [confirmDelete, setConfirmDelete] = useState(false)
  const lead = reminder.lead_minutes
    ? `${leadLabel(reminder.lead_minutes)} before`
    : null
  return (
    <article className="app-card" id={`reminder-${reminder.id}`}>
      <div className="app-card-head">
        <KindBadge kind="reminder" />
        <div style={{ flex: 1, minWidth: 0 }}>
          <h2 className="app-card-title">{reminder.what}</h2>
          <Meta
            parts={[
              reminder.due_label,
              reminder.repeat !== 'none' ? reminder.repeat : null,
              lead,
              reminder.state !== 'pending' ? reminder.state : null,
              reminder.snooze_count ? `snoozed ${reminder.snooze_count}×` : null,
              reminder.source === 'agent' ? 'from an agent' : null,
            ]}
          />
        </div>
      </div>
      <div className="app-row end">
        {!past && (
          <>
            <button className="app-btn small" onClick={() => void onAct(reminder.id, { snooze_minutes: 10 })}>
              Snooze 10m
            </button>
            <button className="app-btn small" onClick={() => void onAct(reminder.id, { state: 'done' })}>
              Done
            </button>
            {onEdit && (
              <button className="app-btn small quiet" onClick={onEdit}>
                Edit
              </button>
            )}
          </>
        )}
        {past && reminder.state !== 'pending' && (
          <button className="app-btn small quiet" onClick={() => void onAct(reminder.id, { state: 'pending' })}>
            Put back
          </button>
        )}
        <button
          className="app-btn small quiet danger"
          onClick={() => (confirmDelete ? void onDelete(reminder.id) : setConfirmDelete(true))}
        >
          {confirmDelete ? 'Confirm delete' : 'Delete'}
        </button>
      </div>
    </article>
  )
}

function leadLabel(minutes: number): string {
  if (minutes < 60) return `${minutes} min`
  if (minutes < 1440) return `${minutes / 60} h`
  return `${minutes / 1440} day${minutes === 1440 ? '' : 's'}`
}

function ReminderForm({
  reminder,
  onDone,
  onCancel,
}: {
  reminder: Reminder | null
  onDone: () => Promise<void>
  onCancel: () => void
}) {
  const start = useMemo(() => brusselsNow(60), [])
  const [what, setWhat] = useState(reminder?.what ?? '')
  const [date, setDate] = useState(reminder?.due_date ?? start.date)
  const [time, setTime] = useState(reminder?.due_time ?? start.time)
  const [lead, setLead] = useState(reminder?.lead_minutes ?? 0)
  const [repeat, setRepeat] = useState<Reminder['repeat']>(reminder?.repeat ?? 'none')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function save() {
    if (!what.trim() || busy) return
    setBusy(true)
    setError(null)
    try {
      const payload = { what: what.trim(), date, time, lead_minutes: lead, repeat }
      if (reminder) await api.updateReminder(reminder.id, payload)
      else await api.createReminder(payload)
      await onDone()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'could not save that')
    } finally {
      setBusy(false)
    }
  }

  return (
    <section className="app-card">
      <h3 className="app-section-title" style={{ marginTop: 0 }}>
        {reminder ? 'Edit reminder' : 'New reminder'}
      </h3>
      <div className="app-field">
        <label htmlFor="r-what">What</label>
        <input
          id="r-what"
          value={what}
          onChange={(e) => setWhat(e.target.value)}
          maxLength={200}
          placeholder="Send Alfera the v2 invoice"
        />
      </div>
      <div className="app-grid-2">
        <div className="app-field">
          <label htmlFor="r-date">Date</label>
          <input id="r-date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </div>
        <div className="app-field">
          <label htmlFor="r-time">Time (Brussels)</label>
          <input id="r-time" type="time" value={time} onChange={(e) => setTime(e.target.value)} />
        </div>
      </div>
      <div className="app-grid-2">
        <div className="app-field">
          <label htmlFor="r-lead">Warn me</label>
          <select id="r-lead" value={lead} onChange={(e) => setLead(Number(e.target.value))}>
            {LEADS.map((minutes) => (
              <option key={minutes} value={minutes}>
                {minutes === 0 ? 'At the time' : `${leadLabel(minutes)} before`}
              </option>
            ))}
          </select>
        </div>
        <div className="app-field">
          <label htmlFor="r-repeat">Repeat</label>
          <select id="r-repeat" value={repeat} onChange={(e) => setRepeat(e.target.value as Reminder['repeat'])}>
            {REPEATS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>
      {error && <ErrorNote error={error} />}
      <div className="app-row end">
        <button className="app-btn small quiet" onClick={onCancel}>
          Cancel
        </button>
        <button className="app-btn small primary" disabled={busy || !what.trim()} onClick={() => void save()}>
          {busy ? 'Saving…' : reminder ? 'Save' : 'Add reminder'}
        </button>
      </div>
    </section>
  )
}
