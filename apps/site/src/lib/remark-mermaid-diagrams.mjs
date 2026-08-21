function escapeHtml(value) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
}

function hasMetaFlag(meta, flag) {
  return String(meta ?? '')
    .split(/\s+/)
    .includes(flag)
}

function visit(node) {
  if (!node || typeof node !== 'object') {
    return
  }

  if (node.type === 'code' && node.lang === 'mermaid') {
    const source = escapeHtml(node.value)
    const animated = hasMetaFlag(node.meta, 'animated')
    const responsiveStack = hasMetaFlag(node.meta, 'stack')
    const animationAttribute = animated ? ' data-mermaid-animation="sequence"' : ''
    const responsiveAttribute = responsiveStack ? ' data-mermaid-responsive="stack"' : ''

    node.type = 'html'
    node.value = [
      `<figure class="architecture-diagram" data-mermaid-diagram${animationAttribute}${responsiveAttribute} data-pagefind-ignore>`,
      '  <figcaption class="sr-only architecture-diagram__caption">Diagrama de arquitetura</figcaption>',
      '  <div class="architecture-diagram__canvas" data-mermaid-canvas aria-live="polite"></div>',
      `  <pre data-mermaid-source hidden><code>${source}</code></pre>`,
      '</figure>',
    ].join('\n')
    delete node.lang
    delete node.meta
    return
  }

  if (!Array.isArray(node.children)) {
    return
  }

  for (const child of node.children) {
    visit(child)
  }
}

export default function remarkMermaidDiagrams() {
  return (tree) => visit(tree)
}
