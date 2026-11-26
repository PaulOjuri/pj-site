/**
 * The agent inbox, read and written through the GitHub REST API.
 *
 * The inbox is open issues in PaulOjuri/agent-network labelled `agent-inbox` plus `research` or
 * `decision` plus `project:<name>` (agent-network/src/inbox.ts files them). claude.ai's own comments
 * start with a hidden marker, which is how its research is told apart from Paul's words.
 *
 * GITHUB_INBOX_TOKEN is a fine-grained PAT with issues read+write on that one repository, and nothing
 * else. This app only ever comments and adds the `decided` label: it never closes an issue and never
 * removes a label, so the agents' own delivery flow stays theirs.
 */
import type { AppEnv } from './env'

export const CLAUDE_AI_MARKER = '<!-- agent-inbox:claude-ai -->'
const DEFAULT_API = 'https://api.github.com'
const UA = 'paulojuri.com-agent-app'

/** Only ever anything other than api.github.com in tests (tests/app/github-stub.mjs). */
const apiBase = (env: AppEnv) => (env.GITHUB_API_BASE || DEFAULT_API).replace(/\/+$/, '')

export type InboxKind = 'research' | 'decision' | 'unknown'

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
  /** The title without the "[kind] project:" prefix the agents add. */
  question: string
  kind: InboxKind
  project: string
  labels: string[]
  decided: boolean
  answered: boolean
  body: string
  url: string
  createdAt: string
  updatedAt: string
  comments: InboxComment[]
  /** claude.ai's latest marker comment, which is its research or its recommendation. */
  recommendation: string | null
}

interface GhIssue {
  number: number
  title: string
  body: string | null
  html_url: string
  created_at: string
  updated_at: string
  comments: number
  labels: Array<{ name: string }>
  pull_request?: unknown
}

interface GhComment {
  id: number
  body: string | null
  created_at: string
  user: { login: string } | null
}

export class GithubError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message)
  }
}

export function inboxRepo(env: AppEnv): string {
  const repo = (env.INBOX_REPO || 'PaulOjuri/agent-network').trim()
  if (!/^[\w.-]+\/[\w.-]+$/.test(repo)) throw new GithubError('INBOX_REPO is not owner/name', 500)
  return repo
}

async function gh<T>(env: AppEnv, path: string, init?: RequestInit): Promise<T> {
  if (!env.GITHUB_INBOX_TOKEN) throw new GithubError('GITHUB_INBOX_TOKEN is not set', 503)
  const res = await fetch(`${apiBase(env)}${path}`, {
    ...init,
    headers: {
      accept: 'application/vnd.github+json',
      authorization: `Bearer ${env.GITHUB_INBOX_TOKEN}`,
      'user-agent': UA,
      'x-github-api-version': '2022-11-28',
      // The issue list is cached for up to a minute; the app should never show a stale decision.
      'cache-control': 'no-cache',
      ...(init?.body ? { 'content-type': 'application/json' } : {}),
    },
  })
  if (!res.ok) {
    const detail = await res.text().catch(() => '')
    throw new GithubError(`github ${res.status}: ${detail.slice(0, 200)}`, res.status === 404 ? 404 : 502)
  }
  return (await res.json()) as T
}

const stripPrefix = (title: string) => title.replace(/^\[\w+\]\s*[\w-]+:\s*/, '')

function classify(labels: string[]): { kind: InboxKind; project: string } {
  return {
    kind: labels.includes('decision') ? 'decision' : labels.includes('research') ? 'research' : 'unknown',
    project: labels.find((l) => l.startsWith('project:'))?.slice('project:'.length) || 'general',
  }
}

function toComment(c: GhComment): InboxComment {
  const body = c.body ?? ''
  const isClaude = body.includes(CLAUDE_AI_MARKER)
  return {
    id: c.id,
    author: c.user?.login ?? 'unknown',
    from: isClaude ? 'claude-ai' : 'paul',
    body: body.replace(CLAUDE_AI_MARKER, '').trim(),
    at: c.created_at,
  }
}

/** One issue, read fresh, with its comments. */
export async function getIssue(env: AppEnv, number: number): Promise<InboxIssue> {
  const repo = inboxRepo(env)
  const issue = await gh<GhIssue>(env, `/repos/${repo}/issues/${number}`)
  const comments = issue.comments
    ? await gh<GhComment[]>(env, `/repos/${repo}/issues/${number}/comments?per_page=100`)
    : []
  return toInboxIssue(issue, comments)
}

export function toInboxIssue(issue: GhIssue, rawComments: GhComment[]): InboxIssue {
  const labels = issue.labels.map((l) => l.name)
  const { kind, project } = classify(labels)
  const comments = rawComments.map(toComment)
  const fromClaude = comments.filter((c) => c.from === 'claude-ai')
  return {
    number: issue.number,
    title: issue.title,
    question: stripPrefix(issue.title),
    kind,
    project,
    labels,
    decided: labels.includes('decided'),
    answered: labels.includes('answered'),
    body: issue.body ?? '',
    url: issue.html_url,
    createdAt: issue.created_at,
    updatedAt: issue.updated_at,
    comments,
    recommendation: fromClaude.length ? fromClaude[fromClaude.length - 1].body : null,
  }
}

/**
 * The open inbox, newest first. Comments are fetched per issue, so this is capped: 25 issues is far
 * more than the inbox has ever held, and the cap keeps one screen to at most 26 GitHub calls.
 */
export async function listInbox(env: AppEnv, limit = 25): Promise<InboxIssue[]> {
  const repo = inboxRepo(env)
  const issues = await gh<GhIssue[]>(env, `/repos/${repo}/issues?state=open&labels=agent-inbox&per_page=${limit}`)
  const real = issues.filter((i) => !i.pull_request).slice(0, limit)
  const out: InboxIssue[] = []
  for (const issue of real) {
    const comments = issue.comments
      ? await gh<GhComment[]>(env, `/repos/${repo}/issues/${issue.number}/comments?per_page=100`)
      : []
    out.push(toInboxIssue(issue, comments))
  }
  // Decisions first, then whatever changed most recently.
  return out.sort((a, b) => {
    const weight = (i: InboxIssue) => (i.kind === 'decision' && !i.decided ? 0 : 1)
    return weight(a) - weight(b) || Date.parse(b.updatedAt) - Date.parse(a.updatedAt)
  })
}

/**
 * The open inbox without its comments: one GitHub call, so a screen that only needs to know *that* an
 * agent has something waiting (the Agents tab) does not pay for 26 of them.
 */
export async function listInboxBrief(env: AppEnv, limit = 50): Promise<InboxIssue[]> {
  const repo = inboxRepo(env)
  const issues = await gh<GhIssue[]>(env, `/repos/${repo}/issues?state=open&labels=agent-inbox&per_page=${limit}`)
  return issues.filter((i) => !i.pull_request).map((issue) => toInboxIssue(issue, []))
}

export async function addComment(env: AppEnv, number: number, body: string): Promise<{ id: number }> {
  return gh<{ id: number }>(env, `/repos/${inboxRepo(env)}/issues/${number}/comments`, {
    method: 'POST',
    body: JSON.stringify({ body }),
  })
}

/** Adds labels. There is deliberately no remove-label and no close anywhere in this file. */
export async function addLabels(env: AppEnv, number: number, labels: string[]): Promise<void> {
  await gh(env, `/repos/${inboxRepo(env)}/issues/${number}/labels`, {
    method: 'POST',
    body: JSON.stringify({ labels }),
  })
}
