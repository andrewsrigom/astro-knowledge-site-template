import { expect, test } from '@playwright/test'

const legalCases = [
  {
    checklistHeading: 'Operational privacy checklist',
    operationalHeading: 'Operational privacy status',
    path: '/privacy',
    preferredLocale: 'en',
    title: 'Privacy Policy',
  },
  {
    checklistHeading: 'Operational privacy checklist',
    operationalHeading: 'Operational privacy status',
    path: '/terms-and-services',
    preferredLocale: 'en',
    title: 'Terms of Service',
  },
  {
    checklistHeading: 'Checklist operacional de privacidade',
    operationalHeading: 'Estado operacional de privacidade',
    path: '/pt-br/politica-de-privacidade',
    preferredLocale: 'pt-br',
    title: 'Politica de Privacidade',
  },
  {
    checklistHeading: 'Checklist operacional de privacidade',
    operationalHeading: 'Estado operacional de privacidade',
    path: '/pt-br/termos-e-servicos',
    preferredLocale: 'pt-br',
    title: 'Termos de Uso',
  },
] as const

test.describe('legal pages', () => {
  for (const legalCase of legalCases) {
    test(`renders publication guidance for ${legalCase.path}`, async ({ page }) => {
      await page.goto(legalCase.path)

      await expect(page.getByRole('heading', { name: legalCase.title })).toBeVisible()
      const checklistHeading = page.getByRole('heading', { name: legalCase.checklistHeading })

      await expect(checklistHeading).toBeVisible()
      await expect(page.getByRole('heading', { name: legalCase.operationalHeading })).toBeVisible()
      await expect(checklistHeading.locator('xpath=following-sibling::ul[1]/li').first()).toBeVisible()
    })
  }
})
