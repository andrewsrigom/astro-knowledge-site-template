import { readFileSync } from 'node:fs'

import { describe, expect, it } from 'vitest'

const componentSource = (name: string) => readFileSync(
  new URL(`../components/${name}`, import.meta.url),
  'utf8',
)

const notebookSource = (name: string) => componentSource(`ui/notebook/${name}`)

const siteSource = (name: string) => readFileSync(
  new URL(`../../${name}`, import.meta.url),
  'utf8',
)

describe('guide composition with Caderno UI', () => {
  it('uses the canonical method, local index, cards, links and dividers', () => {
    const page = componentSource('PreparationSubjectPage.astro')
    const rail = componentSource('PreparationChapterRail.astro')
    const pager = componentSource('PreparationChapterPager.astro')

    expect(page).toContain('<NotebookMethodChain')
    expect(page).toContain('<NotebookManualProse')
    expect(page).toContain('<NotebookDivider')
    expect(rail).toContain('<NotebookTOC')
    expect(rail).toContain('<NotebookCard')
    expect(rail).toContain('<NotebookLink')
    expect(pager).toContain('<NotebookCard')
    expect(pager).toContain('<NotebookDivider')
    expect(`${page}\n${rail}\n${pager}`).not.toContain('wired-')
  })

  it('renders Markdown through the same visual contracts as the laboratory', () => {
    const prose = notebookSource('NotebookManualProse.astro')
    const contracts = [
      'notebook-accordion.css',
      'notebook-blockquote.css',
      'notebook-code-block.css',
      'notebook-highlight.css',
      'notebook-post-it.css',
      'notebook-table.css',
    ]

    contracts.forEach((contract) => expect(prose).toContain(contract))
    expect(prose).toContain("question.classList.add('notebook-accordion-item')")
    expect(prose).toContain("figure.className = 'notebook-code-block'")
    expect(prose).toContain("table.classList.add('notebook-table')")
  })

  it('keeps primitive styles in shared contracts instead of parallel copies', () => {
    const primitives = [
      ['NotebookAccordionItem.astro', 'notebook-accordion.css'],
      ['NotebookBlockquote.astro', 'notebook-blockquote.css'],
      ['NotebookCodeBlock.astro', 'notebook-code-block.css'],
      ['NotebookHighlight.astro', 'notebook-highlight.css'],
      ['NotebookTable.astro', 'notebook-table.css'],
    ] as const

    primitives.forEach(([component, contract]) => {
      const source = notebookSource(component)
      expect(source).toContain(contract)
      expect(source).not.toContain('<style>')
    })
  })

  it('uses matching syntax colors for the light and dark notebook themes', () => {
    const astroConfig = siteSource('astro.config.mjs')
    const codeStyles = siteSource('src/styles/notebook-code-block.css')

    expect(astroConfig).toContain("light: 'github-light'")
    expect(astroConfig).toContain("dark: 'github-dark'")
    expect(astroConfig).toContain('defaultColor: false')
    expect(codeStyles).toContain('color: var(--shiki-light)')
    expect(codeStyles).toContain('color: var(--shiki-dark)')
  })
})
