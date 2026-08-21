import { getLegalContactLinks } from '@/lib/legal-contact'
import { DEFAULT_SITE_URL } from '@/lib/deployment-mode'
import {
  getNewsletterActionUrl,
  getObservabilityScriptConfig,
  hasCommentsEnabled,
  siteConfig,
  siteStorageKeys,
} from '@/lib/site-config'
import { getSiteLocale, type SiteLocale } from '@/lib/site-copy'

type OperationalPrivacyInput = {
  commentsEnabled: boolean
  commentsOrigin: string | null
  legalEmail: string | null
  locale: SiteLocale
  newsletterActionUrl: string | null
  observabilityScriptUrl: string | null
  ownerLocation: string | null
  ownerName: string | null
  siteOrigin: string | null
  storageKeys: {
    challengeCodePrefix: string
    challengeSolvedPrefix: string
    completedArticles: string
    focusModePreference: string
    localePreference: string
    themePreference: string
  }
}

type OperationalPrivacyCopy = {
  activeIntegrationsTitle: string
  browserStorageTitle: string
  checklistNoThirdParty: string
  checklistReviewConsent: string
  checklistReviewCsp: string
  checklistReviewLegalCopy: string
  checklistReviewProviderTerms: string
  commentsBody: string
  commentsLabel: string
  externalDependencyLabel: string
  firstPartyDependencyLabel: string
  firstPartyStorageSuffix: string
  missingContactWarning: string
  missingOperatorWarning: string
  newsletterBody: string
  newsletterLabel: string
  observabilityBody: string
  observabilityLabel: string
  originLabel: string
  publishWarningsTitle: string
  reviewChecklistTitle: string
  storageArticleProgress: string
  storageChallengeCode: string
  storageChallengeSolved: string
  storageFocusMode: string
  storageLocale: string
  storageTheme: string
  summaryNoThirdParty: string
  summaryThirdParty: (count: number) => string
  title: string
}

type OperationalPrivacyIntegration = {
  body: string
  id: 'comments' | 'newsletter' | 'observability'
  isThirdParty: boolean
  label: string
  origin: string | null
}

export type OperationalPrivacySnapshot = {
  activeIntegrationsTitle: string
  browserStorage: Array<{ key: string; value: string }>
  browserStorageTitle: string
  externalDependencyLabel: string
  firstPartyDependencyLabel: string
  hasThirdPartyIntegrations: boolean
  integrations: OperationalPrivacyIntegration[]
  originLabel: string
  publishWarnings: string[]
  publishWarningsTitle: string
  reviewChecklist: string[]
  reviewChecklistTitle: string
  summary: string
  title: string
}

const operationalPrivacyCopy: Record<string, OperationalPrivacyCopy> = {
  en: {
    activeIntegrationsTitle: 'Enabled integrations and providers',
    browserStorageTitle: 'Browser storage used by this shell',
    checklistNoThirdParty:
      'This deployment currently runs without third-party comments, newsletter delivery, or analytics scripts.',
    checklistReviewConsent:
      'Review whether comments, newsletter capture, or observability require consent or another lawful basis in the target jurisdiction before publishing.',
    checklistReviewCsp:
      'Confirm CSP, form-action, and external origins match every active provider before production.',
    checklistReviewLegalCopy:
      'Keep the privacy and terms pages aligned with the actual providers, data categories, and retention flows you enable.',
    checklistReviewProviderTerms:
      'Review the provider terms, moderation policy, retention, and DPA expectations for each external dependency.',
    commentsBody:
      'Loads the Giscus embed so readers can open GitHub-backed comments from the article page.',
    commentsLabel: 'Comments embed',
    externalDependencyLabel: 'External dependency',
    firstPartyDependencyLabel: 'First-party endpoint',
    firstPartyStorageSuffix: 'Stored only in the visitor browser.',
    missingContactWarning:
      'Legal/support contact is still missing. Publish a contact email before turning third-party features on in production.',
    missingOperatorWarning:
      'Operator identity still depends on template fallback values. Replace owner name and jurisdiction before publishing with third-party providers.',
    newsletterBody:
      'Posts subscriber email addresses to the configured newsletter endpoint for signup or mailing-list delivery.',
    newsletterLabel: 'Newsletter endpoint',
    observabilityBody:
      'Loads analytics tooling that may collect traffic, referral, browser metadata, heatmaps, and session replay data to improve the site experience.',
    observabilityLabel: 'Analytics and session replay',
    originLabel: 'Origin',
    publishWarningsTitle: 'Publish blockers to review',
    reviewChecklistTitle: 'Operational privacy checklist',
    storageArticleProgress:
      'Completed article IDs for progress and next-step recommendations.',
    storageChallengeCode:
      'Challenge playground drafts saved locally with a namespaced challenge-code key. ',
    storageChallengeSolved:
      'Solved challenge flags saved locally with a namespaced challenge-solved key. ',
    storageFocusMode: 'Focus mode preference used by the engineering guide.',
    storageLocale: 'Locale preference used for the shell language switcher.',
    storageTheme: 'Theme preference used for the light and dark appearance toggle.',
    summaryNoThirdParty:
      'This deployment currently uses only first-party browser storage for preferences and progress. No third-party comments, newsletter delivery, or observability scripts are active.',
    summaryThirdParty: (count) =>
      `This deployment currently exposes ${count} optional integration${count === 1 ? '' : 's'} that should be reviewed before publishing to production.`,
    title: 'Operational privacy status',
  },
  'pt-br': {
    activeIntegrationsTitle: 'Integracoes e provedores ativos',
    browserStorageTitle: 'Armazenamento no navegador usado pela shell',
    checklistNoThirdParty:
      'Esta instalacao roda sem comentarios de terceiros, entrega de newsletter ou scripts externos de analytics/observabilidade.',
    checklistReviewConsent:
      'Revise se comentarios, captura de newsletter ou observabilidade exigem consentimento ou outra base legal na jurisdicao alvo antes de publicar.',
    checklistReviewCsp:
      'Confirme CSP, form-action e origens externas para cada provedor ativo antes da producao.',
    checklistReviewLegalCopy:
      'Mantenha politica de privacidade e termos alinhados aos provedores, categorias de dados e fluxos de retencao realmente habilitados.',
    checklistReviewProviderTerms:
      'Revise termos do provedor, moderacao, retencao e exigencias de DPA para cada dependencia externa.',
    commentsBody:
      'Carrega o embed do Giscus para abrir comentarios baseados em GitHub na pagina do artigo.',
    commentsLabel: 'Embed de comentarios',
    externalDependencyLabel: 'Dependencia externa',
    firstPartyDependencyLabel: 'Endpoint de primeira parte',
    firstPartyStorageSuffix: 'Fica guardado apenas no navegador da pessoa.',
    missingContactWarning:
      'Contato juridico/suporte ainda nao foi configurado. Publique um email de contato antes de ligar recursos de terceiros em producao.',
    missingOperatorWarning:
      'A identidade do operador ainda depende de fallback de template. Troque nome do responsavel e jurisdicao antes de publicar com provedores de terceiros.',
    newsletterBody:
      'Envia emails de inscricao para o endpoint configurado de newsletter ou mailing list.',
    newsletterLabel: 'Endpoint de newsletter',
    observabilityBody:
      'Carrega tooling de analytics que pode coletar trafego, origem de visita, metadados do navegador, mapas de calor e session replay para melhorar a experiencia do site.',
    observabilityLabel: 'Analytics e session replay',
    originLabel: 'Origem',
    publishWarningsTitle: 'Pendencias para publicar',
    reviewChecklistTitle: 'Checklist operacional de privacidade',
    storageArticleProgress:
      'IDs de artigos concluidos para progresso e recomendacao de proximo passo.',
    storageChallengeCode:
      'Rascunhos do playground salvos localmente com chave namespaced de challenge-code. ',
    storageChallengeSolved:
      'Flags de desafios resolvidos salvas localmente com chave namespaced de challenge-solved. ',
    storageFocusMode: 'Preferencia do modo foco usada no guia de engenharia.',
    storageLocale: 'Preferencia de locale usada no seletor de idioma da shell.',
    storageTheme: 'Preferencia de tema usada no alternador de aparencia clara e escura.',
    summaryNoThirdParty:
      'Esta instalacao usa apenas armazenamento local de primeira parte para preferencias e progresso. Nenhum comentario de terceiros, entrega de newsletter ou script externo de observabilidade esta ativo.',
    summaryThirdParty: (count) =>
      `Esta instalacao expoe ${count} integracao${count === 1 ? '' : 'es'} opcional${count === 1 ? '' : 's'} que deve${count === 1 ? '' : 'm'} ser revisada${count === 1 ? '' : 's'} antes de publicar em producao.`,
    title: 'Estado operacional de privacidade',
  },
}

function getOperationalPrivacyCopy(locale: SiteLocale) {
  return operationalPrivacyCopy[getSiteLocale(locale)] ?? operationalPrivacyCopy.en
}

function tryGetOrigin(value: string | null | undefined) {
  try {
    return value ? new URL(value).origin : null
  } catch {
    return null
  }
}

function isThirdPartyOrigin(origin: string | null, siteOrigin: string | null) {
  return Boolean(origin && siteOrigin && origin !== siteOrigin)
}

function getConfiguredSiteOrigin() {
  return tryGetOrigin(
    siteConfig.site.productionSiteUrl !== DEFAULT_SITE_URL
      ? siteConfig.site.productionSiteUrl
      : siteConfig.site.siteUrl,
  )
}

export function buildOperationalPrivacySnapshot(
  input: OperationalPrivacyInput,
): OperationalPrivacySnapshot {
  const copy = getOperationalPrivacyCopy(input.locale)
  const integrations: OperationalPrivacyIntegration[] = []

  if (input.commentsEnabled && input.commentsOrigin) {
    integrations.push({
      body: copy.commentsBody,
      id: 'comments',
      isThirdParty: isThirdPartyOrigin(input.commentsOrigin, input.siteOrigin),
      label: copy.commentsLabel,
      origin: input.commentsOrigin,
    })
  }

  const newsletterOrigin = tryGetOrigin(input.newsletterActionUrl)

  if (newsletterOrigin) {
    integrations.push({
      body: copy.newsletterBody,
      id: 'newsletter',
      isThirdParty: isThirdPartyOrigin(newsletterOrigin, input.siteOrigin),
      label: copy.newsletterLabel,
      origin: newsletterOrigin,
    })
  }

  const observabilityOrigin = tryGetOrigin(input.observabilityScriptUrl)

  if (observabilityOrigin) {
    integrations.push({
      body: copy.observabilityBody,
      id: 'observability',
      isThirdParty: isThirdPartyOrigin(observabilityOrigin, input.siteOrigin),
      label: copy.observabilityLabel,
      origin: observabilityOrigin,
    })
  }

  const hasThirdPartyIntegrations = integrations.some((integration) => integration.isThirdParty)
  const hasOptionalIntegrations = integrations.length > 0
  const publishWarnings: string[] = []

  if (hasOptionalIntegrations && !input.legalEmail) {
    publishWarnings.push(copy.missingContactWarning)
  }

  if (hasOptionalIntegrations && (!input.ownerName || !input.ownerLocation)) {
    publishWarnings.push(copy.missingOperatorWarning)
  }

  const reviewChecklist = hasOptionalIntegrations
    ? [
        copy.checklistReviewLegalCopy,
        copy.checklistReviewConsent,
        copy.checklistReviewCsp,
        copy.checklistReviewProviderTerms,
      ]
    : [copy.checklistNoThirdParty]

  return {
    activeIntegrationsTitle: copy.activeIntegrationsTitle,
    browserStorage: [
      {
        key: input.storageKeys.localePreference,
        value: `${copy.storageLocale} ${copy.firstPartyStorageSuffix}`,
      },
      {
        key: input.storageKeys.themePreference,
        value: `${copy.storageTheme} ${copy.firstPartyStorageSuffix}`,
      },
      {
        key: input.storageKeys.focusModePreference,
        value: `${copy.storageFocusMode} ${copy.firstPartyStorageSuffix}`,
      },
      {
        key: input.storageKeys.completedArticles,
        value: `${copy.storageArticleProgress} ${copy.firstPartyStorageSuffix}`,
      },
      {
        key: `${input.storageKeys.challengeCodePrefix}.*`,
        value: `${copy.storageChallengeCode}${copy.firstPartyStorageSuffix}`,
      },
      {
        key: `${input.storageKeys.challengeSolvedPrefix}.*`,
        value: `${copy.storageChallengeSolved}${copy.firstPartyStorageSuffix}`,
      },
    ],
    browserStorageTitle: copy.browserStorageTitle,
    externalDependencyLabel: copy.externalDependencyLabel,
    firstPartyDependencyLabel: copy.firstPartyDependencyLabel,
    hasThirdPartyIntegrations,
    integrations,
    originLabel: copy.originLabel,
    publishWarnings,
    publishWarningsTitle: copy.publishWarningsTitle,
    reviewChecklist,
    reviewChecklistTitle: copy.reviewChecklistTitle,
    summary:
      integrations.length > 0
        ? copy.summaryThirdParty(integrations.length)
        : copy.summaryNoThirdParty,
    title: copy.title,
  }
}

export function getOperationalPrivacySnapshot(locale?: SiteLocale) {
  const resolvedLocale = getSiteLocale(locale)
  const { legalEmail, supportEmail } = getLegalContactLinks()
  const observabilityScriptConfig = getObservabilityScriptConfig()

  return buildOperationalPrivacySnapshot({
    commentsEnabled:
      hasCommentsEnabled()
      && [
        import.meta.env.PUBLIC_GISCUS_REPO,
        import.meta.env.PUBLIC_GISCUS_REPO_ID,
        import.meta.env.PUBLIC_GISCUS_CATEGORY,
        import.meta.env.PUBLIC_GISCUS_CATEGORY_ID,
      ].every(Boolean),
    commentsOrigin: 'https://giscus.app',
    legalEmail: legalEmail?.value ?? supportEmail?.value ?? null,
    locale: resolvedLocale,
    newsletterActionUrl: getNewsletterActionUrl(),
    observabilityScriptUrl:
      observabilityScriptConfig?.src
      ?? (observabilityScriptConfig?.clarityProjectId ? 'https://www.clarity.ms/tag/' : null),
    ownerLocation: siteConfig.legal.ownerLocation,
    ownerName: siteConfig.legal.ownerName,
    siteOrigin: getConfiguredSiteOrigin(),
    storageKeys: siteStorageKeys,
  })
}
