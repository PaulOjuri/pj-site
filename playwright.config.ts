import { defineConfig, devices } from '@playwright/test'

const PORT = 4321

/**
 * The other two suites live under tests/ but are not browser tests of the public site, and each has its
 * own config: tests/unit (no browser, no server) runs from playwright.unit.config.ts, and tests/app
 * (needs `wrangler pages dev`, the Pages Functions and a local D1) from playwright.app.config.ts.
 */
const OTHER_SUITES = ['**/unit/**', '**/app/**']

/**
 * Drives the static export, the same files Cloudflare Pages serves.
 * Two viewports, because /heyalf has to hold up on a phone and a desktop.
 */
export default defineConfig({
  testDir: './tests',
  // A project's own testIgnore replaces this one rather than adding to it, so OTHER_SUITES has to be
  // repeated in each project below. This line is what applies to anything added without one.
  testIgnore: OTHER_SUITES,
  fullyParallel: false,
  workers: 1,
  reporter: [['list']],
  timeout: 90_000,
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: 'retain-on-failure',
    // Real clicks are trusted gestures, so autoplay policy stays on; this only
    // keeps the test run silent.
    launchOptions: { args: ['--mute-audio'] },
  },
  projects: [
    {
      name: 'mobile-390x844',
      use: { ...devices['Desktop Chrome'], viewport: { width: 390, height: 844 } },
      testIgnore: [/reduced-motion\.spec\.ts/, ...OTHER_SUITES],
    },
    {
      name: 'desktop-1440x900',
      use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } },
      testIgnore: [/reduced-motion\.spec\.ts/, ...OTHER_SUITES],
    },
    {
      name: 'reduced-motion',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1440, height: 900 },
        reducedMotion: 'reduce',
      },
      testMatch: /reduced-motion\.spec\.ts/,
    },
  ],
  webServer: {
    command: `node scripts/serve-out.mjs ${PORT}`,
    url: `http://localhost:${PORT}/heyalf`,
    reuseExistingServer: true,
    timeout: 30_000,
  },
})
