import { defineConfig } from '@playwright/test'

/**
 * Unit tests for the pieces that have no browser in them: the Web Push encryption, the Brussels/UTC
 * reminder maths, the validators and the markdown renderer. No server, no browser.
 *
 *   npm run test:unit
 *
 * Playwright's runner is here already (tests/) and transpiles TypeScript, so there's no second test
 * framework to install for this.
 */
export default defineConfig({
  testDir: './tests/unit',
  fullyParallel: true,
  reporter: [['list']],
  timeout: 20_000,
})
