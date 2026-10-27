'use client'

import type { ReactElement } from 'react'
import type { Scene } from '@/lib/alf/types'
import type { SceneView } from './view'
import { DeviceStage } from './DeviceStage'
import { AlfSurface } from './AlfSurface'
import { LaptopApp } from './screens/LaptopApp'
import { Icon } from './icons'

/** An Alfera laptop, 1280×794: lid with the screen, base below it. */
export function LaptopFrame({
  scene,
  view,
  reduced,
}: {
  scene: Scene
  view: SceneView
  reduced: boolean
}): ReactElement {
  return (
    <DeviceStage width={1280} height={794}>
      <div className="alf-device-inner alf-laptop">
        <div className="alf-lid">
          <span className="alf-lcam" />
          <div className={`alf-lscreen${view.revealed ? ' is-revealed' : ''}`}>
            <div className="alf-ltop">
              <span>Alfera</span>
              <span className="alf-si">
                <Icon name="wifi" />
                <Icon name="battery" />
                <span>8:42</span>
              </span>
            </div>
            <LaptopApp scene={scene} />
            <div className="alf-dock">
              {(
                [
                  ['phone', '#2f9e63'],
                  ['msg', '#3b82f6'],
                  ['map', '#e07a3a'],
                  ['cal', '#d54b4b'],
                  ['music', '#8f57d6'],
                  ['gear', '#5d6478'],
                ] as const
              ).map(([icon, tint]) => (
                <i key={icon} style={{ ['--c' as string]: tint }}>
                  <Icon name={icon} />
                </i>
              ))}
            </div>
            <div className={`alf-glow is-laptop${view.listening ? ' is-on' : ''}`} />
            <div className={`alf-keyhint${view.waking ? ' is-shown' : ''}`}>
              <Icon name="mic" />
              Hey Alf
            </div>
            <div className={`alf-apanel${view.sheetOpen ? ' is-open' : ''}`}>
              <AlfSurface scene={scene} view={view} kind="laptop" reduced={reduced} />
            </div>
          </div>
        </div>
        <div className="alf-base" />
      </div>
    </DeviceStage>
  )
}
