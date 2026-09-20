'use client'

interface Vec3 { x: number; y: number; z: number }

interface WalkState {
  activeBook: string | null
  setActiveBook: (id: string | null, cameraPos?: Vec3, lookAt?: Vec3) => void
  rosieGreeted: boolean
  setRosieGreeted: (v?: boolean) => void
  dialogOpen: boolean
  openDialog: (type?: string) => void
  closeDialog: () => void
}

// Minimal stub store state
const state: WalkState = {
  activeBook: null,
  setActiveBook: () => {},
  rosieGreeted: false,
  setRosieGreeted: () => {},
  dialogOpen: false,
  openDialog: () => {},
  closeDialog: () => {},
}

// Minimal zustand-compatible selector hook stub
export function useWalkStore<T>(selector: (s: WalkState) => T): T {
  return selector(state)
}
