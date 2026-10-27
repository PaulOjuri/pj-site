/**
 * Types over `src/data/alf-demo.json` — a verbatim copy of
 * `alf-demo-kit/data/alf-demo.json`. Transcripts, translations and word
 * timings are fixed: read them, never rewrite them.
 */

export type LangCode = 'yo' | 'ig' | 'ha' | 'pcm'

/** One displayed word with its start/end offset in seconds into the clip. */
export interface Word {
  w: string
  s: number
  e: number
}

export interface Clip {
  text: string
  en: string
  audio: string
  duration_s: number
  words: Word[]
}

export interface Greeting extends Clip {
  lang: string
  lang_code: LangCode
  hello: string
}

export interface Action {
  icon: string
  title: string
  detail: string
  buttons: string[]
}

export interface Widget {
  label: string
  value: string
  note: string
  icon?: string
}

export interface Thread {
  name: string
  preview: string
  time: string
  unread?: boolean
  icon?: string
}

export interface PhoneHome {
  widget?: Widget
  app?: string
  threads?: Thread[]
}

export type Card =
  | { type: 'route-map'; legend: string[] }
  | {
      type: 'reminder'
      title: string
      when: string
      text: string
      market_week: { day: string; tag?: string; highlight?: boolean }[]
    }
  | {
      type: 'prayer-times'
      note: string
      prayers: [string, string][]
      highlight: string
      reminder: string
      dust: string
    }
  | { type: 'scam-alert'; title: string; text: string; number: string }

export interface CalendarDay {
  day: string
  market: string
  today?: boolean
  market_day?: boolean
}

export interface CalendarEvent {
  day: string
  time: string
  title: string
  added_by_alf?: boolean
}

export interface LaptopScreen {
  window: string
  widget?: Widget
  footer?: string[]
  map_labels?: Record<string, string>
  days?: CalendarDay[]
  hours?: string[]
  events?: CalendarEvent[]
  banner?: string
}

export interface Scene {
  id: LangCode
  lang: string
  lang_code: LangCode
  hello: string
  title: string
  setting: string
  /** Stand-in-voice note. Shown as a badge when present. */
  badge: string | null
  /** Which device the full demo plays this scene on. */
  demo_device: 'phone' | 'laptop'
  user: { text: string; en: string }
  alf: Clip
  action: Action
  context: string[]
  screens: { phone_home: PhoneHome; card: Card; laptop: LaptopScreen }
}

export interface AlfDemo {
  about: { concept_note: string; voice_note: string; production_note: string }
  greetings: Greeting[]
  scenes: Scene[]
  full_demo_order: LangCode[]
}
