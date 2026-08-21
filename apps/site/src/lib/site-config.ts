import {
  brandConfig,
  type BrandLocale,
  type HomeDefaultSection,
  type LocalizedBrandText,
  type ShellFeature,
} from '@/brand/brand.config'
import { getLocalizedValue, normalizeSiteLocale } from '@/lib/locale-config'
import {
  getEnabledSections,
  getSection,
  getSectionByPageType,
  isSupportedSectionPageType,
  isSectionEnabled as isEnabledInManifest,
} from '@/lib/section-manifest'
import {
  buildRobotsTxt,
  resolveRobotsMetaContent,
  resolveSiteDeployment,
} from '@/lib/deployment-mode'

type ConfigLocale = BrandLocale

const FEED_METADATA: Record<string, (siteName: string) => { description: string; title: string }> = {
  en: (siteName) => ({
    description: `${siteName} in English, with articles, tracks, concepts, and reference content organized for study.`,
    title: siteName,
  }),
  'pt-br': (siteName) => ({
    description: `${siteName} em portugues, com artigos, trilhas, conceitos e referencias organizadas para estudo.`,
    title: `${siteName} PT-BR`,
  }),
}

const LEGAL_FALLBACKS = {
  governingLaw: {
    en: 'the laws applicable to the operator',
    'pt-br': 'as leis aplicaveis ao operador',
  },
  governingVenue: {
    en: 'the courts applicable to the operator',
    'pt-br': 'o foro aplicavel ao operador',
  },
  operatorLocation: {
    en: 'the operator jurisdiction',
    'pt-br': 'a jurisdicao do operador',
  },
  operatorName: {
    en: 'the site operator',
    'pt-br': 'o operador do site',
  },
  templateNotice: {
    en: 'Replace operator identity, contact channels, jurisdiction, enabled providers, and retention details before publishing this site.',
    'pt-br': 'Troque identidade do operador, canais de contato, jurisdicao, provedores habilitados e detalhes de retencao antes de publicar este site.',
  },
} as const

type ScriptDataAttributes = Record<string, string>

function readPublicEnv(value: string | undefined) {
  const normalized = value?.trim()

  return normalized && normalized.length > 0 ? normalized : null
}

function normalizeStorageNamespace(value: string | null) {
  const normalized = value
    ?.trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

  return normalized && normalized.length > 0 ? normalized : brandConfig.site.storageNamespace
}

function normalizeScriptDataAttributes(value: string | null): ScriptDataAttributes {
  if (!value) {
    return {}
  }

  try {
    const parsed = JSON.parse(value)

    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      return {}
    }

    return Object.fromEntries(
      Object.entries(parsed).flatMap(([key, entryValue]) => {
        if (typeof entryValue !== 'string') {
          return []
        }

        return [[key, entryValue]]
      }),
    )
  } catch {
    return {}
  }
}

function getLocalizedFallback(locale: ConfigLocale, values: Record<string, string>) {
  const normalizedLocale = normalizeSiteLocale(locale)

  return values[normalizedLocale] ?? values[brandConfig.locales.default] ?? Object.values(values)[0]
}

function resolveLocalizedBrandText(locale: ConfigLocale, text: LocalizedBrandText) {
  return getLocalizedValue(text, locale)
}

const siteDeployment = resolveSiteDeployment({
  activeSiteUrl: readPublicEnv(import.meta.env.SITE),
  configuredSiteUrl: readPublicEnv(import.meta.env.PUBLIC_SITE_URL) ?? brandConfig.site.url,
})

const clarityProjectId = readPublicEnv(import.meta.env.PUBLIC_CLARITY_PROJECT_ID)
const observabilityScriptSrc = readPublicEnv(import.meta.env.PUBLIC_OBSERVABILITY_SCRIPT_SRC)

export const siteConfig = {
  author: {
    ...brandConfig.author,
  },
  features: { ...brandConfig.features },
  home: {
    ...brandConfig.home,
  },
  integrations: {
    comments: {
      ...brandConfig.integrations.comments,
    },
    observability: {
      ...brandConfig.integrations.observability,
      enabled:
        brandConfig.integrations.observability.enabled
        || Boolean(observabilityScriptSrc)
        || Boolean(clarityProjectId),
      clarityProjectId,
      scriptDataAttributes: normalizeScriptDataAttributes(
        readPublicEnv(import.meta.env.PUBLIC_OBSERVABILITY_SCRIPT_DATA_JSON),
      ),
      scriptSrc: observabilityScriptSrc,
    },
    newsletter: {
      ...brandConfig.integrations.newsletter,
    },
  },
  legal: {
    governingLaw: readPublicEnv(import.meta.env.PUBLIC_GOVERNING_LAW) ?? brandConfig.legal.governingLaw,
    governingVenue:
      readPublicEnv(import.meta.env.PUBLIC_GOVERNING_VENUE) ?? brandConfig.legal.governingVenue,
    legalEmail: readPublicEnv(import.meta.env.PUBLIC_LEGAL_EMAIL) ?? brandConfig.legal.legalEmail,
    ownerLocation:
      readPublicEnv(import.meta.env.PUBLIC_LEGAL_OWNER_LOCATION) ?? brandConfig.legal.ownerLocation,
    ownerName: readPublicEnv(import.meta.env.PUBLIC_LEGAL_OWNER_NAME) ?? brandConfig.legal.ownerName,
    supportEmail:
      readPublicEnv(import.meta.env.PUBLIC_SUPPORT_EMAIL) ?? brandConfig.legal.supportEmail,
  },
  site: {
    description:
      readPublicEnv(import.meta.env.PUBLIC_SITE_DESCRIPTION) ?? brandConfig.site.description,
    name: readPublicEnv(import.meta.env.PUBLIC_SITE_NAME) ?? brandConfig.site.name,
    productionSiteUrl: siteDeployment.configuredSiteUrl,
    siteUrl: siteDeployment.siteUrl,
    storageNamespace: normalizeStorageNamespace(
      readPublicEnv(import.meta.env.PUBLIC_STORAGE_NAMESPACE),
    ),
  },
} as const

export const siteAppearance = {
  backgroundColor: 'rgb(246 247 251)',
  themeColor: 'rgb(246 247 251)',
} as const

export const siteAssetPaths = {
  favicon: '/favicon.svg',
  manifest: '/manifest.webmanifest',
} as const

export const siteUrls = {
  giscusTheme: new URL('/giscus-theme.css?v=1', `${siteConfig.site.siteUrl}/`).toString(),
  icon: new URL('/icon.svg', `${siteConfig.site.siteUrl}/`).toString(),
  llms: new URL('/llms.txt', `${siteConfig.site.siteUrl}/`).toString(),
  socialImage: new URL('/og-image.svg', `${siteConfig.site.siteUrl}/`).toString(),
  sitemap: new URL('/sitemap-index.xml', `${siteConfig.site.siteUrl}/`).toString(),
} as const

export const siteStorageKeys = {
  challengeCodePrefix: `${siteConfig.site.storageNamespace}.challenge-code`,
  challengeSolvedPrefix: `${siteConfig.site.storageNamespace}.challenge-solved`,
  completedArticles: `${siteConfig.site.storageNamespace}.completed-articles.v1`,
  focusModePreference: `${siteConfig.site.storageNamespace}.guide-focus-mode.v1`,
  localePreference: `${siteConfig.site.storageNamespace}.locale-preference.v1`,
  preparationProgramPrefix: `${siteConfig.site.storageNamespace}.preparation-program`,
  themePreference: `${siteConfig.site.storageNamespace}.theme-preference.v1`,
} as const

export const siteEvents = {
  articleReadingReset: `${siteConfig.site.storageNamespace}:article-reading-reset`,
  challengeSolved: `${siteConfig.site.storageNamespace}:challenge-solved`,
  completedArticlesChanged: `${siteConfig.site.storageNamespace}:completed-articles-changed`,
} as const

export function getSitePageTitle(title: string) {
  return `${title} | ${siteConfig.site.name}`
}

export function getSiteName() {
  return siteConfig.site.name
}

export function getSiteDescription() {
  return siteConfig.site.description
}

export function isFeatureEnabled(feature: ShellFeature) {
  return siteConfig.features[feature]
}

export function isSectionEnabled(sectionId: string) {
  return isEnabledInManifest(sectionId)
}

export function getEnabledSectionKeys() {
  return getEnabledSections().map((section) => section.id)
}

export function getHomeDefaultSection(): HomeDefaultSection {
  if (siteConfig.home.defaultSection === 'landing') {
    return 'landing'
  }

  if (siteConfig.home.defaultSection && getSection(siteConfig.home.defaultSection)) {
    return siteConfig.home.defaultSection
  }

  if (siteConfig.home.defaultSection) {
    const pageTypeSection = isSupportedSectionPageType(siteConfig.home.defaultSection)
      ? getSectionByPageType(siteConfig.home.defaultSection)
      : null

    if (pageTypeSection) {
      return pageTypeSection.id
    }
  }

  const firstEnabledSection = getEnabledSections()[0]

  return firstEnabledSection?.id ?? 'landing'
}

export function getHomeLandingCopy(locale: ConfigLocale) {
  return {
    description: resolveLocalizedBrandText(locale, siteConfig.home.landing.description),
    eyebrow: resolveLocalizedBrandText(locale, siteConfig.home.landing.eyebrow),
    title: resolveLocalizedBrandText(locale, siteConfig.home.landing.title),
  }
}

export function getNewsletterActionUrl() {
  const configuredAction = readPublicEnv(import.meta.env.PUBLIC_NEWSLETTER_URL)

  if (!siteConfig.features.newsletter || !siteConfig.integrations.newsletter.enabled) {
    return null
  }

  return configuredAction
}

export function getSiteAuthor() {
  return siteConfig.author
}

export function getObservabilityScriptConfig() {
  if (!siteConfig.integrations.observability.enabled) {
    return null
  }

  if (
    !siteConfig.integrations.observability.scriptSrc
    && !siteConfig.integrations.observability.clarityProjectId
  ) {
    return null
  }

  return {
    clarityProjectId: siteConfig.integrations.observability.clarityProjectId,
    dataAttributes: siteConfig.integrations.observability.scriptDataAttributes,
    src: siteConfig.integrations.observability.scriptSrc,
  }
}

export function hasCommentsEnabled() {
  return siteConfig.features.comments && siteConfig.integrations.comments.enabled
}

export function shouldAdvertiseSiteFeed() {
  return siteDeployment.shouldAdvertiseFeed
}

export function getSiteRobotsMetaContent(pageNoindex = false) {
  return resolveRobotsMetaContent({
    pageNoindex,
    siteShouldIndex: siteDeployment.shouldIndex,
  })
}

export function getRobotsTxtContent() {
  return buildRobotsTxt({
    shouldIndex: siteDeployment.shouldIndex,
    sitemapUrl: siteUrls.sitemap,
  })
}

export function getFeedResponseHeaders() {
  return siteDeployment.shouldIndex
    ? {}
    : {
        'X-Robots-Tag': 'noindex, nofollow',
      }
}

export function getFeedMetadata(locale: ConfigLocale) {
  const normalizedLocale = normalizeSiteLocale(locale)
  return (FEED_METADATA[normalizedLocale] ?? FEED_METADATA[brandConfig.locales.default])(siteConfig.site.name)
}

export function getLegalOperatorName(locale: ConfigLocale) {
  return siteConfig.legal.ownerName ?? getLocalizedFallback(locale, LEGAL_FALLBACKS.operatorName)
}

export function getLegalOperatorLocation(locale: ConfigLocale) {
  return siteConfig.legal.ownerLocation ?? getLocalizedFallback(locale, LEGAL_FALLBACKS.operatorLocation)
}

export function getLegalGoverningLaw(locale: ConfigLocale) {
  return siteConfig.legal.governingLaw ?? getLocalizedFallback(locale, LEGAL_FALLBACKS.governingLaw)
}

export function getLegalVenue(locale: ConfigLocale) {
  return siteConfig.legal.governingVenue ?? getLocalizedFallback(locale, LEGAL_FALLBACKS.governingVenue)
}

export function getLegalTemplateNotice(locale: ConfigLocale) {
  return getLocalizedFallback(locale, LEGAL_FALLBACKS.templateNotice)
}
