import { describe, expect, it } from 'vitest'

import { getPreparationArea, getPreparationAreas, PREPARATION_AREA_IDS } from '@/lib/preparation-areas'

describe('preparation areas', () => {
  it('keeps the navigation order stable', () => {
    expect(getPreparationAreas('pt-br').map((area) => area.id)).toEqual(PREPARATION_AREA_IDS)
  })

  it('localizes labels and descriptions', () => {
    expect(getPreparationArea('backend-apis', 'pt-br')).toMatchObject({
      label: 'Backend e APIs',
    })
    expect(getPreparationArea('backend-apis', 'en')).toMatchObject({
      label: 'Backend and APIs',
    })
  })
})
