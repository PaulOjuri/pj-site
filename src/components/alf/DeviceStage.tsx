'use client'

import { useEffect, useRef, type ReactElement, type ReactNode } from 'react'

/**
 * Renders a device at its design size and scales it to whatever width the
 * column gives it, so screen content keeps its proportions. The box holds the
 * device's aspect ratio, a ResizeObserver feeds the scale into `--s`.
 */
export function DeviceStage({
  width,
  height,
  children,
}: {
  width: number
  height: number
  children: ReactNode
}): ReactElement {
  const boxRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const box = boxRef.current
    if (!box) return
    const inner = box.firstElementChild as HTMLElement | null
    if (!inner) return

    const fit = () => {
      const w = box.clientWidth
      if (w) inner.style.setProperty('--s', String(w / width))
    }
    fit()
    const ro = new ResizeObserver(fit)
    ro.observe(box)
    return () => ro.disconnect()
  }, [width])

  return (
    <div
      ref={boxRef}
      className="alf-device-fit"
      style={{
        ['--w' as string]: width,
        ['--h' as string]: height,
        aspectRatio: `${width} / ${height}`,
      }}
    >
      {children}
    </div>
  )
}
