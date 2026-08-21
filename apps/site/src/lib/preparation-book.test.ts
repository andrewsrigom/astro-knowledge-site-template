import { describe, expect, it } from 'vitest'

import {
  getPreparationChapterContext,
  getPreparationGlossaryReferences,
  getPreparationPracticeContext,
  getPreparationVolume,
  resolvePreparationBook,
  type PreparationCatalogData,
  type PreparationChallengeEntry,
  type PreparationEntry,
} from '@/lib/preparation-book'

function createGuide(guideId: string): PreparationEntry {
  return {
    data: {
      guideId,
      locale: 'pt-br',
      status: 'active',
      subjectId: guideId,
      title: `Guide ${guideId}`,
    },
    id: `pt-br/${guideId}/manual`,
  } as PreparationEntry
}

function createChallenge(challengeId: string): PreparationChallengeEntry {
  return {
    data: {
      challengeId,
      locale: 'pt-br',
      status: 'active',
      title: `Challenge ${challengeId}`,
    },
    id: `pt-br/${challengeId}`,
  } as PreparationChallengeEntry
}

function createCatalog(
  volumes: PreparationCatalogData['volumes'],
): PreparationCatalogData {
  return {
    catalogId: 'preparation-book',
    competencies: [],
    description: 'Preparation book.',
    locale: 'pt-br',
    schemaVersion: 2,
    status: 'active',
    title: 'Preparation',
    volumes,
  }
}

describe('preparation book', () => {
  it('sorts the hierarchy and crosses volume boundaries for previous and next chapters', () => {
    const catalog = createCatalog([
      {
        description: 'Second volume.',
        id: 'backend',
        legacyCompetencyIds: [],
        order: 2,
        parts: [{
          chapters: [{ guideId: 'node', order: 1 }],
          id: 'runtime',
          order: 1,
          practices: [],
          references: [],
          title: 'Runtime',
        }],
        title: 'Backend',
      },
      {
        description: 'First volume.',
        id: 'frontend',
        legacyCompetencyIds: ['client'],
        order: 1,
        parts: [{
          chapters: [
            { guideId: 'react', order: 2 },
            { guideId: 'browser', order: 1 },
          ],
          description: 'Core browser and React guides.',
          id: 'web',
          order: 1,
          practices: [{ challengeId: 'debug-ui', order: 1 }],
          references: [{ kind: 'guide', refId: 'node', relation: 'related' }],
          title: 'Web',
        }],
        title: 'Frontend',
      },
    ])
    const book = resolvePreparationBook(
      catalog,
      ['browser', 'react', 'node'].map(createGuide),
      [createChallenge('debug-ui')],
    )

    expect(book.volumes.map((volume) => volume.id)).toEqual(['frontend', 'backend'])
    expect(book.chapters.map((chapter) => chapter.guideId)).toEqual(['browser', 'react', 'node'])
    expect(book.volumes[0].parts[0].description).toBe('Core browser and React guides.')
    expect(book.volumes[0].parts[0].practices[0].challengeId).toBe('debug-ui')
    expect(book.volumes[0].parts[0].references[0]).toMatchObject({
      href: '/pt-br/guia/node',
      title: 'Guide node',
    })

    const context = getPreparationChapterContext(book, 'react')

    expect(context?.previousChapter?.guideId).toBe('browser')
    expect(context?.nextChapter?.guideId).toBe('node')
    expect(context?.volume.id).toBe('frontend')
    expect(getPreparationPracticeContext(book, 'debug-ui')).toMatchObject({
      part: { id: 'web' },
      practice: { challengeId: 'debug-ui' },
      volume: { id: 'frontend' },
    })
    expect(getPreparationPracticeContext(book, 'standalone-challenge')).toBeNull()
    expect(getPreparationVolume(book, 'client')?.id).toBe('frontend')
  })

  it('finds glossary references in canonical book order', () => {
    const catalog = createCatalog([
      {
        description: 'First volume.',
        id: 'frontend',
        legacyCompetencyIds: [],
        order: 1,
        parts: [{
          chapters: [
            { guideId: 'browser', order: 1 },
            { guideId: 'react', order: 2 },
          ],
          id: 'web',
          order: 1,
          practices: [],
          references: [],
          title: 'Web',
        }],
        title: 'Frontend',
      },
      {
        description: 'Second volume.',
        id: 'backend',
        legacyCompetencyIds: [],
        order: 2,
        parts: [{
          chapters: [{ guideId: 'node', order: 1 }],
          id: 'runtime',
          order: 1,
          practices: [],
          references: [],
          title: 'Runtime',
        }],
        title: 'Backend',
      },
    ])
    const guides = [
      {
        ...createGuide('browser'),
        data: {
          ...createGuide('browser').data,
          glossaryIds: ['dom', 'rendering'],
        },
      },
      {
        ...createGuide('react'),
        data: {
          ...createGuide('react').data,
          glossaryIds: ['rendering'],
        },
      },
      {
        ...createGuide('node'),
        data: {
          ...createGuide('node').data,
          glossaryIds: ['runtime'],
        },
      },
    ]
    const book = resolvePreparationBook(catalog, guides, [])

    expect(getPreparationGlossaryReferences(book, 'rendering').map((reference) => reference.chapter.guideId)).toEqual([
      'browser',
      'react',
    ])
    expect(getPreparationGlossaryReferences(book, 'rendering')[0]).toMatchObject({
      part: { id: 'web' },
      volume: { id: 'frontend' },
    })
    expect(getPreparationGlossaryReferences(book, 'missing')).toEqual([])
  })

  it('rejects a guide assigned to more than one canonical chapter', () => {
    const catalog = createCatalog([{
      description: 'Frontend volume.',
      id: 'frontend',
      legacyCompetencyIds: [],
      order: 1,
      parts: [
        {
          chapters: [{ guideId: 'react', order: 1 }],
          id: 'rendering',
          order: 1,
          practices: [],
          references: [],
          title: 'Rendering',
        },
        {
          chapters: [{ guideId: 'react', order: 1 }],
          id: 'state',
          order: 2,
          practices: [],
          references: [],
          title: 'State',
        },
      ],
      title: 'Frontend',
    }])

    expect(() => resolvePreparationBook(catalog, [createGuide('react')], [])).toThrowError(
      '[preparation-book] Guide "react" is assigned to more than one canonical chapter.',
    )
  })

  it('rejects a challenge assigned to more than one canonical practice', () => {
    const catalog = createCatalog([{
      description: 'Frontend volume.',
      id: 'frontend',
      legacyCompetencyIds: [],
      order: 1,
      parts: [
        {
          chapters: [{ guideId: 'browser', order: 1 }],
          id: 'browser',
          order: 1,
          practices: [{ challengeId: 'debug-ui', order: 1 }],
          references: [],
          title: 'Browser',
        },
        {
          chapters: [{ guideId: 'react', order: 1 }],
          id: 'react',
          order: 2,
          practices: [{ challengeId: 'debug-ui', order: 1 }],
          references: [],
          title: 'React',
        },
      ],
      title: 'Frontend',
    }])

    expect(() => resolvePreparationBook(
      catalog,
      ['browser', 'react'].map(createGuide),
      [createChallenge('debug-ui')],
    )).toThrowError('Challenge "debug-ui" is assigned to more than one canonical practice.')
  })

  it('rejects a missing visible guide', () => {
    const catalog = createCatalog([{
      description: 'Frontend volume.',
      id: 'frontend',
      legacyCompetencyIds: [],
      order: 1,
      parts: [{
        chapters: [{ guideId: 'missing-guide', order: 1 }],
        id: 'web',
        order: 1,
        practices: [],
        references: [],
        title: 'Web',
      }],
      title: 'Frontend',
    }])

    expect(() => resolvePreparationBook(catalog, [], [])).toThrowError(
      'Missing visible guide "missing-guide"',
    )
  })

  it('rejects missing visible practices and cross-references', () => {
    const practiceCatalog = createCatalog([{
      description: 'Frontend volume.',
      id: 'frontend',
      legacyCompetencyIds: [],
      order: 1,
      parts: [{
        chapters: [{ guideId: 'browser', order: 1 }],
        id: 'web',
        order: 1,
        practices: [{ challengeId: 'missing-practice', order: 1 }],
        references: [],
        title: 'Web',
      }],
      title: 'Frontend',
    }])
    const referenceCatalog = createCatalog([{
      description: 'Frontend volume.',
      id: 'frontend',
      legacyCompetencyIds: [],
      order: 1,
      parts: [{
        chapters: [{ guideId: 'browser', order: 1 }],
        id: 'web',
        order: 1,
        practices: [],
        references: [{ kind: 'challenge', refId: 'missing-reference', relation: 'related' }],
        title: 'Web',
      }],
      title: 'Frontend',
    }])

    expect(() => resolvePreparationBook(
      practiceCatalog,
      [createGuide('browser')],
      [],
    )).toThrowError('Missing visible challenge "missing-practice"')
    expect(() => resolvePreparationBook(
      referenceCatalog,
      [createGuide('browser')],
      [],
    )).toThrowError('Missing visible challenge "missing-reference"')
  })

  it('rejects ambiguous sibling orders', () => {
    const catalog = createCatalog([
      {
        description: 'Frontend volume.',
        id: 'frontend',
        legacyCompetencyIds: ['client'],
        order: 1,
        parts: [
          {
            chapters: [{ guideId: 'browser', order: 1 }],
            id: 'web',
            order: 1,
            practices: [],
            references: [],
            title: 'Web',
          },
          {
            chapters: [{ guideId: 'react', order: 1 }],
            id: 'react',
            order: 1,
            practices: [],
            references: [],
            title: 'React',
          },
        ],
        title: 'Frontend',
      },
    ])

    expect(() => resolvePreparationBook(
      catalog,
      ['browser', 'react'].map(createGuide),
      [],
    )).toThrowError('Duplicate part order "1" in volume "frontend".')
  })

  it('rejects collisions between canonical volume ids and legacy competency ids', () => {
    const catalog = createCatalog([
      {
        description: 'Frontend volume.',
        id: 'frontend',
        legacyCompetencyIds: ['client'],
        order: 1,
        parts: [{
          chapters: [{ guideId: 'browser', order: 1 }],
          id: 'web',
          order: 1,
          practices: [],
          references: [],
          title: 'Web',
        }],
        title: 'Frontend',
      },
      {
        description: 'Client alias collision.',
        id: 'client',
        legacyCompetencyIds: [],
        order: 2,
        parts: [{
          chapters: [{ guideId: 'typescript', order: 1 }],
          id: 'language',
          order: 1,
          practices: [],
          references: [],
          title: 'Language',
        }],
        title: 'Client',
      },
    ])

    expect(() => resolvePreparationBook(
      catalog,
      ['browser', 'typescript'].map(createGuide),
      [],
    )).toThrowError('Duplicate volume or legacy competency id "client".')
  })

  it('returns null for a standalone guide that is not in the book', () => {
    const catalog = createCatalog([{
      description: 'Frontend volume.',
      id: 'frontend',
      legacyCompetencyIds: [],
      order: 1,
      parts: [{
        chapters: [{ guideId: 'browser', order: 1 }],
        id: 'web',
        order: 1,
        practices: [],
        references: [],
        title: 'Web',
      }],
      title: 'Frontend',
    }])
    const book = resolvePreparationBook(catalog, [createGuide('browser')], [])

    expect(getPreparationChapterContext(book, 'draft-guide')).toBeNull()
  })
})
