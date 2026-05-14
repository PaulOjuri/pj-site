'use client'

import { Component, ReactNode } from 'react'

type Props = { children: ReactNode; fallback: ReactNode }
type State = { errored: boolean }

export class WebGLErrorBoundary extends Component<Props, State> {
  state: State = { errored: false }

  static getDerivedStateFromError(): State {
    return { errored: true }
  }

  render() {
    if (this.state.errored) return this.props.fallback
    return this.props.children
  }
}
