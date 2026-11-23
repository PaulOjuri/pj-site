// GET /api/app/config: what the app needs before it can do anything, chiefly the VAPID public key to
// subscribe with. Behind Access, so it also doubles as the app's "am I signed in" check.
import { guarded, json } from './_guard'
import { inboxRepo } from '../../_lib/github'

export const onRequestGet = guarded(async ({ env, identity }) => {
  let repo: string | null = null
  try {
    repo = inboxRepo(env)
  } catch {
    repo = null
  }
  return json({
    email: identity.email,
    vapidPublicKey: env.VAPID_PUBLIC_KEY || null,
    pushConfigured: Boolean(env.VAPID_PUBLIC_KEY && env.VAPID_PRIVATE_KEY),
    inboxConfigured: Boolean(env.GITHUB_INBOX_TOKEN && repo),
    inboxRepo: repo,
    timeZone: 'Europe/Brussels',
  })
})
