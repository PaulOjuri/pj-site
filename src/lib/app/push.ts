/**
 * Installing the app and turning notifications on.
 *
 * iOS only has Web Push for a site that has been added to the Home Screen, and it only grants permission
 * from a real tap. So: show the install instructions until `display-mode: standalone` is true, then show
 * one button, and only call `Notification.requestPermission()` from inside its click handler. Asking any
 * other way is refused once and for all, which would leave the app permanently unable to notify.
 */
import { api } from './api'

export const SW_PATH = '/app/sw.js'
export const SW_SCOPE = '/app'

export type PushState = 'unsupported' | 'needs-install' | 'default' | 'granted' | 'denied'

export function isStandalone(): boolean {
  if (typeof window === 'undefined') return false
  // iOS Safari uses the non-standard navigator.standalone; everyone else has the media query.
  const iosStandalone = (window.navigator as Navigator & { standalone?: boolean }).standalone === true
  return iosStandalone || window.matchMedia('(display-mode: standalone)').matches
}

export function isIos(): boolean {
  if (typeof navigator === 'undefined') return false
  return (
    /iphone|ipad|ipod/i.test(navigator.userAgent) ||
    // iPadOS reports as a Mac, but a Mac has no touch points.
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
  )
}

export function pushSupported(): boolean {
  return (
    typeof window !== 'undefined' &&
    'serviceWorker' in navigator &&
    'PushManager' in window &&
    'Notification' in window
  )
}

export function pushState(): PushState {
  if (!pushSupported()) return isIos() && !isStandalone() ? 'needs-install' : 'unsupported'
  // On iOS the Push API only exists once installed, so this is mostly for the honest case of a
  // desktop browser that has it either way.
  if (isIos() && !isStandalone()) return 'needs-install'
  return Notification.permission as PushState
}

export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (!('serviceWorker' in navigator)) return null
  try {
    return await navigator.serviceWorker.register(SW_PATH, { scope: SW_SCOPE })
  } catch (err) {
    console.warn('service worker registration failed', err)
    return null
  }
}

export async function existingSubscription(): Promise<PushSubscription | null> {
  if (!pushSupported()) return null
  const registration = await navigator.serviceWorker.getRegistration(SW_SCOPE)
  return (await registration?.pushManager.getSubscription()) ?? null
}

function keyBytes(base64url: string): Uint8Array {
  const padded = base64url.replace(/-/g, '+').replace(/_/g, '/')
  const raw = atob(padded + '='.repeat((4 - (padded.length % 4)) % 4))
  const out = new Uint8Array(raw.length)
  for (let i = 0; i < raw.length; i++) out[i] = raw.charCodeAt(i)
  return out
}

/**
 * Ask for permission and subscribe. Must be called straight from a click handler.
 * Returns the state it ended in, so the button can say what happened.
 */
export async function enablePush(vapidPublicKey: string): Promise<{ state: PushState; error?: string }> {
  if (!pushSupported()) return { state: pushState(), error: 'this browser has no Web Push' }
  try {
    const permission = await Notification.requestPermission()
    if (permission !== 'granted') return { state: permission as PushState }

    const registration = (await navigator.serviceWorker.getRegistration(SW_SCOPE)) ?? (await registerServiceWorker())
    if (!registration) return { state: 'default', error: 'the service worker would not register' }
    await navigator.serviceWorker.ready

    const subscription =
      (await registration.pushManager.getSubscription()) ??
      (await registration.pushManager.subscribe({
        userVisibleOnly: true,
        // Uint8Array, not the base64url string: Safari rejects the string form.
        applicationServerKey: keyBytes(vapidPublicKey) as BufferSource,
      }))

    await api.subscribe(subscription.toJSON())
    return { state: 'granted' }
  } catch (err) {
    return { state: pushState(), error: err instanceof Error ? err.message : String(err) }
  }
}

/** Turn notifications off on this device: drop the row, then the browser subscription. */
export async function disablePush(): Promise<void> {
  const subscription = await existingSubscription()
  if (!subscription) return
  await api.unsubscribe(subscription.endpoint).catch(() => undefined)
  await subscription.unsubscribe().catch(() => undefined)
}
