'use client'
import { useCallback, useEffect, useState } from 'react'
import { api, ApiError } from '@/lib/app/api'
import { isIos, isStandalone, registerServiceWorker } from '@/lib/app/push'
import type { AppConfig } from '@/lib/app/types'
import { AgentsTab } from './AgentsTab'
import { ChatTab } from './ChatTab'
import { FeedTab } from './FeedTab'
import { InboxTab } from './InboxTab'
import { InstallScreen } from './InstallScreen'
import { RemindersTab } from './RemindersTab'
import { SettingsTab } from './SettingsTab'
import { ChatIcon, ClockIcon, FeedIcon, InboxIcon, NetworkIcon, RefreshIcon, SettingsIcon } from './icons'
import { ErrorNote } from './ui'

/**
 * The app shell.
 *
 * Routing is the hash, because the whole app is one document: a notification's deep link
 * (/app#inbox/12) becomes a hashchange in the already-open app instead of a cold start, and the service
 * worker has exactly one shell to cache for offline.
 *
 *   #inbox      #inbox/12          an issue number
 *   #reminders  #reminders/<uuid>  one reminder
 *   #chat       #chat/<thread>     one conversation ("new" starts one)
 *   #feed
 *   #agents     #agents/alfera     one agent's sheet, over the map
 *   #settings
 */

/**
 * `label` is the word under the icon, short enough for a sixth of a phone; `name` is what the tab is
 * called out loud (its aria-label, and what the tests ask for); `title` is the large serif heading the
 * section wears, which is not always the same thing.
 */
const TABS = [
  { id: 'inbox', label: 'Inbox', name: 'Inbox', title: 'Inbox', eyebrow: 'what needs you', Icon: InboxIcon },
  { id: 'reminders', label: 'Remind', name: 'Reminders', title: 'Reminders', eyebrow: 'brussels time', Icon: ClockIcon },
  { id: 'chat', label: 'Chat', name: 'Chat', title: 'Chat', eyebrow: 'the orchestrator', Icon: ChatIcon },
  { id: 'feed', label: 'Feed', name: 'Feed', title: 'Feed', eyebrow: 'everything that happened', Icon: FeedIcon },
  { id: 'agents', label: 'Agents', name: 'Agents', title: 'the network', eyebrow: 'who works for you', Icon: NetworkIcon },
  { id: 'settings', label: 'Set', name: 'Settings', title: 'Settings', eyebrow: 'this device', Icon: SettingsIcon },
] as const

type TabId = (typeof TABS)[number]['id']
const DISMISS_KEY = 'agent-app:install-dismissed'

interface Route {
  tab: TabId
  focus: string | null
}

function parseHash(hash: string): Route {
  const [tab, ...rest] = hash.replace(/^#\/?/, '').split('/')
  const found = TABS.find((t) => t.id === tab)
  return { tab: found?.id ?? 'inbox', focus: rest.length ? decodeURIComponent(rest.join('/')) : null }
}

export function AgentApp() {
  const [route, setRoute] = useState<Route>({ tab: 'inbox', focus: null })
  const [config, setConfig] = useState<AppConfig | null>(null)
  const [configError, setConfigError] = useState<string | null>(null)
  const [reloadToken, setReloadToken] = useState(0)
  const [unread, setUnread] = useState(0)
  const [showInstall, setShowInstall] = useState(false)
  const [offline, setOffline] = useState(false)

  // The hash is read after mount: the static export has no idea what it is at build time.
  useEffect(() => {
    const sync = () => setRoute(parseHash(window.location.hash))
    sync()
    window.addEventListener('hashchange', sync)
    return () => window.removeEventListener('hashchange', sync)
  }, [])

  const navigate = useCallback((hash: string) => {
    const next = hash.startsWith('#') ? hash : `#${hash}`
    if (window.location.hash === next) setRoute(parseHash(next))
    else window.location.hash = next
  }, [])

  const loadConfig = useCallback(async () => {
    setConfigError(null)
    try {
      setConfig(await api.config())
    } catch (err) {
      setConfigError(
        err instanceof ApiError && err.needsSignIn
          ? 'Your Cloudflare Access session has run out. Reload to sign in again.'
          : err instanceof ApiError
            ? err.message
            : 'could not reach the app endpoints',
      )
    }
  }, [])

  useEffect(() => {
    void registerServiceWorker()
    // Loading on mount: a static export has no server component to preload this, and the
    // state lands after an await rather than during the render pass.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadConfig()
  }, [loadConfig])

  useEffect(() => {
    const update = () => setOffline(!navigator.onLine)
    update()
    window.addEventListener('online', update)
    window.addEventListener('offline', update)
    return () => {
      window.removeEventListener('online', update)
      window.removeEventListener('offline', update)
    }
  }, [])

  useEffect(() => {
    // Reads a browser API that does not exist while the static export renders, so the
    // answer can only arrive after mount.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (isIos() && !isStandalone() && localStorage.getItem(DISMISS_KEY) !== '1') setShowInstall(true)
  }, [])

  // A push that arrives while the app is open: the service worker says so, and the open tab reloads.
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return
    const onMessage = (event: MessageEvent) => {
      const data = event.data as { type?: string; url?: string } | null
      if (data?.type === 'push') setReloadToken((n) => n + 1)
      if (data?.type === 'navigate' && data.url) {
        const hash = data.url.includes('#') ? data.url.slice(data.url.indexOf('#')) : '#feed'
        navigate(hash)
      }
    }
    navigator.serviceWorker.addEventListener('message', onMessage)
    return () => navigator.serviceWorker.removeEventListener('message', onMessage)
  }, [navigate])

  // The unread count for the Feed tab's dot. Cheap, and refreshed with everything else.
  useEffect(() => {
    let cancelled = false
    api
      .feed({ limit: 1 })
      .then((data) => {
        if (!cancelled) setUnread(data.unread)
      })
      .catch(() => undefined)
    return () => {
      cancelled = true
    }
  }, [reloadToken, route.tab])

  if (showInstall) {
    return (
      <div className="agent-app" id="agent-app">
        <header className="app-head">
          <div className="app-head-title">
            <span className="app-eyebrow">paul&apos;s agents</span>
            <h1>Agent</h1>
          </div>
        </header>
        <div className="app-body">
          <InstallScreen
            onDismiss={() => {
              localStorage.setItem(DISMISS_KEY, '1')
              setShowInstall(false)
            }}
          />
        </div>
        <nav className="app-tabs" aria-hidden="true" />
      </div>
    )
  }

  const current = TABS.find((t) => t.id === route.tab) ?? TABS[0]

  return (
    <div className="agent-app" id="agent-app">
      <header className="app-head" data-offline={offline ? '' : undefined}>
        <div className="app-head-title">
          <span className="app-eyebrow">
            {offline ? 'offline · showing what was cached' : current.eyebrow}
          </span>
          <h1>{current.title}</h1>
        </div>
        <div className="app-head-actions">
          <button
            className="app-btn icon"
            onClick={() => setReloadToken((n) => n + 1)}
            aria-label="Refresh"
            title="Refresh"
          >
            <RefreshIcon />
          </button>
        </div>
      </header>

      <div className="app-body" key={route.tab}>
        {/* Offline, the header already says so and the tab below says what it could still show; a
            third note about the same thing would be noise. */}
        {configError && !offline && <ErrorNote error={configError} onRetry={loadConfig} />}

        {route.tab === 'inbox' && (
          <InboxTab
            focus={route.focus}
            onFocus={(id) => navigate(id ? `#inbox/${id}` : '#inbox')}
            reloadToken={reloadToken}
          />
        )}
        {route.tab === 'reminders' && (
          <RemindersTab
            focus={route.focus}
            onFocus={(id) => navigate(id ? `#reminders/${id}` : '#reminders')}
            reloadToken={reloadToken}
          />
        )}
        {route.tab === 'chat' && (
          <ChatTab
            focus={route.focus}
            onFocus={(id) => navigate(id ? `#chat/${id}` : '#chat')}
            reloadToken={reloadToken}
          />
        )}
        {route.tab === 'feed' && <FeedTab onNavigate={navigate} reloadToken={reloadToken} />}
        {route.tab === 'agents' && (
          <AgentsTab
            focus={route.focus}
            onFocus={(name) => navigate(name ? `#agents/${name}` : '#agents')}
            onNavigate={navigate}
            reloadToken={reloadToken}
          />
        )}
        {route.tab === 'settings' && <SettingsTab config={config} onInstallHelp={() => setShowInstall(true)} />}
      </div>

      <nav className="app-tabs" aria-label="Sections">
        <div
          className="app-tabbar"
          style={
            {
              '--tab-index': TABS.findIndex((t) => t.id === current.id),
              '--tab-count': TABS.length,
            } as React.CSSProperties
          }
        >
          {/* The lamp slides to the tab you picked; the tabs themselves only change colour. */}
          <span className="app-tab-lamp" aria-hidden="true" />
          {TABS.map(({ id, label, name, Icon }) => (
            <button
              key={id}
              className="app-tab"
              aria-current={route.tab === id ? 'page' : undefined}
              aria-label={name}
              onClick={() => navigate(`#${id}`)}
            >
              <span className="glyph">
                <Icon />
              </span>
              {label}
              {id === 'feed' && unread > 0 && <span className="dot" aria-label={`${unread} unread`} />}
            </button>
          ))}
        </div>
      </nav>
    </div>
  )
}
