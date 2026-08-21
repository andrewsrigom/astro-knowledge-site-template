// @vitest-environment jsdom

import { describe, expect, it } from 'vitest'

import {
  filterSiteSearchResultsByPrefixes,
  getPagefindModulePath,
  getSearchResultGroupLabel,
  shouldCloseSearchWithShortcut,
  shouldOpenSearchWithShortcut,
} from '@/lib/site-search'

describe('site search helpers', () => {
  it('maps result urls to the matching section label', () => {
    const sections = [
      { href: '/articles', id: 'articles', label: 'Articles' },
      { href: '/topics', id: 'topics', label: 'Topics' },
    ]

    expect(getSearchResultGroupLabel('/articles/example', sections, 'Pages')).toBe('Articles')
    expect(getSearchResultGroupLabel('/topics?page=2', sections, 'Pages')).toBe('Topics')
    expect(getSearchResultGroupLabel('/privacy', sections, 'Pages')).toBe('Pages')
  })

  it('builds the pagefind module path relative to the deploy base url', () => {
    expect(getPagefindModulePath('/')).toBe('/pagefind/pagefind.js')
    expect(getPagefindModulePath('/docs')).toBe('/docs/pagefind/pagefind.js')
    expect(getPagefindModulePath('/docs/')).toBe('/docs/pagefind/pagefind.js')
  })

  it('limits book search results to the configured route prefix', () => {
    const results = [
      { meta: { title: 'Runtime' }, url: '/pt-br/guia/javascript-runtime' },
      { meta: { title: 'Promises' }, url: '/pt-br/guia/promises?from=search' },
      { meta: { title: 'Article' }, url: '/pt-br/artigos/promises' },
    ]

    expect(filterSiteSearchResultsByPrefixes(results, ['/pt-br/guia/'])).toEqual([
      results[0],
      results[1],
    ])
    expect(filterSiteSearchResultsByPrefixes(results, [])).toEqual(results)
  })

  it('opens with slash only outside editable targets', () => {
    const event = new KeyboardEvent('keydown', { key: '/' })
    Object.defineProperty(event, 'target', { value: document.createElement('button') })

    const inputEvent = new KeyboardEvent('keydown', { key: '/' })
    Object.defineProperty(inputEvent, 'target', { value: document.createElement('input') })

    expect(shouldOpenSearchWithShortcut(event)).toBe(true)
    expect(shouldOpenSearchWithShortcut(inputEvent)).toBe(false)
  })

  it('closes only on escape when already open', () => {
    expect(shouldCloseSearchWithShortcut(new KeyboardEvent('keydown', { key: 'Escape' }), true)).toBe(true)
    expect(shouldCloseSearchWithShortcut(new KeyboardEvent('keydown', { key: 'Escape' }), false)).toBe(false)
    expect(shouldCloseSearchWithShortcut(new KeyboardEvent('keydown', { key: 'Enter' }), true)).toBe(false)
  })
})
