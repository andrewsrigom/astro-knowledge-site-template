import { describe, expect, it } from 'vitest'

import {
  getPreparationCompetencyHref,
  getPreparationIndexHref,
  getPreparationProgramHref,
  getPreparationSubjectHref,
  getPreparationVolumeHref,
} from '@/lib/preparation-links'

describe('preparation links', () => {
  it('uses the localized section route', () => {
    expect(getPreparationIndexHref('en')).toBe('/guide')
    expect(getPreparationIndexHref('pt-br')).toBe('/pt-br/guia')
  })

  it('uses one canonical path per subject manual', () => {
    expect(getPreparationSubjectHref('web-components', 'pt-br')).toBe(
      '/pt-br/guia/web-components',
    )
  })

  it('places competencies below a localized catalog segment', () => {
    expect(getPreparationCompetencyHref('devops-cloud', 'pt-br')).toBe(
      '/pt-br/guia/competencias/devops-cloud',
    )
    expect(getPreparationCompetencyHref('frontend', 'en')).toBe(
      '/guide/competencies/frontend',
    )
  })

  it('places book volumes below a stable localized segment', () => {
    expect(getPreparationVolumeHref('frontend', 'pt-br')).toBe(
      '/pt-br/guia/volumes/frontend',
    )
    expect(getPreparationVolumeHref('system-design', 'en')).toBe(
      '/guide/volumes/system-design',
    )
  })

  it('places guided programs below the localized preparation route', () => {
    expect(getPreparationProgramHref('fullstack-ai', 'pt-br')).toBe(
      '/pt-br/guia/programa/fullstack-ai',
    )
  })
})
