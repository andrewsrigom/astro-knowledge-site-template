import { readLocalStorageString, writeLocalStorageString } from '@/lib/local-storage'
import { siteStorageKeys } from '@/lib/site-config'

export const siteThemes = ['dark', 'light'] as const

export type SiteTheme = (typeof siteThemes)[number]

export const defaultSiteTheme: SiteTheme = 'light'

type ThemeRoot = {
  dataset: Record<string, string | undefined>
  style?: {
    colorScheme?: string
  }
}

export function isSiteTheme(value: string | null | undefined): value is SiteTheme {
  return value === 'dark' || value === 'light'
}

export function resolveSiteTheme(
  storedTheme: string | null | undefined,
  _systemPrefersDark: boolean | null | undefined,
  fallbackTheme: SiteTheme = defaultSiteTheme,
) {
  if (isSiteTheme(storedTheme)) {
    return storedTheme
  }

  return fallbackTheme
}

export function getStoredSiteTheme(storageKey = siteStorageKeys.themePreference) {
  const storedTheme = readLocalStorageString(storageKey)
  return isSiteTheme(storedTheme) ? storedTheme : null
}

export function storeSiteTheme(theme: SiteTheme, storageKey = siteStorageKeys.themePreference) {
  return writeLocalStorageString(storageKey, theme)
}

export function getDocumentSiteTheme(root: ThemeRoot) {
  return resolveSiteTheme(root.dataset.theme, null)
}

export function applySiteTheme(theme: SiteTheme, root: ThemeRoot) {
  root.dataset.theme = theme

  if (root.style) {
    root.style.colorScheme = theme
  }

  return theme
}

export function toggleSiteTheme(theme: SiteTheme) {
  return theme === 'dark' ? 'light' : 'dark'
}
