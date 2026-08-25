import { expect, test, type Page } from '@playwright/test'
import { desktopLocaleMenuDomHooks } from '../src/lib/dom-hooks'
import { e2eHookSelectors } from './support/hooks'
import { getLocaleSwitcherLinkSelector } from './support/locale'

async function waitForIdleHydration(page: Page, delay = 500) {
  await page.waitForTimeout(delay)
}

test.describe('accessibility flows', () => {
  test('supports skip link navigation and table of contents anchors', async ({ page }) => {
    await page.goto('/articles/foundations/customize-the-template-after-the-first-clone')

    const skipLink = page.getByRole('link', { name: 'Skip to main content' })
    await expect(skipLink).toHaveAttribute('href', '#main-content')
    await skipLink.focus()
    await expect(skipLink).toBeFocused()

    await skipLink.press('Enter')
    await expect(page.locator('main#main-content')).toBeFocused()

    const tocNavigation = page.getByRole('navigation', { name: 'On this page' })
    await expect(tocNavigation).toBeVisible()

    const firstTocLink = tocNavigation.getByRole('link').first()
    const firstTocHref = await firstTocLink.getAttribute('href')
    await firstTocLink.evaluate((element) => {
      ;(element as HTMLAnchorElement).click()
    })

    await expect
      .poll(() => page.evaluate(() => window.location.hash))
      .toBe(firstTocHref)
  })

  test('opens search from the keyboard and restores focus on close', async ({ page }) => {
    await page.goto('/articles')
    await waitForIdleHydration(page)

    const searchTrigger = page.locator(e2eHookSelectors.searchLauncherDesktopTrigger)
    await searchTrigger.focus()
    await searchTrigger.press('Slash')

    await expect(page.locator(e2eHookSelectors.searchLauncherDialog)).toBeVisible()
    await expect(page.locator(e2eHookSelectors.searchLauncherInput)).toBeFocused()

    await page.keyboard.press('Escape')

    await expect(page.locator(e2eHookSelectors.searchLauncherDialog)).toHaveCount(0)
    await expect(searchTrigger).toBeFocused()
  })

  test('closes desktop and mobile navigation menus with escape', async ({ page }) => {
    await page.goto('/articles')

    const desktopLocaleTrigger = page.locator(desktopLocaleMenuDomHooks.trigger.selector)
    await desktopLocaleTrigger.focus()
    await desktopLocaleTrigger.press('Enter')

    const portugueseLink = page.locator(getLocaleSwitcherLinkSelector('pt-br'))
    await expect(portugueseLink).toBeVisible()
    await portugueseLink.focus()
    await page.keyboard.press('Escape')

    await expect(portugueseLink).not.toBeVisible()
    await expect(desktopLocaleTrigger).toBeFocused()

    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto('/articles')

    const mobileNavTrigger = page.locator(e2eHookSelectors.mobileNavTrigger)
    await mobileNavTrigger.focus()
    await mobileNavTrigger.press('Enter')

    const mobileNavFirstLink = page.locator(`${e2eHookSelectors.mobileNavPanel} a`).first()
    await expect(mobileNavFirstLink).toBeVisible()
    await mobileNavFirstLink.focus()
    await page.keyboard.press('Escape')

    await expect(page.locator(`${e2eHookSelectors.mobileNavRoot}[open]`)).toHaveCount(0)
    await expect(mobileNavTrigger).toBeFocused()
  })

  test('keeps modal focus flow when opening and closing solution reveal', async ({ page }) => {
    await page.goto('/challenges/build-a-localized-section-url')
    await page.locator('#challenge-playground').scrollIntoViewIfNeeded()
    await page.locator('.cm-content').waitFor()
    await waitForIdleHydration(page, 750)

    const solutionTrigger = page.locator(e2eHookSelectors.solutionRevealTriggerButton)
    await solutionTrigger.scrollIntoViewIfNeeded()
    await solutionTrigger.focus()
    await solutionTrigger.click()

    await expect(page.getByRole('dialog')).toBeVisible()
    await page.keyboard.press('Escape')

    await expect(page.getByRole('dialog')).toHaveCount(0)
    await expect(solutionTrigger).toBeFocused()
  })
})
