import type { CollectionEntry } from 'astro:content'

import { getArticleReadingTimeMinutes } from '@/lib/article-meta'
import { getArticleHrefFromEntry } from '@/lib/article-links'
import { getTracksHref } from '@/lib/tracks-links'

export type EditorialLocale = 'en' | 'pt-br'

type LocalizedText = Record<EditorialLocale, string>
type RoadmapLevel = CollectionEntry<'articles'>['data']['level']

type RoadmapPosition = {
  x: number
  y: number
}

type EditorialRoadmapTag = {
  id: string
  label: LocalizedText
}

type EditorialRoadmapNodeBase = {
  id: string
  position: RoadmapPosition
}

export type RoadmapArticleNode = EditorialRoadmapNodeBase & {
  articleId: string
  kind: 'article'
}

export type RoadmapConceptNode = EditorialRoadmapNodeBase & {
  kind: 'concept'
  panelBody: LocalizedText
  relatedArticleIds: string[]
  summary: LocalizedText
  title: LocalizedText
}

export type RoadmapNode = RoadmapArticleNode | RoadmapConceptNode

export type EditorialRoadmap = {
  id: string
  intro: LocalizedText
  label: LocalizedText
  level?: RoadmapLevel
  locales?: EditorialLocale[]
  nodes: RoadmapNode[]
  slug: LocalizedText
  summary: LocalizedText
  tags: EditorialRoadmapTag[]
  title: LocalizedText
}

export type ResolvedRoadmapArticleNode = {
  articleId: string
  href: string | null
  id: string
  isAvailableInLocale: boolean
  kind: 'article'
  position: RoadmapPosition
  post: CollectionEntry<'articles'>
}

export type ResolvedRoadmapConceptNode = {
  id: string
  kind: 'concept'
  panelBody: string
  position: RoadmapPosition
  relatedArticles: CollectionEntry<'articles'>[]
  summary: string
  title: string
}

export type ResolvedRoadmapNode = ResolvedRoadmapArticleNode | ResolvedRoadmapConceptNode

export type ResolvedEditorialRoadmap = {
  availableLocales: EditorialLocale[]
  articleNodes: ResolvedRoadmapArticleNode[]
  estimatedReadingMinutes: number
  href: string
  id: string
  intro: string
  label: string
  level: RoadmapLevel
  locale: EditorialLocale
  nodes: ResolvedRoadmapNode[]
  slug: string
  slugs: LocalizedText
  stepCount: number
  summary: string
  tags: Array<{ id: string; label: string }>
  title: string
}

export type EditorialArticleContext = {
  currentArticle: ResolvedRoadmapArticleNode
  nextArticle: ResolvedRoadmapArticleNode | null
  previousArticle: ResolvedRoadmapArticleNode | null
  roadmap: ResolvedEditorialRoadmap
  stepIndex: number
  totalSteps: number
}

const STARTER_ROADMAP: EditorialRoadmap = {
  id: 'first-clone-checklist',
  intro: {
    en: 'A lightweight track that helps you validate the shell before replacing the bundled starter content.',
    'pt-br': 'Uma trilha leve para validar a shell antes de substituir o starter incluido no repo.',
  },
  label: {
    en: 'Start here',
    'pt-br': 'Comece aqui',
  },
  level: 'beginner',
  nodes: [
    {
      id: 'starter-concept',
      kind: 'concept',
      panelBody: {
        en: 'Run the starter first, confirm the shell works, and only then move brand and content to your own repo. This keeps the first change small and debuggable.',
        'pt-br': 'Rode o starter primeiro, confirme que a shell funciona e so depois mova marca e conteudo para o seu repo. Assim a primeira mudanca fica pequena e depuravel.',
      },
      position: { x: 0, y: 0 },
      relatedArticleIds: ['customize-the-template-after-clone'],
      summary: {
        en: 'Validate the shell before you personalize everything.',
        'pt-br': 'Valide a shell antes de personalizar tudo.',
      },
      title: {
        en: 'Start with a safe first pass',
        'pt-br': 'Comece com uma primeira passada segura',
      },
    },
    {
      articleId: 'customize-the-template-after-clone',
      id: 'starter-article',
      kind: 'article',
      position: { x: 260, y: 0 },
    },
  ],
  slug: {
    en: 'first-clone-checklist',
    'pt-br': 'checklist-do-primeiro-clone',
  },
  summary: {
    en: 'Validate the starter shell, then move to brand and editorial customization with confidence.',
    'pt-br': 'Valide a shell inicial e depois siga para marca e conteudo editorial com mais seguranca.',
  },
  tags: [
    {
      id: 'starter',
      label: {
        en: 'Starter',
        'pt-br': 'Starter',
      },
    },
  ],
  title: {
    en: 'First clone checklist',
    'pt-br': 'Checklist do primeiro clone',
  },
}

const PT_BR_ONLY_E2E_ROADMAP: EditorialRoadmap = {
  id: 'e2e-pt-br-only-track',
  intro: {
    en: 'Portuguese-only test fixture track.',
    'pt-br': 'Trilha de fixture usada para testar locale indisponivel.',
  },
  label: {
    en: 'Fixture track',
    'pt-br': 'Trilha fixture',
  },
  level: 'beginner',
  locales: ['pt-br'],
  nodes: [
    {
      articleId: 'customize-the-template-after-clone',
      id: 'fixture-article',
      kind: 'article',
      position: { x: 0, y: 0 },
    },
  ],
  slug: {
    en: 'pt-br-only-e2e-track',
    'pt-br': 'trilha-apenas-pt-br-e2e',
  },
  summary: {
    en: 'Fixture track for locale asymmetry coverage.',
    'pt-br': 'Trilha de fixture para cobrir assimetria de locale.',
  },
  tags: [
    {
      id: 'fixture',
      label: {
        en: 'Fixture',
        'pt-br': 'Fixture',
      },
    },
  ],
  title: {
    en: 'PT-BR only fixture track',
    'pt-br': 'Trilha fixture apenas PT-BR',
  },
}

const ROADMAPS = [STARTER_ROADMAP, PT_BR_ONLY_E2E_ROADMAP]
const EDITORIAL_LOCALES: EditorialLocale[] = ['en', 'pt-br']

function getLocalizedText(text: LocalizedText, locale: EditorialLocale) {
  return text[locale] ?? text.en
}

function getRoadmapAvailableLocales(roadmap: EditorialRoadmap) {
  return roadmap.locales ? [...roadmap.locales] : EDITORIAL_LOCALES
}

function getRoadmapLevel(roadmap: EditorialRoadmap): RoadmapLevel {
  return roadmap.level ?? 'intermediate'
}

function getEstimatedReadingMinutes(articleNodes: ResolvedRoadmapArticleNode[]) {
  return articleNodes.reduce((sum, node) => sum + getArticleReadingTimeMinutes(node.post), 0)
}

export function getPrimaryEditorialRoadmap() {
  return STARTER_ROADMAP
}

export function getPrimaryEditorialRoadmapHref(locale: EditorialLocale) {
  return getTracksHref(locale, getLocalizedText(STARTER_ROADMAP.slug, locale))
}

function resolveRoadmap(
  roadmap: EditorialRoadmap,
  locale: EditorialLocale,
  articles: CollectionEntry<'articles'>[],
): ResolvedEditorialRoadmap {
  const localizedArticles = articles.filter(
    (entry) =>
      entry.data.locale === locale &&
      entry.data.status === 'active' &&
      entry.data.trackEligible,
  )
  const byArticleId = new Map(localizedArticles.map((entry) => [entry.data.articleId, entry]))
  const nodes: ResolvedRoadmapNode[] = []

  for (const node of roadmap.nodes) {
    if (node.kind === 'article') {
      const post = byArticleId.get(node.articleId)

      if (!post) {
        continue
      }

      nodes.push({
        articleId: node.articleId,
        href: getArticleHrefFromEntry(post),
        id: node.id,
        isAvailableInLocale: true,
        kind: 'article',
        position: node.position,
        post,
      })
      continue
    }

    nodes.push({
      id: node.id,
      kind: 'concept',
      panelBody: getLocalizedText(node.panelBody, locale),
      position: node.position,
      relatedArticles: node.relatedArticleIds.flatMap((articleId) => {
        const post = byArticleId.get(articleId)
        return post ? [post] : []
      }),
      summary: getLocalizedText(node.summary, locale),
      title: getLocalizedText(node.title, locale),
    })
  }

  const articleNodes = nodes.filter((node): node is ResolvedRoadmapArticleNode => node.kind === 'article')
  const slug = getLocalizedText(roadmap.slug, locale)

  return {
    availableLocales: getRoadmapAvailableLocales(roadmap),
    articleNodes,
    estimatedReadingMinutes: getEstimatedReadingMinutes(articleNodes),
    href: getTracksHref(locale, slug) ?? (locale === 'pt-br' ? `/pt-br/trilhas/${slug}` : `/tracks/${slug}`),
    id: roadmap.id,
    intro: getLocalizedText(roadmap.intro, locale),
    label: getLocalizedText(roadmap.label, locale),
    level: getRoadmapLevel(roadmap),
    locale,
    nodes,
    slug,
    slugs: roadmap.slug,
    stepCount: articleNodes.length,
    summary: getLocalizedText(roadmap.summary, locale),
    tags: roadmap.tags.map((tag) => ({
      id: tag.id,
      label: getLocalizedText(tag.label, locale),
    })),
    title: getLocalizedText(roadmap.title, locale),
  }
}

export function resolveEditorialRoadmaps(
  locale: EditorialLocale,
  articles: CollectionEntry<'articles'>[],
): ResolvedEditorialRoadmap[] {
  return ROADMAPS
    .filter((roadmap) => getRoadmapAvailableLocales(roadmap).includes(locale))
    .map((roadmap) => resolveRoadmap(roadmap, locale, articles))
    .filter((roadmap) => roadmap.articleNodes.length > 0)
}

export function resolveEditorialRoadmap(
  locale: EditorialLocale,
  articles: CollectionEntry<'articles'>[],
  roadmapId = STARTER_ROADMAP.id,
) {
  return resolveEditorialRoadmaps(locale, articles).find((roadmap) => roadmap.id === roadmapId) ?? null
}

export function resolveEditorialRoadmapBySlug(
  locale: EditorialLocale,
  articles: CollectionEntry<'articles'>[],
  slug: string,
) {
  return resolveEditorialRoadmaps(locale, articles).find((roadmap) => roadmap.slug === slug) ?? null
}

export function getEditorialRoadmapById(
  locale: EditorialLocale,
  articles: CollectionEntry<'articles'>[],
  roadmapId: string,
) {
  return resolveEditorialRoadmap(locale, articles, roadmapId)
}

export function getEditorialRoadmapBySlug(
  locale: EditorialLocale,
  articles: CollectionEntry<'articles'>[],
  slug: string,
) {
  return resolveEditorialRoadmapBySlug(locale, articles, slug)
}

export function getArticleEditorialContext(
  post: CollectionEntry<'articles'>,
  articles: CollectionEntry<'articles'>[],
): EditorialArticleContext | null {
  const locale = post.data.locale === 'pt-br' ? 'pt-br' : 'en'
  const roadmap = resolveEditorialRoadmaps(locale, articles).find((entry) =>
    entry.articleNodes.some((node) => node.articleId === post.data.articleId),
  )

  if (!roadmap) {
    return null
  }

  const articleIndex = roadmap.articleNodes.findIndex((node) => node.articleId === post.data.articleId)

  if (articleIndex < 0) {
    return null
  }

  return {
    currentArticle: roadmap.articleNodes[articleIndex],
    nextArticle: roadmap.articleNodes[articleIndex + 1] ?? null,
    previousArticle: roadmap.articleNodes[articleIndex - 1] ?? null,
    roadmap,
    stepIndex: articleIndex + 1,
    totalSteps: roadmap.articleNodes.length,
  }
}
