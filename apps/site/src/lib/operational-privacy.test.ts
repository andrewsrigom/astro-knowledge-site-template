import { describe, expect, it } from 'vitest'

import { buildOperationalPrivacySnapshot } from '@/lib/operational-privacy'

describe('buildOperationalPrivacySnapshot', () => {
  it('reports a first-party-only deployment when no optional integrations are active', () => {
    const snapshot = buildOperationalPrivacySnapshot({
      commentsEnabled: false,
      commentsOrigin: null,
      legalEmail: null,
      locale: 'en',
      newsletterActionUrl: null,
      observabilityScriptUrl: null,
      ownerLocation: null,
      ownerName: null,
      siteOrigin: 'https://seniorpath.dev',
      storageKeys: {
        challengeCodePrefix: 'site-template.challenge-code',
        challengeSolvedPrefix: 'site-template.challenge-solved',
        completedArticles: 'site-template.completed-articles.v1',
        focusModePreference: 'site-template.guide-focus-mode.v1',
        localePreference: 'site-template.locale-preference.v1',
        themePreference: 'site-template.theme-preference.v1',
      },
    })

    expect(snapshot.integrations).toHaveLength(0)
    expect(snapshot.hasThirdPartyIntegrations).toBe(false)
    expect(snapshot.reviewChecklist).toEqual([
      'This deployment currently runs without third-party comments, newsletter delivery, or analytics scripts.',
    ])
    expect(snapshot.publishWarnings).toEqual([])
    expect(snapshot.browserStorage.map((item) => item.key)).toEqual([
      'site-template.locale-preference.v1',
      'site-template.theme-preference.v1',
      'site-template.guide-focus-mode.v1',
      'site-template.completed-articles.v1',
      'site-template.challenge-code.*',
      'site-template.challenge-solved.*',
    ])
  })

  it('flags third-party integrations and missing publish contacts', () => {
    const snapshot = buildOperationalPrivacySnapshot({
      commentsEnabled: true,
      commentsOrigin: 'https://giscus.app',
      legalEmail: null,
      locale: 'en',
      newsletterActionUrl: 'https://buttondown.email/api/emails/embed-subscribe/test',
      observabilityScriptUrl: 'https://plausible.io/js/script.js',
      ownerLocation: null,
      ownerName: null,
      siteOrigin: 'https://seniorpath.dev',
      storageKeys: {
        challengeCodePrefix: 'site-template.challenge-code',
        challengeSolvedPrefix: 'site-template.challenge-solved',
        completedArticles: 'site-template.completed-articles.v1',
        focusModePreference: 'site-template.guide-focus-mode.v1',
        localePreference: 'site-template.locale-preference.v1',
        themePreference: 'site-template.theme-preference.v1',
      },
    })

    expect(snapshot.integrations).toHaveLength(3)
    expect(snapshot.hasThirdPartyIntegrations).toBe(true)
    expect(snapshot.reviewChecklist).toContain(
      'Review whether comments, newsletter capture, or observability require consent or another lawful basis in the target jurisdiction before publishing.',
    )
    expect(snapshot.publishWarnings).toEqual([
      'Legal/support contact is still missing. Publish a contact email before turning third-party features on in production.',
      'Operator identity still depends on template fallback values. Replace owner name and jurisdiction before publishing with third-party providers.',
    ])
  })

  it('keeps the checklist active for first-party optional integrations', () => {
    const snapshot = buildOperationalPrivacySnapshot({
      commentsEnabled: false,
      commentsOrigin: null,
      legalEmail: 'legal@example.com',
      locale: 'en',
      newsletterActionUrl: 'https://seniorpath.dev/newsletter/subscribe',
      observabilityScriptUrl: null,
      ownerLocation: 'Brazil',
      ownerName: 'Site Operator',
      siteOrigin: 'https://seniorpath.dev',
      storageKeys: {
        challengeCodePrefix: 'site-template.challenge-code',
        challengeSolvedPrefix: 'site-template.challenge-solved',
        completedArticles: 'site-template.completed-articles.v1',
        focusModePreference: 'site-template.guide-focus-mode.v1',
        localePreference: 'site-template.locale-preference.v1',
        themePreference: 'site-template.theme-preference.v1',
      },
    })

    expect(snapshot.hasThirdPartyIntegrations).toBe(false)
    expect(snapshot.integrations).toHaveLength(1)
    expect(snapshot.reviewChecklist).toContain(
      'Confirm CSP, form-action, and external origins match every active provider before production.',
    )
    expect(snapshot.publishWarnings).toEqual([])
  })
})
