'use client'
import { useEffect } from 'react'
import { CustomCursor } from '@/components/CustomCursor'

// Konami code easter egg
const KONAMI = ['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','b','a']

function useKonami(callback: () => void) {
  useEffect(() => {
    let sequence: string[] = []
    function onKey(e: KeyboardEvent) {
      sequence = [...sequence, e.key].slice(-KONAMI.length)
      if (sequence.join(',') === KONAMI.join(',')) callback()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [callback])
}

function ConsoleMessage() {
  useEffect(() => {
    const style = [
      'color: #D4A255',
      'font-size: 14px',
      'font-weight: bold',
      'letter-spacing: 0.05em',
    ].join(';')

    const subStyle = [
      'color: #8A857C',
      'font-size: 11px',
      'letter-spacing: 0.05em',
    ].join(';')

    console.log('%cHello, fellow developer.', style)
    console.log('%cYou opened the tools. I respect that.', subStyle)
    console.log('%c\nThis site was built by hand — Next.js, Framer Motion, GSAP, Lenis.', subStyle)
    console.log('%cIf you spot something worth stealing, steal it. That\'s how this works.', subStyle)
    console.log('%c\n→ hello@paulojuri.com', `${subStyle}; color: #D4A255`)
  }, [])

  return null
}

export function SiteEffects() {
  // Konami: briefly flash the page background to amber then back
  useKonami(() => {
    const root = document.documentElement
    const original = getComputedStyle(root).getPropertyValue('--accent').trim()
    root.style.setProperty('--bg', '#1a120a')
    const banner = document.createElement('div')
    banner.innerHTML = `
      <div style="
        position: fixed; inset: 0; z-index: 99999;
        display: flex; align-items: center; justify-content: center;
        background: rgba(13,12,11,0.95); pointer-events: none;
      ">
        <p style="
          font-family: monospace; font-size: clamp(1rem, 3vw, 1.5rem);
          letter-spacing: 0.15em; color: #D4A255; text-align: center;
          line-height: 2; padding: 2rem;
        ">
          ↑↑↓↓←→←→BA<br>
          <span style="font-size: 0.65em; color: #565049; display: block; margin-top: 1rem;">
            You found the konami code. Not bad.<br>
            Now go build something.
          </span>
        </p>
      </div>
    `
    document.body.appendChild(banner)
    setTimeout(() => {
      banner.style.opacity = '0'
      banner.style.transition = 'opacity 600ms'
      root.style.removeProperty('--bg')
      setTimeout(() => banner.remove(), 700)
    }, 2800)
  })

  return (
    <>
      <ConsoleMessage />
      <CustomCursor />
    </>
  )
}
