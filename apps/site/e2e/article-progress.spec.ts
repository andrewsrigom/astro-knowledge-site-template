import { expect, test } from '@playwright/test'
import { e2eHookSelectors } from './support/hooks'

function readCompletedArticleIds() {
  const storageKey = Object.keys(window.localStorage).find((key) => key.endsWith('.completed-articles.v1'))

  if (!storageKey) {
    return []
  }

  try {
    return JSON.parse(window.localStorage.getItem(storageKey) ?? '[]')
  } catch {
    return []
  }
}

function writeCompletedArticleIds(ids: string[]) {
  const storageKey = Object.keys(window.localStorage).find((key) => key.endsWith('.completed-articles.v1'))
    ?? 'site-template.completed-articles.v1'

  window.localStorage.setItem(storageKey, JSON.stringify(ids))
}

test('persists article completion and allows resetting it', async ({ page }) => {
  const markUnreadButton = page.getByRole('button', { name: 'Mark as unread', exact: true }).first()

  await page.goto('/articles/foundations/customize-the-template-after-the-first-clone')
  await expect(page.getByRole('heading', { name: 'Customize the template after the first clone' })).toBeVisible()

  await page.evaluate(() => {
    window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'auto' })
  })

  await expect
    .poll(() => page.evaluate(readCompletedArticleIds))
    .toContain('customize-the-template-after-clone')

  await expect(markUnreadButton).toBeVisible()

  await page.reload()
  await expect(markUnreadButton).toBeVisible()

  await markUnreadButton.click()

  await expect
    .poll(() => page.evaluate(readCompletedArticleIds))
    .not.toContain('customize-the-template-after-clone')
})

test('reorders next step based on local article progress', async ({ page }) => {
  await page.goto('/articles/foundations/next-step-root')

  const nextStepTitle = page.locator(e2eHookSelectors.articleCompletionNextStepTitle).first()
  const nextStepLink = page.locator(e2eHookSelectors.articleCompletionNextStepLink).first()

  await page.evaluate(() => {
    window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'auto' })
  })
  await expect
    .poll(() => page.evaluate(readCompletedArticleIds))
    .toContain('next-step-root')
  await expect(nextStepTitle).toHaveText('Next Step Estimation')
  await expect(nextStepLink).toHaveAttribute('href', /next-step-estimation$/)

  await page.evaluate(writeCompletedArticleIds, ['next-step-root', 'next-step-estimation'])
  await page.reload()
  await page.evaluate(() => {
    window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'auto' })
  })
  await expect
    .poll(() => page.evaluate(readCompletedArticleIds))
    .toContain('next-step-estimation')
  await expect(nextStepTitle).toHaveText('Next Step Communication')
  await expect(nextStepLink).toHaveAttribute('href', /next-step-communication$/)
  await expect(nextStepLink).not.toHaveAttribute('href', /next-step-estimation$/)
})
