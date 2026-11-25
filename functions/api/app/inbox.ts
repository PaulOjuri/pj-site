// GET /api/app/inbox: the open agent-inbox issues, decisions first. Everything in them is untrusted
// text from GitHub; it is sent as JSON and the app renders it as text nodes, never as markup.
import { guarded, json } from './_guard'
import { GithubError, inboxRepo, listInbox } from '../../_lib/github'

export const onRequestGet = guarded(async ({ env }) => {
  if (!env.GITHUB_INBOX_TOKEN) return json({ error: 'GITHUB_INBOX_TOKEN is not set', issues: [] }, 503)
  try {
    const issues = await listInbox(env)
    return json({ repo: inboxRepo(env), issues })
  } catch (err) {
    if (err instanceof GithubError) return json({ error: err.message, issues: [] }, err.status)
    throw err
  }
})
