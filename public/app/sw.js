/*
  The agent app's service worker.

  Three jobs:
    1. Keep the app shell openable offline.
    2. Show the notifications the Worker and the notify endpoint push, with the default sound, and
       deep-link each one to its own card.
    3. Handle the notification's own buttons (snooze, done) without opening the app.

  Scope is /app, which is wider than this file's folder, so public/_headers sends
  `Service-Worker-Allowed: /app` with it. Nothing outside /app is intercepted: the public pages of
  paulojuri.com must behave exactly as they did before this file existed.

  Bump VERSION to roll the cache; the old one is deleted on activate.
*/

const VERSION = 'agent-app-v1'
const SHELL = ['/app', '/app/manifest.webmanifest', '/app/offline.html', '/app/offline', '/app/icon-192.png']

/** Everything the app needs to boot: the shell, plus the hashed Next chunks the shell references. */
async function precache() {
  const cache = await caches.open(VERSION)
  // One URL at a time. addAll() throws the whole batch away if a single entry fails, and on the
  // deployed site /app/offline.html is a 308 to /app/offline — exactly the kind of thing that would
  // otherwise take the rest of the shell down with it.
  await Promise.all(SHELL.map((url) => cache.add(url).catch(() => undefined)))
  try {
    // Pull the chunk URLs out of the page itself, so a first launch offline still works. One request
    // at a time: addAll() throws the whole batch away if a single URL 404s, and the page's inlined
    // payload mentions names that are not all real files.
    const html = await (await fetch('/app', { cache: 'reload' })).text()
    const assets = [...html.matchAll(/["'](\/_next\/static\/[^"'\\]+\.(?:js|css))["']/g)].map((m) => m[1])
    await Promise.all([...new Set(assets)].slice(0, 60).map((url) => cache.add(url).catch(() => undefined)))
  } catch {
    // Offline at install time: the shell is cached on the next successful visit instead.
  }
}

self.addEventListener('install', (event) => {
  event.waitUntil(precache().then(() => self.skipWaiting()))
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const names = await caches.keys()
      await Promise.all(names.filter((name) => name !== VERSION).map((name) => caches.delete(name)))
      await self.clients.claim()
    })(),
  )
})

self.addEventListener('message', (event) => {
  if (event.data === 'skip-waiting') self.skipWaiting()
})

const isAppPath = (url) => url.pathname === '/app' || url.pathname.startsWith('/app/')

self.addEventListener('fetch', (event) => {
  const request = event.request
  if (request.method !== 'GET') return
  const url = new URL(request.url)
  if (url.origin !== self.location.origin) return
  // Private data is never cached, and the rest of the site is left alone.
  if (url.pathname.startsWith('/api/')) return
  const isAsset = url.pathname.startsWith('/_next/static/')
  if (!isAppPath(url) && !isAsset) return

  // Navigations: the network decides, the cache catches us.
  if (request.mode === 'navigate') {
    event.respondWith(
      (async () => {
        try {
          const response = await fetch(request)
          if (response.ok) {
            const cache = await caches.open(VERSION)
            cache.put('/app', response.clone())
          }
          return response
        } catch {
          // ignoreVary: the cached shell was stored for a different request's headers, and a Vary
          // mismatch here would mean a blank page instead of the app.
          const cache = await caches.open(VERSION)
          const options = { ignoreSearch: true, ignoreVary: true }
          return (
            (await cache.match('/app', options)) ||
            (await cache.match('/app/offline.html', options)) ||
            (await cache.match('/app/offline', options)) ||
            Response.error()
          )
        }
      })(),
    )
    return
  }

  // Assets: answer from the cache at once, refresh it in the background.
  event.respondWith(
    (async () => {
      const cache = await caches.open(VERSION)
      const cached = await cache.match(request, { ignoreVary: true })
      const network = fetch(request)
        .then((response) => {
          if (response.ok) cache.put(request, response.clone())
          return response
        })
        .catch(() => cached || Response.error())
      return cached || network
    })(),
  )
})

/* ── Notifications ───────────────────────────────────────────────────────── */

self.addEventListener('push', (event) => {
  let payload = {}
  try {
    payload = event.data ? event.data.json() : {}
  } catch {
    payload = { title: 'Agent', body: event.data ? event.data.text().slice(0, 200) : '' }
  }

  const title = payload.title || 'Agent'
  const url = typeof payload.url === 'string' && payload.url.startsWith('/') ? payload.url : '/app'
  const actions = Array.isArray(payload.actions) ? payload.actions.slice(0, 2) : []

  event.waitUntil(
    (async () => {
      await self.registration.showNotification(title, {
        body: payload.body || '',
        // The default sound and vibration: silent would make a reminder useless.
        silent: false,
        // One notification per card id, so a repeat of the same card replaces it.
        tag: payload.id || url,
        renotify: true,
        icon: '/app/icon-192.png',
        badge: '/app/badge-96.png',
        data: { url, kind: payload.kind || 'note', id: payload.id || null },
        actions,
        requireInteraction: payload.priority === 'high',
      })
      // If the app is open, let it refresh rather than sit on stale cards.
      const clients = await self.clients.matchAll({ type: 'window', includeUncontrolled: true })
      for (const client of clients) client.postMessage({ type: 'push', url })
    })(),
  )
})

/** The reminder id out of a deep link like /app#reminders/<uuid>. */
function reminderIdFrom(url) {
  const match = /#reminders\/([\w-]+)$/.exec(url || '')
  return match ? match[1] : null
}

async function patchReminder(id, body) {
  try {
    const response = await fetch(`/api/app/reminders/${id}`, {
      method: 'PATCH',
      // Access authorises by cookie, so the credentials have to go with it.
      credentials: 'include',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body),
    })
    return response.ok
  } catch {
    return false
  }
}

self.addEventListener('notificationclick', (event) => {
  const data = event.notification.data || {}
  const action = event.action
  event.notification.close()

  event.waitUntil(
    (async () => {
      // Snooze and Done are handled here: no window has to open at all.
      if (action === 'snooze' || action === 'done') {
        const id = reminderIdFrom(data.url)
        const ok = id && (await patchReminder(id, action === 'snooze' ? { snooze_minutes: 10 } : { state: 'done' }))
        if (!ok) {
          await self.registration.showNotification('Could not reach the app', {
            body: action === 'snooze' ? 'The snooze did not save. Open Agent to try again.' : 'Marking it done did not save.',
            icon: '/app/icon-192.png',
            data: { url: data.url || '/app#reminders' },
          })
        }
        const open = await self.clients.matchAll({ type: 'window', includeUncontrolled: true })
        for (const client of open) client.postMessage({ type: 'push', url: data.url })
        return
      }

      // Otherwise: focus the app if it is already open, and take it to the right card.
      const url = data.url || '/app'
      const clients = await self.clients.matchAll({ type: 'window', includeUncontrolled: true })
      const existing = clients.find((client) => new URL(client.url).pathname.startsWith('/app'))
      if (existing) {
        await existing.focus()
        existing.postMessage({ type: 'navigate', url })
        if ('navigate' in existing) await existing.navigate(url).catch(() => undefined)
        return
      }
      await self.clients.openWindow(url)
    })(),
  )
})

self.addEventListener('pushsubscriptionchange', (event) => {
  // The browser rotated the subscription: tell the server the old endpoint is dead. The app re-subscribes
  // on its next launch, and anything the server pushes to the old endpoint gets a 410 and is deleted.
  const old = event.oldSubscription
  if (!old) return
  event.waitUntil(
    fetch('/api/app/subscriptions', {
      method: 'DELETE',
      credentials: 'include',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ endpoint: old.endpoint }),
    }).catch(() => undefined),
  )
})
