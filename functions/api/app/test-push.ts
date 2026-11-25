// POST /api/app/test-push: Settings → "Send test notification". Goes through the same path as a real
// agent notification (feed row, then push), so a green result means the whole chain works.
import { guarded, json } from './_guard'
import { notify } from '../../_lib/notify'
import { vapidFrom } from '../../_lib/notify'
import { brusselsLabel } from '../../_lib/time'

export const onRequestPost = guarded(async ({ env }) => {
  if (!vapidFrom(env)) return json({ error: 'VAPID keys are not set on this deployment' }, 503)
  const { id, push } = await notify(env, {
    kind: 'note',
    title: 'Test notification',
    body: `Sent from Settings at ${brusselsLabel(new Date().toISOString())}.`,
    url: '/app#feed',
    source: 'app',
    project: 'general',
    priority: 'normal',
  })
  if (push.subscriptions === 0) return json({ error: 'no subscriptions on this account yet' }, 409)
  return json({ ok: push.sent > 0, id, ...push })
})
