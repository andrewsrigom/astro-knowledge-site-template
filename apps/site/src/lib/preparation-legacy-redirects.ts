import type { ContentStatus } from '@/lib/content-visibility'
import { getDefaultLocale, getLocalePath, getNonDefaultLocales } from '@/lib/locale-config'
import {
  getLegacyPreparationRouteSegments,
  getPreparationVolumeHref,
} from '@/lib/preparation-links'
import { getPageTypeRouteSegment } from '@/lib/section-manifest'

type LegacyProgramSource = {
  legacyProgramIds: string[]
  locale: string
  programId: string
  status: ContentStatus
}

type LegacyVolumeSource = {
  id: string
  legacyCompetencyIds: string[]
}

type LegacyCatalogSource = {
  locale: string
  status: ContentStatus
  volumes: LegacyVolumeSource[]
}

type RedirectProps = {
  statusCode: 301
  targetHref: string
}

type LocalizedProgramRedirectPath = {
  params: {
    locale: string
    program: string
    section: string
  }
  props: RedirectProps
}

type DefaultLocaleProgramRedirectPath = {
  params: {
    program: string
    section: string
  }
  props: RedirectProps
}

type LocalizedCompetencyRedirectPath = {
  params: {
    competency: string
    locale: string
    section: string
  }
  props: RedirectProps
}

type DefaultLocaleCompetencyRedirectPath = {
  params: {
    competency: string
    section: string
  }
  props: RedirectProps
}

function createRedirectProps(targetHref: string): RedirectProps {
  return {
    statusCode: 301,
    targetHref,
  }
}

function getLegacyCompetencyAliases(volume: LegacyVolumeSource) {
  return [...new Set([volume.id, ...volume.legacyCompetencyIds])]
}

export function getPreparationProgramAliases(program: LegacyProgramSource) {
  return [...new Set([program.programId, ...program.legacyProgramIds])]
}

export function getLegacyPreparationProgramRedirectPaths(
  programs: LegacyProgramSource[],
) {
  const supportedLocales = new Set(getNonDefaultLocales())
  const seen = new Set<string>()

  return programs.flatMap<LocalizedProgramRedirectPath>((program) => {
    const locale = program.locale
    const section = getPageTypeRouteSegment('preparation', locale)

    if (program.status === 'archived' || !supportedLocales.has(locale) || !section) {
      return []
    }

    const routeSegments = [section, ...getLegacyPreparationRouteSegments(locale)]

    return routeSegments.flatMap((routeSection) =>
      getPreparationProgramAliases(program).flatMap((programId) => {
        const key = `${locale}:${routeSection}:${programId}`

        if (seen.has(key)) {
          return []
        }

        seen.add(key)

        return [{
          params: {
            locale,
            program: programId,
            section: routeSection,
          },
          props: createRedirectProps(getLocalePath(locale)),
        }]
      }),
    )
  })
}

export function getDefaultLocalePreparationProgramRedirectPaths(
  programs: LegacyProgramSource[],
) {
  const defaultLocale = getDefaultLocale()
  const section = getPageTypeRouteSegment('preparation', defaultLocale)

  if (!section) {
    return [] satisfies DefaultLocaleProgramRedirectPath[]
  }

  const seen = new Set<string>()

  return programs.flatMap<DefaultLocaleProgramRedirectPath>((program) => {
    if (program.status === 'archived' || program.locale !== defaultLocale) {
      return []
    }

    const routeSegments = [section, ...getLegacyPreparationRouteSegments(defaultLocale)]

    return routeSegments.flatMap((routeSection) =>
      getPreparationProgramAliases(program).flatMap((programId) => {
        const key = `${routeSection}:${programId}`

        if (seen.has(key)) {
          return []
        }

        seen.add(key)

        return [{
          params: {
            program: programId,
            section: routeSection,
          },
          props: createRedirectProps(getLocalePath(defaultLocale)),
        }]
      }),
    )
  })
}

export function getLegacyPreparationCompetencyRedirectPaths(
  catalogs: LegacyCatalogSource[],
) {
  const supportedLocales = new Set(getNonDefaultLocales())
  const seen = new Set<string>()

  return catalogs.flatMap<LocalizedCompetencyRedirectPath>((catalog) => {
    const locale = catalog.locale
    const section = getPageTypeRouteSegment('preparation', locale)

    if (catalog.status === 'archived' || !supportedLocales.has(locale) || !section) {
      return []
    }

    const routeSegments = [section, ...getLegacyPreparationRouteSegments(locale)]

    return routeSegments.flatMap((routeSection) =>
      catalog.volumes.flatMap((volume) =>
        getLegacyCompetencyAliases(volume).flatMap((competency) => {
          const key = `${locale}:${routeSection}:${competency}`

          if (seen.has(key)) {
            return []
          }

          seen.add(key)

          return [{
            params: {
              competency,
              locale,
              section: routeSection,
            },
            props: createRedirectProps(getPreparationVolumeHref(volume.id, locale)),
          }]
        }),
      ),
    )
  })
}

export function getDefaultLocalePreparationCompetencyRedirectPaths(
  catalogs: LegacyCatalogSource[],
) {
  const defaultLocale = getDefaultLocale()
  const section = getPageTypeRouteSegment('preparation', defaultLocale)

  if (!section) {
    return [] satisfies DefaultLocaleCompetencyRedirectPath[]
  }

  const seen = new Set<string>()

  return catalogs.flatMap<DefaultLocaleCompetencyRedirectPath>((catalog) => {
    if (catalog.status === 'archived' || catalog.locale !== defaultLocale) {
      return []
    }

    const routeSegments = [section, ...getLegacyPreparationRouteSegments(defaultLocale)]

    return routeSegments.flatMap((routeSection) =>
      catalog.volumes.flatMap((volume) =>
        getLegacyCompetencyAliases(volume).flatMap((competency) => {
          const key = `${routeSection}:${competency}`

          if (seen.has(key)) {
            return []
          }

          seen.add(key)

          return [{
            params: {
              competency,
              section: routeSection,
            },
            props: createRedirectProps(getPreparationVolumeHref(volume.id, defaultLocale)),
          }]
        }),
      ),
    )
  })
}
