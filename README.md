# paulojuri.com

Personal site: Next.js 16 (App Router, static export) on Cloudflare Pages, with Pages Functions for
the dynamic bits. `npm run dev` to work locally, `npm run build` then
`npx wrangler pages deploy out --project-name paulojuri` to ship.

## /chess

A closed-loop chess training system lives at `/chess`: games in, Stockfish analysis, recurring
weaknesses out with evidence and confidence, a weekly plan, a trainer, and a title-route tracker.
The pipeline that produces its data is in [`chess-coach/`](chess-coach/README.md); design notes and
the decisions behind it are in [`chess-coach/docs/ARCHITECTURE.md`](chess-coach/docs/ARCHITECTURE.md).

## /app

The agent app: a private, installable web app where Paul's agents reach him and he answers back —
decisions from the agent inbox, reminders, chat with the orchestrator, and the feed of every run. It sits
behind Cloudflare Access and pushes to an iPhone over Web Push (RFC 8291, implemented with WebCrypto so it
runs on Workers). The cron side lives in [`workers/reminders/`](workers/reminders/); the agents are in
[PaulOjuri/agent-network](https://github.com/PaulOjuri/agent-network).

How it fits together, what the endpoints are, how to run it locally and how to add a card kind:
[`docs/AGENT-APP.md`](docs/AGENT-APP.md).

## /heyalf

"Meet Alf", a concept demo of a Nigerian-language voice assistant on Alfera devices, lives at
`/heyalf`. Copy, translations, per-word timings and screen content come from
[`src/data/alf-demo.json`](src/data/alf-demo.json); the clips are in `public/heyalf/audio/`. The
source kit, including the original single-file reference and the voice credits, is in
[`alf-demo-kit/`](alf-demo-kit/README.md).

Browser tests: `npm run build`, then `npm run test:e2e` (Playwright, against the static export at
390x844 and 1440x900, plus a reduced-motion pass).

Everything else: `npm run typecheck` (the site, then the Functions and Workers), `npm run test:unit` (no
browser, no server) and `npm run test:app` (every flow of /app against `wrangler pages dev`).

---

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
