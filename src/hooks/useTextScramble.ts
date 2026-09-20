'use client'
import { useEffect, useState } from 'react'

const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%'

function randomChar() {
  return CHARS[Math.floor(Math.random() * CHARS.length)]
}

function isPreserved(char: string) {
  return char === ' ' || char === '/' || char === '.'
}

function scrambledVersion(text: string, revealed: number) {
  const floor = Math.floor(revealed)
  return text
    .split('')
    .map((char, i) => {
      if (i < floor) return char
      if (isPreserved(char)) return char
      return randomChar()
    })
    .join('')
}

export function useTextScramble(text: string, startDelay = 0, speed = 40) {
  const [display, setDisplay] = useState(() => scrambledVersion(text, 0))
  const [done, setDone] = useState(false)

  useEffect(() => {
    // Respect prefers-reduced-motion
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setDisplay(text)
      setDone(true)
      return
    }

    let revealed = 0
    let intervalId: ReturnType<typeof setInterval>
    let timeoutId: ReturnType<typeof setTimeout>

    timeoutId = setTimeout(() => {
      intervalId = setInterval(() => {
        revealed += 0.35
        if (revealed >= text.length) {
          setDisplay(text)
          setDone(true)
          clearInterval(intervalId)
        } else {
          setDisplay(scrambledVersion(text, revealed))
        }
      }, speed)
    }, startDelay)

    return () => {
      clearTimeout(timeoutId)
      clearInterval(intervalId)
    }
  }, [text, startDelay, speed])

  return { display, done }
}
