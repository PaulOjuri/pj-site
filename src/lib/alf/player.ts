/**
 * Playback for /heyalf.
 *
 * One shared <audio> element for every clip, because iOS Safari will only ever
 * unlock the element the user's first tap touched. Nothing here starts sound on
 * its own: `play()` is only ever reached from a click handler.
 *
 * The Web Audio graph (used for the orb's level) is built on that same first
 * tap and is strictly optional — if it throws, the element still plays and the
 * orb falls back to a slow breath.
 */

const AUDIO_BASE = '/heyalf/audio/'

/** Thrown when a newer run has taken over, or Stop was pressed. */
export class Cancelled extends Error {
  constructor() {
    super('cancelled')
    this.name = 'Cancelled'
  }
}

type TimeFn = (currentTime: number, duration: number) => void

class AlfPlayer {
  private el: HTMLAudioElement | null = null
  private ctx: AudioContext | null = null
  private analyser: AnalyserNode | null = null
  private graphFailed = false
  private freq: Uint8Array = new Uint8Array(256)
  /** Object URLs keyed by the clip path from the JSON. */
  private cache = new Map<string, string>()
  private inflight = new Map<string, Promise<string>>()
  /** Bumped by every stop, tab change, toggle and new run. */
  private token = 0
  private cleanup: (() => void) | null = null

  /** True once a clip is playing; the orb reads this to stop breathing. */
  speaking = false

  // ── lifecycle ───────────────────────────────────────────────────────────

  mount(): () => void {
    if (this.el) return this.cleanup ?? (() => {})

    const el = new Audio()
    // No sound before a tap, and no bytes before a tab is chosen.
    el.preload = 'none'
    el.setAttribute('playsinline', '')
    el.crossOrigin = 'anonymous'
    // In the document so iOS treats it as a real player, and so tests can see
    // which clip is loaded. It has no controls and nothing lays out around it.
    el.setAttribute('data-testid', 'alf-audio')
    el.style.display = 'none'
    document.body.appendChild(el)
    this.el = el

    // A backgrounded tab should go quiet, not keep talking.
    const onVisibility = () => {
      if (document.hidden) this.stop()
    }
    document.addEventListener('visibilitychange', onVisibility)

    this.cleanup = () => {
      document.removeEventListener('visibilitychange', onVisibility)
      this.stop()
      for (const url of this.cache.values()) URL.revokeObjectURL(url)
      this.cache.clear()
      this.inflight.clear()
      el.remove()
      void this.ctx?.close()
      this.ctx = null
      this.analyser = null
      this.el = null
      this.cleanup = null
    }
    return this.cleanup
  }

  /**
   * Build (or resume) the analyser graph. Must be called from a user gesture:
   * iOS Safari creates every AudioContext suspended until one does.
   */
  unlock(): void {
    if (this.graphFailed || !this.el) return
    if (this.ctx) {
      if (this.ctx.state === 'suspended') void this.ctx.resume()
      return
    }
    try {
      const Ctor =
        window.AudioContext ??
        (window as unknown as { webkitAudioContext?: typeof AudioContext })
          .webkitAudioContext
      if (!Ctor) throw new Error('no AudioContext')
      const ctx = new Ctor()
      const source = ctx.createMediaElementSource(this.el)
      const analyser = ctx.createAnalyser()
      analyser.fftSize = 512
      source.connect(analyser)
      analyser.connect(ctx.destination)
      this.ctx = ctx
      this.analyser = analyser
      this.freq = new Uint8Array(analyser.frequencyBinCount)
      if (ctx.state === 'suspended') void ctx.resume()
    } catch {
      // Keep the sound, lose the visualiser.
      this.graphFailed = true
      this.ctx = null
      this.analyser = null
    }
  }


  /**
   * Unlock the <audio> element itself, from inside the gesture.
   *
   * iOS Safari ties playback permission to the element, not the page, and a
   * scene waits ~1.8s (wake, sheet, typing) before Alf speaks — long after the
   * tap has lapsed. Starting and immediately stopping the already-fetched clip
   * here spends the gesture on the element so the real play() is allowed.
   */
  prime(path?: string): void {
    const el = this.el
    if (!el) return
    const url = path ? this.cache.get(path) : el.src || undefined
    if (!url) return
    const wasMuted = el.muted
    el.muted = true
    el.src = url
    const started = el.play()
    if (started && typeof started.then === 'function') {
      started.then(
        () => {
          el.pause()
          el.currentTime = 0
          el.muted = wasMuted
        },
        () => {
          el.muted = wasMuted
        }
      )
    } else {
      el.pause()
      el.muted = wasMuted
    }
  }

  // ── loading ─────────────────────────────────────────────────────────────

  /** Fetch a clip and hold it as an object URL. Safe to call repeatedly. */
  preload(path: string): Promise<string> {
    const cached = this.cache.get(path)
    if (cached) return Promise.resolve(cached)
    const pending = this.inflight.get(path)
    if (pending) return pending

    const name = path.replace(/^.*\//, '')
    const run = fetch(AUDIO_BASE + name)
      .then((r) => {
        if (!r.ok) throw new Error(`${r.status} for ${name}`)
        return r.blob()
      })
      .then((blob) => {
        const url = URL.createObjectURL(blob)
        this.cache.set(path, url)
        this.inflight.delete(path)
        return url
      })
      .catch((err) => {
        this.inflight.delete(path)
        throw err
      })

    this.inflight.set(path, run)
    return run
  }

  // ── cancellation ────────────────────────────────────────────────────────

  /** Start a new run and invalidate every older one. */
  begin(): number {
    return ++this.token
  }

  live(token: number): boolean {
    return token === this.token
  }

  stop(): void {
    this.token++
    this.speaking = false
    const el = this.el
    if (el) {
      el.pause()
      el.onended = null
      el.onerror = null
    }
  }

  /** A cancellable pause. Rejects with Cancelled if the run was superseded. */
  wait(ms: number, token: number): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.live(token)) return reject(new Cancelled())
      window.setTimeout(
        () => (this.live(token) ? resolve() : reject(new Cancelled())),
        ms
      )
    })
  }

  // ── playback ────────────────────────────────────────────────────────────

  /**
   * Play one clip to its end, reporting currentTime on every frame.
   * Resolves when it ends; rejects with Cancelled if anything interrupts it.
   */
  async play(path: string, token: number, onTime?: TimeFn): Promise<void> {
    if (!this.live(token)) throw new Cancelled()
    const el = this.el
    if (!el) throw new Cancelled()

    this.unlock()
    const url = await this.preload(path)
    if (!this.live(token)) throw new Cancelled()

    el.src = url
    el.muted = false
    el.currentTime = 0

    await new Promise<void>((resolve, reject) => {
      const tick = () => {
        if (!this.live(token)) return
        onTime?.(el.currentTime, el.duration || 0)
        if (!el.paused && !el.ended) requestAnimationFrame(tick)
      }
      el.onended = () => {
        this.speaking = false
        onTime?.(el.duration || 0, el.duration || 0)
        if (this.live(token)) resolve()
        else reject(new Cancelled())
      }
      el.onerror = () => {
        this.speaking = false
        reject(new Error(`could not play ${path}`))
      }
      el.play().then(
        () => {
          this.speaking = true
          requestAnimationFrame(tick)
        },
        (err: unknown) => {
          this.speaking = false
          reject(err instanceof Error ? err : new Error(String(err)))
        }
      )
    })
  }

  // ── orb level ───────────────────────────────────────────────────────────

  /** 0–1 loudness of the current frame, or -1 when there is no analyser. */
  level(): number {
    if (!this.analyser || !this.speaking) return this.graphFailed ? -1 : 0
    this.analyser.getByteFrequencyData(this.freq as Uint8Array<ArrayBuffer>)
    let sum = 0
    for (let i = 2; i < 80; i++) sum += this.freq[i]
    return Math.min(1, sum / (78 * 170))
  }
}

export const player = new AlfPlayer()
