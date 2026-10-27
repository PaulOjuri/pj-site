# Alf demo kit

Everything needed to rebuild the "Meet Alf" demo on a website.

| Path | What it is |
| --- | --- |
| `PROMPT.md` | The prompt to give Claude Code in your website's repo |
| `data/alf-demo.json` | Copy, English translations, per-word timings, screen content, demo order |
| `audio/` | 4 greeting clips and 4 scene clips (MP3, mono, 64 kbps) |
| `reference/meet-alf.html` | Working single-file demo; open it in any browser, no internet needed except fonts |
| `LICENSES.md` | Credits that must stay on the page |

## How to use

1. Copy the `alf-demo-kit` folder into the root of your website's repo and commit it.
2. Open the repo in Claude Code and paste the contents of `PROMPT.md`.
3. Review Claude Code's plan, then let it build. Check the result on a real iPhone and Android phone with sound on.

## Timings

Each clip in `alf-demo.json` has `words`: one entry per displayed word, with `s` (start) and `e` (end) in seconds from the start of the MP3. Highlight a word while `s <= currentTime < e`.

## Before showing it outside your team

- Have native speakers check the Yorùbá, Igbo, Hausa and Pidgin lines.
- Igbo and Pidgin use a stand-in voice with a Hausa accent. Replace those clips when native recordings exist; keep the file names and regenerate the timings.

---

## Where this lives on paulojuri.com

Built as `/heyalf`. The page reads `src/data/alf-demo.json` (a byte-identical copy
of `data/alf-demo.json`, so the kit stays the archive and the app has a source
inside `src/`) and serves the clips from `public/heyalf/audio/`. If the data here
ever changes, copy it across and keep the two in step:

    cmp alf-demo-kit/data/alf-demo.json src/data/alf-demo.json
