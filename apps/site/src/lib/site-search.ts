import { isEditableKeyboardTarget } from '@/lib/keyboard'

export type SiteSearchSection = {
  href: string
  id: string
  label: string
}

export type SiteSearchResult = {
  excerpt?: string
  meta?: {
    title?: string
  }
  url: string
}

type PagefindSearchModule = {
  search: (query: string) => Promise<{ results: Array<{ data: () => Promise<SiteSearchResult> }> }>
}

let pagefindModule: PagefindSearchModule | null = null

function normalizeBaseUrl(baseUrl: string) {
  const trimmed = baseUrl.trim()

  if (!trimmed) {
    return '/'
  }

  const withLeadingSlash = trimmed.startsWith('/') ? trimmed : `/${trimmed}`
  return withLeadingSlash.endsWith('/') ? withLeadingSlash : `${withLeadingSlash}/`
}

export function getPagefindModulePath(baseUrl = import.meta.env.BASE_URL ?? '/') {
  const normalizedBaseUrl = normalizeBaseUrl(baseUrl)
  return new URL('pagefind/pagefind.js', `https://example.com${normalizedBaseUrl}`).pathname
}

async function loadPagefind() {
  return import(/* @vite-ignore */ getPagefindModulePath()) as Promise<PagefindSearchModule>
}

export function getSearchResultGroupLabel(
  url: string,
  searchableSections: SiteSearchSection[],
  fallbackGroupLabel: string,
) {
  const match = searchableSections.find((section) =>
    url === section.href || url.startsWith(`${section.href}/`) || url.startsWith(`${section.href}?`),
  )

  return match?.label ?? fallbackGroupLabel
}

export function filterSiteSearchResultsByPrefixes(
  results: SiteSearchResult[],
  prefixes: string[],
  limit = 8,
) {
  const normalizedPrefixes = prefixes
    .map((prefix) => prefix.trim().replace(/\/+$/, '') || '/')
    .filter((prefix, index, items) => items.indexOf(prefix) === index)

  return results
    .filter((result) =>
      normalizedPrefixes.length === 0
      || normalizedPrefixes.some((prefix) =>
        result.url === prefix
        || result.url.startsWith(`${prefix}/`)
        || result.url.startsWith(`${prefix}?`)
        || result.url.startsWith(`${prefix}#`),
      ),
    )
    .slice(0, limit)
}

export function shouldOpenSearchWithShortcut(event: KeyboardEvent) {
  return !isEditableKeyboardTarget(event.target) && event.key === '/'
}

export function shouldCloseSearchWithShortcut(event: KeyboardEvent, isOpen: boolean) {
  return isOpen && event.key === 'Escape'
}

export async function runSiteSearch(query: string, limit = 8) {
  const normalizedQuery = query.trim()

  if (!normalizedQuery) {
    return []
  }

  pagefindModule ??= await loadPagefind()
  const response = await pagefindModule.search(normalizedQuery)

  return Promise.all(
    response.results.slice(0, limit).map(async (result) => result.data()),
  )
}
