import { beforeEach, describe, expect, it, vi } from 'vitest'

const {
  mockGetArticleEditorialContext,
  mockResolveEditorialRoadmap,
  mockResolveEditorialRoadmapBySlug,
  mockResolveEditorialRoadmaps,
} = vi.hoisted(() => ({
  mockGetArticleEditorialContext: vi.fn(),
  mockResolveEditorialRoadmap: vi.fn(),
  mockResolveEditorialRoadmapBySlug: vi.fn(),
  mockResolveEditorialRoadmaps: vi.fn(),
}))

vi.mock('@content/roadmaps/roadmaps', () => ({
  getArticleEditorialContext: mockGetArticleEditorialContext,
  resolveEditorialRoadmap: mockResolveEditorialRoadmap,
  resolveEditorialRoadmapBySlug: mockResolveEditorialRoadmapBySlug,
  resolveEditorialRoadmaps: mockResolveEditorialRoadmaps,
}))

import {
  getArticleEditorialContext,
  getPrimaryEditorialRoadmap,
  getPrimaryEditorialRoadmapHref,
  resolveEditorialRoadmap,
  resolveEditorialRoadmapBySlug,
} from '@/lib/roadmaps'

type TestArticleNode = {
  articleId: string
  href: string
  id: string
  isAvailableInLocale: boolean
  kind: 'article'
  position: { x: number; y: number }
  post: {
    body: string
    data: {
      articleId: string
      level: 'advanced' | 'beginner' | 'intermediate'
      locale: string
      status: string
      title: string
      trackEligible: boolean
    }
    id: string
  }
}

type TestConceptNode = {
  id: string
  kind: 'concept'
  panelBody: string
  position: { x: number; y: number }
  relatedArticles: TestArticleNode['post'][]
  summary: string
  title: string
}

function createArticleNode(options: {
  articleId: string
  id: string
  level?: 'advanced' | 'beginner' | 'intermediate'
  wordCount?: number
}): TestArticleNode {
  const {
    articleId,
    id,
    level = 'beginner',
    wordCount = 220,
  } = options

  return {
    articleId,
    href: `/articles/${articleId}`,
    id,
    isAvailableInLocale: true,
    kind: 'article',
    position: { x: 0, y: 0 },
    post: {
      body: 'word '.repeat(wordCount),
      data: {
        articleId,
        level,
        locale: 'en',
        status: 'active',
        title: `Title for ${articleId}`,
        trackEligible: true,
      },
      id: `en/foundations/${articleId}`,
    },
  }
}

function createConceptNode(id = 'concept-node'): TestConceptNode {
  return {
    id,
    kind: 'concept',
    panelBody: 'Concept body',
    position: { x: 0, y: 0 },
    relatedArticles: [],
    summary: 'Concept summary',
    title: 'Concept title',
  }
}

function createRoadmap(overrides: Record<string, unknown> = {}) {
  const firstArticle = createArticleNode({ articleId: 'article-1', id: 'article-1-node', wordCount: 220 })
  const secondArticle = createArticleNode({ articleId: 'article-2', id: 'article-2-node', wordCount: 440 })

  return {
    articleNodes: [firstArticle, secondArticle],
    availableLocales: ['en', 'pt-br'],
    href: '/tracks/example',
    id: 'example',
    intro: 'Intro',
    label: 'Track',
    locale: 'en',
    nodes: [createConceptNode(), firstArticle, secondArticle],
    slug: 'example',
    slugs: { en: 'example', 'pt-br': 'exemplo' },
    summary: 'Summary',
    tags: [{ id: 'starter', label: 'Starter' }],
    title: 'Example track',
    ...overrides,
  }
}

describe('roadmap facade', () => {
  beforeEach(() => {
    mockResolveEditorialRoadmap.mockReset()
    mockResolveEditorialRoadmapBySlug.mockReset()
    mockResolveEditorialRoadmaps.mockReset()
    mockGetArticleEditorialContext.mockReset()
  })

  it('enhances roadmap lookup by id with derived metrics', () => {
    const roadmap = createRoadmap()
    const articles = [] as never[]

    mockResolveEditorialRoadmap.mockReturnValue(roadmap)

    expect(resolveEditorialRoadmap('en', articles, 'example')).toMatchObject({
      estimatedReadingMinutes: 3,
      level: 'intermediate',
      stepCount: 2,
    })
    expect(resolveEditorialRoadmap('en', articles, 'example')?.nodes.map((node) => node.id)).toEqual([
      'concept-node',
      'article-1-node',
      'article-2-node',
    ])
    expect(mockResolveEditorialRoadmap).toHaveBeenCalledWith('en', articles, 'example')
  })

  it('keeps explicit content metrics when the synced module already exposes them', () => {
    const roadmap = createRoadmap({
      estimatedReadingMinutes: 123,
      level: 'beginner',
      stepCount: 99,
    })
    const articles = [] as never[]

    mockResolveEditorialRoadmapBySlug.mockReturnValue(roadmap)

    expect(resolveEditorialRoadmapBySlug('pt-br', articles, 'example')).toMatchObject({
      estimatedReadingMinutes: 123,
      level: 'beginner',
      stepCount: 99,
    })
    expect(mockResolveEditorialRoadmapBySlug).toHaveBeenCalledWith('pt-br', articles, 'example')
  })

  it('enhances article editorial context from the synced content module', () => {
    const currentArticle = createArticleNode({ articleId: 'article-1', id: 'article-1-node', wordCount: 220 })
    const roadmap = createRoadmap({
      articleNodes: [currentArticle],
      nodes: [currentArticle],
    })
    const context = {
      currentArticle,
      nextArticle: null,
      previousArticle: null,
      roadmap,
      stepIndex: 1,
      totalSteps: 1,
    }
    const post = {
      data: {
        articleId: 'article-1',
        locale: 'en',
      },
    } as never
    const articles = [] as never[]

    mockGetArticleEditorialContext.mockReturnValue(context)

    expect(getArticleEditorialContext(post, articles)).toMatchObject({
      roadmap: {
        estimatedReadingMinutes: 1,
        level: 'intermediate',
        stepCount: 1,
      },
      stepIndex: 1,
      totalSteps: 1,
    })
    expect(mockGetArticleEditorialContext).toHaveBeenCalledWith(post, articles)
  })

  it('drops draft and non-track-eligible roadmap articles from the shell facade', () => {
    const draftArticle = createArticleNode({ articleId: 'draft-article', id: 'draft-node' })
    draftArticle.post.data.status = 'draft'
    const hiddenArticle = createArticleNode({ articleId: 'hidden-article', id: 'hidden-node' })
    hiddenArticle.post.data.trackEligible = false
    const visibleArticle = createArticleNode({ articleId: 'visible-article', id: 'visible-node' })
    const roadmap = createRoadmap({
      articleNodes: [draftArticle, hiddenArticle, visibleArticle],
      nodes: [
        {
          ...createConceptNode('concept-with-related'),
          relatedArticles: [draftArticle.post, hiddenArticle.post, visibleArticle.post],
        },
        draftArticle,
        hiddenArticle,
        visibleArticle,
      ],
    })

    mockResolveEditorialRoadmap.mockReturnValue(roadmap)

    expect(resolveEditorialRoadmap('en', [] as never[], 'example')).toMatchObject({
      articleNodes: [{ id: 'visible-node' }],
      estimatedReadingMinutes: 1,
      nodes: [
        {
          id: 'concept-with-related',
          relatedArticles: [{ data: { articleId: 'visible-article' } }],
        },
        { id: 'visible-node' },
      ],
      stepCount: 1,
    })
  })

  it('derives the primary resolved roadmap from the synced roadmap list', () => {
    const firstRoadmap = createRoadmap({
      href: '/tracks/first',
      id: 'first',
      slug: 'first',
      slugs: { en: 'first', 'pt-br': 'primeira' },
    })
    const secondRoadmap = createRoadmap({
      href: '/tracks/second',
      id: 'second',
      slug: 'second',
      slugs: { en: 'second', 'pt-br': 'segunda' },
    })
    const articles = [] as never[]

    mockResolveEditorialRoadmaps.mockReturnValue([firstRoadmap, secondRoadmap])

    expect(getPrimaryEditorialRoadmap('en', articles)).toMatchObject({
      estimatedReadingMinutes: 3,
      href: '/tracks/first',
      id: 'first',
      level: 'intermediate',
      stepCount: 2,
    })
    expect(getPrimaryEditorialRoadmapHref('en', articles)).toBe('/tracks/first')
    expect(mockResolveEditorialRoadmaps).toHaveBeenCalledWith('en', articles)
  })

  it('returns null when no resolved roadmap is available', () => {
    mockResolveEditorialRoadmaps.mockReturnValue([])

    expect(getPrimaryEditorialRoadmap('en', [] as never[])).toBeNull()
    expect(getPrimaryEditorialRoadmapHref('en', [] as never[])).toBeNull()
  })
})
