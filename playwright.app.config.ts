import { defineConfig, devices } from '@playwright/test'

/**
 * End-to-end tests for /app, against the real thing: `wrangler pages dev` serving the static export
 * with the Pages Functions and a local D1, plus a stand-in GitHub API so the inbox and the decide flow
 * can be driven without a personal access token.
 *
 *   npm run build && npm run test:app
 *
 * Needs .dev.vars (see README § The agent app). One viewport only: this app is for a phone.
 */
const PORT = 8788
const GITHUB_STUB_PORT = 8791
const PUSH_STUB_PORT = 8792
/** The agents' own write token, so a test can post a roster event the way Paul's Mac does. */
export const INGEST_TOKEN = 'dev-ingest-token'

export default defineConfig({
  testDir: './tests/app',
  fullyParallel: false,
  workers: 1,
  reporter: [['list']],
  timeout: 60_000,
  use: {
    ...devices['Desktop Chrome'],
    baseURL: `http://localhost:${PORT}`,
    // An iPhone 15's viewport, which is the only screen this app has to work on.
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
    trace: 'retain-on-failure',
    // An installed app has been granted notifications; without this the Settings tab only ever shows
    // the blocked state and the button under test never renders.
    permissions: ['notifications'],
  },
  projects: [{ name: 'iphone-390x844', use: {} }],
  webServer: [
    {
      command: `node tests/app/github-stub.mjs ${GITHUB_STUB_PORT}`,
      url: `http://127.0.0.1:${GITHUB_STUB_PORT}/repos/PaulOjuri/agent-network/issues`,
      reuseExistingServer: true,
      timeout: 15_000,
    },
    {
      command: `node tests/app/push-stub.mjs ${PUSH_STUB_PORT}`,
      url: `http://127.0.0.1:${PUSH_STUB_PORT}/health`,
      reuseExistingServer: true,
      timeout: 15_000,
    },
    {
      command: `npx wrangler pages dev out --port ${PORT} --binding GITHUB_INBOX_TOKEN=stub-token GITHUB_API_BASE=http://127.0.0.1:${GITHUB_STUB_PORT} AGENTS_INGEST_TOKEN=${INGEST_TOKEN}`,
      url: `http://localhost:${PORT}/app`,
      reuseExistingServer: false,
      timeout: 60_000,
    },
  ],
})
