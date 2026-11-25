/**
 * The card kind registry.
 *
 * "Anything the agents need me for" should be a new entry here, not a new screen. A kind decides what a
 * card looks like, which tab it belongs to, what the notification offers as actions, and where tapping
 * it goes. Unknown kinds still render: they fall back to `GENERIC`, so an agent can send a kind this
 * build has never heard of and the card is still readable.
 *
 * Adding one: docs/AGENT-APP.md § Adding a card kind.
 *
 * Imported by both the app (src/components/app) and the Functions (functions/api/agent/notify.ts), so
 * keep it free of browser and Workers APIs.
 */

export type Tone = 'accent' | 'info' | 'warn' | 'ok' | 'danger' | 'muted'
export type Tab = 'inbox' | 'reminders' | 'chat' | 'feed'

export interface NotificationAction {
  action: string
  title: string
}

export interface KindSpec {
  /** What the card is called on screen. */
  label: string
  /**
   * One character standing for the kind. The card draws an SVG mark instead (`KindMark` in
   * components/app/icons.tsx); this is the fallback for anywhere there is no room to draw, and it
   * keeps the registry readable on its own.
   */
  glyph: string
  tone: Tone
  /** Which tab a card of this kind belongs to. */
  tab: Tab
  /** Offered on the notification itself, handled in public/app/sw.js. */
  actions?: NotificationAction[]
  /** One line explaining the kind, shown in Settings so the registry documents itself. */
  about: string
}

export const GENERIC: KindSpec = {
  label: 'Update',
  glyph: '•',
  tone: 'muted',
  tab: 'feed',
  about: 'Anything an agent sends without a known kind.',
}

export const KINDS: Record<string, KindSpec> = {
  decision: {
    label: 'Decision',
    glyph: '?',
    tone: 'accent',
    tab: 'inbox',
    actions: [{ action: 'open', title: 'Decide' }],
    about: 'Only Paul can settle it. Filed as a GitHub issue by ask_paul.',
  },
  research: {
    label: 'Research',
    glyph: 'i',
    tone: 'info',
    tab: 'inbox',
    about: 'claude.ai answers these; the card shows what it found.',
  },
  reminder: {
    label: 'Reminder',
    glyph: '!',
    tone: 'warn',
    tab: 'reminders',
    actions: [
      { action: 'snooze', title: 'Snooze 10m' },
      { action: 'done', title: 'Done' },
    ],
    about: 'Fired by the reminders Worker, on the minute.',
  },
  chat: {
    label: 'Reply',
    glyph: '↩',
    tone: 'ok',
    tab: 'chat',
    about: 'An answer from the agents to something you asked in Chat.',
  },
  run: {
    label: 'Run',
    glyph: '▶',
    tone: 'muted',
    tab: 'feed',
    about: 'A briefing or single-agent run finished on your Mac.',
  },
  alert: {
    label: 'Alert',
    glyph: '△',
    tone: 'danger',
    tab: 'feed',
    about: 'Something an agent thinks is going wrong.',
  },
  note: {
    label: 'Note',
    glyph: '·',
    tone: 'muted',
    tab: 'feed',
    about: 'Information with nothing to do about it.',
  },
}

export const KIND_IDS = Object.keys(KINDS)

export function kindSpec(kind: string | null | undefined): KindSpec {
  return (kind && KINDS[kind]) || GENERIC
}

export const PRIORITIES = ['low', 'normal', 'high'] as const
export type Priority = (typeof PRIORITIES)[number]

/** RFC 8030 urgency, so a low-priority card doesn't wake the phone. */
export function urgencyFor(priority: Priority): 'low' | 'normal' | 'high' {
  return priority === 'low' ? 'low' : priority === 'high' ? 'high' : 'normal'
}
