import { expect, test } from '@playwright/test'

import { e2eHookSelectors } from './support/hooks'

test('shows a manual copy fallback when clipboard is unavailable in article share', async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: undefined,
    })
  })

  await page.goto('/articles/foundations/customize-the-template-after-the-first-clone')
  await page.locator(e2eHookSelectors.articleShareReady).waitFor()
  await page.locator(e2eHookSelectors.articleShareCopyButton).click()

  const manualInput = page.locator(e2eHookSelectors.articleShareManualInput)

  await expect(manualInput).toBeVisible()
  await expect(manualInput).toHaveValue(/customize-the-template-after-the-first-clone$/)
})

test('keeps the challenge playground usable when local storage is blocked', async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(window, 'localStorage', {
      configurable: true,
      get() {
        throw new Error('storage blocked')
      },
    })
  })

  await page.goto('/challenges/build-a-localized-section-url')
  await page.locator('#challenge-playground').scrollIntoViewIfNeeded()
  await page.locator('.cm-content').waitFor()
  await page.waitForTimeout(750)
  await page.locator(e2eHookSelectors.challengeRunButton).click()

  await expect(page.locator(e2eHookSelectors.challengeAllPassingBadge)).toBeVisible()
  await expect(page.locator(e2eHookSelectors.challengeStorageWarning)).toBeVisible()
})
