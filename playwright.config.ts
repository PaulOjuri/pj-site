import { defineConfig, devices } from '@playwright/test'

const PORT = 4321

/**
 * Drives the static export, the same files Cloudflare Pages serves.
 * Two viewports, because /heyalf has to hold up on a phone and a desktop.
 */
export default defineConfig({
  testDir: './tests',
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
      testIgnore: /reduced-motion\.spec\.ts/,
    },
    {
      name: 'desktop-1440x900',
      use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } },
      testIgnore: /reduced-motion\.spec\.ts/,
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
