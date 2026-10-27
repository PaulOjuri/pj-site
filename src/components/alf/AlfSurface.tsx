'use client'

import type { ReactElement } from 'react'
import type { Scene } from '@/lib/alf/types'
import type { SceneView } from './view'
import { Orb } from './Orb'
import { SceneCard } from './screens/SceneCard'

/** Alf's reply, one span per word so the current one can be lit. */
export function Words({ scene, view }: { scene: Scene; view: SceneView }): ReactElement {
  return (
    <>
      {scene.alf.words.map((word, i) => (
        <span
          key={i}
          className={
            i < view.said ? 'alf-w' : i === view.now ? 'alf-w is-now' : 'alf-w is-pending'
          }
        >
          {word.w}{' '}
        </span>
      ))}
    </>
  )
}

/**
 * The bottom sheet on the phone and the floating panel on the laptop share
 * this body. Buttons here are drawings of buttons: spans, so nothing inside a
 * concept screen can navigate or submit.
 */
export function AlfSurface({
  scene,
  view,
  kind,
  reduced,
}: {
  scene: Scene
  view: SceneView
  kind: 'phone' | 'laptop'
  reduced: boolean
}): ReactElement {
  return (
    <>
      <div className="alf-ahead">
        <Orb className="alf-orb-c" reduced={reduced} />
        <b>Alf</b>
        <span className="alf-lc">{scene.lang}</span>
        <span className="alf-st">{view.status}</span>
      </div>
      <div className="alf-you-line" lang={scene.lang_code}>
        {view.typed}
      </div>
      <div className="alf-alf-line" lang={scene.lang_code}>
        <Words scene={scene} view={view} />
      </div>
      {kind === 'phone' && <SceneCard card={scene.screens.card} shown={view.revealed} />}
      <div className="alf-acts" data-shown={view.revealed ? 'true' : 'false'}>
        {scene.action.buttons.map((label, i) => (
          <span
            key={label}
            className={`alf-fbtn${i === 0 ? (scene.id === 'pcm' ? ' is-warn' : ' is-go') : ''}`}
          >
            {label}
          </span>
        ))}
      </div>
    </>
  )
}
