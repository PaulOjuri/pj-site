'use client'

import type { ReactElement } from 'react'
import type { Scene } from '@/lib/alf/types'
import type { SceneView } from './view'
import { DeviceStage } from './DeviceStage'
import { AlfSurface } from './AlfSurface'
import { PhoneHome } from './screens/PhoneHome'
import { Icon } from './icons'

/** Status bar, shared by both frames. */
function StatusBar(): ReactElement {
  return (
    <div className="alf-sbar">
      <span>8:42</span>
      <span className="alf-si">
        <Icon name="signal" />
        <Icon name="wifi" />
        76%
        <Icon name="battery" />
      </span>
    </div>
  )
}

/** An Alfera Android phone, 380×790, power button on the right edge. */
export function PhoneFrame({
  scene,
  view,
  reduced,
}: {
  scene: Scene
  view: SceneView
  reduced: boolean
}): ReactElement {
  return (
    <DeviceStage width={380} height={790}>
      <div className="alf-device-inner alf-phone">
        <div className="alf-body" />
        <span className={`alf-hw is-power${view.waking ? ' is-pressed' : ''}`} />
        <span className="alf-hw is-vol" />
        <div className={`alf-screen${view.revealed ? ' is-revealed' : ''}`}>
          <StatusBar />
          <PhoneHome data={scene.screens.phone_home} />
          <div className={`alf-glow${view.listening ? ' is-on' : ''}`} />
          <div className={`alf-hey${view.waking ? ' is-shown' : ''}`}>
            <Icon name="mic" />
            Hey Alf
          </div>
          <div className={`alf-sheet${view.sheetOpen ? ' is-open' : ''}`}>
            <AlfSurface scene={scene} view={view} kind="phone" reduced={reduced} />
          </div>
          <div className="alf-gesture" />
          <span className="alf-cam" />
        </div>
      </div>
    </DeviceStage>
  )
}
