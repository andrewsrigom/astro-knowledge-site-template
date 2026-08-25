import { expect, test } from '@playwright/test'
import { switchLocale } from './support/locale'

const localePreferenceKey = 'seniorpath.locale-preference.v1'

test.describe('shell locale flows', () => {
  test.describe('browser locale redirect', () => {
    test.use({ locale: 'pt-BR' })

    test('redirects the home page when the browser prefers pt-br and there is no saved preference', async ({ page }) => {
      await page.addInitScript((key) => window.localStorage.removeItem(key), localePreferenceKey)

      await page.goto('/')

      await expect(page).toHaveURL(/\/pt-br$/)
      await expect(page.locator('h1').first()).toBeVisible()
    })
  })

  test('keeps an explicit localized route when there is no saved preference', async ({ page }) => {
    await page.addInitScript((key) => window.localStorage.removeItem(key), localePreferenceKey)

    await page.goto('/pt-br')

    await expect(page).toHaveURL(/\/pt-br$/)
    await expect(page.locator('html')).toHaveAttribute('lang', 'pt-BR')
  })

  test('switches locale from the desktop menu and persists the preference', async ({ page }) => {
    await page.goto('/articles')

    await switchLocale(page, 'pt-br')

    await expect(page).toHaveURL(/\/pt-br\/artigos$/)
    await expect(page.locator('h1').first()).toBeVisible()
    await expect
      .poll(() => page.evaluate((key) => window.localStorage.getItem(key), localePreferenceKey))
      .toBe('pt-br')
  })
})
