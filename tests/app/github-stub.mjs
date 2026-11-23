/**
 * A stand-in for the GitHub issues API, so the Inbox and the decide flow can be driven locally without
 * a personal access token and without touching the real repository.
 *
 *   node tests/app/github-stub.mjs [port]
 *
 * It serves two agent-inbox issues — one decision with a claude.ai recommendation, one research answer —
 * and accepts comments and label additions. It refuses to close an issue or remove a label, which is
 * what the app is supposed to never do: if that ever changes, this test server is where it shows up.
 *
 * Point the Functions at it with GITHUB_API_BASE (see functions/_lib/env.ts).
 */
import { createServer } from 'node:http'

const PORT = Number(process.argv[2] ?? 8791)
const MARKER = '<!-- agent-inbox:claude-ai -->'

/** Deliberately nasty text: the app has to render this as characters, not as markup. */
const XSS = '<img src=x onerror=alert(1)> & <script>alert("inbox")</script>'

const issues = new Map([
  [
    12,
    {
      number: 12,
      title: '[decision] alfera: Which launch date for the v2 site?',
      body: `**Project:** alfera\n\n## Question\nWhich launch date for the v2 site?\n\n## Context\nThe preview branch is green and the client has signed off on the copy. ${XSS}\n\n## Options\n1. 1 December, before the party\n2. 15 December, after the party\n`,
      html_url: 'https://github.com/PaulOjuri/agent-network/issues/12',
      created_at: '2026-11-21T09:00:00Z',
      updated_at: '2026-11-22T17:30:00Z',
      labels: [{ name: 'agent-inbox' }, { name: 'decision' }, { name: 'project:alfera' }],
      comments: [
        {
          id: 1,
          created_at: '2026-11-22T17:30:00Z',
          user: { login: 'paulojuri' },
          body: `${MARKER}\n## Recommendation\nGo with **1 December**.\n\n- the party on the 10th is the demo moment\n- two weeks of real traffic before the invoice\n\nSee [the brief](https://github.com/PaulOjuri/agent-network).`,
        },
      ],
    },
  ],
  [
    13,
    {
      number: 13,
      title: '[research] unalone: What do EU hosts charge for a single self-hosted runner?',
      body: '**Project:** unalone\n\n## Question\nWhat do EU hosts charge for a single self-hosted runner?\n',
      html_url: 'https://github.com/PaulOjuri/agent-network/issues/13',
      created_at: '2026-11-20T08:00:00Z',
      updated_at: '2026-11-20T16:48:00Z',
      labels: [{ name: 'agent-inbox' }, { name: 'research' }, { name: 'project:unalone' }, { name: 'answered' }],
      comments: [
        {
          id: 2,
          created_at: '2026-11-20T16:48:00Z',
          user: { login: 'paulojuri' },
          body: `${MARKER}\nHetzner CX22 is about €4.50/month in Falkenstein; Scaleway DEV1-S is about €7.`,
        },
      ],
    },
  ],
])

let nextCommentId = 100

const json = (res, status, data) => {
  res.writeHead(status, { 'content-type': 'application/json' })
  res.end(JSON.stringify(data))
}

const withComments = (issue) => ({ ...issue, comments: issue.comments.length })

createServer((req, res) => {
  const chunks = []
  req.on('data', (c) => chunks.push(c))
  req.on('end', () => {
    const url = new URL(req.url, `http://localhost:${PORT}`)
    const body = chunks.length ? JSON.parse(Buffer.concat(chunks).toString()) : {}
    const parts = url.pathname.split('/').filter(Boolean) // repos, owner, repo, issues, ...

    if (req.method === 'GET' && parts[3] === 'issues' && parts.length === 4) {
      const open = [...issues.values()].filter((i) => !i.state || i.state === 'open')
      return json(res, 200, open.map(withComments))
    }
    const number = Number(parts[4])
    const issue = issues.get(number)
    if (!issue) return json(res, 404, { message: 'Not Found' })

    if (req.method === 'GET' && parts.length === 5) return json(res, 200, withComments(issue))
    if (req.method === 'GET' && parts[5] === 'comments') return json(res, 200, issue.comments)

    if (req.method === 'POST' && parts[5] === 'comments') {
      const comment = {
        id: nextCommentId++,
        created_at: new Date().toISOString(),
        user: { login: 'paulojuri' },
        body: String(body.body ?? ''),
      }
      issue.comments.push(comment)
      issue.updated_at = comment.created_at
      return json(res, 201, comment)
    }

    if (req.method === 'POST' && parts[5] === 'labels') {
      for (const name of body.labels ?? []) if (!issue.labels.some((l) => l.name === name)) issue.labels.push({ name })
      return json(res, 200, issue.labels)
    }

    // Anything that would close an issue or take a label off is a failure of the app, not of the stub.
    if (req.method === 'PATCH' || req.method === 'DELETE') {
      console.error(`REFUSED: the app tried to ${req.method} ${url.pathname}`)
      return json(res, 403, { message: 'this app must never close an issue or remove a label' })
    }
    return json(res, 404, { message: 'Not Found' })
  })
}).listen(PORT, '127.0.0.1', () => console.log(`github stub on ${PORT}`))
