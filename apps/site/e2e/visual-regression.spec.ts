import { expect, test, type Page } from '@playwright/test'

import { e2eHookSelectors } from './support/hooks'

const snapshotOptions = {
  animations: 'disabled' as const,
  caret: 'hide' as const,
  scale: 'css' as const,
}

const visualStabilityStyles = `
  *,
  *::before,
  *::after {
    caret-color: transparent !important;
  }

  html {
    scroll-behavior: auto !important;
    scrollbar-width: none !important;
  }

  body::-webkit-scrollbar,
  html::-webkit-scrollbar {
    display: none !important;
  }
`

test.use({
  colorScheme: 'dark',
  viewport: {
    height: 1080,
    width: 1440,
  },
})

async function prepareVisualPage(page: Page, path: string) {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto(path)
  await page.waitForLoadState('networkidle')
  await page.evaluate(async () => {
    if ('fonts' in document) {
      await document.fonts.ready
    }
  })
  await page.addStyleTag({ content: visualStabilityStyles })
  await page.evaluate(() => {
    window.scrollTo({ top: 0, behavior: 'auto' })
  })
}

test.describe('visual regression coverage', () => {
  test('captures the home page', async ({ page }) => {
    await prepareVisualPage(page, '/')
    await expect(page.locator(e2eHookSelectors.searchLauncherDesktopTrigger)).toBeVisible()

    await expect(page).toHaveScreenshot('home-page.png', snapshotOptions)
  })

  test('captures the article page', async ({ page }) => {
    await prepareVisualPage(page, '/articles/foundations/customize-the-template-after-the-first-clone')
    await expect(page.locator(e2eHookSelectors.articleShareReady)).toBeVisible()

    await expect(page).toHaveScreenshot('article-page.png', snapshotOptions)
  })

  test('captures the track page', async ({ page }) => {
    await prepareVisualPage(page, '/tracks/first-clone-checklist')
    await expect(page.locator(e2eHookSelectors.trackConcept)).toBeVisible()

    await expect(page).toHaveScreenshot('track-page.png', snapshotOptions)
  })

  test('captures the challenge page', async ({ page }) => {
    await prepareVisualPage(page, '/challenges/build-a-localized-section-url')
    await expect(page.locator(e2eHookSelectors.challengeRunButton)).toBeVisible()

    await expect(page).toHaveScreenshot('challenge-page.png', snapshotOptions)
  })

  test('captures the search overlay', async ({ page }) => {
    await prepareVisualPage(page, '/')

    await page.locator(e2eHookSelectors.searchLauncherDesktopTrigger).click()
    await expect(page.locator(e2eHookSelectors.searchLauncherDialog)).toBeVisible()

    await expect(page).toHaveScreenshot('search-overlay.png', snapshotOptions)
  })

  test('captures the preparation guide with Caderno UI', async ({ page }) => {
    await prepareVisualPage(page, '/pt-br/guia')
    await expect(page.locator('[data-preparation-volume-list]')).toBeVisible()
    await expect(page.locator('cad-chart')).toHaveCount(0)

    await expect(page).toHaveScreenshot('preparation-guide-page.png', snapshotOptions)
  })
})
