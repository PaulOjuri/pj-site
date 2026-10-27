/** The phone's home screen behind the Alf sheet. Content from `screens.phone_home`. */
import type { ReactElement } from 'react'
import type { PhoneHome as PhoneHomeData } from '@/lib/alf/types'
import { Icon, widgetIcon, type IconName } from '../icons'

const APPS: [string, IconName, string][] = [
  ['Phone', 'phone', '#2f9e63'],
  ['Messages', 'msg', '#3b82f6'],
  ['Camera', 'cam', '#555a70'],
  ['Maps', 'map', '#e07a3a'],
  ['Clock', 'clock', '#262a40'],
  ['Calendar', 'cal', '#d54b4b'],
  ['Music', 'music', '#8f57d6'],
  ['Settings', 'gear', '#5d6478'],
]

const THREAD_TINT = ['#2b6cb0', '#7a3b2e', '#8f57d6', '#2f9e63']

export function PhoneHome({ data }: { data: PhoneHomeData }): ReactElement {
  if (data.threads) {
    return (
      <div className="alf-msgs">
        <h4>{data.app}</h4>
        {data.threads.map((t, i) => (
          <div key={t.name} className={`alf-mrow${t.unread ? ' is-new' : ''}`}>
            <span className="alf-av" style={{ ['--c' as string]: THREAD_TINT[i % 4] }}>
              {i === 0 ? (
                <Icon name="shield" />
              ) : t.icon ? (
                <Icon name={t.icon as IconName} />
              ) : (
                t.name.charAt(0)
              )}
            </span>
            <div>
              <b>{t.name}</b>
              <p>{t.preview}</p>
            </div>
            <time>{t.time}</time>
          </div>
        ))}
      </div>
    )
  }

  const w = data.widget
  return (
    <div className="alf-home">
      {w && (
        <div className="alf-widget">
          <div>
            <small>{w.label}</small>
            <b>{w.value}</b>
            <span>{w.note}</span>
          </div>
          {w.icon && <Icon name={widgetIcon[w.icon] ?? 'clock'} />}
        </div>
      )}
      <div className="alf-apps">
        {APPS.map(([name, icon, tint]) => (
          <div className="alf-app" key={name}>
            <i style={{ ['--c' as string]: tint }}>
              <Icon name={icon} />
            </i>
            {name}
          </div>
        ))}
      </div>
    </div>
  )
}
