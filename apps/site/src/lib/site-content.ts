import { getCollection, type CollectionEntry } from 'astro:content'

import { isVisibleContentStatus } from '@/lib/content-visibility'

type ArticleEntry = CollectionEntry<'articles'>
type ChallengeEntry = CollectionEntry<'challenges'>
type ConceptEntry = CollectionEntry<'concepts'>
type GlossaryEntry = CollectionEntry<'glossary'>
type PreparationEntry = CollectionEntry<'preparation'>
type PreparationCatalogEntry = CollectionEntry<'preparationCatalogs'>
type PreparationProgramEntry = CollectionEntry<'preparationPrograms'>

let articlesPromise: Promise<ArticleEntry[]> | null = null
let challengesPromise: Promise<ChallengeEntry[]> | null = null
let conceptsPromise: Promise<ConceptEntry[]> | null = null
let glossaryPromise: Promise<GlossaryEntry[]> | null = null
let preparationPromise: Promise<PreparationEntry[]> | null = null
let preparationCatalogsPromise: Promise<PreparationCatalogEntry[]> | null = null
let preparationProgramsPromise: Promise<PreparationProgramEntry[]> | null = null

const activeArticlesByLocale = new Map<string, Promise<ArticleEntry[]>>()
const activeChallengesByLocale = new Map<string, Promise<ChallengeEntry[]>>()
const visibleChallengesByLocale = new Map<string, Promise<ChallengeEntry[]>>()
const activeConceptsByLocale = new Map<string, Promise<ConceptEntry[]>>()
const activeGlossaryByLocale = new Map<string, Promise<GlossaryEntry[]>>()
const visiblePreparationByLocale = new Map<string, Promise<PreparationEntry[]>>()

function isActiveEntry(entry: { data: { locale?: string | null; status?: string | null } }, locale: string) {
  return entry.data.locale === locale && entry.data.status === 'active'
}

export function getArticleCollection() {
  articlesPromise ??= getCollection('articles')
  return articlesPromise
}

export function getChallengeCollection() {
  challengesPromise ??= getCollection('challenges')
  return challengesPromise
}

export function getConceptCollection() {
  conceptsPromise ??= getCollection('concepts')
  return conceptsPromise
}

export function getGlossaryCollection() {
  glossaryPromise ??= getCollection('glossary')
  return glossaryPromise
}

export function getPreparationCollection() {
  preparationPromise ??= getCollection('preparation')
  return preparationPromise
}

export function getPreparationCatalogCollection() {
  preparationCatalogsPromise ??= getCollection('preparationCatalogs')
  return preparationCatalogsPromise
}

export function getPreparationProgramCollection() {
  preparationProgramsPromise ??= getCollection('preparationPrograms')
  return preparationProgramsPromise
}

export function getActiveArticlesByLocale(locale: string) {
  let cachedPromise = activeArticlesByLocale.get(locale)

  if (!cachedPromise) {
    cachedPromise = getArticleCollection().then((entries) => entries.filter((entry) => isActiveEntry(entry, locale)))
    activeArticlesByLocale.set(locale, cachedPromise)
  }

  return cachedPromise
}

export function getActiveChallengesByLocale(locale: string) {
  let cachedPromise = activeChallengesByLocale.get(locale)

  if (!cachedPromise) {
    cachedPromise = getChallengeCollection().then((entries) => entries.filter((entry) => isActiveEntry(entry, locale)))
    activeChallengesByLocale.set(locale, cachedPromise)
  }

  return cachedPromise
}

export function getVisibleChallengesByLocale(locale: string, includeDrafts = import.meta.env.DEV) {
  const cacheKey = `${locale}:${includeDrafts ? 'with-drafts' : 'active-only'}`
  let cachedPromise = visibleChallengesByLocale.get(cacheKey)

  if (!cachedPromise) {
    cachedPromise = getChallengeCollection().then((entries) =>
      entries.filter((entry) =>
        entry.data.locale === locale
        && isVisibleContentStatus(entry.data.status, includeDrafts),
      ),
    )
    visibleChallengesByLocale.set(cacheKey, cachedPromise)
  }

  return cachedPromise
}

export function getActiveConceptsByLocale(locale: string) {
  let cachedPromise = activeConceptsByLocale.get(locale)

  if (!cachedPromise) {
    cachedPromise = getConceptCollection().then((entries) => entries.filter((entry) => isActiveEntry(entry, locale)))
    activeConceptsByLocale.set(locale, cachedPromise)
  }

  return cachedPromise
}

export function getActiveGlossaryByLocale(locale: string) {
  let cachedPromise = activeGlossaryByLocale.get(locale)

  if (!cachedPromise) {
    cachedPromise = getGlossaryCollection().then((entries) => entries.filter((entry) => isActiveEntry(entry, locale)))
    activeGlossaryByLocale.set(locale, cachedPromise)
  }

  return cachedPromise
}

export function getVisiblePreparationByLocale(locale: string, includeDrafts = import.meta.env.DEV) {
  const cacheKey = `${locale}:${includeDrafts ? 'with-drafts' : 'active-only'}`
  let cachedPromise = visiblePreparationByLocale.get(cacheKey)

  if (!cachedPromise) {
    cachedPromise = getPreparationCollection().then((entries) =>
      entries.filter((entry) =>
        entry.data.locale === locale
        && isVisibleContentStatus(entry.data.status, includeDrafts),
      ),
    )
    visiblePreparationByLocale.set(cacheKey, cachedPromise)
  }

  return cachedPromise
}
