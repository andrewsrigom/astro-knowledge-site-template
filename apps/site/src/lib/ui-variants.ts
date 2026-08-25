import { cva } from 'class-variance-authority'

import { cn } from '@/lib/cn'
import { ui } from '@/lib/ui'

export const navLinkVariants = cva(
  'inline-flex min-h-8 items-center justify-center rounded-md px-[0.45rem] py-[0.3rem] [font-family:var(--cad-font-hand)] text-(--cad-hand-sm) font-medium text-site-ink transition-colors duration-150 hover:bg-site-hover hover:text-site-link-hover focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-dashed focus-visible:outline-site-link-hover nav:min-h-9 nav:px-3 nav:py-2 lg:min-h-10 lg:px-3.5',
  {
    variants: {
      active: {
        false: '',
        true: 'underline decoration-2 underline-offset-[0.28em]',
      },
    },
    defaultVariants: {
      active: false,
    },
  },
)

export const filterChipVariants = cva(
  'inline-flex min-h-[2.05rem] cursor-pointer items-center justify-center rounded-md border border-dashed border-site-line-strong bg-[color-mix(in_srgb,var(--chip-accent-dark,var(--site-surface-strong))_34%,transparent)] px-3 py-1.5 [font-family:var(--cad-font-hand)] text-(--cad-hand-xs) font-semibold text-site-ink transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-dashed focus-visible:outline-site-link-hover lg:min-h-[2.3rem] lg:px-3.5',
  {
    variants: {
      active: {
        false: '',
        true: 'border-site-line-strong bg-site-accent/20 text-site-link-hover',
      },
    },
    defaultVariants: {
      active: false,
    },
  },
)

export const directoryListVariants = cva('', {
  variants: {
    layout: {
      rows: ui.linearList,
      cards: ui.titleCardList,
    },
  },
  defaultVariants: {
    layout: 'cards',
  },
})

export const directoryLinkVariants = cva('', {
  variants: {
    layout: {
      rows: ui.linearCardInteractive,
      cards: ui.titleCardLink,
    },
  },
  defaultVariants: {
    layout: 'cards',
  },
})

export const linkCardVariants = cva('', {
  variants: {
    variant: {
      compact:
        'group grid gap-2 rounded-md px-3 py-2 text-inherit transition-colors duration-150 hover:bg-site-hover hover:text-site-link-hover focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-dashed focus-visible:outline-site-link-hover',
      ghost:
        'group block rounded-md p-3 text-inherit transition-colors duration-150 hover:bg-site-hover hover:text-site-link-hover focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-dashed focus-visible:outline-site-link-hover',
      panel: ui.titleCardLink,
    },
  },
  defaultVariants: {
    variant: 'panel',
  },
})

export const linkCardHeaderVariants = cva('', {
  variants: {
    showArrow: {
      false: 'grid gap-1',
      true: 'flex items-center justify-between gap-4',
    },
  },
  defaultVariants: {
    showArrow: true,
  },
})

export const articleCardArticleVariants = cva('group relative h-full bg-transparent', {
  variants: {
    variant: {
      linear: 'border-t border-site-line',
      minimal: '',
      rich: '',
    },
  },
  defaultVariants: {
    variant: 'minimal',
  },
})

export const articleCardLinkVariants = cva(
  'text-inherit transition-colors duration-150 hover:bg-site-hover hover:text-site-link-hover focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-dashed focus-visible:outline-site-link-hover',
  {
    variants: {
      variant: {
        linear: ui.linearCardInteractive,
        minimal: 'block rounded-md p-3',
        rich: 'grid min-h-[8.8rem] gap-1.5 rounded-md border border-dashed border-site-line-strong bg-site-card p-4 shadow-sm',
      },
    },
    defaultVariants: {
      variant: 'minimal',
    },
  },
)

export const articleCardTitleVariants = cva(cn(ui.linearItemTitle, 'transition-colors duration-150'), {
  variants: {
    variant: {
      linear: 'text-base',
      minimal: '',
      rich: '',
    },
  },
  defaultVariants: {
    variant: 'minimal',
  },
})

export const eyebrowVariants = cva('', {
  variants: {
    tone: {
      caps: ui.cardEyebrow,
      sentence: ui.metaQuiet,
    },
  },
  defaultVariants: {
    tone: 'caps',
  },
})
