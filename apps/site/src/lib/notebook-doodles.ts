import {
  cadIconCategories,
  cadIcons,
  type CadIconName,
} from '@caderno-ui/icons'

export const notebookDoodles = cadIcons
export type NotebookDoodleName = CadIconName

export type NotebookDoodleCategory = {
  id: 'annotation' | 'engineering' | 'study'
  label: string
  icons: readonly NotebookDoodleName[]
}

export const notebookDoodleCategories: NotebookDoodleCategory[] = [
  { id: 'annotation', label: 'Anotação', icons: cadIconCategories.annotation },
  { id: 'study', label: 'Estudo', icons: cadIconCategories.study },
  { id: 'engineering', label: 'Engenharia', icons: cadIconCategories.engineering },
]

const notebookDoodleByPageType = {
  articles: 'note',
  challenges: 'code',
  concepts: 'brain',
  glossary: 'book',
  preparation: 'bookmark',
  topics: 'layers',
  tracks: 'target',
} as const satisfies Record<string, NotebookDoodleName>

export function getNotebookDoodleForPageType(pageType: string): NotebookDoodleName {
  return notebookDoodleByPageType[pageType as keyof typeof notebookDoodleByPageType] ?? 'note'
}
