import type { CollectionEntry } from 'astro:content'

import { getChallengeHrefFromEntry } from '@/lib/challenge-links'
import { getPreparationSubjectHref } from '@/lib/preparation-links'

export type PreparationCatalogData = CollectionEntry<'preparationCatalogs'>['data']
export type PreparationBookVolumeData = PreparationCatalogData['volumes'][number]
export type PreparationBookPartData = PreparationBookVolumeData['parts'][number]
export type PreparationEntry = CollectionEntry<'preparation'>
export type PreparationChallengeEntry = CollectionEntry<'challenges'>

export type ResolvedPreparationChapter = {
  guide: PreparationEntry
  guideId: string
  href: string
  order: number
  partId: string
  partTitle: string
  volumeId: string
  volumeTitle: string
}

export type ResolvedPreparationPractice = {
  challenge: PreparationChallengeEntry
  challengeId: string
  href: string
  order: number
}

export type ResolvedPreparationReference = PreparationBookPartData['references'][number] & {
  href: string
  title: string
}

export type ResolvedPreparationPart = Omit<PreparationBookPartData, 'chapters' | 'practices' | 'references'> & {
  chapters: ResolvedPreparationChapter[]
  practices: ResolvedPreparationPractice[]
  references: ResolvedPreparationReference[]
}

export type ResolvedPreparationVolume = Omit<PreparationBookVolumeData, 'parts'> & {
  parts: ResolvedPreparationPart[]
}

export type ResolvedPreparationBook = {
  catalog: PreparationCatalogData
  chapters: ResolvedPreparationChapter[]
  volumes: ResolvedPreparationVolume[]
}

export type PreparationChapterContext = {
  chapter: ResolvedPreparationChapter
  nextChapter: ResolvedPreparationChapter | null
  part: ResolvedPreparationPart
  previousChapter: ResolvedPreparationChapter | null
  volume: ResolvedPreparationVolume
}

export type PreparationPracticeContext = {
  part: ResolvedPreparationPart
  practice: ResolvedPreparationPractice
  volume: ResolvedPreparationVolume
}

export type PreparationGlossaryReference = {
  chapter: ResolvedPreparationChapter
  part: ResolvedPreparationPart
  volume: ResolvedPreparationVolume
}

function compareOrderedEntries(
  left: { order: number },
  right: { order: number },
) {
  return left.order - right.order
}

function fail(message: string): never {
  throw new Error(`[preparation-book] ${message}`)
}

function assertUniqueValues(values: Array<{ label: string; value: string | number }>, scope: string) {
  const seen = new Set<string | number>()

  values.forEach(({ label, value }) => {
    if (seen.has(value)) {
      fail(`Duplicate ${label} "${value}" in ${scope}.`)
    }

    seen.add(value)
  })
}

function createEntryMap<Entry>(
  entries: Entry[],
  getId: (entry: Entry) => string,
  entryKind: string,
) {
  const entriesById = new Map<string, Entry>()

  entries.forEach((entry) => {
    const id = getId(entry)

    if (entriesById.has(id)) {
      fail(`Duplicate ${entryKind} "${id}" in the visible collection.`)
    }

    entriesById.set(id, entry)
  })

  return entriesById
}

function getRequiredEntry<Entry>(
  entriesById: Map<string, Entry>,
  id: string,
  entryKind: string,
  scope: string,
) {
  const entry = entriesById.get(id)

  if (!entry) {
    fail(`Missing visible ${entryKind} "${id}" referenced by ${scope}.`)
  }

  return entry
}

export function getPreparationVolumeAliases(volume: PreparationBookVolumeData) {
  return [...new Set([volume.id, ...volume.legacyCompetencyIds])]
}

export function resolvePreparationBook(
  catalog: PreparationCatalogData,
  preparation: PreparationEntry[],
  challenges: PreparationChallengeEntry[],
): ResolvedPreparationBook {
  const locale = catalog.locale
  const localizedPreparation = preparation.filter((entry) => entry.data.locale === locale)
  const localizedChallenges = challenges.filter((entry) => entry.data.locale === locale)
  const guideById = createEntryMap(localizedPreparation, (entry) => entry.data.guideId, 'guideId')
  const challengeById = createEntryMap(localizedChallenges, (entry) => entry.data.challengeId, 'challengeId')
  const canonicalGuideIds = new Set<string>()
  const canonicalPracticeIds = new Set<string>()
  const volumeAliases = new Set<string>()
  const volumes = [...catalog.volumes]
    .sort(compareOrderedEntries)
    .map<ResolvedPreparationVolume>((volume) => {
      const volumeScope = `volume "${volume.id}"`

      getPreparationVolumeAliases(volume).forEach((alias) => {
        if (volumeAliases.has(alias)) {
          fail(`Duplicate volume or legacy competency id "${alias}".`)
        }

        volumeAliases.add(alias)
      })

      assertUniqueValues(
        volume.parts.map((part) => ({ label: 'part id', value: part.id })),
        volumeScope,
      )
      assertUniqueValues(
        volume.parts.map((part) => ({ label: 'part order', value: part.order })),
        volumeScope,
      )

      const parts = [...volume.parts]
        .sort(compareOrderedEntries)
        .map<ResolvedPreparationPart>((part) => {
          const partScope = `part "${part.id}" in ${volumeScope}`

          assertUniqueValues(
            part.chapters.map((chapter) => ({ label: 'chapter order', value: chapter.order })),
            partScope,
          )
          assertUniqueValues(
            part.practices.map((practice) => ({ label: 'practice order', value: practice.order })),
            partScope,
          )

          const chapters = [...part.chapters]
            .sort(compareOrderedEntries)
            .map<ResolvedPreparationChapter>((chapter) => {
              if (canonicalGuideIds.has(chapter.guideId)) {
                fail(`Guide "${chapter.guideId}" is assigned to more than one canonical chapter.`)
              }

              canonicalGuideIds.add(chapter.guideId)
              const guide = getRequiredEntry(guideById, chapter.guideId, 'guide', partScope)

              return {
                guide,
                guideId: chapter.guideId,
                href: getPreparationSubjectHref(guide.data.subjectId, locale),
                order: chapter.order,
                partId: part.id,
                partTitle: part.title,
                volumeId: volume.id,
                volumeTitle: volume.title,
              }
            })
          const practices = [...part.practices]
            .sort(compareOrderedEntries)
            .map<ResolvedPreparationPractice>((practice) => {
              if (canonicalPracticeIds.has(practice.challengeId)) {
                fail(`Challenge "${practice.challengeId}" is assigned to more than one canonical practice.`)
              }

              canonicalPracticeIds.add(practice.challengeId)
              const challenge = getRequiredEntry(
                challengeById,
                practice.challengeId,
                'challenge',
                partScope,
              )

              return {
                challenge,
                challengeId: practice.challengeId,
                href: getChallengeHrefFromEntry(challenge),
                order: practice.order,
              }
            })
          const references = part.references.map<ResolvedPreparationReference>((reference) => {
            if (reference.kind === 'guide') {
              const guide = getRequiredEntry(guideById, reference.refId, 'guide', partScope)

              return {
                ...reference,
                href: getPreparationSubjectHref(guide.data.subjectId, locale),
                title: guide.data.title,
              }
            }

            const challenge = getRequiredEntry(challengeById, reference.refId, 'challenge', partScope)

            return {
              ...reference,
              href: getChallengeHrefFromEntry(challenge),
              title: challenge.data.title,
            }
          })

          return {
            ...part,
            chapters,
            practices,
            references,
          }
        })

      return {
        ...volume,
        parts,
      }
    })

  assertUniqueValues(
    volumes.map((volume) => ({ label: 'volume id', value: volume.id })),
    'preparation book',
  )
  assertUniqueValues(
    volumes.map((volume) => ({ label: 'volume order', value: volume.order })),
    'preparation book',
  )

  return {
    catalog,
    chapters: volumes.flatMap((volume) => volume.parts.flatMap((part) => part.chapters)),
    volumes,
  }
}

export function getPreparationVolume(
  book: ResolvedPreparationBook,
  volumeId: string,
) {
  return book.volumes.find((volume) => getPreparationVolumeAliases(volume).includes(volumeId)) ?? null
}

export function getPreparationChapterContext(
  book: ResolvedPreparationBook,
  guideId: string,
): PreparationChapterContext | null {
  const chapterIndex = book.chapters.findIndex((chapter) => chapter.guideId === guideId)

  if (chapterIndex < 0) {
    return null
  }

  const chapter = book.chapters[chapterIndex]
  const volume = book.volumes.find((entry) => entry.id === chapter.volumeId)
  const part = volume?.parts.find((entry) => entry.id === chapter.partId)

  if (!volume || !part) {
    fail(`Could not recover the catalog context for guide "${guideId}".`)
  }

  return {
    chapter,
    nextChapter: book.chapters[chapterIndex + 1] ?? null,
    part,
    previousChapter: book.chapters[chapterIndex - 1] ?? null,
    volume,
  }
}

export function getPreparationPracticeContext(
  book: ResolvedPreparationBook,
  challengeId: string,
): PreparationPracticeContext | null {
  for (const volume of book.volumes) {
    for (const part of volume.parts) {
      const practice = part.practices.find((entry) => entry.challengeId === challengeId)

      if (practice) {
        return {
          part,
          practice,
          volume,
        }
      }
    }
  }

  return null
}

export function getPreparationGlossaryReferences(
  book: ResolvedPreparationBook,
  glossaryId: string,
): PreparationGlossaryReference[] {
  const references: PreparationGlossaryReference[] = []

  for (const volume of book.volumes) {
    for (const part of volume.parts) {
      for (const chapter of part.chapters) {
        if (chapter.guide.data.glossaryIds.includes(glossaryId)) {
          references.push({
            chapter,
            part,
            volume,
          })
        }
      }
    }
  }

  return references
}
