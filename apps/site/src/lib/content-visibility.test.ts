import { describe, expect, it } from 'vitest'

import { isVisibleContentStatus } from '@/lib/content-visibility'

describe('content visibility', () => {
  it('always includes active content', () => {
    expect(isVisibleContentStatus('active', false)).toBe(true)
    expect(isVisibleContentStatus('active', true)).toBe(true)
  })

  it('includes drafts only when explicitly requested', () => {
    expect(isVisibleContentStatus('draft', false)).toBe(false)
    expect(isVisibleContentStatus('draft', true)).toBe(true)
  })

  it('never includes archived content', () => {
    expect(isVisibleContentStatus('archived', false)).toBe(false)
    expect(isVisibleContentStatus('archived', true)).toBe(false)
  })
})
