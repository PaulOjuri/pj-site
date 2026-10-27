/**
 * Page chrome only. Every line Alf speaks, every translation, every screen and
 * the demo order live in `src/data/alf-demo.json`; this file holds the copy the
 * JSON does not carry, taken verbatim from `alf-demo-kit/reference/meet-alf.html`.
 */

export const COPY = {
  mark: 'Concept demo for Alfera Technik devices',
  eyebrow: 'Voice assistant · Made for Nigeria',
  headline: ['Alf speaks ', 'your', ' language.'] as const,
  lede: 'Yorùbá, Igbo, Hausa and Pidgin, on Alfera phones and laptops. Alf answers the question you asked, then adds what a Nigerian friend would:',
  ledeStrong: 'rain on your route, market day, prayer time, a scam call.',
  playAll: 'Play the full demo',
  stopAll: 'Stop the demo',
  playHello: 'Hear Alf say hello',
  orbIdle: 'Tap play to hear Alf',
  stageTitle: 'Alf on Alfera devices',
  stageLede:
    'Pick a language, then switch between phone and laptop. Every answer adds local context and asks before it acts.',
  phoneCaption: 'Alfera Android phone · concept screens',
  laptopCaption: 'Alfera laptop · concept screens',
  statusListening: 'Listening…',
  statusWaiting: 'Waiting for your yes',
  statusSpeaking: (lang: string) => `Speaking ${lang}`,
  traitsLabel: 'How Alf behaves',
  traits: [
    {
      title: 'Answers in your language',
      body: 'Speak Yorùbá, Igbo, Hausa or Pidgin, and Alf replies in the same one.',
    },
    {
      title: 'Knows the local picture',
      body: 'Floods, market days, prayer times, naira and the scams going round.',
    },
    {
      title: 'Asks before it acts',
      body: 'Calls, payments and blocking a number always wait for your yes.',
    },
  ],
  aboutTitle: 'About this demo',
  credit:
    'Prototype voices: BibleTTS (Biblica open.bible recordings), CC BY-SA 4.0.',
} as const
