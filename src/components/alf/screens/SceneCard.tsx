/**
 * The card Alf reveals inside the phone sheet at the end of a scene.
 * Every string comes from `screens.card` in the JSON.
 */
import type { ReactElement } from 'react'
import type { Card } from '@/lib/alf/types'
import { Icon } from '../icons'
import { RouteMap } from './RouteMap'

export function SceneCard({ card, shown }: { card: Card; shown: boolean }): ReactElement {
  const cls = `alf-card${shown ? ' is-shown' : ''}`

  switch (card.type) {
    case 'route-map':
      return (
        <div className={cls} data-testid="scene-card">
          <div className="alf-mapbox">
            <RouteMap compact />
          </div>
          <div className="alf-legend">
            {card.legend.map((line, i) => (
              <span key={line}>
                <i className={i === 1 ? 'is-alf' : undefined} />
                {line}
              </span>
            ))}
          </div>
        </div>
      )

    case 'reminder':
      return (
        <div className={cls} data-testid="scene-card">
          <div className="alf-rem-top">
            <Icon name="bell" />
            <b>{card.title}</b>
            <span>{card.when}</span>
          </div>
          <p>{card.text}</p>
          <div className="alf-mweek">
            {card.market_week.map((d) => (
              <span key={d.day} className={d.highlight ? 'is-on' : undefined}>
                <span lang="ig">{d.day}</span>
                {d.tag && <small>{d.tag}</small>}
              </span>
            ))}
          </div>
        </div>
      )

    case 'prayer-times':
      return (
        <div className={cls} data-testid="scene-card">
          <div className="alf-plist">
            {card.prayers.map(([name, time]) => {
              const on = name === card.highlight
              return (
                <div key={name} className={on ? 'is-on' : undefined}>
                  <span lang="ha">{name}</span>
                  <span>
                    {time}
                    {on && <em> · reminder {card.reminder}</em>}
                  </span>
                </div>
              )
            })}
          </div>
          <div className="alf-dust">
            <Icon name="haze" />
            {card.dust}
          </div>
          <p className="alf-card-note">{card.note}</p>
        </div>
      )

    case 'scam-alert':
      return (
        <div className={cls} data-testid="scene-card">
          <div className="alf-scam-top">
            <Icon name="shield" />
            <b>{card.title}</b>
          </div>
          <p>{card.text}</p>
          <div className="alf-num">{card.number}</div>
        </div>
      )
  }
}
