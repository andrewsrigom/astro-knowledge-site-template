import { describe, expect, it } from 'vitest'

import remarkMermaidDiagrams from '@/lib/remark-mermaid-diagrams.mjs'

describe('remark Mermaid diagrams', () => {
  it('replaces Mermaid code nodes with an accessible progressive-enhancement shell', () => {
    const tree = {
      type: 'root',
      children: [
        { type: 'paragraph', children: [{ type: 'text', value: 'before' }] },
        {
          type: 'code',
          lang: 'mermaid',
          meta: null,
          value: 'flowchart LR\n  accTitle: Request path\n  A[Client] --> B[API]',
        },
      ],
    }

    remarkMermaidDiagrams()(tree)

    const diagram = tree.children[1] as { lang?: string; type: string; value: string }
    expect(diagram.type).toBe('html')
    expect(diagram.lang).toBeUndefined()
    expect(diagram.value).toContain('data-mermaid-diagram')
    expect(diagram.value).toContain('data-mermaid-canvas')
    expect(diagram.value).toContain('data-mermaid-source hidden')
    expect(diagram.value).toContain('accTitle: Request path')
    expect(diagram.value).not.toContain('Ver definição do diagrama')
  })

  it('marks diagrams with the animated meta flag for progressive playback', () => {
    const tree = {
      type: 'root',
      children: [
        {
          type: 'code',
          lang: 'mermaid',
          meta: 'animated stack',
          value: 'flowchart LR\n  A[Problem] --> B[Contract]',
        },
      ],
    }

    remarkMermaidDiagrams()(tree)

    const diagram = tree.children[0] as { type: string; value: string }
    expect(diagram.value).toContain('data-mermaid-animation="sequence"')
    expect(diagram.value).toContain('data-mermaid-responsive="stack"')
    expect(diagram.value).not.toContain('data-mermaid-replay')
    expect(diagram.value).not.toContain('data-mermaid-expand')
  })

  it('keeps regular diagrams static', () => {
    const tree = {
      type: 'root',
      children: [{ type: 'code', lang: 'mermaid', meta: null, value: 'flowchart LR\n  A --> B' }],
    }

    remarkMermaidDiagrams()(tree)

    const diagram = tree.children[0] as { type: string; value: string }
    expect(diagram.value).not.toContain('data-mermaid-animation')
    expect(diagram.value).not.toContain('data-mermaid-responsive')
    expect(diagram.value).not.toContain('data-mermaid-replay')
  })

  it('escapes diagram source kept in the no-JavaScript fallback', () => {
    const tree = {
      type: 'root',
      children: [{ type: 'code', lang: 'mermaid', value: 'A[<script>] --> B & C' }],
    }

    remarkMermaidDiagrams()(tree)

    const diagram = tree.children[0] as { type: string; value: string }
    expect(diagram.value).toContain('A[&lt;script&gt;] --&gt; B &amp; C')
    expect(diagram.value).not.toContain('<script>')
  })
})
