import { describe, expect, it } from 'vitest'

import {
  getDefaultLocalePreparationCompetencyRedirectPaths,
  getDefaultLocalePreparationProgramRedirectPaths,
  getLegacyPreparationCompetencyRedirectPaths,
  getLegacyPreparationProgramRedirectPaths,
  getPreparationProgramAliases,
} from '@/lib/preparation-legacy-redirects'

describe('preparation legacy redirects', () => {
  it('keeps canonical and old localized program routes redirecting to the book home', () => {
    const paths = getLegacyPreparationProgramRedirectPaths([
      {
        legacyProgramIds: ['fullstack-ai-12-semanas'],
        locale: 'pt-br',
        programId: 'fullstack-ai',
        status: 'draft',
      },
    ])

    expect(paths.map((path) => path.params)).toEqual([
      { locale: 'pt-br', program: 'fullstack-ai', section: 'guia' },
      { locale: 'pt-br', program: 'fullstack-ai-12-semanas', section: 'guia' },
      { locale: 'pt-br', program: 'fullstack-ai', section: 'preparacao' },
      { locale: 'pt-br', program: 'fullstack-ai-12-semanas', section: 'preparacao' },
    ])
    expect(paths.every((path) => path.props.targetHref === '/pt-br')).toBe(true)
  })

  it('keeps canonical and old default-locale program routes', () => {
    const paths = getDefaultLocalePreparationProgramRedirectPaths([
      {
        legacyProgramIds: ['backend-legacy'],
        locale: 'en',
        programId: 'backend',
        status: 'active',
      },
    ])

    expect(paths.map((path) => path.params)).toEqual([
      { program: 'backend', section: 'guide' },
      { program: 'backend-legacy', section: 'guide' },
      { program: 'backend', section: 'prep' },
      { program: 'backend-legacy', section: 'prep' },
    ])
    expect(paths.every((path) => path.props.targetHref === '/')).toBe(true)
  })

  it('keeps archived programs out of legacy redirects', () => {
    expect(getLegacyPreparationProgramRedirectPaths([
      {
        legacyProgramIds: ['archived-program'],
        locale: 'pt-br',
        programId: 'retired',
        status: 'archived',
      },
    ])).toEqual([])
  })

  it('redirects canonical and old competency routes to canonical volumes', () => {
    const paths = getLegacyPreparationCompetencyRedirectPaths([
      {
        locale: 'pt-br',
        status: 'draft',
        volumes: [
          {
            id: 'devops-cloud',
            legacyCompetencyIds: ['infra'],
          },
        ],
      },
    ])

    expect(paths.map((path) => path.params)).toEqual([
      { competency: 'devops-cloud', locale: 'pt-br', section: 'guia' },
      { competency: 'infra', locale: 'pt-br', section: 'guia' },
      { competency: 'devops-cloud', locale: 'pt-br', section: 'preparacao' },
      { competency: 'infra', locale: 'pt-br', section: 'preparacao' },
    ])
    expect(paths.every(
      (path) => path.props.targetHref === '/pt-br/guia/volumes/devops-cloud',
    )).toBe(true)
  })

  it('redirects canonical and old default-locale competency routes', () => {
    const paths = getDefaultLocalePreparationCompetencyRedirectPaths([
      {
        locale: 'en',
        status: 'active',
        volumes: [
          {
            id: 'system-design',
            legacyCompetencyIds: ['architecture'],
          },
        ],
      },
    ])

    expect(paths.map((path) => path.params)).toEqual([
      { competency: 'system-design', section: 'guide' },
      { competency: 'architecture', section: 'guide' },
      { competency: 'system-design', section: 'prep' },
      { competency: 'architecture', section: 'prep' },
    ])
    expect(paths.every(
      (path) => path.props.targetHref === '/guide/volumes/system-design',
    )).toBe(true)
  })

  it('deduplicates repeated program aliases', () => {
    expect(getPreparationProgramAliases({
      legacyProgramIds: ['backend', 'backend-legacy', 'backend-legacy'],
      locale: 'en',
      programId: 'backend',
      status: 'active',
    })).toEqual(['backend', 'backend-legacy'])
  })
})
