import type { CollectionEntry } from 'astro:content'
import { getTopicRootGroupId } from '@template/content'

import { getArticleHrefFromEntry } from '@/lib/article-links'
import { sortArticlesByRecency } from '@/lib/article-tree'
import { formatEditorialDate } from '@/lib/format-date'
import { getSiteCopy, getSiteDateLocale, type SiteLocale } from '@/lib/site-copy'
import { getTopicGroupHref, getTopicHref } from '@/lib/topic-links'
import {
  getAvailableTopicGroups,
  getAvailableTopicsInGroup,
  getLocalizedArticleTopics,
  getLocalizedArticleTopicsInGroup,
  getLocalizedTopicGroupLabel,
  getLocalizedTopicLabel,
  getLocalizedTopicSummary,
  getLocalizedTopicGroupSummary,
  getTopicGroupArticles,
} from '@/lib/topic-taxonomy'

export const ARTICLE_DIRECTORY_PAGE_SIZE = 24
export const CARD_DIRECTORY_PAGE_SIZE = 12
export const HOME_DIRECTORY_PREVIEW_SIZE = 12
export const TOPIC_GROUP_DIRECTORY_PAGE_SIZE = 24
export const TOPIC_INDEX_PAGE_SIZE = 12

type ArticleEntry = CollectionEntry<'articles'>

export type DirectoryTag = {
  id: string
  label: string
}

export type DirectoryItem = {
  badgeLabel?: string
  completedCtaLabel?: string
  completionId?: string
  contentKind?: 'article' | 'note'
  ctaLabel?: string
  description?: string
  eyebrow?: string
  href: string | null
  meta?: string
  tags: DirectoryTag[]
  title: string
}

export type PaginatedItems<T> = {
  currentPage: number
  hasNextPage: boolean
  hasPreviousPage: boolean
  items: T[]
  nextPage: number | null
  pageCount: number
  previousPage: number | null
  totalItems: number
}

export function paginateItems<T>(items: T[], page: number, pageSize: number): PaginatedItems<T> {
  const normalizedPage = Number.isFinite(page) ? Math.max(1, Math.floor(page)) : 1
  const totalItems = items.length
  const pageCount = Math.max(1, Math.ceil(totalItems / pageSize))
  const currentPage = Math.min(normalizedPage, pageCount)
  const sliceStart = (currentPage - 1) * pageSize

  return {
    currentPage,
    hasNextPage: currentPage < pageCount,
    hasPreviousPage: currentPage > 1,
    items: items.slice(sliceStart, sliceStart + pageSize),
    nextPage: currentPage < pageCount ? currentPage + 1 : null,
    pageCount,
    previousPage: currentPage > 1 ? currentPage - 1 : null,
    totalItems,
  }
}

export function getPaginatedPathNumbers(totalItems: number, pageSize: number) {
  const pageCount = Math.ceil(totalItems / pageSize)

  if (pageCount <= 1) {
    return []
  }

  return Array.from({ length: pageCount - 1 }, (_, index) => index + 2)
}

function formatArticleCountLabel(count: number, locale: SiteLocale) {
  const copy = getSiteCopy(locale)
  const label = count === 1 ? copy.directory.articleCountSingular : copy.directory.articleCountPlural
  return `${count} ${label}`
}

export function buildArticleDirectoryItems(
  posts: ArticleEntry[],
  locale: SiteLocale,
  options?: {
    groupId?: string
    sortByRecency?: boolean
  },
) {
  const copy = getSiteCopy(locale)
  const dateLocale = getSiteDateLocale(locale)
  const sortedPosts = options?.sortByRecency ? sortArticlesByRecency(posts) : posts

  return sortedPosts.map<DirectoryItem>((post) => ({
    badgeLabel: post.data.kind === 'note' ? copy.directory.noteBadge : undefined,
    completedCtaLabel: copy.directory.readAgain,
    completionId: post.data.articleId,
    contentKind: post.data.kind,
    ctaLabel: copy.directory.readMore,
    description: post.data.description,
    eyebrow: formatEditorialDate(post.data.pubDate, dateLocale),
    href: getArticleHrefFromEntry(post),
    tags: options?.groupId
      ? getLocalizedArticleTopicsInGroup(post, options.groupId, locale).map(({ id, label }) => ({ id, label }))
      : getLocalizedArticleTopics(post).map(({ id, label }) => ({ id, label })),
    title: post.data.title,
  }))
}

export function buildTopicGroupDirectoryItems(posts: ArticleEntry[], locale: SiteLocale) {
  return getAvailableTopicGroups(posts, locale).map<DirectoryItem>((group) => ({
    description: getLocalizedTopicGroupSummary(group.id, locale),
    href: getTopicGroupHref(group.id, locale),
    meta: formatArticleCountLabel(getTopicGroupArticles(posts, group.id, locale).length, locale),
    tags: [],
    title: getLocalizedTopicGroupLabel(group.id, locale),
  }))
}

export function buildTopicDirectoryItems(posts: ArticleEntry[], locale: SiteLocale) {
  return getAvailableTopicGroups(posts, locale).flatMap<DirectoryItem>((group) =>
    getAvailableTopicsInGroup(posts, group.id, locale).map((topic) => ({
      description: getLocalizedTopicSummary(topic.id, locale),
      href: getTopicHref(topic.id, locale),
      meta: getLocalizedTopicGroupLabel(getTopicRootGroupId(topic.id) ?? group.id, locale),
      tags: [],
      title: getLocalizedTopicLabel(topic.id, locale),
    })),
  )
}
