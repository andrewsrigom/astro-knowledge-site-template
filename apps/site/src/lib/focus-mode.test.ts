import { describe, expect, it } from 'vitest'

import {
  applyFocusMode,
  isFocusModePreference,
  resolveFocusMode,
  toggleFocusMode,
} from '@/lib/focus-mode'

describe('focus mode helpers', () => {
  it('accepts only persisted focus preferences', () => {
    expect(isFocusModePreference('on')).toBe(true)
    expect(isFocusModePreference('off')).toBe(true)
    expect(isFocusModePreference('true')).toBe(false)
    expect(isFocusModePreference(null)).toBe(false)
  })

  it('enables focus mode only for an explicit on preference', () => {
    expect(resolveFocusMode('on')).toBe(true)
    expect(resolveFocusMode('off')).toBe(false)
    expect(resolveFocusMode('invalid')).toBe(false)
    expect(resolveFocusMode(null)).toBe(false)
  })

  it('applies and toggles focus mode', () => {
    const root = { dataset: {} as Record<string, string | undefined> }

    applyFocusMode(true, root)
    expect(root.dataset.focusMode).toBe('true')

    applyFocusMode(false, root)
    expect(root.dataset.focusMode).toBe('false')
    expect(toggleFocusMode(false)).toBe(true)
    expect(toggleFocusMode(true)).toBe(false)
  })
})
