'use client'
import { AppMark } from './icons'

/**
 * How to install, for iOS.
 *
 * Safari has no install prompt an app can trigger: adding to the Home Screen is a manual three-tap
 * journey through the Share sheet, and until it is done iOS gives a web page no Push API at all. So the
 * app says exactly where to tap, and nothing else on this screen competes with it.
 *
 * The icon is drawn here rather than loaded, because the thing it stands for — the icon on the Home
 * Screen — does not exist yet.
 */
export function InstallScreen({ onDismiss }: { onDismiss: () => void }) {
  return (
    <div className="app-install">
      <AppMark />
      <h2>
        Put Agent on your
        <br />
        Home Screen
      </h2>
      <p>iOS only lets an installed app send notifications, so this is the one step that cannot be skipped.</p>
      <ol>
        <li>
          <span>
            Tap the <strong>Share</strong>{' '}
            button in Safari&apos;s toolbar — the square with an arrow coming out of it.
          </span>
        </li>
        <li>
          <span>
            Scroll down and tap <strong>Add to Home Screen</strong>.
          </span>
        </li>
        <li>
          <span>
            Tap <strong>Add</strong>. Agent appears on your Home Screen.
          </span>
        </li>
        <li>
          <span>
            Open it from there, go to <strong>Settings</strong> in the app, and tap{' '}
            <strong>Turn on notifications</strong>.
          </span>
        </li>
      </ol>
      <p className="app-note">
        It has to be Safari: an app added from another iOS browser does not get Web Push. Cloudflare Access will ask
        for your email once inside the installed app.
      </p>
      <button className="app-btn" onClick={onDismiss}>
        Carry on in the browser
      </button>
      <p className="app-fine">Everything except notifications works in the browser too.</p>
    </div>
  )
}
