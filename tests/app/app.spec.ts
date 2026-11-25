import { test, expect, type Page } from '@playwright/test'
import { mkdir } from 'node:fs/promises'

/**
 * Every flow of /app, against `wrangler pages dev`: the Functions, a local D1 and a stand-in GitHub API.
 * The screenshots in docs/app-screens are taken here, at iPhone size, so they cannot drift from the app.
 *
 * One serial run: the tabs share one database, and the point is the round trips between them.
 */

const TOKEN = 'dev-agent-app-token'
const SHOTS = 'docs/app-screens'

test.describe.configure({ mode: 'serial' })

async function shot(page: Page, name: string) {
  await mkdir(SHOTS, { recursive: true })
  // Animations off: the app staggers its cards in, and a screenshot taken mid-flight would show
  // half-faded ones in the docs.
  await page.screenshot({ path: `${SHOTS}/${name}.png`, animations: 'disabled' })
}

/** The tab bar is the app's only navigation. */
const tab = (page: Page, name: string) => page.getByRole('button', { name, exact: true })

test.beforeEach(async ({ page }) => {
  await page.goto('/app')
  await expect(page.locator('#agent-app')).toBeVisible()
})

test('the shell: five tabs, no site chrome, nothing wider than the phone', async ({ page }) => {
  await expect(page.getByRole('navigation', { name: 'Sections' })).toBeVisible()
  for (const name of ['Inbox', 'Reminders', 'Chat', 'Feed', 'Settings']) {
    await expect(tab(page, name)).toBeVisible()
  }
  // The public site's header and skip link must not be in an installed app.
  await expect(page.locator('body > header')).toBeHidden()
  const overflow = await page.evaluate(() => ({
    doc: document.documentElement.scrollWidth,
    win: window.innerWidth,
  }))
  expect(overflow.doc).toBeLessThanOrEqual(overflow.win)
})

test('installable: manifest, icons and a service worker that claims /app', async ({ page, request }) => {
  await expect(page.locator('link[rel="manifest"]')).toHaveAttribute('href', '/app/manifest.webmanifest')
  await expect(page.locator('link[rel="apple-touch-icon"]')).toHaveAttribute('href', '/app/apple-touch-icon.png')
  // Next emits the standard name; iOS has honoured it since 16.4, and the manifest's display mode
  // is what actually decides standalone on a current iPhone.
  await expect(page.locator('meta[name="mobile-web-app-capable"]')).toHaveAttribute('content', 'yes')
  await expect(page.locator('meta[name="apple-mobile-web-app-title"]')).toHaveAttribute('content', 'Agent')
  await expect(page.locator('meta[name="theme-color"]')).toHaveAttribute('content', '#0A0A0A')
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/)

  const manifest = await request.get('/app/manifest.webmanifest')
  expect(manifest.ok()).toBe(true)
  const parsed = await manifest.json()
  expect(parsed.display).toBe('standalone')
  expect(parsed.start_url).toBe('/app')
  expect(parsed.icons.map((i: { sizes: string }) => i.sizes)).toContain('512x512')

  const sw = await request.get('/app/sw.js')
  expect(sw.headers()['service-worker-allowed']).toBe('/app')

  // It registers, and takes control of this page.
  const scope = await page.evaluate(async () => {
    const registration = await navigator.serviceWorker.getRegistration('/app')
    return registration?.scope ?? null
  })
  expect(scope).toContain('/app')
})

test('inbox: a decision, its recommendation, and markup that stays text', async ({ page }) => {
  await tab(page, 'Inbox').click()
  await expect(page.getByRole('button', { name: /Which launch date for the v2 site/ })).toBeVisible()
  await expect(page.getByText(/What do EU hosts charge/)).toBeVisible()
  await shot(page, '1-inbox')

  await page.getByRole('button', { name: /Which launch date for the v2 site/ }).click()
  await expect(page.getByText("claude.ai's recommendation")).toBeVisible()
  await expect(page.getByText('1 December', { exact: false }).first()).toBeVisible()

  // The issue body carries an <img onerror> and a <script>. Both have to be on screen as characters.
  await expect(page.getByText('<script>alert("inbox")</script>', { exact: false })).toBeVisible()
  expect(await page.locator('#agent-app script').count()).toBe(0)
  expect(await page.locator('#agent-app img').count()).toBe(0)
  await shot(page, '2-decision')
})

test('decide: the comment is posted, then the decided label, and nothing is closed', async ({ page, request }) => {
  await page.goto('/app#inbox/12')
  await expect(page.getByLabel('Your decision')).toBeVisible()
  await page.getByLabel('Your decision').fill('1 December. The party on the 10th is the demo, so it has to be live before it.')

  // Two taps: Decide, then confirm. A decision is not something to fire off by brushing the screen.
  await page.getByRole('button', { name: 'Decide' }).click()
  await page.getByRole('button', { name: 'Confirm: this is decided' }).click()

  // The issue is re-read after posting, so the Decide button is gone once GitHub has both the
  // comment and the label. Waiting on that, not on the word "decided", which is also in the help text.
  await expect(page.getByRole('button', { name: /^(Decide|Confirm: this is decided)$/ })).toHaveCount(0, {
    timeout: 20_000,
  })
  await expect(page.locator('.app-meta').first()).toContainText('decided')

  const issue = await (await request.get('http://127.0.0.1:8791/repos/PaulOjuri/agent-network/issues/12')).json()
  expect(issue.labels.map((l: { name: string }) => l.name)).toContain('decided')
  expect(issue.state ?? 'open').toBe('open') // the app never closes an issue
  const comments = await (
    await request.get('http://127.0.0.1:8791/repos/PaulOjuri/agent-network/issues/12/comments')
  ).json()
  expect(comments[comments.length - 1].body).toContain('1 December')
})

test('reminders: create in Brussels time, snooze, and delete', async ({ page }) => {
  await tab(page, 'Reminders').click()
  await page.getByRole('button', { name: 'New reminder' }).click()
  await page.getByLabel('What').fill('Call the Alfera client back')
  await page.getByLabel('Date').fill('2026-12-02')
  await page.getByLabel('Time (Brussels)').fill('09:30')
  await page.getByLabel('Warn me').selectOption('30')
  await page.getByLabel('Repeat').selectOption('weekdays')
  await page.getByRole('button', { name: 'Add reminder' }).click()

  const card = page.locator('.app-card', { hasText: 'Call the Alfera client back' })
  await expect(card).toBeVisible()
  await expect(card).toContainText('Wed 2 Dec, 09:30')
  await expect(card).toContainText('weekdays')
  await expect(card).toContainText('30 min before')
  await shot(page, '3-reminders')

  await card.getByRole('button', { name: 'Snooze 10m' }).click()
  await expect(card).toContainText('snoozed 1×')

  await card.getByRole('button', { name: 'Delete' }).click()
  await card.getByRole('button', { name: 'Confirm delete' }).click()
  await expect(page.locator('.app-card', { hasText: 'Call the Alfera client back' })).toHaveCount(0)
})

test('chat: a message waits for the Mac, then the reply arrives', async ({ page, request }) => {
  await tab(page, 'Chat').click()
  await page.getByRole('button', { name: 'New conversation' }).click()
  await page.getByLabel('Message').fill('What is Alfera waiting on this week?')
  await page.getByRole('button', { name: 'Send' }).click()

  await expect(page.getByText('waiting for your Mac').first()).toBeVisible()
  await shot(page, '4-chat-waiting')

  // The Mac picks it up and answers, exactly as `npm run chat` does.
  const pending = await (
    await request.get('/api/agent/messages?status=pending&claim=1', {
      headers: { authorization: `Bearer ${TOKEN}` },
    })
  ).json()
  const message = pending.messages.find((m: { body: string }) => m.body.includes('Alfera'))
  expect(message).toBeTruthy()

  const reply = await request.post(`/api/agent/messages/${message.id}/reply`, {
    headers: { authorization: `Bearer ${TOKEN}` },
    data: {
      body: 'The launch date (now decided: 1 December) and the October invoice. Nothing is blocked on code.',
      agent: 'orchestrator',
    },
  })
  expect(reply.status()).toBe(201)

  await page.reload()
  await expect(page.getByText(/October invoice/)).toBeVisible({ timeout: 20_000 })
  await expect(page.getByText('waiting for your Mac')).toHaveCount(0)
  await shot(page, '5-chat-answered')
})

test('feed: agent events and pushed cards in one list, filterable', async ({ page, request }) => {
  const notify = await request.post('/api/agent/notify', {
    headers: { authorization: `Bearer ${TOKEN}` },
    data: {
      title: 'Unalone: the CI runner has been busy for 40 minutes',
      body: 'The single self-hosted runner is the bottleneck again.',
      kind: 'alert',
      project: 'unalone',
      priority: 'normal',
      url: '/app#feed',
    },
  })
  expect([201, 429]).toContain(notify.status())

  await tab(page, 'Feed').click()
  await expect(page.getByText(/CI runner has been busy|PRs waiting on you/).first()).toBeVisible()
  await shot(page, '6-feed')

  // Wait for the filtered request, not for the old list to look different.
  const filtered = page.waitForResponse((r) => r.url().includes('/api/app/feed?') && r.url().includes('project=unalone'))
  await page.getByRole('button', { name: 'unalone', exact: true }).click()
  await filtered
  await expect(page.locator('.app-card').first()).toBeVisible()
  const projects = await page.locator('.app-card .app-meta').allTextContents()
  expect(projects.length).toBeGreaterThan(0)
  expect(projects.every((text) => text.includes('unalone'))).toBe(true)
})

test('settings: the push button, and the kind registry documenting itself', async ({ page }) => {
  // Headless Chromium always reports notifications as denied, whatever the context is granted, so the
  // permission is faked here. What is under test is the app's own branch, not Chromium's prompt.
  await page.addInitScript(() => {
    Object.defineProperty(Notification, 'permission', { get: () => 'granted', configurable: true })
  })
  // A hash-only navigation does not re-run init scripts, so this reload is what applies the stub.
  await page.goto('/app#settings')
  await page.reload()

  await expect(page.getByRole('heading', { name: 'Notifications' })).toBeVisible()
  await expect(page.getByRole('button', { name: /Turn on notifications|Subscribe this device/ })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Send test notification' })).toBeVisible()
  await expect(page.getByText('Card kinds')).toBeVisible()
  await expect(page.getByText('Fired by the reminders Worker, on the minute.')).toBeVisible()
  await shot(page, '7-settings')
})

test('offline: the shell is cached and the app still opens', async ({ page, context }) => {
  // The worker has to be controlling this page and have the shell in its cache before the network can
  // be taken away; otherwise this would test Chromium's HTTP cache, not the service worker.
  await expect
    .poll(
      () =>
        page.evaluate(async () => {
          if (!navigator.serviceWorker.controller) return 0
          const cache = await caches.open('agent-app-v1')
          return (await cache.keys()).length
        }),
      { timeout: 25_000, message: 'the service worker never finished precaching the shell' },
    )
    // The four shell entries plus the page's chunks.
    .toBeGreaterThan(4)

  await context.setOffline(true)
  await page.goto('/app')
  await expect(page.locator('#agent-app')).toBeVisible()
  await expect(page.getByRole('navigation', { name: 'Sections' })).toBeVisible()
  await shot(page, '8-offline')
  await context.setOffline(false)
})

/**
 * The install screen is the only part of the app a desktop browser never sees, and it is the one that
 * decides whether notifications are ever possible, so it gets a run of its own with an iPhone's UA.
 */
test.describe('on an iPhone that has not installed it yet', () => {
  test.use({
    userAgent:
      'Mozilla/5.0 (iPhone; CPU iPhone OS 18_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.1 Mobile/15E148 Safari/604.1',
  })

  test('install: the Home Screen instructions come first, and dismissing them sticks', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /Home Screen/ })).toBeVisible()
    // Nothing competes with them: there is no tab bar to wander off into.
    await expect(page.getByRole('navigation', { name: 'Sections' })).toHaveCount(0)
    await shot(page, '9-install')

    await page.getByRole('button', { name: 'Carry on in the browser' }).click()
    await expect(page.getByRole('navigation', { name: 'Sections' })).toBeVisible()

    // Dismissed once, dismissed for good on this device.
    await page.reload()
    await expect(page.getByRole('navigation', { name: 'Sections' })).toBeVisible()
    await expect(page.getByRole('heading', { name: /Home Screen/ })).toHaveCount(0)
  })
})
