const metaQuiet = 'm-0 text-[0.82rem] leading-6 tracking-[0.03em] text-site-ink-muted lg:text-[0.9rem]'
const dialogHint = 'm-0 text-[0.76rem] uppercase tracking-[0.12em] text-site-ink-muted lg:text-[0.84rem]'
const filterLabel = 'm-0 mb-2 text-[0.72rem] font-bold uppercase tracking-[0.22em] text-site-ink-subtle lg:text-[0.8rem]'
const progressMeta = 'm-0 text-[0.82rem] font-medium tracking-[0.03em] text-site-ink-soft lg:text-[0.9rem]'
const progressStatus = 'm-0 text-[0.88rem] font-semibold leading-6 text-site-ink lg:text-[0.96rem]'
const shareLabel = 'm-0 text-[0.8rem] font-medium uppercase tracking-[0.22em] text-site-ink-soft lg:text-[0.88rem]'

export const uiTypography = {
  articleBylineName: 'm-0 [font-family:var(--notebook-font-hand)] text-(--notebook-hand-md) font-bold text-article-heading',
  articleExcerpt: 'm-0 mt-3 max-w-[60ch] [font-family:var(--notebook-font-book)] text-[1.02rem] leading-[1.7] text-article-excerpt lg:text-[1.15rem]',
  articleHeaderTagTone: 'text-[0.75rem] leading-6 tracking-[0.04em] text-article-tag-tone',
  articleKicker: metaQuiet,
  articleMeta: 'm-0 text-sm leading-6 text-article-body lg:text-[0.96rem]',
  articleMetaSubtle: metaQuiet,
  articleTitle:
    'my-3 [font-family:var(--notebook-font-book)] text-[clamp(2.3rem,4vw,3.75rem)] font-semibold leading-[1.06] tracking-[-0.035em] text-article-heading',
  bodyCopy: 'm-0 [font-family:var(--notebook-font-book)] leading-[1.62] text-site-ink-soft lg:text-[1.04rem] lg:leading-7',
  cardDescription: 'm-0 [font-family:var(--notebook-font-book)] text-[0.84rem] leading-6 text-site-ink-soft lg:text-[0.93rem] lg:leading-7',
  cardEyebrow: 'm-0 mb-1 [font-family:var(--notebook-font-hand)] text-(--notebook-hand-xs) font-bold uppercase tracking-[0.12em] text-site-link-hover',
  cardMeta: 'm-0 text-[0.76rem] font-medium tracking-[0.04em] text-site-ink-muted lg:text-[0.84rem]',
  cardMetaCaps: 'mt-auto text-[0.72rem] uppercase tracking-[0.08em] text-site-ink-muted lg:text-[0.8rem]',
  dialogHint,
  eyebrow: 'm-0 mb-2 [font-family:var(--notebook-font-hand)] text-(--notebook-hand-sm) font-bold uppercase tracking-[0.12em] text-site-link-hover',
  eyebrowSentence: 'm-0 [font-family:var(--notebook-font-hand)] text-(--notebook-hand-sm) font-medium text-site-ink-muted',
  filterLabel,
  footerLink: 'w-fit [font-family:var(--notebook-font-hand)] text-(--notebook-hand-md) font-medium leading-6 text-site-ink underline decoration-dashed underline-offset-4 transition-colors duration-150 hover:text-site-link-hover focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-dashed focus-visible:outline-site-link-hover',
  heading:
    'm-0 [font-family:var(--notebook-font-book)] text-[clamp(1.7rem,5vw,2.35rem)] font-semibold tracking-[-0.028em] text-site-ink lg:text-[clamp(1.9rem,3vw,2.55rem)]',
  headingCompact:
    'm-0 [font-family:var(--notebook-font-book)] text-[clamp(1.35rem,4vw,1.86rem)] font-semibold leading-[1.08] tracking-[-0.014em] text-site-ink lg:text-[clamp(1.5rem,2.5vw,2rem)]',
  linearItemTitle: 'm-0 [font-family:var(--notebook-font-book)] text-base font-semibold leading-[1.3] lg:text-[1.1rem]',
  linkCardTitle: 'm-0 [font-family:var(--notebook-font-book)] text-lg font-semibold leading-[1.12] tracking-[-0.012em] lg:text-[1.22rem]',
  metaQuiet,
  nextReadTitle: 'm-0 text-[0.98rem] leading-[1.2] lg:text-[1.08rem]',
  progressMeta,
  progressStatus,
  shareLabel,
} as const
