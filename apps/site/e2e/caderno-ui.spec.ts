import { expect, test } from '@playwright/test'

const catalogPath = '/pt-br/laboratorio/caderno-ui'

test.describe('Caderno UI package integration', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(catalogPath)
    await page.locator('cad-tabs').waitFor()
    await page.evaluate(() => customElements.whenDefined('cad-tabs'))
  })

  test('renders the Lit tabs and supports keyboard navigation', async ({ page }) => {
    const tabs = page.locator('cad-tabs')
    const tabButtons = tabs.getByRole('tab')
    const contractTab = tabs.getByRole('tab', { name: 'Contrato' })
    const referenceTab = tabs.getByRole('tab', { name: 'Referência' })

    await expect(tabButtons).toHaveCount(4)
    await expect(contractTab).toHaveAttribute('aria-selected', 'true')
    await expect(tabs.locator('cad-tab[name="contrato"]')).toBeVisible()
    await expect(tabs.locator('cad-tab[name="problema"]')).toBeHidden()

    await contractTab.press('ArrowRight')

    await expect(tabs).toHaveAttribute('active-tab', 'referencia')
    await expect(referenceTab).toBeFocused()
    await expect(tabs.locator('cad-tab[name="referencia"]')).toBeVisible()
  })

  test('dismisses an alert through a composed public event', async ({ page }) => {
    const alert = page.locator('cad-alert[variant="danger"]')

    await page.evaluate(() => {
      const target = document.querySelector('cad-alert[variant="danger"]')
      target?.addEventListener('cad-dismiss', (event) => {
        document.body.dataset.cadDismissed = String(
          (event as CustomEvent<{ variant: string }>).detail.variant,
        )
      })
    })

    await alert.getByRole('button', { name: 'Dispensar aviso' }).click()

    await expect(alert).toBeHidden()
    await expect(page.locator('body')).toHaveAttribute('data-cad-dismissed', 'danger')
  })

  test('persists bookmarks with the existing SeniorPath storage key', async ({ page }) => {
    const bookmark = page.locator('cad-bookmark[bookmark-id="navigation-showcase"]')
    const button = bookmark.getByRole('button')

    await page.evaluate(() => {
      localStorage.removeItem('seniorpath:notebook-bookmark:navigation-showcase')
    })
    await page.reload()
    await page.evaluate(() => customElements.whenDefined('cad-bookmark'))

    await expect(button).toHaveAttribute('aria-pressed', 'false')
    await button.click()

    await expect(button).toHaveAttribute('aria-pressed', 'true')
    await expect.poll(() => page.evaluate(() => (
      localStorage.getItem('seniorpath:notebook-bookmark:navigation-showcase')
    ))).toBe('true')

    await page.reload()
    await page.evaluate(() => customElements.whenDefined('cad-bookmark'))
    await expect(button).toHaveAttribute('aria-pressed', 'true')
  })
})

test.describe('Caderno UI progressive enhancement', () => {
  test.use({ javaScriptEnabled: false })

  test('keeps alert and tab content readable without JavaScript', async ({ page }) => {
    await page.goto(catalogPath)

    await expect(page.locator('cad-alert').first()).toContainText('Contexto importante')
    await expect(page.locator('cad-alert').first()).toContainText(
      'Este exemplo usa uma entrada simplificada',
    )

    const panels = page.locator('cad-tabs cad-tab')
    await expect(panels).toHaveCount(4)
    await expect(panels.filter({ hasText: 'Enumere entradas' })).toBeVisible()
    await expect(panels.filter({ hasText: 'Escreva a assinatura' })).toBeVisible()
    await expect(panels.filter({ hasText: 'Encontre uma solução vizinha' })).toBeVisible()
    await expect(panels.filter({ hasText: 'Argumente informalmente' })).toBeVisible()
  })
})
