import { describe, expect, it } from 'vitest'

import {
  filterKnownProgramItemIds,
  getProgramItemIds,
  getProgramProgress,
  getProgramStorageKey,
  type ProgramCompetency,
} from '@/lib/preparation-program'

const competencies: ProgramCompetency[] = [
  {
    goal: 'Entender o runtime.',
    id: 'javascript',
    order: 1,
    title: 'JavaScript',
    groups: [
      {
        id: 'runtime',
        items: [{ href: '/runtime', id: 'runtime', kind: 'guide', label: 'Runtime' }],
        order: 1,
        priority: 'essential',
        title: 'Runtime',
      },
      {
        id: 'extra',
        items: [{ href: null, id: 'extra', kind: 'checkpoint', label: 'Extra' }],
        order: 2,
        priority: 'optional',
        title: 'Extra',
      },
    ],
  },
]

describe('preparation program', () => {
  it('selects item ids by priority', () => {
    expect(getProgramItemIds(competencies, 'essential')).toEqual(['runtime'])
    expect(getProgramItemIds(competencies)).toEqual(['runtime', 'extra'])
  })

  it('ignores stale and duplicated ids when loading progress', () => {
    expect(filterKnownProgramItemIds(competencies, ['runtime', 'runtime', 'old', 2])).toEqual(['runtime'])
  })

  it('calculates progress from essential ids only', () => {
    expect(getProgramProgress(['runtime', 'other'], ['runtime', 'extra'])).toEqual({
      completedRequired: 1,
      progress: 50,
    })
  })

  it('uses a versioned storage key', () => {
    expect(getProgramStorageKey('seniorpath.program', 'fullstack-ai')).toBe(
      'seniorpath.program.fullstack-ai.v2',
    )
  })
})
