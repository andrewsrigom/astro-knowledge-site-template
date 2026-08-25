import { expect, test } from '@playwright/test'
import { e2eHookSelectors } from './support/hooks'

const localePreferenceKey = 'seniorpath.locale-preference.v1'

test.describe('article archive pagination', () => {
  test('navigates to the second english archive page', async ({ page }) => {
    await page.goto('/articles')

    await expect(page.locator(e2eHookSelectors.directoryPaginationNextLink)).toBeVisible()
    await page.locator(e2eHookSelectors.directoryPaginationNextLink).click()

    await expect(page).toHaveURL(/\/articles\/page\/2$/)
    await expect(page.locator(e2eHookSelectors.directoryPaginationCurrentPage)).toContainText('2')
    await expect(page.locator(e2eHookSelectors.directoryItem).first()).toBeVisible()
  })

  test('navigates to the second portuguese archive page', async ({ page }) => {
    await page.addInitScript(
      ({ key, value }) => window.localStorage.setItem(key, value),
      { key: localePreferenceKey, value: 'pt-br' },
    )

    await page.goto('/pt-br/artigos')

    await expect(page.locator(e2eHookSelectors.directoryPaginationNextLink)).toBeVisible()
    await page.locator(e2eHookSelectors.directoryPaginationNextLink).click()

    await expect(page).toHaveURL(/\/pt-br\/artigos\/page\/2$/)
    await expect(page.locator(e2eHookSelectors.directoryPaginationCurrentPage)).toContainText('2')
    await expect(page.locator(e2eHookSelectors.directoryItem).first()).toBeVisible()
  })
})
