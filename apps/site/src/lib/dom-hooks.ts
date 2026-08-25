type DataHook<Name extends string> = {
  attr: Name
  selector: `[${Name}]`
}

type IdHook<Name extends string> = {
  id: Name
  selector: `#${Name}`
}

type SelectorHook = {
  selector: string
}

function createDataHook<Name extends string>(attr: Name): DataHook<Name> {
  return {
    attr,
    selector: `[${attr}]`,
  }
}

function createIdHook<Name extends string>(id: Name): IdHook<Name> {
  return {
    id,
    selector: `#${id}`,
  }
}

export const completionDomHooks = {
  completeBadge: createDataHook('data-article-post-complete-badge'),
  completeText: createDataHook('data-article-post-complete-text'),
  defaultText: createDataHook('data-article-post-default-cta'),
  item: createDataHook('data-article-post'),
  mobileCompleteText: createDataHook('data-article-post-mobile-complete-text'),
  mobileDefaultText: createDataHook('data-article-post-mobile-default-cta'),
  title: createDataHook('data-card-title'),
} as const

export const sharedDomHooks = {
  controllerId: createDataHook('data-controller-id'),
} as const

export const layoutDomHooks = {
  newsletterEmail: createIdHook('newsletter-email'),
  newsletterMirror: createDataHook('data-newsletter-email-mirror'),
} as const

export const desktopLocaleMenuDomHooks = {
  link: createDataHook('data-desktop-locale-link'),
  trigger: createDataHook('data-desktop-locale-trigger'),
} as const

export const mobileNavMenuDomHooks = {
  panel: createDataHook('data-mobile-nav-panel'),
  root: createDataHook('data-mobile-nav-root'),
  trigger: createDataHook('data-mobile-nav-trigger'),
} as const

export const directoryFilterDomHooks = {
  noJsNote: createDataHook('data-directory-filter-no-js'),
} as const

export const articleCompletionSummaryDomHooks = {
  nextStepLink: createDataHook('data-completion-next-step-link'),
  nextStepSection: createDataHook('data-completion-next-step-section'),
  nextStepTitle: createDataHook('data-completion-next-step-title'),
  markUnread: createDataHook('data-completion-mark-unread'),
  recommendationCandidates: createDataHook('data-completion-recommendation-candidates'),
  relatedItem: createDataHook('data-completion-related-item'),
  relatedItemClass: createDataHook('data-completion-related-item-class'),
  relatedList: createDataHook('data-completion-related-list'),
  relatedSection: createDataHook('data-completion-related-section'),
  root: createDataHook('data-article-completion-summary'),
} as const

export const articleCompletionPanelDomHooks = {
  completionId: createDataHook('data-completion-id'),
  root: createDataHook('data-article-completion-panel'),
} as const

export const challengePlaygroundDomHooks = {
  allPassingBadge: createDataHook('data-challenge-all-passing'),
  noJsFallback: createDataHook('data-challenge-playground-no-js'),
  shareUrl: createDataHook('data-challenge-share-url'),
  root: createDataHook('data-challenge-playground'),
  runButton: createDataHook('data-challenge-run'),
  storageWarning: createDataHook('data-challenge-storage-warning'),
} as const

export const articleShareDomHooks = {
  copyButton: createDataHook('data-share-copy'),
  copyLinkError: createDataHook('data-copy-link-error'),
  copyLinkManual: createDataHook('data-copy-link-manual'),
  copyLinkSuccess: createDataHook('data-copy-link-success'),
  description: createDataHook('data-share-description'),
  fallback: createDataHook('data-share-fallback'),
  feedback: createDataHook('data-share-feedback'),
  manualInput: createDataHook('data-share-manual-input'),
  manualSection: createDataHook('data-share-manual-section'),
  nativeButton: createDataHook('data-share-native'),
  ready: createDataHook('data-share-ready'),
  root: createDataHook('data-article-share'),
  title: createDataHook('data-share-title'),
  url: createDataHook('data-share-url'),
} as const

export const articleReadingDomHooks = {
  content: createDataHook('data-article-reading-content'),
  end: createDataHook('data-article-reading-end'),
} as const

export const articleStickyMetaDomHooks = {
  mobileReadingProgress: createDataHook('data-mobile-reading-progress'),
  mobileReadingProgressBar: createDataHook('data-mobile-reading-progress-bar'),
  mobileReadingProgressValue: createDataHook('data-mobile-reading-progress-value'),
  readingProgress: createDataHook('data-reading-progress'),
  readingProgressBar: createDataHook('data-reading-progress-bar'),
  readingProgressValue: createDataHook('data-reading-progress-value'),
  root: createDataHook('data-toc-root'),
  showCompletionInPlace: createDataHook('data-show-completion-in-place'),
  stickyDirection: createDataHook('data-sticky-direction'),
  tocLink: createDataHook('data-toc-link'),
  tocSection: createDataHook('data-toc-section'),
  tocSlug: createDataHook('data-toc-slug'),
} as const

export const trackProgressDomHooks = {
  completedLabel: createDataHook('data-track-completed-label'),
  continueLabel: createDataHook('data-track-continue-label'),
  cta: createDataHook('data-track-progress-cta'),
  ctaLabel: createDataHook('data-track-progress-cta-label'),
  item: createDataHook('data-track-progress-item'),
  itemHref: createDataHook('data-track-href'),
  itemId: createDataHook('data-track-item'),
  nextDefaultHref: createDataHook('data-track-next-default-href'),
  nextLink: createDataHook('data-track-next-link'),
  nextTrackLabel: createDataHook('data-track-next-track-label'),
  nextText: createDataHook('data-track-next-text'),
  noJsNote: createDataHook('data-track-progress-no-js'),
  ofLabel: createDataHook('data-of-label'),
  overallIcon: createDataHook('data-track-overall-icon'),
  overallText: createDataHook('data-track-overall-text'),
  progressBar: createDataHook('data-track-progress-bar'),
  progressLabel: createDataHook('data-progress-label'),
  progressStatus: createDataHook('data-track-progress-status'),
  progressValue: createDataHook('data-track-progress-value'),
  reviewLabel: createDataHook('data-review-label'),
  root: createDataHook('data-track-progress-root'),
  stepLabel: createDataHook('data-step-label'),
} as const

export const trackPageDomHooks = {
  concept: createDataHook('data-track-concept'),
  conceptTitle: createDataHook('data-track-concept-title'),
} as const

export const solutionRevealDomHooks = {
  confirmButton: createDataHook('data-solution-reveal-confirm'),
  content: createDataHook('data-solution-reveal-content'),
  noJsDetails: createDataHook('data-solution-reveal-no-js'),
  triggerButton: createDataHook('data-solution-reveal-trigger'),
} as const

export const searchLauncherDomHooks = {
  desktopTrigger: createDataHook('data-search-launcher-desktop-trigger'),
  dialog: createDataHook('data-search-launcher-dialog'),
  input: createDataHook('data-search-launcher-input'),
  mobileTrigger: createDataHook('data-search-launcher-mobile-trigger'),
  noJsFallback: createDataHook('data-search-launcher-no-js-fallback'),
  resultLink: createDataHook('data-search-launcher-result-link'),
} as const

export const recentUpdatesDomHooks = {
  item: createDataHook('data-recent-updates-item'),
  root: createDataHook('data-recent-updates-root'),
} as const

export const legalPageDomHooks = {
  operationalReview: createDataHook('data-legal-operational-review'),
  publicationChecklist: createDataHook('data-legal-publication-checklist'),
} as const

export function getDataHookAttributes<Name extends string>(
  hook: DataHook<Name>,
  value: string | null | undefined = '',
) {
  if (value == null) {
    return {}
  }

  return { [hook.attr]: value } as Record<Name, string>
}

export function readDataHookValue(hook: DataHook<string>, element: Element) {
  return element.getAttribute(hook.attr) ?? ''
}

function escapeSelectorValue(value: string) {
  if (typeof CSS !== 'undefined' && typeof CSS.escape === 'function') {
    return CSS.escape(value)
  }

  return value.replaceAll('\\', '\\\\').replaceAll('"', '\\"')
}

export function getScopedDataHookSelector(
  rootHook: DataHook<string>,
  scopedHook: DataHook<string>,
  value: string,
) {
  return `${rootHook.selector}[${scopedHook.attr}="${escapeSelectorValue(value)}"]`
}

export function queryScopedByHook<T extends Element>(
  scope: ParentNode,
  rootHook: DataHook<string>,
  scopedHook: DataHook<string>,
  value: string,
) {
  return scope.querySelector<T>(getScopedDataHookSelector(rootHook, scopedHook, value))
}

export function queryByHook<T extends Element>(scope: ParentNode, hook: SelectorHook) {
  return scope.querySelector<T>(hook.selector)
}

export function queryAllByHook<T extends Element>(scope: ParentNode, hook: SelectorHook) {
  return Array.from(scope.querySelectorAll<T>(hook.selector))
}

export function closestByHook<T extends Element>(element: Element, hook: SelectorHook) {
  return element.closest<T>(hook.selector)
}
