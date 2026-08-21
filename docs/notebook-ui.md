# SeniorPath Caderno UI

`Caderno UI` é o vocabulário visual de anotações do SeniorPath. A coleção contém 38 doodles SVG autorais divididos entre anotação, estudo e engenharia, além de adesivos, post-its, marca-textos e componentes de leitura.

O objetivo não é fazer toda a interface parecer desenhada à mão. Os doodles funcionam como sinais pequenos: indicam uma pergunta, uma ideia, uma prática, uma relação ou um tipo de assunto. O fundo e a tipografia continuam limpos.

## Componente

```astro
---
import DoodleIcon from '@/components/ui/notebook/DoodleIcon.astro'
---

<DoodleIcon name="lightbulb" size={20} />
<DoodleIcon label="Objetivo" name="target" size={24} />
```

- `name` seleciona um desenho tipado por `NotebookDoodleName`;
- `size` aceita número ou dimensão CSS;
- `label` torna o SVG uma imagem acessível;
- sem `label`, o desenho é decorativo e recebe `aria-hidden`;
- `class` permite controlar cor e composição sem alterar o SVG.

As definições ficam em `apps/site/src/lib/notebook-doodles.ts`. Cada desenho usa o mesmo `viewBox` de `24 × 24`, traço baseado em `currentColor` e uma segunda passagem levemente deslocada.

## Famílias

- **Anotação:** sinais, setas, pergunta, alerta, caixa, estrela, colchetes, revisão, sublinhado, confirmação, erro, pin, fita, marca-texto e rabisco.
- **Estudo:** cérebro, ideia, relógio, objetivo, nota, livro, marcador, lápis, busca e checklist.
- **Engenharia:** código, terminal, banco, servidor, nuvem, rede, segurança, bug, configuração, camadas, API, branch, entrega e performance.

## Componentes de anotação

```astro
---
import NotebookHighlight from '@/components/ui/notebook/NotebookHighlight.astro'
import NotebookPostIt from '@/components/ui/notebook/NotebookPostIt.astro'
import NotebookSticker from '@/components/ui/notebook/NotebookSticker.astro'
---

<NotebookSticker icon="spark" label="ideia central" tone="blue" />

<NotebookPostIt icon="lightbulb" label="Dica" tone="lemon">
  <p>Defina o contrato antes de escolher a implementação.</p>
</NotebookPostIt>

<p>
  O custo está na
  <NotebookHighlight tone="pink">operação repetida</NotebookHighlight>.
</p>
```

- `NotebookSticker` possui cinco cores, três formatos e dois tamanhos;
- `NotebookPostIt` possui cinco papéis, inclinação opcional e uma fita discreta;
- `NotebookHighlight` possui seis cores e os traços `marker`, `underline` e `double`.

## Abas

Cada painel usa `NotebookTabPanel`; o `id` precisa corresponder ao `id` declarado em `tabs`. O componente cuida de ARIA, clique e navegação por setas, Home e End.

```astro
---
import NotebookTabPanel from '@/components/ui/notebook/NotebookTabPanel.astro'
import NotebookTabs from '@/components/ui/notebook/NotebookTabs.astro'
---

<NotebookTabs
  ariaLabel="Etapas da solução"
  defaultTab="contrato"
  groupId="solution-steps"
  tabs={[
    { id: 'problema', label: 'Problema', tone: 'coral' },
    { id: 'contrato', label: 'Contrato', tone: 'lemon' },
  ]}
>
  <NotebookTabPanel id="problema">Defina entradas, saídas e limites.</NotebookTabPanel>
  <NotebookTabPanel id="contrato">Registre pré-condições e pós-condições.</NotebookTabPanel>
</NotebookTabs>
```

## Regras de uso

1. Um doodle precisa indicar algo; não serve para ocupar espaço vazio.
2. Use no máximo um ícone por rótulo ou pequena nota.
3. O texto carrega o significado. O ícone só reforça.
4. Preserve `currentColor` para que tema claro, escuro e modo foco funcionem sem versões duplicadas.
5. Evite misturar doodles com ícones geométricos diferentes dentro do mesmo grupo de controles.
6. Novos desenhos precisam funcionar em 16 px antes de serem usados em tamanhos maiores.

## Laboratório

A prancha de inspeção está disponível em desenvolvimento em `/pt-br/laboratorio/caderno-ui`. A página é `noindex` e não participa da navegação do guia.

A referência única de fontes, escalas, cores e regras de composição fica em `/pt-br/laboratorio/tokens`. Ela usa os próprios tokens, por isso também serve para inspecionar a paleta nos temas claro e escuro.
