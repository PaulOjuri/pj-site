'use client'
import { useCallback, useEffect, useState } from 'react'
import { api, ApiError } from '@/lib/app/api'
import { KINDS } from '@/lib/app/kinds'
import { disablePush, enablePush, existingSubscription, isIos, isStandalone, pushState, type PushState } from '@/lib/app/push'
import type { AppConfig } from '@/lib/app/types'
import { ErrorNote, KindBadge } from './ui'

/**
 * Settings: notifications on or off, a test notification, and what this build knows about itself.
 *
 * Permission is asked for from the button's own click handler and nowhere else. A browser only grants it
 * from a user gesture, and a refusal is permanent, so asking on load would be a one-way door.
 */

interface Props {
  config: AppConfig | null
  onInstallHelp: () => void
}

export function SettingsTab({ config, onInstallHelp }: Props) {
  const [state, setState] = useState<PushState>('unsupported')
  const [endpoint, setEndpoint] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    setState(pushState())
    setEndpoint((await existingSubscription())?.endpoint ?? null)
  }, [])

  useEffect(() => {
    // Reads a browser API that does not exist while the static export renders, so the
    // answer can only arrive after mount.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void refresh()
  }, [refresh])

  async function turnOn() {
    if (!config?.vapidPublicKey) {
      setError('no VAPID public key on this deployment yet')
      return
    }
    setBusy(true)
    setError(null)
    setMessage(null)
    // Straight from the tap: requestPermission() inside enablePush().
    const result = await enablePush(config.vapidPublicKey)
    await refresh()
    setBusy(false)
    if (result.state === 'granted') setMessage('Notifications are on for this device.')
    else if (result.state === 'denied') setError('iOS has notifications blocked for this app. Settings → Notifications → Agent.')
    else setError(result.error ?? 'permission was not granted')
  }

  async function turnOff() {
    setBusy(true)
    setError(null)
    setMessage(null)
    await disablePush()
    await refresh()
    setBusy(false)
    setMessage('This device will not be notified any more.')
  }

  async function test() {
    setBusy(true)
    setError(null)
    setMessage(null)
    try {
      const result = await api.testPush()
      setMessage(result.sent > 0 ? `Sent to ${result.sent} device(s).` : 'Nothing was sent; check the subscription.')
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'the test could not be sent')
    } finally {
      setBusy(false)
    }
  }

  const installed = isStandalone()

  return (
    <>
      <section className="app-card">
        <h2 className="app-section-title" style={{ marginTop: 0 }}>
          Notifications
        </h2>

        {state === 'needs-install' && (
          <>
            <p>Add the app to your Home Screen first. iOS only allows notifications once it is installed.</p>
            <div className="app-row">
              <button className="app-btn small primary" onClick={onInstallHelp}>
                How to install
              </button>
            </div>
          </>
        )}

        {state === 'unsupported' && <p>This browser has no Web Push.</p>}

        {state === 'default' && (
          <>
            <p>Notifications are off on this device.</p>
            <div className="app-row">
              <button className="app-btn primary" disabled={busy} onClick={() => void turnOn()}>
                {busy ? 'Asking…' : 'Turn on notifications'}
              </button>
            </div>
          </>
        )}

        {state === 'denied' && (
          <p>
            Notifications are blocked for this app. On iOS: Settings → Notifications → Agent. Then come back and turn
            them on here.
          </p>
        )}

        {state === 'granted' && (
          <>
            <p>
              {endpoint ? 'On, and this device is subscribed.' : 'Permission is granted, but this device has no subscription yet.'}
            </p>
            <div className="app-row">
              {!endpoint && (
                <button className="app-btn primary" disabled={busy} onClick={() => void turnOn()}>
                  Subscribe this device
                </button>
              )}
              <button className="app-btn" disabled={busy || !endpoint} onClick={() => void test()}>
                {busy ? '…' : 'Send test notification'}
              </button>
              {endpoint && (
                <button className="app-btn quiet" disabled={busy} onClick={() => void turnOff()}>
                  Turn off
                </button>
              )}
            </div>
          </>
        )}

        {message && <p className="app-note">{message}</p>}
        {error && <ErrorNote error={error} />}
      </section>

      <section className="app-card">
        <h2 className="app-section-title" style={{ marginTop: 0 }}>
          This install
        </h2>
        <dl className="app-meta" style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '0.35rem 0.75rem' }}>
          <dt>signed in</dt>
          <dd style={{ textTransform: 'none', letterSpacing: 0 }}>{config?.email ?? '—'}</dd>
          <dt>home screen</dt>
          <dd>{installed ? 'yes' : isIos() ? 'not yet' : 'n/a'}</dd>
          <dt>push keys</dt>
          <dd>{config?.pushConfigured ? 'set' : 'missing'}</dd>
          <dt>inbox</dt>
          <dd style={{ textTransform: 'none', letterSpacing: 0 }}>
            {config?.inboxConfigured ? (config?.inboxRepo ?? 'set') : 'no GitHub token'}
          </dd>
          <dt>time zone</dt>
          <dd style={{ textTransform: 'none', letterSpacing: 0 }}>{config?.timeZone ?? 'Europe/Brussels'}</dd>
        </dl>
        {!installed && isIos() && (
          <div className="app-row">
            <button className="app-btn small quiet" onClick={onInstallHelp}>
              How to install
            </button>
          </div>
        )}
      </section>

      <section className="app-card">
        <h2 className="app-section-title" style={{ marginTop: 0 }}>
          Card kinds
        </h2>
        <p style={{ fontSize: '0.85rem' }}>
          What the agents can send. A new kind is one entry in <code>src/lib/app/kinds.ts</code>, not a new screen —
          see docs/AGENT-APP.md.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {Object.entries(KINDS).map(([id, spec]) => (
            <div key={id} style={{ display: 'flex', gap: '0.6rem', alignItems: 'flex-start' }}>
              <KindBadge kind={id} />
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: '0.9rem' }}>
                  {spec.label} <code>{id}</code>
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-faint)' }}>
                  {spec.about} → {spec.tab}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  )
}
