import type { CollectionEntry } from 'astro:content'

import {
  getPreparationPracticeContext,
  resolvePreparationBook,
  type PreparationPracticeContext,
  type ResolvedPreparationBook,
} from '@/lib/preparation-book'
import { isVisibleContentStatus } from '@/lib/content-visibility'
import {
  getPreparationCatalogCollection,
  getVisibleChallengesByLocale,
  getVisiblePreparationByLocale,
} from '@/lib/site-content'

export type PreparationPracticePageContext = {
  book: ResolvedPreparationBook
  owner: PreparationPracticeContext
}

const preparationBookByLocale = new Map<string, Promise<ResolvedPreparationBook | null>>()

function getVisiblePreparationBook(locale: string) {
  let bookPromise = preparationBookByLocale.get(locale)

  if (!bookPromise) {
    bookPromise = (async () => {
      const catalogs = await getPreparationCatalogCollection()
      const catalog = catalogs.find((entry) =>
        entry.data.locale === locale
        && isVisibleContentStatus(entry.data.status, import.meta.env.DEV),
      )

      if (!catalog) {
        return null
      }

      const [preparation, challenges] = await Promise.all([
        getVisiblePreparationByLocale(locale),
        getVisibleChallengesByLocale(locale),
      ])

      return resolvePreparationBook(catalog.data, preparation, challenges)
    })()
    preparationBookByLocale.set(locale, bookPromise)
  }

  return bookPromise
}

export async function getPreparationPracticePageContext(
  challenge: CollectionEntry<'challenges'>,
): Promise<PreparationPracticePageContext | null> {
  const book = await getVisiblePreparationBook(challenge.data.locale)

  if (!book) {
    return null
  }

  const owner = getPreparationPracticeContext(book, challenge.data.challengeId)

  return owner ? { book, owner } : null
}
