import { expect, test } from '@playwright/test'
import { e2eHookSelectors } from './support/hooks'

test('runs the starter challenge and reveals the solution', async ({ page }) => {
  await page.goto('/challenges/build-a-localized-section-url')

  await page.locator('#challenge-playground').scrollIntoViewIfNeeded()
  await page.locator('.cm-content').waitFor()
  await page.waitForTimeout(750)
  await page.locator(e2eHookSelectors.challengeRunButton).click()

  await expect
    .poll(() =>
      page.evaluate(() => {
        for (let index = 0; index < window.localStorage.length; index += 1) {
          const key = window.localStorage.key(index)

          if (
            key?.includes('challenge-solved')
            && key.includes('build-a-localized-section-url')
          ) {
            return window.localStorage.getItem(key)
          }
        }

        return null
      }),
    )
    .toBe('1')
  await expect(page.locator(e2eHookSelectors.challengeAllPassingBadge)).toBeVisible()

  const viewSolutionButton = page.locator(e2eHookSelectors.solutionRevealTriggerButton)
  await viewSolutionButton.scrollIntoViewIfNeeded()
  await page.waitForTimeout(500)
  await viewSolutionButton.click()
  await page.locator(e2eHookSelectors.solutionRevealConfirmButton).click()

  await expect(page.locator(e2eHookSelectors.solutionRevealContent)).toBeVisible()
})
