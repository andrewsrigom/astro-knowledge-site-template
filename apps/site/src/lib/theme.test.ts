import { describe, expect, it } from 'vitest'

import {
  applySiteTheme,
  defaultSiteTheme,
  getDocumentSiteTheme,
  isSiteTheme,
  resolveSiteTheme,
  toggleSiteTheme,
} from '@/lib/theme'

describe('theme helpers', () => {
  it('accepts only supported themes', () => {
    expect(isSiteTheme('dark')).toBe(true)
    expect(isSiteTheme('light')).toBe(true)
    expect(isSiteTheme('system')).toBe(false)
    expect(isSiteTheme(null)).toBe(false)
  })

  it('prefers the stored theme when it is valid', () => {
    expect(resolveSiteTheme('light', true)).toBe('light')
    expect(resolveSiteTheme('dark', false)).toBe('dark')
  })

  it('uses the light product default when there is no stored theme', () => {
    expect(resolveSiteTheme(null, true)).toBe('light')
    expect(resolveSiteTheme(undefined, false)).toBe('light')
  })

  it('keeps the light shell as the final fallback', () => {
    expect(resolveSiteTheme('invalid', null)).toBe(defaultSiteTheme)
  })

  it('applies the theme to the document root shape', () => {
    const root = {
      dataset: {} as Record<string, string | undefined>,
      style: {} as { colorScheme?: string },
    }

    applySiteTheme('light', root)

    expect(root.dataset.theme).toBe('light')
    expect(root.style.colorScheme).toBe('light')
    expect(getDocumentSiteTheme(root)).toBe('light')
  })

  it('toggles between light and dark', () => {
    expect(toggleSiteTheme('dark')).toBe('light')
    expect(toggleSiteTheme('light')).toBe('dark')
  })
})
