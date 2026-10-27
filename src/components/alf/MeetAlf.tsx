'use client'

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  type ReactElement,
} from 'react'
import demo from '@/data/alf-demo.json'
import type { AlfDemo, LangCode, Scene } from '@/lib/alf/types'
import { COPY } from '@/lib/alf/copy'
import { Cancelled, player } from '@/lib/alf/player'
import { Orb } from './Orb'
import { Icon } from './icons'
import { PhoneFrame } from './PhoneFrame'
import { LaptopFrame } from './LaptopFrame'
import { Words } from './AlfSurface'
import { restView, type SceneView } from './view'

const DATA = demo as AlfDemo
const SCENES = DATA.scenes

type Device = 'phone' | 'laptop'
type Mode = 'idle' | 'scene' | 'all'

/** prefers-reduced-motion, read straight from the media query. */
const REDUCED_MOTION = '(prefers-reduced-motion: reduce)'
const reducedMotion = {
  subscribe(onChange: () => void) {
    const mq = window.matchMedia(REDUCED_MOTION)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  },
  get: () => window.matchMedia(REDUCED_MOTION).matches,
  // The export is static, so assume full motion until the client says otherwise.
  onServer: () => false,
}

interface NowLine {
  text: string
  en: string
  lang: LangCode
}

export function MeetAlf(): ReactElement {
  const reduced = useSyncExternalStore(
    reducedMotion.subscribe,
    reducedMotion.get,
    reducedMotion.onServer
  )
  const [index, setIndex] = useState(0)
  const [device, setDevice] = useState<Device>('phone')
  const [showEn, setShowEn] = useState(true)
  const [mode, setMode] = useState<Mode>('idle')
  const [greetIndex, setGreetIndex] = useState(-1)
  const [caption, setCaption] = useState<string>(COPY.orbIdle)
  const [nowLine, setNowLine] = useState<NowLine>({
    text: DATA.greetings[0].text,
    en: DATA.greetings[0].en,
    lang: DATA.greetings[0].lang_code,
  })

  const scene: Scene = SCENES[index]
  const [view, setView] = useState<SceneView>(() => restView(SCENES[0], COPY.statusWaiting))

  const tabsRef = useRef<HTMLDivElement>(null)
  const stageRef = useRef<HTMLElement>(null)
  const heroRef = useRef<HTMLHeadingElement>(null)

  // ── setup ───────────────────────────────────────────────────────────────

  useEffect(() => player.mount(), [])

  // A backgrounded tab stops the audio; put the stage back to rest.
  useEffect(() => {
    const onHidden = () => {
      if (!document.hidden) return
      setMode('idle')
      setGreetIndex(-1)
      setCaption(COPY.orbIdle)
      setView(restView(SCENES[index], COPY.statusWaiting))
    }
    document.addEventListener('visibilitychange', onHidden)
    return () => document.removeEventListener('visibilitychange', onHidden)
  }, [index])

  // Fetch the chosen scene's clip, once the page is otherwise idle.
  useEffect(() => {
    const clip = SCENES[index].alf.audio
    const idle =
      window.requestIdleCallback?.(() => void player.preload(clip).catch(() => {})) ??
      window.setTimeout(() => void player.preload(clip).catch(() => {}), 1200)
    return () => {
      if (window.cancelIdleCallback) window.cancelIdleCallback(idle as number)
      else window.clearTimeout(idle as number)
    }
  }, [index])

  // ── playback ────────────────────────────────────────────────────────────

  const cancel = useCallback(() => {
    player.stop()
    setMode('idle')
    setGreetIndex(-1)
    setCaption(COPY.orbIdle)
  }, [])

  const rest = useCallback((i: number) => {
    setView(restView(SCENES[i], COPY.statusWaiting))
  }, [])

  const runGreetings = useCallback(async (token: number) => {
    for (let i = 0; i < DATA.greetings.length; i++) {
      const g = DATA.greetings[i]
      setGreetIndex(i)
      setNowLine({ text: g.text, en: g.en, lang: g.lang_code })
      setCaption(g.lang)
      await player.play(g.audio, token)
      setCaption(COPY.orbIdle)
      await player.wait(350, token)
    }
    setGreetIndex(-1)
  }, [])

  const runScene = useCallback(
    async (i: number, token: number, dev: Device) => {
      const s = SCENES[i]
      setIndex(i)
      setDevice(dev)
      setNowLine({ text: s.user.text, en: s.user.en, lang: s.lang_code })
      setView({
        typed: '',
        said: 0,
        now: -1,
        status: COPY.statusListening,
        waking: false,
        listening: false,
        sheetOpen: false,
        revealed: false,
        progress: 0,
      })
      setCaption(COPY.statusListening)

      // Have the bytes before the sheet opens, so speech starts on cue.
      await player.preload(s.alf.audio).catch(() => {})
      await player.wait(500, token)

      // Wake Alf: hold the power button, or say "Hey Alf" at the laptop.
      setView((v) => ({ ...v, waking: true, listening: true }))
      await player.wait(900, token)
      setView((v) => ({ ...v, waking: false, sheetOpen: true }))
      await player.wait(450, token)

      // The user's words arrive one at a time.
      const words = s.user.text.split(' ')
      if (reduced) {
        setView((v) => ({ ...v, typed: s.user.text }))
      } else {
        for (let k = 0; k < words.length; k++) {
          const typed = words.slice(0, k + 1).join(' ')
          setView((v) => ({ ...v, typed }))
          await player.wait(75, token)
        }
      }
      setView((v) => ({ ...v, listening: false }))
      await player.wait(350, token)

      setView((v) => ({ ...v, status: COPY.statusSpeaking(s.lang) }))
      setNowLine({ text: s.alf.text, en: s.alf.en, lang: s.lang_code })
      setCaption(s.lang)

      let lastSaid = -1
      let lastNow = -2
      let lastPct = -1
      await player.play(s.alf.audio, token, (t, d) => {
        let said = 0
        let now = -1
        for (let k = 0; k < s.alf.words.length; k++) {
          const w = s.alf.words[k]
          if (t >= w.e) said = k + 1
          else {
            if (t >= w.s) now = k
            break
          }
        }
        const pct = d ? Math.round((t / d) * 100) : 0
        if (said !== lastSaid || now !== lastNow || pct !== lastPct) {
          lastSaid = said
          lastNow = now
          lastPct = pct
          setView((v) => ({ ...v, said, now, progress: pct / 100 }))
        }
      })

      setCaption(COPY.orbIdle)
      setView(restView(s, COPY.statusWaiting))
    },
    [reduced]
  )

  const scrollTo = useCallback(
    (el: HTMLElement | null) => {
      el?.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' })
    },
    [reduced]
  )

  const playScene = useCallback(
    (i: number, dev?: Device) => {
      player.stop()
      player.unlock()
      player.prime(SCENES[i].alf.audio)
      const token = player.begin()
      setMode('scene')
      void runScene(i, token, dev ?? device)
        .then(() => player.live(token) && setMode('idle'))
        .catch((err: unknown) => {
          if (!(err instanceof Cancelled)) {
            setMode('idle')
            rest(i)
          }
        })
    },
    [device, rest, runScene]
  )

  const playAll = useCallback(() => {
    player.stop()
    player.unlock()
    player.prime(DATA.greetings[0].audio)
    const token = player.begin()
    setMode('all')
    void (async () => {
      try {
        scrollTo(heroRef.current)
        await runGreetings(token)
        await player.wait(400, token)
        scrollTo(stageRef.current)
        await player.wait(600, token)
        for (const id of DATA.full_demo_order) {
          const i = SCENES.findIndex((s) => s.id === id)
          if (i < 0) continue
          await runScene(i, token, SCENES[i].demo_device)
          await player.wait(2200, token)
        }
        setCaption(COPY.orbIdle)
        setMode('idle')
      } catch (err) {
        if (!(err instanceof Cancelled)) {
          setMode('idle')
          setCaption(COPY.orbIdle)
        }
      }
    })()
  }, [runGreetings, runScene, scrollTo])

  const playHello = useCallback(() => {
    player.stop()
    player.unlock()
    player.prime(DATA.greetings[0].audio)
    const token = player.begin()
    setMode('all')
    void runGreetings(token)
      .then(() => player.live(token) && setMode('idle'))
      .catch((err: unknown) => {
        if (!(err instanceof Cancelled)) setMode('idle')
      })
  }, [runGreetings])

  // ── controls ────────────────────────────────────────────────────────────

  const chooseTab = useCallback(
    (i: number) => {
      cancel()
      setIndex(i)
      rest(i)
      setNowLine({ text: SCENES[i].alf.text, en: SCENES[i].alf.en, lang: SCENES[i].lang_code })
      void player.preload(SCENES[i].alf.audio).catch(() => {})
    },
    [cancel, rest]
  )

  const chooseDevice = useCallback(
    (d: Device) => {
      cancel()
      setDevice(d)
      rest(index)
    },
    [cancel, index, rest]
  )

  const onTabKey = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      const last = SCENES.length - 1
      let next: number | null = null
      if (e.key === 'ArrowRight') next = index === last ? 0 : index + 1
      else if (e.key === 'ArrowLeft') next = index === 0 ? last : index - 1
      else if (e.key === 'Home') next = 0
      else if (e.key === 'End') next = last
      if (next === null) return
      e.preventDefault()
      chooseTab(next)
      const tab = tabsRef.current?.querySelector<HTMLButtonElement>(`#alf-tab-${SCENES[next].id}`)
      tab?.focus()
    },
    [chooseTab, index]
  )

  /** A radiogroup moves with the arrows, not just with Tab. */
  const onDeviceKey = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (!['ArrowRight', 'ArrowDown', 'ArrowLeft', 'ArrowUp'].includes(e.key)) return
      e.preventDefault()
      const next: Device = device === 'phone' ? 'laptop' : 'phone'
      chooseDevice(next)
      const group = e.currentTarget
      group.querySelectorAll('button')[next === 'phone' ? 0 : 1]?.focus()
    },
    [chooseDevice, device]
  )

  const stopEverything = useCallback(() => {
    cancel()
    rest(index)
  }, [cancel, index, rest])

  const playing = mode !== 'idle'
  const frame = useMemo(
    () =>
      device === 'phone' ? (
        <PhoneFrame scene={scene} view={view} reduced={reduced} />
      ) : (
        <LaptopFrame scene={scene} view={view} reduced={reduced} />
      ),
    [device, scene, view, reduced]
  )

  // ── render ──────────────────────────────────────────────────────────────

  return (
    <div className={`alf${device === 'laptop' ? ' is-laptop' : ''}${showEn ? '' : ' alf-hide-en'}`}>
      <div className="alf-wrap">
        <header className="alf-top">
          <div className="alf-mark">
            <b>
              Alf<i>.</i>
            </b>
            <span className="alf-tag">{COPY.mark}</span>
          </div>
          <a className="alf-tag alf-tag-link" href="#alf-about">
            About this demo
          </a>
        </header>

        {/* ── hero ── */}
        <section className="alf-hero" aria-labelledby="alf-hero-title">
          <div className="alf-hero-copy">
            <p className="alf-eyebrow">{COPY.eyebrow}</p>
            <h1 id="alf-hero-title" ref={heroRef}>
              {COPY.headline[0]}
              <em>{COPY.headline[1]}</em>
              {COPY.headline[2]}
            </h1>
            <p className="alf-lede">
              {COPY.lede} <strong>{COPY.ledeStrong}</strong>
            </p>
            <div className="alf-cta">
              <button
                type="button"
                className="alf-btn is-primary"
                onClick={() => (mode === 'all' ? stopEverything() : playAll())}
              >
                <Icon name={mode === 'all' ? 'stop' : 'play'} />
                <span>{mode === 'all' ? COPY.stopAll : COPY.playAll}</span>
              </button>
              <button type="button" className="alf-btn" onClick={playHello}>
                <Icon name="wave" />
                <span>{COPY.playHello}</span>
              </button>
            </div>
          </div>

          <div className="alf-hero-stage">
            <div className="alf-orb-box">
              <Orb rings reduced={reduced} className="alf-orb" />
              <div className="alf-orb-caption">{caption}</div>
            </div>
            <div className="alf-greets" aria-label="Languages">
              {DATA.greetings.map((g, i) => (
                <span key={g.lang_code} className={`alf-greet${i === greetIndex ? ' is-on' : ''}`}>
                  <span lang={g.lang_code}>{g.hello}</span>
                  <small>{g.lang}</small>
                </span>
              ))}
            </div>
            <p className="alf-now-line" aria-live="polite">
              <span lang={nowLine.lang}>{nowLine.text}</span>
              <span className="alf-now-en">{nowLine.en}</span>
            </p>
          </div>
        </section>

        {/* ── device stage ── */}
        <section className="alf-stage-section" aria-labelledby="alf-stage-title" ref={stageRef}>
          <div className="alf-sec-head">
            <h2 id="alf-stage-title">{COPY.stageTitle}</h2>
            <p>{COPY.stageLede}</p>
          </div>

          <div
            className="alf-rail"
            role="tablist"
            aria-label="Choose a language"
            ref={tabsRef}
            onKeyDown={onTabKey}
          >
            {SCENES.map((s, i) => (
              <button
                key={s.id}
                type="button"
                role="tab"
                id={`alf-tab-${s.id}`}
                className="alf-lang"
                aria-selected={i === index}
                aria-controls="alf-transcript"
                tabIndex={i === index ? 0 : -1}
                onClick={() => chooseTab(i)}
              >
                <span className="alf-hello" lang={s.lang_code}>
                  {s.hello}
                </span>
                <span className="alf-name">{s.lang}</span>
                <span className="alf-scene">{s.title}</span>
              </button>
            ))}
          </div>

          <div className="alf-stage-bar">
            <div className="alf-seg" role="radiogroup" aria-label="Device" onKeyDown={onDeviceKey}>
              <button
                type="button"
                role="radio"
                aria-checked={device === 'phone'}
                tabIndex={device === 'phone' ? 0 : -1}
                onClick={() => chooseDevice('phone')}
              >
                <Icon name="phoneDevice" />
                Phone
              </button>
              <button
                type="button"
                role="radio"
                aria-checked={device === 'laptop'}
                tabIndex={device === 'laptop' ? 0 : -1}
                onClick={() => chooseDevice('laptop')}
              >
                <Icon name="laptopDevice" />
                Laptop
              </button>
            </div>
            <div className="alf-bar-right">
              <label className="alf-switch" htmlFor="alf-show-en">
                <input
                  type="checkbox"
                  id="alf-show-en"
                  checked={showEn}
                  onChange={(e) => setShowEn(e.target.checked)}
                />
                English
              </label>
              <button
                type="button"
                className="alf-btn"
                data-testid="scene-play"
                onClick={() => (playing ? stopEverything() : playScene(index))}
              >
                <Icon name={playing ? 'stop' : 'play'} />
                <span>{playing ? 'Stop' : 'Play'}</span>
              </button>
            </div>
          </div>

          <div className="alf-stage">
            <div className="alf-device-col">
              <div className="alf-device" aria-hidden="true">
                {frame}
              </div>
              <div className="alf-progress" aria-hidden="true">
                <i style={{ width: `${Math.round(view.progress * 100)}%` }} />
              </div>
              <p className="alf-device-caption">
                {device === 'phone' ? COPY.phoneCaption : COPY.laptopCaption}
              </p>
            </div>

            <div className="alf-panel" id="alf-transcript" role="tabpanel" aria-labelledby={`alf-tab-${scene.id}`}>
              <div className="alf-panel-top">
                <b>{scene.title}</b>
                <span>
                  {scene.lang} · {scene.setting}
                </span>
                {scene.badge && <span className="alf-badge">{scene.badge}</span>}
              </div>
              <div className="alf-chat">
                <div className="alf-row is-you">
                  <div className="alf-who">You</div>
                  <div className="alf-bubble" lang={scene.lang_code}>
                    {scene.user.text}
                  </div>
                  <div className="alf-en">{scene.user.en}</div>
                </div>
                <div className={`alf-row is-alf${playing ? ' is-speaking' : ''}`}>
                  <div className="alf-who">
                    <span className="alf-dot" />
                    Alf
                  </div>
                  <div className="alf-bubble" lang={scene.lang_code}>
                    <Words scene={scene} view={view} />
                  </div>
                  <div className="alf-en">{scene.alf.en}</div>
                </div>
                <div className="alf-context">
                  <span className="alf-k">Alf used</span>
                  {scene.context.map((c) => (
                    <span className="alf-chip" key={c}>
                      {c}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── how Alf behaves ── */}
        <section className="alf-traits" aria-label={COPY.traitsLabel}>
          {COPY.traits.map((t) => (
            <div className="alf-trait" key={t.title}>
              <h3>{t.title}</h3>
              <p>{t.body}</p>
            </div>
          ))}
        </section>

        {/* ── about ── */}
        <section className="alf-about" id="alf-about">
          <h2>{COPY.aboutTitle}</h2>
          <div>
            <p>{DATA.about.concept_note}</p>
            <p>{DATA.about.voice_note}</p>
            <p>{DATA.about.production_note}</p>
            <p className="alf-credit">{COPY.credit}</p>
          </div>
        </section>
      </div>

      {/* ── sticky control bar, phones only ── */}
      <div className="alf-sticky" aria-hidden={false}>
        <span className="alf-sticky-lang">
          <span lang={scene.lang_code}>{scene.hello}</span>
          <small>{scene.lang}</small>
        </span>
        <button
          type="button"
          className="alf-btn is-primary"
          onClick={() => (playing ? stopEverything() : playScene(index))}
        >
          <Icon name={playing ? 'stop' : 'play'} />
          <span>{playing ? 'Stop' : 'Play'}</span>
        </button>
      </div>
    </div>
  )
}
