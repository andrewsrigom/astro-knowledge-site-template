import type { CollectionEntry } from 'astro:content'
import { TOPIC_GROUP_DEFINITIONS, getTopicGroupRouteSegment, getTopicPathSegments } from '@template/content'

import { getChallengeSlugFromEntry } from '@/lib/challenge-links'
import { getConceptSlugFromEntry } from '@/lib/concepts-links'
import { assertUniqueStaticPaths } from '@/lib/content-integrity'
import { getDefaultLocale } from '@/lib/locale-config'
import {
  getLegacyPreparationRouteSegments,
  getPreparationIndexHref,
  getPreparationSubjectHref,
  sortPreparationEntries,
} from '@/lib/preparation-links'
import { getEntryLeafRouteSegment, getNormalizedRouteSegment } from '@/lib/route-segments'
import {
  resolveEditorialRoadmaps,
  type EditorialLocale,
  type ResolvedEditorialRoadmap,
} from '@/lib/roadmaps'
import {
  getEnabledSections,
  type SectionLocale,
  type SectionPageType,
  type SiteSection,
} from '@/lib/section-manifest'
import {
  getActiveArticlesByLocale,
  getActiveChallengesByLocale,
  getActiveConceptsByLocale,
  getActiveGlossaryByLocale,
  getArticleCollection,
  getVisibleChallengesByLocale,
  getVisiblePreparationByLocale,
} from '@/lib/site-content'
import { getAvailableTopicsInGroup, getTopicGroupArticles } from '@/lib/topic-taxonomy'

type ArticleEntry = CollectionEntry<'articles'>
type ChallengeEntry = CollectionEntry<'challenges'>
type ConceptEntry = CollectionEntry<'concepts'>
type GlossaryEntry = CollectionEntry<'glossary'>
type PreparationEntry = CollectionEntry<'preparation'>

type DynamicIndexPageType = Exclude<SectionPageType, 'articles'>

type DynamicSectionIndexProps = {
  challenges?: ChallengeEntry[]
  concepts?: ConceptEntry[]
  locale: SectionLocale
  pageType: DynamicIndexPageType
  posts?: ArticleEntry[]
  preparation?: PreparationEntry[]
  redirectHref?: string
  roadmaps?: ResolvedEditorialRoadmap[]
  sectionId: string
  terms?: GlossaryEntry[]
}

type DynamicSectionDetailProps = {
  challenge?: ChallengeEntry
  concept?: ConceptEntry
  groupId?: string
  locale: SectionLocale
  pageType: DynamicIndexPageType
  posts?: ArticleEntry[]
  preparation?: PreparationEntry[]
  redirectHref?: string
  roadmap?: ResolvedEditorialRoadmap
  sectionId: string
  slug: string
  subjectId?: string
  term?: GlossaryEntry
  topics?: ReturnType<typeof getAvailableTopicsInGroup>
}

type DynamicTopicDetailProps = {
  groupId: string
  locale: SectionLocale
  pageType: 'topics'
  sectionId: string
  topicId: string
}

type StaticPath<Props> = {
  params: Record<string, string>
  props: Props
}

const DYNAMIC_SECTION_PAGE_TYPES = new Set<DynamicIndexPageType>([
  'tracks',
  'topics',
  'concepts',
  'glossary',
  'challenges',
  'preparation',
])

function isDynamicSection(section: SiteSection): section is SiteSection & { pageType: DynamicIndexPageType } {
  return section.pageType !== 'articles'
}

function getRoutableSections(locale: SectionLocale) {
  return getEnabledSections().filter(
    (section): section is SiteSection & { pageType: DynamicIndexPageType } =>
      isDynamicSection(section) &&
      DYNAMIC_SECTION_PAGE_TYPES.has(section.pageType) &&
      Boolean(section.routes[locale]),
  )
}

export async function getDynamicSectionIndexPaths(locale: SectionLocale) {
  const isDefaultLocale = locale === getDefaultLocale()
  const sections = getRoutableSections(locale)
  const articles = await getArticleCollection()
  const activeConcepts = await getActiveConceptsByLocale(locale)
  const activeGlossary = await getActiveGlossaryByLocale(locale)
  const activeChallenges = await getActiveChallengesByLocale(locale)
  const visiblePreparation = await getVisiblePreparationByLocale(locale)

  const canonicalPaths = sections.map<StaticPath<DynamicSectionIndexProps>>((section) => {
    const props: DynamicSectionIndexProps = {
      locale,
      pageType: section.pageType,
      sectionId: section.id,
    }

    if (section.pageType === 'tracks') {
      props.roadmaps = resolveEditorialRoadmaps(locale as EditorialLocale, articles)
    } else if (section.pageType === 'concepts') {
      props.concepts = activeConcepts
    } else if (section.pageType === 'glossary') {
      props.terms = activeGlossary
    } else if (section.pageType === 'challenges') {
      props.challenges = activeChallenges
    } else if (section.pageType === 'preparation') {
      props.preparation = visiblePreparation
    }

    return {
      params: {
        ...(isDefaultLocale ? {} : { locale }),
        section: section.routes[locale],
      },
      props,
    }
  })
  const paths = canonicalPaths.flatMap((path) => {
    if (path.props.pageType !== 'preparation') return [path]

    return [
      path,
      ...getLegacyPreparationRouteSegments(locale).map((section) => ({
        params: {
          ...path.params,
          section,
        },
        props: {
          ...path.props,
          redirectHref: getPreparationIndexHref(locale),
        },
      })),
    ]
  })

  return assertUniqueStaticPaths(paths, 'dynamic section index')
}

export async function getDynamicSectionDetailPaths(locale: SectionLocale) {
  const isDefaultLocale = locale === getDefaultLocale()
  const sections = getRoutableSections(locale)
  const articles = await getArticleCollection()
  const activeArticles = await getActiveArticlesByLocale(locale)
  const activeConcepts = await getActiveConceptsByLocale(locale)
  const activeGlossary = await getActiveGlossaryByLocale(locale)
  const visibleChallenges = await getVisibleChallengesByLocale(locale)
  const visiblePreparation = await getVisiblePreparationByLocale(locale)

  const canonicalPaths = sections.flatMap<StaticPath<DynamicSectionDetailProps>>((section) => {
    if (section.pageType === 'tracks') {
      return resolveEditorialRoadmaps(locale as EditorialLocale, articles).map((roadmap) => {
        const slug = getNormalizedRouteSegment(roadmap.slug)

        return {
          params: {
            ...(isDefaultLocale ? {} : { locale }),
            section: section.routes[locale],
            slug,
          },
          props: {
            locale,
            pageType: section.pageType,
            roadmap,
            sectionId: section.id,
            slug,
          },
        }
      })
    }

    if (section.pageType === 'topics') {
      return TOPIC_GROUP_DEFINITIONS.flatMap((group) => {
        const topics = getAvailableTopicsInGroup(activeArticles, group.id, locale)
        const posts = getTopicGroupArticles(activeArticles, group.id, locale)

        if (topics.length === 0 && posts.length === 0) {
          return []
        }

        const slug = getNormalizedRouteSegment(getTopicGroupRouteSegment(group.id, locale))

        return [
          {
            params: {
              ...(isDefaultLocale ? {} : { locale }),
              section: section.routes[locale],
              slug,
            },
            props: {
              groupId: group.id,
              locale,
              pageType: section.pageType,
              sectionId: section.id,
              slug,
            },
          },
        ]
      })
    }

    if (section.pageType === 'concepts') {
      return activeConcepts.map((concept) => {
        const slug = getConceptSlugFromEntry(concept)

        return {
          params: {
            ...(isDefaultLocale ? {} : { locale }),
            section: section.routes[locale],
            slug,
          },
          props: {
            concept,
            locale,
            pageType: section.pageType,
            sectionId: section.id,
            slug,
          },
        }
      })
    }

    if (section.pageType === 'glossary') {
      return activeGlossary.map((term) => {
        const slug = getEntryLeafRouteSegment(term.id)

        return {
          params: {
            ...(isDefaultLocale ? {} : { locale }),
            section: section.routes[locale],
            slug,
          },
          props: {
            locale,
            pageType: section.pageType,
            sectionId: section.id,
            slug,
            term,
          },
        }
      })
    }

    if (section.pageType === 'challenges') {
      return visibleChallenges.map((challenge) => {
        const slug = getChallengeSlugFromEntry(challenge)

        return {
          params: {
            ...(isDefaultLocale ? {} : { locale }),
            section: section.routes[locale],
            slug,
          },
          props: {
            challenge,
            locale,
            pageType: section.pageType,
            sectionId: section.id,
            slug,
          },
        }
      })
    }

    if (section.pageType === 'preparation') {
      const subjectIds = [...new Set(visiblePreparation.map((entry) => entry.data.subjectId))]

      return subjectIds.map((subjectId) => {
        const slug = getNormalizedRouteSegment(subjectId)

        return {
          params: {
            ...(isDefaultLocale ? {} : { locale }),
            section: section.routes[locale],
            slug,
          },
          props: {
            locale,
            pageType: section.pageType,
            preparation: sortPreparationEntries(
              visiblePreparation.filter((entry) => entry.data.subjectId === subjectId),
            ),
            sectionId: section.id,
            slug,
            subjectId,
          },
        }
      })
    }

    return []
  })
  const paths = canonicalPaths.flatMap((path) => {
    if (path.props.pageType !== 'preparation' || !path.props.subjectId) return [path]

    return [
      path,
      ...getLegacyPreparationRouteSegments(locale).map((section) => ({
        params: {
          ...path.params,
          section,
        },
        props: {
          ...path.props,
          redirectHref: getPreparationSubjectHref(path.props.subjectId!, locale),
        },
      })),
    ]
  })

  return assertUniqueStaticPaths(paths, 'dynamic section detail')
}

export async function getDynamicTopicDetailPaths(locale: SectionLocale) {
  const isDefaultLocale = locale === getDefaultLocale()
  const topicsSection = getRoutableSections(locale).find((section) => section.pageType === 'topics')

  if (!topicsSection) {
    return []
  }

  const activeArticles = await getActiveArticlesByLocale(locale)

  return assertUniqueStaticPaths(
    TOPIC_GROUP_DEFINITIONS.flatMap<StaticPath<DynamicTopicDetailProps>>((group) =>
      getAvailableTopicsInGroup(activeArticles, group.id, locale).map((topic) => {
        const [, ...topicSegments] = getTopicPathSegments(topic.id, locale)

        return {
          params: {
            ...(isDefaultLocale ? {} : { locale }),
            group: getTopicGroupRouteSegment(group.id, locale),
            section: topicsSection.routes[locale],
            topic: topicSegments.join('/'),
          },
          props: {
            groupId: group.id,
            locale,
            pageType: 'topics',
            sectionId: topicsSection.id,
            topicId: topic.id,
          },
        }
      }),
    ),
    'dynamic topic detail',
  )
}
