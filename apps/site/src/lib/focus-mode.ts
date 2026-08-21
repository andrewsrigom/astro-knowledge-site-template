import { readLocalStorageString, writeLocalStorageString } from '@/lib/local-storage'
import { siteStorageKeys } from '@/lib/site-config'

export const focusModePreferences = ['off', 'on'] as const

export type FocusModePreference = (typeof focusModePreferences)[number]

type FocusModeRoot = {
  dataset: Record<string, string | undefined>
}

export function isFocusModePreference(
  value: string | null | undefined,
): value is FocusModePreference {
  return value === 'off' || value === 'on'
}

export function resolveFocusMode(value: string | null | undefined) {
  return value === 'on'
}

export function getStoredFocusMode(storageKey = siteStorageKeys.focusModePreference) {
  return resolveFocusMode(readLocalStorageString(storageKey))
}

export function storeFocusMode(
  enabled: boolean,
  storageKey = siteStorageKeys.focusModePreference,
) {
  return writeLocalStorageString(storageKey, enabled ? 'on' : 'off')
}

export function applyFocusMode(enabled: boolean, root: FocusModeRoot) {
  root.dataset.focusMode = enabled ? 'true' : 'false'
  return enabled
}

export function toggleFocusMode(enabled: boolean) {
  return !enabled
}
