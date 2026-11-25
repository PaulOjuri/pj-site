# The agent app (paulojuri.com/app)

A private, installable web app where Paul's agents reach him and he answers back: decisions and research
from the agent inbox, reminders, a chat with the orchestrator, and the feed of everything the network has
done. It is one page with five tabs, behind Cloudflare Access, pushing to an iPhone over Web Push.

The agents live in [PaulOjuri/agent-network](https://github.com/PaulOjuri/agent-network) and run on Paul's
Mac. This repo holds the app, its API and the one cron Worker.

```
  iPhone (installed app)                 Cloudflare                          Paul's Mac
  ──────────────────────                 ──────────                          ──────────
  /app  ─ Access ──────────────▶ Pages Functions  ──▶  D1 "agent-network"  ◀── /api/agents/ingest
   │                             /api/app/*             app_feed                 (step 4 events)
   │                                                    app_reminders
   │  ◀── Web Push ──────────── reminders Worker ──▶    app_messages        ◀── /api/agent/notify
   │      (aes128gcm)           every minute            app_subscriptions       /api/agent/reminders
   │                            every 10 min ──▶ GitHub issues (agent-inbox)     /api/agent/messages
   └── taps a notification ──▶ /app#inbox/12
```

## The five tabs

| Tab | What it is | Reads | Writes |
|---|---|---|---|
| **Inbox** | Open `agent-inbox` issues: decisions you settle, research claude.ai answered | GitHub REST | a comment, and the `decided` label |
| **Reminders** | What, when (Brussels), optional lead time and repeat | `app_reminders` | create, edit, snooze, done, delete |
| **Chat** | Ask the orchestrator something; the Mac answers | `app_messages` | a `pending` message |
| **Feed** | Everything: pushed cards and the agents' run events | `app_feed` + `events` | marks cards read |
| **Settings** | Notifications on/off, a test push, what this build knows | — | subscription rows |

The Feed is the `/agents` page that step 5 of the agent-network README asked for. It lives inside the app,
behind the same Access policy, rather than as a separate page.

## The look

The app is the site at phone size, not a second brand: the same near-black, the same gold, the same
display serif for a title and mono for anything the machine knows. What it adds is the behaviour a
page does not need and an app does.

- **A collapsing large title.** The section's name is set large over a mono eyebrow and shrinks into a
  bar as the body scrolls. It is a scroll-linked CSS animation (`animation-timeline`), so there is no
  scroll handler and no re-render per frame; a browser without scroll timelines simply keeps the large
  title, which is the better half of the effect.
- **A floating tab bar.** A blurred pill that the list runs underneath, with a gold lamp that slides to
  the tab you picked. The tabs themselves only change colour, so nothing reflows on a tap.
- **Tones, not decoration.** Every kind in `kinds.ts` carries one: gold for what only Paul can settle,
  blue for what was looked up, amber for the clock, green for an answer from an agent, red for
  something going wrong. A card borrows its kind's tone for its rail, its badge and its node on the
  Feed's timeline, so the colour on screen always means the same thing. A new kind gets its tone for
  free.
- **The Feed as a timeline.** It is the one list that is a sequence rather than a set, so it is drawn
  as one: a hairline down the gutter with a node where each entry joins it.
- **Skeletons, not spinners.** Every tab loads into the shape of what is coming, so nothing jumps when
  the data lands.
- **Still no images.** Every mark in the app — the tab icons, the kind badges, the empty states and the
  app icon on the install screen — is inline SVG in `components/app/icons.tsx`. `tests/app` fails if an
  `<img>` ever appears inside `#agent-app`.

Reduced motion turns all of it off: no stagger, no shimmer, no sliding lamp.

## Endpoints

Everything under `/api/app/*` is for the browser and requires a **verified Cloudflare Access JWT**.
Everything under `/api/agent/*` is for the Mac and requires the **`AGENT_APP_TOKEN` bearer token**. They
never overlap: a browser cannot use the token endpoints and the Mac cannot use the Access ones.

| Method | Path | What |
|---|---|---|
| GET | `/api/app/config` | VAPID public key, who you are, what is configured |
| POST/DELETE | `/api/app/subscriptions` | store or remove this device's push subscription |
| POST | `/api/app/test-push` | Settings → "Send test notification" |
| GET | `/api/app/feed` | `?project=&kind=&before=&limit=` |
| POST | `/api/app/feed/read` | `{ids}` or `{all:true}` |
| GET/POST | `/api/app/reminders` | list / create |
| PATCH/DELETE | `/api/app/reminders/:id` | edit, `{snooze_minutes}`, `{state}` / delete |
| GET | `/api/app/inbox` | the open agent-inbox issues |
| GET/POST | `/api/app/inbox/:number` | one issue / `{comment, decide?}` |
| GET/POST | `/api/app/chat` | threads / send a message |
| POST | `/api/agent/notify` | `{title, body?, url?, priority?, kind?, project?}` |
| POST | `/api/agent/reminders` | `{what, date+time \| due_at, lead_minutes?, repeat?}` |
| GET | `/api/agent/messages` | `?status=pending&claim=1&limit=` |
| POST | `/api/agent/messages/:id/reply` | `{body, agent?}` or `{failed:true, body?}` |

Input is validated by hand in `functions/_lib/validate.ts`, in the style the site's other Functions already
use (`functions/api/agents/_shared.ts`), with every field length-capped. A `url` must be a path on this
site, so a notification can never be made to open somewhere else.

## Web Push

`functions/_lib/push.ts` implements RFC 8291 (aes128gcm payload encryption) and RFC 8292 (VAPID) with
WebCrypto, because Node's `web-push` cannot run on Workers. It is tested against the worked example in
RFC 8291 §5, byte for byte, in `tests/unit/push.test.ts`.

- One ephemeral ECDH key pair and one salt per message.
- `TTL`, `Urgency` and `Topic` headers; a reminder uses its own id as the topic, so a snoozed reminder
  replaces its undelivered notification instead of stacking another one.
- **404 or 410 from a push service deletes the subscription row.** Any other failure is recorded on the
  row and the subscription is kept, because that is usually the service, not us.
- Notifications are never `silent`, so they play the default sound, and each carries the deep link of the
  card that caused it.

## Reminders and the cron Worker

Pages has no cron, so `workers/reminders/` is a separate Worker bound to the same D1 database:

- `* * * * *` — fire what is due.
- `*/10 * * * *` — poll the agent inbox for new decisions.

Firing claims rows with a single `UPDATE … RETURNING`, so two overlapping runs cannot fire the same
reminder twice (proved in `tests/app` and by hand with four concurrent invocations). A repeat is queued
only after the push, and the next occurrence is computed on the **Brussels wall clock**, so a daily 08:00
reminder stays at 08:00 across a clock change (`functions/_lib/time.ts`, `tests/unit/time.test.ts`).

**New decisions are pushed from the Worker, not from the Mac.** The Mac is asleep most of the day and
claude.ai can add a recommendation at any hour, so a ten-minute poll is the only thing that always runs.
`ask_paul` also pushes the moment it files a decision; `app_inbox_seen` is what stops the two of them
notifying twice about the same issue.

## Security

- `/app` and `/api/app/*` sit behind Cloudflare Access, and every Function **verifies the
  `Cf-Access-Jwt-Assertion` JWT itself** against the team's public keys: signature, issuer, audience,
  expiry, and the email. The header's presence proves nothing (`functions/_lib/access.ts`,
  `tests/unit/access.test.ts`).
- `/api/agent/*` takes only the bearer token, compared in constant time.
- Issue and comment text is **never** turned into HTML. `src/lib/app/markdown.ts` parses a small markdown
  subset into a tree and `Markdown.tsx` renders it as React nodes, so markup in an issue is shown as the
  characters it is. Links are dropped unless they are plain `http(s)` or site-relative.
- No third-party anything: no analytics, no fonts beyond the site's own, no runtime dependencies in the
  Functions.
- `/app` is `noindex` in the metadata, in `public/_headers` and in `robots.ts`.
- Secrets live in Cloudflare (`wrangler secret put`), never in git. `.dev.vars` is git-ignored.

## Adding a card kind

"Anything the agents need me for" should be a new kind, not a new screen.

1. Add an entry to `KINDS` in [`src/lib/app/kinds.ts`](../src/lib/app/kinds.ts):

   ```ts
   invoice: {
     label: 'Invoice',
     glyph: '€',
     tone: 'warn',
     tab: 'feed',
     actions: [{ action: 'open', title: 'Open' }],
     about: 'A client invoice that needs sending or chasing.',
   },
   ```

2. That is the whole change. The kind is accepted by `POST /api/agent/notify`, the card renders with its
   glyph and tone, the Feed gains a filter pill for it, the notification offers its actions, and Settings
   lists it with its `about` line.

3. Only if the kind needs its own **screen** does anything else change: give it a `tab`, and handle the
   new route in `src/components/app/AgentApp.tsx`.

An agent can also send a kind this build has never heard of: the card falls back to `GENERIC` and is still
readable, so the agent side can ship first.

## Running it locally

```bash
cp .dev.vars.example .dev.vars            # then fill in the VAPID keys below
node scripts/vapid-keys.mjs               # throwaway keys for local work

npx wrangler d1 execute agent-network --local --file functions/api/agents/schema.sql
npx wrangler d1 execute agent-network --local --file migrations/agent-network/0001_agent_app.sql

npm run build
npm run app:dev                           # wrangler pages dev out --port 8788
npm run reminders:dev                     # the cron Worker, in another terminal
```

There is no Cloudflare Access in front of `wrangler pages dev`, so `APP_ACCESS_DEV_BYPASS=1` in
`.dev.vars` stands in for it. It is ignored unless `ACCESS_TEAM_DOMAIN` is empty, so it can never open a
deployed site that has Access configured — `tests/unit/access.test.ts` holds that down.

Fire the Worker by hand:

```bash
curl "http://localhost:8789/cdn-cgi/handler/scheduled?cron=*+*+*+*+*"      # reminders
curl "http://localhost:8789/cdn-cgi/handler/scheduled?cron=*%2F10+*+*+*+*" # inbox poll
```

## Tests

```bash
npm run typecheck     # src, then functions + workers (tsconfig.workers.json)
npm run test:unit     # push encryption, Brussels time, validators, markdown, Access JWTs
npm run build
npm run test:app      # every flow against wrangler pages dev, at iPhone size
```

`npm run test:app` runs against stand-ins for the two things a test cannot have: a GitHub API
(`tests/app/github-stub.mjs`, which also fails loudly if the app ever tries to close an issue) and a push
service (`tests/app/push-stub.mjs`, which records what arrived and can answer 410). The screenshots in
`docs/app-screens/` are taken by that run.

## Deploying

```bash
npm run build
npx wrangler pages deploy out --project-name paulojuri
npx wrangler deploy --config workers/reminders/wrangler.toml
```

The Worker and the Pages project have **separate secret stores**: the VAPID keys and the GitHub token have
to be set on both. See the checklist in the pull request.
