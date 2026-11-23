/**
 * The app's one way of talking to its endpoints.
 *
 * Cookies go with every call, because Cloudflare Access authorises the request with the CF_Authorization
 * cookie and the edge turns that into the signed header the Functions verify. A 401 or 403 means the
 * Access session has run out, which is a reload, not an error message.
 */
import type {
  AppConfig,
  ChatResponse,
  FeedResponse,
  InboxIssue,
  InboxResponse,
  Reminder,
  RemindersResponse,
} from './types'

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message)
  }

  /** True when the Access session, not the request, is the problem. */
  get needsSignIn(): boolean {
    return this.status === 401 || this.status === 403
  }
}

async function call<T>(path: string, init: RequestInit = {}): Promise<T> {
  const response = await fetch(path, {
    credentials: 'include',
    ...init,
    headers: {
      accept: 'application/json',
      ...(init.body ? { 'content-type': 'application/json' } : {}),
      ...init.headers,
    },
  })
  const text = await response.text()
  let data: unknown = null
  try {
    data = text ? JSON.parse(text) : null
  } catch {
    // Access serves an HTML sign-in page when the session has gone; treat it as a sign-in problem.
    throw new ApiError(response.ok ? 'unreadable response' : 'please sign in again', response.status)
  }
  if (!response.ok) {
    const message = (data as { error?: string })?.error || `request failed (${response.status})`
    throw new ApiError(message, response.status)
  }
  return data as T
}

const body = (value: unknown) => JSON.stringify(value)

export const api = {
  config: () => call<AppConfig>('/api/app/config'),

  feed: (filters: { project?: string; kind?: string; before?: string; limit?: number } = {}) => {
    const params = new URLSearchParams()
    for (const [key, value] of Object.entries(filters)) if (value) params.set(key, String(value))
    const query = params.toString()
    return call<FeedResponse>(`/api/app/feed${query ? `?${query}` : ''}`)
  },
  markRead: (payload: { ids?: string[]; all?: boolean }) =>
    call<{ marked: number }>('/api/app/feed/read', { method: 'POST', body: body(payload) }),

  reminders: () => call<RemindersResponse>('/api/app/reminders'),
  createReminder: (payload: {
    what: string
    date: string
    time: string
    lead_minutes?: number
    repeat?: string
  }) => call<{ reminder: Reminder }>('/api/app/reminders', { method: 'POST', body: body(payload) }),
  updateReminder: (id: string, payload: Record<string, unknown>) =>
    call<{ reminder: Reminder | null }>(`/api/app/reminders/${encodeURIComponent(id)}`, {
      method: 'PATCH',
      body: body(payload),
    }),
  deleteReminder: (id: string) =>
    call<{ ok: boolean }>(`/api/app/reminders/${encodeURIComponent(id)}`, { method: 'DELETE' }),

  inbox: () => call<InboxResponse>('/api/app/inbox'),
  issue: (number: number) => call<{ issue: InboxIssue }>(`/api/app/inbox/${number}`),
  comment: (number: number, comment: string, decide = false) =>
    call<{ issue: InboxIssue }>(`/api/app/inbox/${number}`, {
      method: 'POST',
      body: body({ comment, decide }),
    }),

  chat: () => call<ChatResponse>('/api/app/chat'),
  send: (message: string, threadId?: string) =>
    call<{ id: string; thread_id: string }>('/api/app/chat', {
      method: 'POST',
      body: body({ body: message, thread_id: threadId }),
    }),

  subscribe: (subscription: PushSubscriptionJSON) =>
    call<{ subscriptions: number }>('/api/app/subscriptions', {
      method: 'POST',
      body: body({ endpoint: subscription.endpoint, keys: subscription.keys }),
    }),
  unsubscribe: (endpoint: string) =>
    call<{ removed: number }>('/api/app/subscriptions', { method: 'DELETE', body: body({ endpoint }) }),
  testPush: () =>
    call<{ ok: boolean; sent: number; subscriptions: number }>('/api/app/test-push', { method: 'POST' }),
}
