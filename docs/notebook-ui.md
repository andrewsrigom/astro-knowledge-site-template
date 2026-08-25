# Caderno UI no SeniorPath

O `Caderno UI` é o design system compartilhado que sustenta a linguagem de caderno do SeniorPath. A biblioteca mantém componentes, tokens, acessibilidade, documentação e o laboratório canônico. O SeniorPath consome os pacotes publicados e valida a integração nas páginas reais do guia.

## Fronteira de responsabilidade

- `@caderno-ui/elements` implementa os custom elements e o comportamento acessível;
- `@caderno-ui/astro` fornece as fachadas Astro usadas pelo site;
- `@caderno-ui/icons` mantém os ícones compartilhados;
- o SeniorPath mantém apenas composição editorial, conteúdo, rotas e adaptações específicas do produto.

Não existe uma segunda galeria de componentes dentro do SeniorPath. A inspeção isolada acontece no laboratório do repositório do Caderno UI; aqui a cobertura é feita no índice, nos volumes e nos capítulos do próprio guia.

## Fachadas locais

Os componentes `NotebookBookmark`, `NotebookBreadcrumb`, `NotebookCard`, `NotebookDivider`, `NotebookLink` e `NotebookSticker` preservam a API que as páginas do SeniorPath já usam. Cada um apenas traduz nomes, valores ou dados do produto para as fachadas compostas de `@caderno-ui/astro`, sem duplicar CSS ou comportamento.

```astro
---
import CadCard from '@caderno-ui/astro/Card.astro'
import CadCardContent from '@caderno-ui/astro/CardContent.astro'
import CadCardHeader from '@caderno-ui/astro/CardHeader.astro'
import CadCardTitle from '@caderno-ui/astro/CardTitle.astro'
---

<CadCard tone="blue" variant="paper">
  <CadCardHeader>
    <CadCardTitle as="h3">Próximo capítulo</CadCardTitle>
  </CadCardHeader>
  <CadCardContent><slot /></CadCardContent>
</CadCard>
```

Novos componentes genéricos devem nascer no Caderno UI e chegar ao SeniorPath como dependência. Uma implementação local só faz sentido quando representa uma composição própria do produto.

## Composições do produto

Permanecem locais:

- `NotebookTOC`, que conecta a navegação do livro à estrutura de conteúdo;
- `NotebookManualProse`, que aprimora Markdown arbitrário renderizado pelo Astro;
- `NotebookMethodChain`, que apenas transforma os dados editoriais do método em `CadSteps` e `CadStep`;
- `DoodleIcon`, que mantém o nome usado pelo produto, mas delega toda a renderização a `CadIcon`.

Os contratos CSS importados por `NotebookManualProse` não são uma biblioteca paralela. Eles estilizam elementos HTML gerados a partir do Markdown, onde não há um componente Astro explícito para envolver cada nó.

## Regras de integração

1. Importe componentes genéricos de `@caderno-ui/astro`.
2. Mantenha uma fachada local somente quando ela traduz uma API já difundida ou acrescenta semântica do SeniorPath.
3. Não copie estilos, scripts ou marcação interna de um componente do Caderno UI.
4. Teste a integração em uma rota real, inclusive com JavaScript desativado quando o conteúdo precisar permanecer legível.
5. Preserve o texto como fonte do significado; doodles e tratamentos manuscritos são sinais de apoio.

## Doodles editoriais

O arquivo `apps/site/src/lib/notebook-doodles.ts` mantém somente categorias e o mapeamento entre tipos de página e nomes públicos de ícones. Geometria, desenho e acessibilidade pertencem a `@caderno-ui/icons` e `CadIcon`. O componente recebe `label` quando o desenho carrega significado; sem rótulo, ele é decorativo.
