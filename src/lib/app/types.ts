/**
 * What the app's endpoints return.
 *
 * Declared here rather than imported from functions/_lib, because those modules are typed against the
 * Workers runtime (D1Database and friends) which has no business in the browser bundle. The shapes are
 * small and the endpoints are the contract; tests/app.spec.ts drives them end to end.
 */

export type Priority = 'low' | 'normal' | 'high'
export type Repeat = 'none' | 'daily' | 'weekdays' | 'weekly'
export type ReminderState = 'pending' | 'firing' | 'fired' | 'done' | 'cancelled'

export interface AppConfig {
  email: string
  vapidPublicKey: string | null
  pushConfigured: boolean
  inboxConfigured: boolean
  inboxRepo: string | null
  timeZone: string
}

export interface FeedItem {
  id: string
  ts: string
  kind: string
  project: string | null
  title: string
  body: string | null
  url: string | null
  priority: Priority
  source: string
  read_at: string | null
}

export interface FeedResponse {
  items: FeedItem[]
  projects: string[]
  unread: number
}

export interface Reminder {
  id: string
  what: string
  due_at: string
  notify_at: string
  due_date: string
  due_time: string
  due_label: string
  notify_label: string
  lead_minutes: number
  repeat: Repeat
  state: ReminderState
  project: string | null
  source: string
  snooze_count: number
  created_at: string
}

export interface RemindersResponse {
  upcoming: Reminder[]
  done: Reminder[]
}

export interface InboxComment {
  id: number
  author: string
  from: 'claude-ai' | 'paul' | 'other'
  body: string
  at: string
}

export interface InboxIssue {
  number: number
  title: string
  question: string
  kind: 'research' | 'decision' | 'unknown'
  project: string
  labels: string[]
  decided: boolean
  answered: boolean
  body: string
  url: string
  createdAt: string
  updatedAt: string
  comments: InboxComment[]
  recommendation: string | null
}

export interface InboxResponse {
  repo?: string
  issues: InboxIssue[]
  error?: string
}

export interface ChatMessage {
  id: string
  thread_id: string
  role: 'paul' | 'agent'
  body: string
  status: string
  agent: string | null
  created_at: string
  answered_at: string | null
}

export interface ChatThread {
  thread_id: string
  messages: ChatMessage[]
  last_at: string
  pending: boolean
}

export interface ChatResponse {
  threads: ChatThread[]
}
