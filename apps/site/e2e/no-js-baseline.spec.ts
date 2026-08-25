import { expect, test } from '@playwright/test'

import { e2eHookSelectors } from './support/hooks'

test.describe('no-js baseline', () => {
  test.use({ javaScriptEnabled: false })

  test('keeps search navigable with a browse fallback', async ({ page }) => {
    await page.goto('/')

    await expect(page.locator(e2eHookSelectors.searchLauncherNoJsFallback)).toBeVisible()
    await expect(page.locator(e2eHookSelectors.searchLauncherDesktopTrigger)).toBeHidden()

    await page.locator(e2eHookSelectors.searchLauncherNoJsFallback).click()
    await expect(page).toHaveURL(/\/articles$/)
  })

  test('keeps directories and tracks browsable without interactive filters or progress meters', async ({ page }) => {
    await page.goto('/tracks')

    await expect(page.getByRole('link', { name: 'Starter', exact: true })).toBeVisible()

    await page.goto('/tracks/first-clone-checklist')

    await expect(page.locator(e2eHookSelectors.trackProgressNoJsNote)).toBeVisible()
    await expect(page.locator(e2eHookSelectors.trackProgressValue)).toBeHidden()
    await expect(page.locator(e2eHookSelectors.trackProgressCta)).toBeVisible()
  })

  test('keeps challenge fallback content usable without JavaScript', async ({ page }) => {
    await page.goto('/challenges/build-a-localized-section-url')

    await expect(page.locator(e2eHookSelectors.challengeNoJsFallback)).toBeVisible()
    await expect(page.locator(e2eHookSelectors.challengeRunButton)).toBeHidden()

    const noJsSolution = page.locator(e2eHookSelectors.solutionRevealNoJsDetails)

    await expect(noJsSolution).toBeVisible()
    await noJsSolution.locator('summary').click()
    await expect(noJsSolution).toHaveAttribute('open', '')
    await expect(noJsSolution).toContainText('Solution')
  })
})
