import type { CollectionEntry } from 'astro:content'

import { getLocalePath, normalizeSiteLocale } from '@/lib/locale-config'
import { getNormalizedRouteSegment } from '@/lib/route-segments'
import { getPageTypeRouteSegment } from '@/lib/section-manifest'

type PreparationEntry = CollectionEntry<'preparation'>

export function getLegacyPreparationRouteSegments(locale: string) {
  return normalizeSiteLocale(locale) === 'pt-br' ? ['preparacao'] : ['prep']
}

export function getPreparationIndexHref(locale: string) {
  const section = getPageTypeRouteSegment('preparation', locale)
  return section ? getLocalePath(locale, section) : getLocalePath(locale)
}

export function getPreparationSubjectHref(subjectId: string, locale: string) {
  return `${getPreparationIndexHref(locale)}/${getNormalizedRouteSegment(subjectId)}`
}

export function getPreparationCompetencyHref(competencyId: string, locale: string) {
  const segment = normalizeSiteLocale(locale) === 'pt-br' ? 'competencias' : 'competencies'
  return `${getPreparationIndexHref(locale)}/${segment}/${getNormalizedRouteSegment(competencyId)}`
}

export function getPreparationVolumeHref(volumeId: string, locale: string) {
  return `${getPreparationIndexHref(locale)}/volumes/${getNormalizedRouteSegment(volumeId)}`
}

export function getPreparationProgramHref(programId: string, locale: string) {
  return `${getPreparationIndexHref(locale)}/programa/${getNormalizedRouteSegment(programId)}`
}

export function sortPreparationEntries(entries: PreparationEntry[]) {
  return [...entries].sort(
    (left, right) =>
      left.data.order - right.data.order
      || left.data.title.localeCompare(right.data.title, left.data.locale),
  )
}
