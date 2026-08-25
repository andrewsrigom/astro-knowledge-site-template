import { expect, test } from '@playwright/test'

test.describe('reference section navigation', () => {
  test('navigates from the topics index into the populated starter group', async ({ page }) => {
    await page.goto('/topics')

    await page.getByRole('link', { name: /Senior Thinking/i }).first().click()

    await expect(page).toHaveURL(/\/topics\/thinking\/delivery$/)
    await expect(page.locator('h1').first()).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Senior Thinking' })).toBeVisible()
  })

  test('navigates from the concepts index to the starter concept page', async ({ page }) => {
    await page.goto('/concepts')

    await page.locator('a[href="/concepts/content-contract"]').first().click()

    await expect(page).toHaveURL(/\/concepts\/content-contract$/)
    await expect(page.locator('h1').first()).toBeVisible()
  })

  test('navigates from the glossary index to the starter glossary term', async ({ page }) => {
    await page.goto('/glossary')

    await page.locator('a[href="/glossary/section-manifest"]').first().click()

    await expect(page).toHaveURL(/\/glossary\/section-manifest$/)
    await expect(page.locator('h1').first()).toBeVisible()
  })
})
