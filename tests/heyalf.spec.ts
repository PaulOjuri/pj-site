import { test, expect, type Page } from '@playwright/test'

const LANGS = [
  { id: 'yo', lang: 'Yorùbá', title: 'Rain on your route' },
  { id: 'ig', lang: 'Igbo', title: 'Market day' },
  { id: 'ha', lang: 'Hausa', title: 'Prayer time' },
  { id: 'pcm', lang: 'Pidgin', title: 'Scam alert' },
] as const

const audioSrc = (page: Page) =>
  page.locator('[data-testid="alf-audio"]').evaluate((el: HTMLAudioElement) => el.src)

/** Make clips run fast so a whole demo fits in a test. */
async function fastForward(page: Page, rate: number) {
  await page.addInitScript((r) => {
    const proto = HTMLMediaElement.prototype
    const play = proto.play
    proto.play = function (this: HTMLMediaElement) {
      this.playbackRate = r
      return play.call(this)
    }
  }, rate)
}

test.describe('Meet Alf', () => {
  test('lays out with no horizontal overflow, down to 320px', async ({ page }) => {
    await page.goto('/heyalf')
    await expect(page.getByRole('heading', { name: /Alf speaks your language/ })).toBeVisible()

    for (const width of [320, 390, 768, 1024, 1440]) {
      await page.setViewportSize({ width, height: 900 })
      await page.waitForTimeout(150)
      const overflow = await page.evaluate(() => ({
        doc: document.documentElement.scrollWidth,
        win: window.innerWidth,
        wide: [...document.querySelectorAll<HTMLElement>('.alf *')]
          .filter((el) => el.getBoundingClientRect().right > window.innerWidth + 1)
          .map((el) => el.className)
          .slice(0, 5),
      }))
      expect(overflow.doc, `document overflows at ${width}px`).toBeLessThanOrEqual(overflow.win)
      expect(overflow.wide, `elements past the right edge at ${width}px`).toEqual([])
    }
  })

  test('keeps the notes that must stay on the page', async ({ page }) => {
    await page.goto('/heyalf')
    await expect(page.getByText(/This is a concept demo/)).toBeVisible()
    await expect(page.getByText(/CC BY-SA 4\.0/).first()).toBeVisible()
    await expect(page.getByText(/BibleTTS \(Biblica open\.bible recordings\)/)).toBeVisible()

    // Stand-in badges show on the two scenes the JSON marks.
    for (const id of ['ig', 'pcm']) {
      await page.locator(`#alf-tab-${id}`).click()
      await expect(page.locator('.alf-badge')).toHaveText(/Stand-in voice/)
    }
    for (const id of ['yo', 'ha']) {
      await page.locator(`#alf-tab-${id}`).click()
      await expect(page.locator('.alf-badge')).toHaveCount(0)
    }
  })

  test('shows every scene at rest, never an empty screen', async ({ page }) => {
    await page.goto('/heyalf')
    for (const { id, title } of LANGS) {
      for (const device of ['Phone', 'Laptop'] as const) {
        await page.locator(`#alf-tab-${id}`).click()
        await page.getByRole('radio', { name: device }).click()
        await expect(page.locator('.alf-panel-top b')).toHaveText(title)
        // The reply is fully spoken and the sheet/panel is open.
        await expect(page.locator('.alf-panel .alf-w.is-pending')).toHaveCount(0)
        const surface = device === 'Phone' ? '.alf-sheet' : '.alf-apanel'
        await expect(page.locator(surface)).toHaveClass(/is-open/)
        await expect(page.locator('.alf-st')).toHaveText('Waiting for your yes')
      }
    }
  })

  for (const { id, lang } of LANGS) {
    for (const device of ['Phone', 'Laptop'] as const) {
      test(`plays ${lang} on the ${device.toLowerCase()}`, async ({ page }) => {
        await page.goto('/heyalf')
        await page.locator(`#alf-tab-${id}`).click()
        await page.getByRole('radio', { name: device }).click()

        const before = await audioSrc(page)
        await page.getByTestId('scene-play').click()

        // The sequence reaches speech...
        await expect(page.locator('.alf-st')).toHaveText(`Speaking ${lang}`, { timeout: 20_000 })

        // ...on a clip of its own...
        const after = await audioSrc(page)
        expect(after).not.toEqual(before)
        expect(after).toMatch(/^blob:/)
        expect(
          await page
            .locator('[data-testid="alf-audio"]')
            .evaluate((el: HTMLAudioElement) => el.paused)
        ).toBe(false)

        // ...and words light up in the transcript, in step with the audio.
        await expect(page.locator('.alf-panel .alf-w.is-now')).toHaveCount(1, { timeout: 10_000 })
        const first = await page.locator('.alf-panel .alf-w.is-now').textContent()
        await expect
          .poll(async () => page.locator('.alf-panel .alf-w.is-now').textContent(), {
            timeout: 10_000,
          })
          .not.toEqual(first)

        // Stop cancels it and leaves the scene at rest.
        await page.getByTestId('scene-play').click()
        await expect(page.getByTestId('scene-play')).toHaveText('Play')
        expect(
          await page
            .locator('[data-testid="alf-audio"]')
            .evaluate((el: HTMLAudioElement) => el.paused)
        ).toBe(true)
        await expect(page.locator('.alf-panel .alf-w.is-pending')).toHaveCount(0)
      })
    }
  }

  test('a tab change cancels whatever is playing', async ({ page }) => {
    await page.goto('/heyalf')
    await page.getByTestId('scene-play').click()
    await expect(page.locator('.alf-st')).toHaveText('Speaking Yorùbá', { timeout: 20_000 })

    await page.locator('#alf-tab-ha').click()
    await expect(page.getByTestId('scene-play')).toHaveText('Play')
    expect(
      await page.locator('[data-testid="alf-audio"]').evaluate((el: HTMLAudioElement) => el.paused)
    ).toBe(true)
    await expect(page.locator('.alf-panel-top b')).toHaveText('Prayer time')
  })

  test('the full demo runs to the end, and Stop cancels it', async ({ page }) => {
    test.setTimeout(180_000)
    await fastForward(page, 12)
    await page.goto('/heyalf')

    const playAll = page.getByRole('button', { name: /Play the full demo/ })
    await playAll.click()

    // It opens with the greetings, lighting each chip in turn.
    await expect(page.locator('.alf-greet.is-on')).toHaveCount(1, { timeout: 15_000 })

    // Stop cancels mid-run.
    await page.getByRole('button', { name: /Stop the demo/ }).click()
    await expect(playAll).toBeVisible()
    expect(
      await page.locator('[data-testid="alf-audio"]').evaluate((el: HTMLAudioElement) => el.paused)
    ).toBe(true)

    // And a fresh run reaches the last scene of full_demo_order on its device.
    await playAll.click()
    await expect(page.locator('.alf-panel-top b')).toHaveText('Scam alert', { timeout: 150_000 })
    await expect(page.getByRole('radio', { name: 'Phone' })).toHaveAttribute(
      'aria-checked',
      'true'
    )
    await expect(page.getByRole('button', { name: /Play the full demo/ })).toBeVisible({
      timeout: 60_000,
    })
    await expect(page.locator('.alf-st')).toHaveText('Waiting for your yes')
  })

  test('language tabs move with the arrow keys', async ({ page }) => {
    await page.goto('/heyalf')
    await page.locator('#alf-tab-yo').focus()
    await page.keyboard.press('ArrowRight')
    await expect(page.locator('#alf-tab-ig')).toBeFocused()
    await expect(page.locator('#alf-tab-ig')).toHaveAttribute('aria-selected', 'true')
    await page.keyboard.press('ArrowLeft')
    await expect(page.locator('#alf-tab-yo')).toBeFocused()
    await page.keyboard.press('End')
    await expect(page.locator('#alf-tab-pcm')).toBeFocused()
  })

  test('marks non-English text with a lang attribute', async ({ page }) => {
    await page.goto('/heyalf')
    for (const { id } of LANGS) {
      await page.locator(`#alf-tab-${id}`).click()
      await expect(page.locator(`.alf-panel .alf-bubble[lang="${id}"]`)).toHaveCount(2)
    }
    await expect(page.locator('.alf-greets [lang="yo"]')).toHaveText('Báwo ni')
    expect(await page.locator('.alf-now-line [lang]').count()).toBeGreaterThan(0)
  })

  test('never plays without a tap', async ({ page }) => {
    await page.goto('/heyalf')
    await page.waitForTimeout(2500)
    const el = page.locator('[data-testid="alf-audio"]')
    expect(await el.evaluate((a: HTMLAudioElement) => a.paused)).toBe(true)
    expect(await el.evaluate((a: HTMLAudioElement) => a.currentTime)).toBe(0)
  })
})

test('the device toggle moves with the arrow keys', async ({ page }) => {
  await page.goto('/heyalf')
  await page.getByRole('radio', { name: 'Phone' }).focus()
  await page.keyboard.press('ArrowRight')
  await expect(page.getByRole('radio', { name: 'Laptop' })).toBeFocused()
  await expect(page.getByRole('radio', { name: 'Laptop' })).toHaveAttribute('aria-checked', 'true')
  await expect(page.locator('.alf-laptop')).toBeVisible()
  await page.keyboard.press('ArrowLeft')
  await expect(page.getByRole('radio', { name: 'Phone' })).toBeFocused()
  await expect(page.locator('.alf-phone')).toBeVisible()
})
