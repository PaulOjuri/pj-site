Build a "Meet Alf" demo page on this website.

## What it is
Alf is a voice assistant concept for Alfera phones and laptops. It speaks Yorùbá, Igbo, Hausa and Nigerian Pidgin, and adds local context to its answers. The page lets visitors hear Alf and watch it work on an Alfera Android phone and an Alfera laptop. It must work equally well on phones and in desktop browsers.

## Inputs (in ./alf-demo-kit, committed to this repo)
- `data/alf-demo.json`: all copy, translations, per-word timings in seconds for every clip, device screen content, the full-demo order and the device each scene plays on.
- `audio/*.mp3`: 8 clips (4 greetings, 4 scenes), about 660 KB in total.
- `reference/meet-alf.html`: a working single-file version. Open it in a browser to see the intended behaviour, layout and animation. Port its behaviour; don't embed the file or its base64 audio.
- `LICENSES.md`: the voice attribution that must appear on the page.

## First, inspect the repo
Work out the framework, router, styling approach, component patterns, fonts, asset pipeline and test setup, and follow them. Don't add a new framework or UI library. If the site has a design system or brand tokens, use them; otherwise use the reference page's palette and fonts. Add the page at `/alf`, unless the site already has a demos or products section; then put it there and tell me where. Show me your plan before writing code.

## Page structure (copy comes from the JSON, not hard-coded)
1. Hero: the headline "Alf speaks your language.", a short intro, "Play the full demo" and "Hear Alf say hello" buttons, an animated orb that reacts to Alf's voice, greeting chips for the four languages, and the current line with its English translation.
2. Device stage: four language tabs (hello word, language, scene title), a Phone/Laptop toggle, an English-translation toggle and a Play/Stop button. On one side, the device frame playing the scene. On the other, the transcript: the user's words, Alf's reply with the current word highlighted, the English translation, the "Alf used" chips, and the stand-in-voice badge where the JSON has one.
3. Three short "How Alf behaves" points: answers in your language, knows the local picture, asks before it acts.
4. About: the concept, voice and production notes from the JSON, plus the CC BY-SA 4.0 credit.

## Device frames
- Build both frames in HTML and CSS, without images: an Android phone (380×790 design size, power button on the right edge) and a laptop (1280×794 design size, lid plus base). Render each at its design size and scale it to its container with a CSS transform driven by a ResizeObserver, so screen content keeps its proportions at any width.
- Each scene has a phone home screen, an Alf bottom sheet (orb, user line, highlighted reply, scene card, action buttons), and a laptop desktop with an app window plus a floating Alf panel. Take the content from `screens` in the JSON: a route map (Yorùbá), a reminder with the Igbo market week (Igbo), prayer times with a harmattan note (Hausa), and a scam alert over a messages list (Pidgin).
- Draw the route map as inline SVG, and animate Alf's route with stroke-dashoffset when it appears.
- Buttons inside the screens are visual only. They must not navigate or submit anything.

## Playback sequence (cancellable at every step)
For a scene: show the device at rest; wake Alf (power-button glow on the phone, a "Hey Alf" chip on the laptop, a screen-edge glow while listening); open the sheet or panel; type the user's words in word by word; play the clip and highlight each word from its `s`/`e` timings, in both the device and the transcript; reveal the scene card or app-window change; set the status to "Waiting for your yes".
The full demo plays the four greetings, scrolls to the stage, then plays each scene on its `demo_device`. Any tab, toggle or Stop cancels whatever is playing. At rest, every scene shows its final state (reply visible, card shown), never an empty screen.

## Audio rules
- Never autoplay. Start sound only from a tap or click.
- Use one shared HTMLAudioElement with `playsinline`. Create the Web Audio AudioContext and AnalyserNode on the first tap (needed on iOS Safari) and resume it if it is suspended. If Web Audio fails, still play the audio and keep the orb gently breathing.
- Load clips lazily: `preload="none"` at page load, then fetch a scene's clip when its tab is chosen.
- Pause when the browser tab is hidden (visibilitychange). Drive highlighting with requestAnimationFrame from `audio.currentTime`.

## Responsive behaviour
- Phones (under 640px): single column; headline before the orb; orb at most 260px; language tabs in a 2×2 grid; full-width Phone/Laptop toggle; phone frame at most 320px wide and centred; laptop frame full width with the transcript below it; a sticky bottom bar with Play/Stop and the current language that clears the safe-area inset. Tap targets at least 44px, body text at least 16px, and no horizontal scrolling down to 320px wide.
- Tablets (640–1023px): two-column hero; phone frame beside the transcript from 820px; laptop stacked above the transcript.
- Desktop (1024px and up): phone (max 400px) beside the transcript; laptop and transcript side by side at about 60/40 from 1100px.
- Keep the layout stable while playing: nothing jumps when text types in or cards appear.

## Accessibility
- The device frames are decorative copies, so mark them aria-hidden. The transcript is the accessible version.
- Language tabs use role="tablist"/"tab" with arrow-key movement; the device toggle is a radiogroup; every control is keyboard-reachable with a visible focus ring.
- Put `lang` attributes on non-English text (yo, ig, ha, pcm), and announce the current line through an aria-live="polite" region.
- Honour prefers-reduced-motion: no orb wobble, no typing animation, instant reveals.
- Meet WCAG AA contrast.

## Typography
Yorùbá, Igbo and Hausa need characters such as ẹ́ ọ̀ ṣ ị ụ ṅ ɓ ɗ ƙ. Use a font that supports them for the transcripts (the reference uses Charis SIL from Google Fonts), and check the diacritics stack correctly.

## Performance and SEO
- Ship no base64 audio, and keep the JSON static. Load fonts with preconnect and `display=swap`.
- Aim for Lighthouse mobile scores of 90+ for performance and accessibility.
- Add a page title ("Meet Alf"), a meta description and Open Graph tags, following the site's conventions.

## Testing
With the repo's test tools, or Playwright if there are none, check at 390×844 and 1440×900:
- no horizontal overflow;
- every language tab plays on both devices, the audio source changes and words highlight;
- the full demo runs to the end, and Stop cancels it;
- reduced-motion mode works.
Then list what I should check by hand on a real iPhone (Safari) and Android phone (Chrome), especially sound.

## Don't
- Don't use Alfera logos or brand assets unless they already exist in this repo.
- Don't change the transcripts, translations or timings.
- Don't remove the "Concept demo" note, the stand-in-voice badges or the CC BY-SA credit.
