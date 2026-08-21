import { sectionManifest as rawSectionManifest } from '@content/sections.manifest.mjs'
import { getDefaultLocale, getLocalePath, getLocalizedValue, normalizeSiteLocale } from '@/lib/locale-config'

export type SectionLocale = string
export type SectionPageType =
  | 'articles'
  | 'tracks'
  | 'topics'
  | 'concepts'
  | 'glossary'
  | 'challenges'
  | 'preparation'

type LocalizedSectionText = Record<string, string>

export type SiteSection = {
  descriptions?: LocalizedSectionText
  enabled?: boolean
  id: string
  labels: LocalizedSectionText
  order?: number
  pageType: SectionPageType
  routes: LocalizedSectionText
  sourceDir?: string
}

type RawManifest = {
  sections?: SiteSection[]
}

const manifest = rawSectionManifest as RawManifest

function normalizeLocale(locale?: string): SectionLocale {
  return normalizeSiteLocale(locale)
}

function sortSections(left: SiteSection, right: SiteSection) {
  const leftOrder = left.order ?? Number.MAX_SAFE_INTEGER
  const rightOrder = right.order ?? Number.MAX_SAFE_INTEGER

  if (leftOrder !== rightOrder) {
    return leftOrder - rightOrder
  }

  return left.id.localeCompare(right.id)
}

const sections = [...(manifest.sections ?? [])].sort(sortSections)
const supportedPageTypes = new Set<SectionPageType>([
  'articles',
  'tracks',
  'topics',
  'concepts',
  'glossary',
  'challenges',
  'preparation',
])

export function getAllSections() {
  return sections
}

export function isSupportedSectionPageType(value: string): value is SectionPageType {
  return supportedPageTypes.has(value as SectionPageType)
}

export function getEnabledSections() {
  return sections.filter((section) => section.enabled !== false)
}

export function getSection(sectionId: string) {
  return sections.find((section) => section.id === sectionId) ?? null
}

export function getSectionByPageType(pageType: SectionPageType) {
  return getEnabledSections().find((section) => section.pageType === pageType) ?? null
}

export function getSectionIdByPageType(pageType: SectionPageType) {
  return getSectionByPageType(pageType)?.id ?? null
}

export function isSectionEnabled(sectionId: string) {
  return getEnabledSections().some((section) => section.id === sectionId)
}

export function isPageTypeEnabled(pageType: SectionPageType) {
  return Boolean(getSectionByPageType(pageType))
}

export function getSectionLabel(sectionId: string, locale?: string) {
  const section = getSection(sectionId)

  return getLocalizedValue(section?.labels, normalizeLocale(locale)) || sectionId
}

export function getSectionDescription(sectionId: string, locale?: string) {
  const section = getSection(sectionId)

  return getLocalizedValue(section?.descriptions, normalizeLocale(locale))
}

export function getSectionRouteSegment(sectionId: string, locale?: string) {
  const section = getSection(sectionId)
  const normalizedLocale = normalizeLocale(locale)

  return (
    section?.routes[normalizedLocale]
    ?? section?.routes[getDefaultLocale()]
    ?? Object.values(section?.routes ?? {})[0]
    ?? null
  )
}

export function getSectionIndexHref(sectionId: string, locale?: string) {
  const normalizedLocale = normalizeLocale(locale)
  const routeSegment = getSectionRouteSegment(sectionId, normalizedLocale)

  if (!routeSegment) {
    return null
  }

  return getLocalePath(normalizedLocale, routeSegment)
}

export function getSectionHref(sectionId: string, locale?: string, slug?: string | null) {
  const normalizedLocale = normalizeLocale(locale)
  const routeSegment = getSectionRouteSegment(sectionId, normalizedLocale)

  if (!routeSegment) {
    return null
  }

  return getLocalePath(normalizedLocale, slug ? `${routeSegment}/${slug}` : routeSegment)
}

export function getPageTypeLabel(pageType: SectionPageType, locale?: string) {
  const section = getSectionByPageType(pageType)

  return getSectionLabel(section?.id ?? pageType, locale)
}

export function getPageTypeDescription(pageType: SectionPageType, locale?: string) {
  const section = getSectionByPageType(pageType)

  return getSectionDescription(section?.id ?? pageType, locale)
}

export function getPageTypeRouteSegment(pageType: SectionPageType, locale?: string) {
  const section = getSectionByPageType(pageType)

  return section ? getSectionRouteSegment(section.id, locale) : null
}

export function getPageTypeIndexHref(pageType: SectionPageType, locale?: string) {
  const section = getSectionByPageType(pageType)

  return section ? getSectionIndexHref(section.id, locale) : null
}

export function getPageTypeHref(pageType: SectionPageType, locale?: string, slug?: string | null) {
  const section = getSectionByPageType(pageType)

  return section ? getSectionHref(section.id, locale, slug) : null
}

export function getSectionByRouteSegment(routeSegment: string, locale?: string) {
  const normalizedLocale = normalizeLocale(locale)

  return (
    getEnabledSections().find(
      (section) =>
        section.routes[normalizedLocale] === routeSegment
        || (!section.routes[normalizedLocale] && section.routes[getDefaultLocale()] === routeSegment),
    ) ?? null
  )
}
