const interactiveTone =
  'text-inherit transition-[color,background-color,border-color,transform] duration-150 hover:bg-site-hover hover:text-site-link-hover focus-visible:bg-site-hover focus-visible:text-site-link-hover focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-dashed focus-visible:outline-site-link-hover'
const linearCard =
  'relative -mx-[0.45rem] grid gap-[0.35rem] rounded-xs px-[0.45rem] py-[0.8rem] md:pr-38 lg:gap-2 lg:px-[0.55rem] lg:py-[0.95rem] lg:pr-41'
const completionBadgeBase =
  'site-completion-badge pointer-events-none absolute inline-flex items-center justify-center rounded-full font-semibold transition-all duration-150'
const completionDesktopCta =
  'absolute right-0 inline-flex translate-x-1 items-center gap-1.5 whitespace-nowrap text-[0.76rem] font-medium tracking-[0.04em] text-site-ink-muted opacity-0 transition-all duration-150 lg:gap-2 lg:text-[0.84rem]'

export const uiRecipes = {
  actionLink:
    'inline-flex items-center rounded-xs px-2.5 py-1.5 [font-family:var(--notebook-font-hand)] text-(--notebook-hand-sm) font-semibold text-site-ink transition-colors duration-150 hover:bg-site-hover hover:text-site-link-hover focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-dashed focus-visible:outline-site-link-hover',
  badge:
    'inline-flex min-h-8 items-center rounded-md border border-dashed border-site-line-strong bg-site-card px-3 py-1 [font-family:var(--notebook-font-hand)] text-(--notebook-hand-xs) font-semibold uppercase tracking-widest text-site-ink lg:min-h-[2.15rem] lg:px-3.5',
  badgeLink:
    'transition-colors duration-150 hover:border-site-line-strong hover:bg-site-hover hover:text-site-link-hover',
  cardButton:
    'group inline-flex w-fit items-center gap-2 rounded-md border border-dashed border-site-line-strong bg-site-card px-3.5 py-2 [font-family:var(--notebook-font-hand)] text-(--notebook-hand-sm) font-medium text-site-ink transition-colors duration-150 hover:bg-site-hover hover:text-site-link-hover focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-dashed focus-visible:outline-site-link-hover lg:px-4 lg:py-2.5',
  completionBadgeCard: `${completionBadgeBase} right-4 top-4 size-8 text-[0.98rem] lg:size-9 lg:text-[1.08rem]`,
  completionBadgeLinear: `${completionBadgeBase} right-3 top-3.5 size-7 text-[0.92rem] lg:right-4 lg:top-1/2 lg:size-9 lg:-translate-y-1/2 lg:text-[1.08rem]`,
  completionDesktopCta,
  completionDesktopCtaInteractive: `${completionDesktopCta} group-hover:translate-x-0 group-hover:opacity-100 group-hover:text-site-link-hover group-focus-within:translate-x-0 group-focus-within:opacity-100 group-focus-within:text-site-link-hover`,
  completionRailInlineMd: 'pointer-events-none absolute right-4 top-1/2 hidden w-34 -translate-y-1/2 items-center justify-end md:inline-flex lg:w-37',
  completionRailLg: 'pointer-events-none absolute right-4 top-1/2 hidden w-37 -translate-y-1/2 items-center justify-end lg:inline-flex',
  completionRailMd: 'pointer-events-none absolute right-4 top-1/2 hidden w-37 -translate-y-1/2 items-center justify-end md:inline-flex',
  contentKindBadge:
    'inline-flex w-fit items-center rounded-md border border-dashed border-site-line-strong bg-site-card px-2.5 py-1 [font-family:var(--notebook-font-hand)] text-(--notebook-hand-xs) font-semibold uppercase tracking-widest text-site-ink-subtle lg:px-3',
  controlButton:
    'inline-flex items-center justify-center rounded-md border border-dashed border-site-line-strong bg-site-panel [font-family:var(--notebook-font-hand)] text-site-ink transition-colors duration-150 hover:bg-site-hover hover:text-site-link-hover focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-dashed focus-visible:outline-site-link-hover',
  dropdownMenu:
    'site-dropdown-shadow absolute right-0 top-[calc(100%+0.6rem)] z-30 grid gap-1 rounded-md border border-dashed border-site-line-strong bg-site-panel p-2',
  dropdownTrigger:
    'inline-flex min-h-9 cursor-pointer list-none items-center justify-center gap-1.5 rounded-md px-2 py-2 [font-family:var(--notebook-font-hand)] text-(--notebook-hand-sm) font-medium text-site-ink transition-colors duration-150 hover:bg-site-hover hover:text-site-link-hover focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-dashed focus-visible:outline-site-link-hover lg:min-h-10 lg:px-2.5 [&::-webkit-details-marker]:hidden',
  highlightBadge:
    'inline-flex items-center rounded-full border border-site-highlight-badge-border bg-site-highlight-badge px-2 py-[0.18rem] text-[0.54rem] font-bold uppercase tracking-[0.18em] text-site-highlight-badge-ink',
  iconButton:
    'inline-flex size-11 items-center justify-center rounded-[48%_52%_46%_54%] border border-dashed border-site-line-strong bg-site-card text-site-ink transition-colors duration-150 hover:bg-site-hover hover:text-site-link-hover focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-dashed focus-visible:outline-site-link-hover lg:size-12',
  inlineCta:
    'mt-0.5 inline-flex items-center gap-1.5 whitespace-nowrap text-[0.76rem] font-medium tracking-[0.04em] text-site-ink-muted transition-colors duration-150 group-hover:text-site-link-hover group-focus-within:text-site-link-hover lg:text-[0.84rem]',
  linearCard,
  linearCardInteractive: `${linearCard} ${interactiveTone}`,
  linearRow: 'group h-full border-t border-dashed border-site-line-strong bg-transparent first:border-t-0',
  navCardLink: `flex h-full items-center gap-3 rounded-md border border-dashed border-site-line-strong px-3 py-3 ${interactiveTone}`,
  navMenuLink:
    'block rounded-md px-3 py-3 [font-family:var(--notebook-font-hand)] text-(--notebook-hand-sm) font-medium text-site-ink transition-colors duration-150 hover:bg-site-hover hover:text-site-link-hover focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-dashed focus-visible:outline-site-link-hover lg:px-3.5 lg:py-3.5',
  navMenuRowLink:
    'flex items-center gap-2.5 rounded-md px-3 py-3 [font-family:var(--notebook-font-hand)] text-(--notebook-hand-sm) font-medium text-site-ink transition-colors duration-150 hover:bg-site-hover hover:text-site-link-hover focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-dashed focus-visible:outline-site-link-hover lg:gap-3 lg:px-3.5 lg:py-3.5',
  navPillLink:
    'inline-flex min-h-9 items-center justify-center gap-2 rounded-md px-2 py-2 [font-family:var(--notebook-font-hand)] text-(--notebook-hand-sm) font-medium text-site-ink transition-colors duration-150 hover:bg-site-hover hover:text-site-link-hover focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-dashed focus-visible:outline-site-link-hover lg:min-h-10 lg:px-2.5',
  panel: 'rounded-md border border-dashed border-site-line-strong bg-site-panel',
  progressBar: 'site-progress-bar h-full w-0 rounded-full transition-[width,background,box-shadow] duration-200',
  progressBarSolid: 'site-progress-fill h-full w-0 rounded-full transition-[width] duration-150 ease-out',
  progressTrack: 'site-progress-track h-1.5 overflow-hidden rounded-full',
  progressTrackStrong: 'site-progress-track-strong h-2 overflow-hidden rounded-full',
  quietAction:
    'w-fit [font-family:var(--notebook-font-hand)] text-(--notebook-hand-xs) font-medium text-site-ink-muted transition-colors duration-150 hover:text-site-link-hover focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-dashed focus-visible:outline-site-link-hover',
  searchDialog:
    'flex h-dvh w-screen max-w-none flex-col overflow-hidden bg-site-panel nav:site-overlay-shadow nav:mx-auto nav:my-[6vh] nav:h-[min(84dvh,42rem)] nav:max-h-[min(84dvh,42rem)] nav:w-full nav:max-w-184 nav:rounded-md nav:border nav:border-dashed nav:border-site-line-strong lg:max-w-200',
  searchResultLink: `grid gap-1 rounded-xs px-3 py-3 ${interactiveTone} lg:gap-1.5 lg:px-4 lg:py-3.5`,
  spotlightPanel:
    'grid gap-4 rounded-md border border-dashed border-site-line-strong bg-site-panel-spotlight px-4 py-4 lg:px-5 lg:py-5',
  subtlePanelLink:
    'group grid gap-2 rounded-md border border-dashed border-site-line-strong bg-site-panel-muted px-3 py-3 text-inherit transition-colors duration-150 hover:bg-site-hover hover:text-site-link-hover focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-dashed focus-visible:outline-site-link-hover',
  titleCardLink:
    'group relative block rounded-md border border-dashed border-site-line-strong bg-site-panel px-5 py-6 text-inherit shadow-sm transition-[color,background-color,border-color,transform,box-shadow] duration-150 hover:-translate-y-0.5 hover:bg-site-hover hover:text-site-link-hover hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-dashed focus-visible:outline-site-link-hover lg:px-6 lg:py-7',
  toolbar: 'grid gap-2 border-y border-dashed border-site-line-strong bg-transparent px-1 py-5 lg:gap-3 lg:py-6',
} as const
