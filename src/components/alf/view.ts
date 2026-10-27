import type { Scene } from '@/lib/alf/types'

/**
 * Everything the device frames and the transcript draw from. One object so the
 * two stay in lockstep: the frame is a decorative copy of the transcript.
 */
export interface SceneView {
  /** The user's line, typed in word by word. */
  typed: string
  /** Words of Alf's reply already spoken. */
  said: number
  /** Word being spoken right now, or -1 in the gaps between words. */
  now: number
  status: string
  /** Power-button glow on the phone, "Hey Alf" chip on the laptop. */
  waking: boolean
  /** Screen-edge glow while Alf listens. */
  listening: boolean
  sheetOpen: boolean
  /** Scene card shown, app window changed, action buttons visible. */
  revealed: boolean
  /** 0–1 along the clip. */
  progress: number
}

/** The resting state of a scene: the answer given, the card on screen. */
export function restView(scene: Scene, waitingLabel: string): SceneView {
  return {
    typed: scene.user.text,
    said: scene.alf.words.length,
    now: -1,
    status: waitingLabel,
    waking: false,
    listening: false,
    sheetOpen: true,
    revealed: true,
    progress: 1,
  }
}
