import { test, expect } from '@playwright/test'

test.describe('Meet Alf under prefers-reduced-motion', () => {
  test('types instantly, reveals instantly and still plays', async ({ page }) => {
    await page.goto('/heyalf')

    // Transitions and animations are off across the page.
    const motion = await page.evaluate(() => {
      const sheet = document.querySelector('.alf-sheet')!
      const card = document.querySelector('.alf-card')
      return {
        sheet: getComputedStyle(sheet).transitionDuration,
        card: card ? getComputedStyle(card).transitionDuration : '0s',
        dot: getComputedStyle(document.querySelector('.alf-dot')!).animationName,
      }
    })
    expect(motion.sheet).toBe('0s')
    expect(motion.card).toBe('0s')
    expect(motion.dot).toBe('none')

    // Alf's route is drawn, not animated in.
    expect(
      await page.locator('.alf-route-line').first().evaluate((el) => getComputedStyle(el).strokeDashoffset)
    ).toBe('0px')

    await page.getByTestId('scene-play').click()

    // The user's line appears whole rather than word by word.
    await expect(page.locator('.alf-sheet .alf-you-line')).toHaveText(
      'Alf, ṣé òjò máa rọ̀ lónìí?',
      { timeout: 8000 }
    )
    await expect(page.locator('.alf-st')).toHaveText('Speaking Yorùbá', { timeout: 20_000 })
    await expect(page.locator('.alf-panel .alf-w.is-now')).toHaveCount(1, { timeout: 10_000 })
  })
})
