import { describe, expect, it } from 'vitest'

import {
  getNotebookDoodleForPageType,
  notebookDoodleCategories,
  notebookDoodles,
} from '@/lib/notebook-doodles'

describe('notebook doodles', () => {
  it('assigns every doodle to one category exactly once', () => {
    const categorizedNames = notebookDoodleCategories.flatMap((category) => category.icons)

    expect(new Set(categorizedNames).size).toBe(categorizedNames.length)
    expect([...categorizedNames].sort()).toEqual(Object.keys(notebookDoodles).sort())
  })

  it('keeps every SVG path non-empty and inside the shared view box contract', () => {
    for (const paths of Object.values(notebookDoodles)) {
      expect(paths.length).toBeGreaterThan(0)
      expect(paths.every((path) => path.startsWith('M'))).toBe(true)
      expect(paths.every((path) => !path.includes('<'))).toBe(true)
    }
  })

  it('maps page types to stable doodles and uses a neutral fallback', () => {
    expect(getNotebookDoodleForPageType('articles')).toBe('note')
    expect(getNotebookDoodleForPageType('challenges')).toBe('code')
    expect(getNotebookDoodleForPageType('preparation')).toBe('bookmark')
    expect(getNotebookDoodleForPageType('unknown-page-type')).toBe('note')
  })
})
