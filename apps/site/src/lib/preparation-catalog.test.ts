import { describe, expect, it } from 'vitest'

import {
  getGuideCompetencies,
  getPreparationCompetencyCounts,
  type PreparationCompetency,
} from '@/lib/preparation-catalog'

const competencies: PreparationCompetency[] = [
  {
    description: 'Frontend notes.',
    groups: [{
      id: 'web',
      items: [
        { kind: 'guide', refId: 'plataforma-web' },
        { kind: 'challenge', refId: 'practice-frontend' },
      ],
      order: 1,
      title: 'Web',
    }],
    id: 'frontend',
    order: 2,
    title: 'Frontend',
  },
  {
    description: 'Security notes.',
    groups: [{
      id: 'browser',
      items: [
        { kind: 'guide', refId: 'plataforma-web' },
        { kind: 'guide', refId: 'http-apis-seguranca' },
      ],
      order: 1,
      title: 'Browser',
    }],
    id: 'seguranca',
    order: 1,
    title: 'Segurança',
  },
]

describe('preparation catalog', () => {
  it('counts unique notes and practices', () => {
    expect(getPreparationCompetencyCounts(competencies[0])).toEqual({ challenges: 1, guides: 1 })
  })

  it('finds every competency that reuses a guide in catalog order', () => {
    expect(getGuideCompetencies(competencies, 'plataforma-web').map((entry) => entry.id)).toEqual([
      'seguranca',
      'frontend',
    ])
  })
})
