/**
 * The app window on the laptop desktop, plus its desktop widget.
 * Content from `screens.laptop`, with the prayer list and message threads
 * reused from `screens.card` and `screens.phone_home`.
 */
import type { ReactElement } from 'react'
import type { Scene } from '@/lib/alf/types'
import { Icon, widgetIcon, type IconName } from '../icons'
import { RouteMap } from './RouteMap'

function Titlebar({ icon, title }: { icon: IconName; title: string }): ReactElement {
  return (
    <div className="alf-tb">
      <Icon name={icon} />
      {title}
      <span className="alf-ctl">
        <i />
        <i />
        <i />
      </span>
    </div>
  )
}

function DesktopWidget({ scene }: { scene: Scene }): ReactElement | null {
  const w = scene.screens.laptop.widget
  if (!w) return null
  const icon = widgetIcon[scene.screens.phone_home.widget?.icon ?? ''] ?? 'shield'
  return (
    <div className="alf-widget-l">
      <Icon name={icon} />
      <div>
        <small>{w.label}</small>
        <b>{w.value}</b>
        <span>{w.note}</span>
      </div>
    </div>
  )
}

export function LaptopApp({ scene }: { scene: Scene }): ReactElement {
  const l = scene.screens.laptop
  const card = scene.screens.card

  if (scene.id === 'yo') {
    const [route, rain, flood] = l.footer ?? []
    return (
      <>
        <div className="alf-win" style={{ left: 34, top: 54, width: 690 }}>
          <Titlebar icon="map" title={l.window} />
          <div className="alf-wbody">
            <div className="alf-lmap">
              <RouteMap labels={l.map_labels} />
            </div>
            <div className="alf-mfoot">
              <b>{route}</b>
              <span>
                <Icon name="rain" />
                {rain}
              </span>
              <span className="alf-fl">{flood}</span>
            </div>
          </div>
        </div>
        <DesktopWidget scene={scene} />
      </>
    )
  }

  if (scene.id === 'ig') {
    const days = l.days ?? []
    const hours = l.hours ?? []
    const events = l.events ?? []
    return (
      <>
        <div className="alf-win" style={{ left: 34, top: 54, width: 700 }}>
          <Titlebar icon="cal" title={l.window} />
          <div className="alf-wbody" style={{ padding: '8px 12px 14px' }}>
            <div className="alf-cal">
              <div />
              {days.map((d) => (
                <div
                  key={d.day}
                  className={`alf-hd${d.today ? ' is-today' : ''}${d.market_day ? ' is-nk' : ''}`}
                >
                  <b>
                    {d.day}
                    {d.today && ' · today'}
                  </b>
                  <small lang="ig">
                    {d.market}
                    {d.market_day && ' market day'}
                  </small>
                </div>
              ))}
              {hours.map((h, row) => (
                <HourRow key={h} hour={h} row={row} days={days} events={events} />
              ))}
            </div>
          </div>
        </div>
        <DesktopWidget scene={scene} />
      </>
    )
  }

  if (scene.id === 'ha' && card.type === 'prayer-times') {
    return (
      <>
        <div className="alf-win" style={{ left: 34, top: 54, width: 520 }}>
          <Titlebar icon="moon" title={l.window} />
          <div className="alf-wbody">
            <div className="alf-pw">
              {card.prayers.map(([name, time]) => {
                const on = name === card.highlight
                return (
                  <div key={name} className={on ? 'is-mg' : undefined}>
                    <span lang="ha">
                      {name}
                      {on && <small>next</small>}
                    </span>
                    <span>
                      {on && <span className="alf-rmd">Reminder {card.reminder} · </span>}
                      {time}
                    </span>
                  </div>
                )
              })}
            </div>
            <p className="alf-wnote">{card.note}.</p>
          </div>
        </div>
        <DesktopWidget scene={scene} />
      </>
    )
  }

  const threads = scene.screens.phone_home.threads ?? []
  return (
    <div className="alf-win" style={{ left: 34, top: 54, width: 640 }}>
      <Titlebar icon="msg" title={l.window} />
      <div className="alf-mwin">
        <div className="alf-mlist">
          {threads.map((t, i) => (
            <div key={t.name} className={i === 0 ? 'is-sel' : undefined}>
              <b>{t.name}</b>
              <span>{t.preview}</span>
            </div>
          ))}
        </div>
        <div className="alf-mconv">
          <div className="alf-sys">Today 8:41 p.m.</div>
          <div className="alf-bub">{threads[0]?.preview}</div>
          <div className="alf-sys">
            Call from {threads[1]?.name} · {threads[1]?.preview}
          </div>
          <div className="alf-sbanner">
            <Icon name="shield" />
            <span>{l.banner}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

function HourRow({
  hour,
  row,
  days,
  events,
}: {
  hour: string
  row: number
  days: NonNullable<Scene['screens']['laptop']['days']>
  events: NonNullable<Scene['screens']['laptop']['events']>
}): ReactElement {
  return (
    <>
      <div className="alf-tm">{hour}</div>
      {days.map((d) => {
        // The grid starts at 6 a.m., so an event's hour gives its row.
        const ev = events.find(
          (e) => e.day === d.day && Number.parseInt(e.time, 10) - 6 === row
        )
        return (
          <div key={d.day} className={`alf-cell${d.market_day ? ' is-nk' : ''}`}>
            {ev && (
              <div className={`alf-ev${ev.added_by_alf ? ' is-new' : ''}`}>
                {ev.time} {ev.title}
              </div>
            )}
          </div>
        )
      })}
    </>
  )
}
