import type { Page } from '@playwright/test'
import { desktopLocaleMenuDomHooks } from '../../src/lib/dom-hooks'

export type LocaleCode = 'en' | 'pt-br'

export async function getLocalePreferenceKey(page: Page) {
  const key = await page
    .locator('script[data-locale-preference-key]')
    .getAttribute('data-locale-preference-key')

  if (!key) {
    throw new Error('The rendered shell did not expose its locale preference key')
  }

  return key
}

export async function openLocaleSwitcher(page: Page) {
  await page.locator(desktopLocaleMenuDomHooks.trigger.selector).click()
}

export function getLocaleSwitcherLinkSelector(localeCode: LocaleCode) {
  return `${desktopLocaleMenuDomHooks.link.selector}[${desktopLocaleMenuDomHooks.link.attr}="${localeCode}"]`
}

export async function switchLocale(page: Page, localeCode: LocaleCode) {
  await openLocaleSwitcher(page)
  await page.locator(getLocaleSwitcherLinkSelector(localeCode)).click()
}
