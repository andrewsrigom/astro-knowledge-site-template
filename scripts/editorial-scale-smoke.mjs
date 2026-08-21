import { cp, mkdtemp, mkdir, readdir, rm, stat, writeFile } from 'node:fs/promises'
import { spawn } from 'node:child_process'
import os from 'node:os'
import path from 'node:path'
import { performance } from 'node:perf_hooks'
import { fileURLToPath } from 'node:url'

const repoRoot = fileURLToPath(new URL('..', import.meta.url))
const starterContentRoot = path.join(repoRoot, 'examples', 'starter-content')
const distRoot = path.join(repoRoot, 'apps', 'site', 'dist')

const DEFAULTS = {
  articlePairs: 180,
  challengePairs: 40,
  conceptPairs: 40,
  glossaryPairs: 40,
  maxBuildMs: 90_000,
  // The scaled build also bundles the diagram and notebook UI modules. Keep a small
  // margin above the cold-build peak instead of treating every emitted chunk as page cost.
  maxRssKb: 2_100_000,
  roadmapCount: 30,
  roadmapStepSize: 4,
}

function readPositiveInteger(value, fallbackValue) {
  const numericValue = Number.parseInt(value ?? '', 10)
  return Number.isFinite(numericValue) && numericValue > 0 ? numericValue : fallbackValue
}

function padNumber(value) {
  return String(value).padStart(3, '0')
}

function escapeYamlString(value) {
  return JSON.stringify(value)
}

function getScaleConfig() {
  const config = {
    articlePairs: readPositiveInteger(process.env.EDITORIAL_SCALE_ARTICLE_PAIRS, DEFAULTS.articlePairs),
    challengePairs: readPositiveInteger(process.env.EDITORIAL_SCALE_CHALLENGE_PAIRS, DEFAULTS.challengePairs),
    conceptPairs: readPositiveInteger(process.env.EDITORIAL_SCALE_CONCEPT_PAIRS, DEFAULTS.conceptPairs),
    glossaryPairs: readPositiveInteger(process.env.EDITORIAL_SCALE_GLOSSARY_PAIRS, DEFAULTS.glossaryPairs),
    maxBuildMs: readPositiveInteger(process.env.EDITORIAL_SCALE_MAX_BUILD_MS, DEFAULTS.maxBuildMs),
    maxRssKb: readPositiveInteger(process.env.EDITORIAL_SCALE_MAX_RSS_KB, DEFAULTS.maxRssKb),
    roadmapCount: readPositiveInteger(process.env.EDITORIAL_SCALE_ROADMAP_COUNT, DEFAULTS.roadmapCount),
    roadmapStepSize: readPositiveInteger(process.env.EDITORIAL_SCALE_ROADMAP_STEP_SIZE, DEFAULTS.roadmapStepSize),
  }

  if (config.articlePairs < config.roadmapCount * config.roadmapStepSize) {
    throw new Error(
      [
        '[scale-smoke] Not enough generated article pairs for the requested roadmap volume.',
        `Received articlePairs=${config.articlePairs}, roadmapCount=${config.roadmapCount}, roadmapStepSize=${config.roadmapStepSize}.`,
      ].join(' '),
    )
  }

  return config
}

function buildArticleFixture({
  articleId,
  date,
  description,
  locale,
  order,
  pathLabels,
  slug,
  summary,
  title,
  trackEligible,
}) {
  return `---
articleId: ${articleId}
title: ${escapeYamlString(title)}
description: ${escapeYamlString(description)}
summary: ${escapeYamlString(summary)}
category: Template
kind: article
level: beginner
locale: ${locale}
order: ${order}
path:
  - ${escapeYamlString(pathLabels[0])}
  - ${escapeYamlString(pathLabels[1])}
practiceChecklist:
  - Validate editorial scale smoke behavior.
relationships: []
relatedDeckIds: []
readiness:
  draft_complete: true
  examples_added: true
  interview_angle: false
  language_simple: true
  practice_items_filled: true
  reasoning_complete: true
  relationships_set: true
  senior_layer: true
  takeaways_filled: true
  voice_human: true
status: active
takeaways:
  - Generated editorial scale fixture ${slug}.
tags:
  - scale
  - smoke
topicIds:
  - delivery
trackEligible: ${trackEligible ? 'true' : 'false'}
pillarId: foundations
branchId: first-clone
pubDate: ${date}
updatedDate: ${date}
---
## ${title}

This article exists only to measure editorial scale build behavior.
`
}

function buildConceptFixture({
  conceptId,
  description,
  locale,
  summary,
  title,
}) {
  return `---
conceptId: ${conceptId}
title: ${escapeYamlString(title)}
description: ${escapeYamlString(description)}
summary: ${escapeYamlString(summary)}
domainId: backend
groupId: apis
locale: ${locale}
pubDate: 2026-03-24
relatedArticleIds:
  - scale-smoke-001
status: active
tags:
  - scale
  - smoke
---
## ${title}

This concept exists only to measure editorial scale build behavior.
`
}

function buildGlossaryFixture({
  locale,
  summary,
  termId,
  title,
}) {
  return `---
termId: ${termId}
title: ${escapeYamlString(title)}
description: ${escapeYamlString(summary)}
summary: ${escapeYamlString(summary)}
aliases:
  - ${escapeYamlString(`${termId}.json`)}
locale: ${locale}
pubDate: 2026-03-24
status: active
tags:
  - scale
  - smoke
---
${summary}
`
}

function buildChallengeFixture({
  challengeId,
  locale,
  order,
  slug,
  title,
}) {
  const localizedSection = locale === 'pt-br' ? 'artigos' : 'articles'
  const localizedSlug = locale === 'pt-br' ? 'escala-smoke-001' : 'scale-smoke-001'

  return `---
challengeId: ${challengeId}
title: ${escapeYamlString(title)}
description: ${escapeYamlString(`Generated challenge fixture ${slug} for editorial scale smoke.`)}
summary: ${escapeYamlString(`Generated challenge fixture ${slug} for editorial scale smoke.`)}
locale: ${locale}
pubDate: 2026-03-24
status: active
type: strings
typeLabel: String handling
level: beginner
estimatedMinutes: 10
solutionLanguage: typescript
order: ${order}
commonMistakes:
  - Forgetting to centralize route helpers in one place.
hints:
  - Keep the URL builder deterministic.
whatToNotice:
  - Build systems degrade quietly when content volume increases.
relatedArticleIds:
  - scale-smoke-001
relatedChallengeIds: []
testCases:
  - description: Returns the localized section route
    input:
      - ${locale}
      - ${localizedSection}
      - ${localizedSlug}
    expected: ${locale === 'pt-br' ? `/pt-br/${localizedSection}/${localizedSlug}` : `/${localizedSection}/${localizedSlug}`}
starterCode: |
  export function buildScaleUrl(locale: string, section: string, slug = ''): string {
    const normalizedSlug = slug.trim().replace(/^\\/+|\\/+$/g, '')
    const base = locale === 'pt-br' ? \`/pt-br/\${section}\` : \`/\${section}\`

    return normalizedSlug ? \`\${base}/\${normalizedSlug}\` : base
  }
---
## ${title}

This challenge exists only to measure editorial scale build behavior.
`
}

function buildRoadmapModule({ roadmapCount, roadmapStepSize }) {
  const roadmaps = Array.from({ length: roadmapCount }, (_, index) => {
    const roadmapNumber = index + 1
    const roadmapId = `scale-smoke-track-${padNumber(roadmapNumber)}`
    const articleIds = Array.from({ length: roadmapStepSize }, (__unused, stepIndex) => {
      const articleNumber = index * roadmapStepSize + stepIndex + 1
      return `scale-smoke-${padNumber(articleNumber)}`
    })

    return {
      id: roadmapId,
      intro: {
        en: `Generated roadmap ${roadmapNumber} for editorial scale smoke.`,
        'pt-br': `Trilha gerada ${roadmapNumber} para smoke de escala editorial.`,
      },
      label: {
        en: 'Scale smoke',
        'pt-br': 'Escala smoke',
      },
      level: 'beginner',
      nodes: [
        {
          id: `${roadmapId}-concept`,
          kind: 'concept',
          panelBody: {
            en: `Concept node for generated roadmap ${roadmapNumber}.`,
            'pt-br': `No de conceito da trilha gerada ${roadmapNumber}.`,
          },
          position: { x: 0, y: 0 },
          relatedArticleIds: articleIds.slice(0, 2),
          summary: {
            en: `Generated context for roadmap ${roadmapNumber}.`,
            'pt-br': `Contexto gerado para a trilha ${roadmapNumber}.`,
          },
          title: {
            en: `Scale concept ${roadmapNumber}`,
            'pt-br': `Conceito de escala ${roadmapNumber}`,
          },
        },
        ...articleIds.map((articleId, stepIndex) => ({
          articleId,
          id: `${roadmapId}-article-${stepIndex + 1}`,
          kind: 'article',
          position: { x: 260 + (stepIndex * 220), y: 0 },
        })),
      ],
      slug: {
        en: roadmapId,
        'pt-br': `trilha-escala-${padNumber(roadmapNumber)}`,
      },
      summary: {
        en: `Generated roadmap ${roadmapNumber} for editorial scale smoke.`,
        'pt-br': `Trilha gerada ${roadmapNumber} para smoke de escala editorial.`,
      },
      tags: [
        {
          id: 'scale',
          label: {
            en: 'Scale',
            'pt-br': 'Escala',
          },
        },
      ],
      title: {
        en: `Scale smoke track ${roadmapNumber}`,
        'pt-br': `Trilha de escala ${roadmapNumber}`,
      },
    }
  })

  return `import type { CollectionEntry } from 'astro:content'

import { getArticleReadingTimeMinutes } from '@/lib/article-meta'
import { getArticleHrefFromEntry } from '@/lib/article-links'
import { getTracksHref } from '@/lib/tracks-links'

export type EditorialLocale = 'en' | 'pt-br'

type LocalizedText = Record<EditorialLocale, string>
type RoadmapLevel = CollectionEntry<'articles'>['data']['level']

type RoadmapPosition = {
  x: number
  y: number
}

type EditorialRoadmapTag = {
  id: string
  label: LocalizedText
}

type EditorialRoadmapNodeBase = {
  id: string
  position: RoadmapPosition
}

export type RoadmapArticleNode = EditorialRoadmapNodeBase & {
  articleId: string
  kind: 'article'
}

export type RoadmapConceptNode = EditorialRoadmapNodeBase & {
  kind: 'concept'
  panelBody: LocalizedText
  relatedArticleIds: string[]
  summary: LocalizedText
  title: LocalizedText
}

export type RoadmapNode = RoadmapArticleNode | RoadmapConceptNode

export type EditorialRoadmap = {
  id: string
  intro: LocalizedText
  label: LocalizedText
  level?: RoadmapLevel
  locales?: EditorialLocale[]
  nodes: RoadmapNode[]
  slug: LocalizedText
  summary: LocalizedText
  tags: EditorialRoadmapTag[]
  title: LocalizedText
}

export type ResolvedRoadmapArticleNode = {
  articleId: string
  href: string | null
  id: string
  isAvailableInLocale: boolean
  kind: 'article'
  position: RoadmapPosition
  post: CollectionEntry<'articles'>
}

export type ResolvedRoadmapConceptNode = {
  id: string
  kind: 'concept'
  panelBody: string
  position: RoadmapPosition
  relatedArticles: CollectionEntry<'articles'>[]
  summary: string
  title: string
}

export type ResolvedRoadmapNode = ResolvedRoadmapArticleNode | ResolvedRoadmapConceptNode

export type ResolvedEditorialRoadmap = {
  availableLocales: EditorialLocale[]
  articleNodes: ResolvedRoadmapArticleNode[]
  estimatedReadingMinutes: number
  href: string
  id: string
  intro: string
  label: string
  level: RoadmapLevel
  locale: EditorialLocale
  nodes: ResolvedRoadmapNode[]
  slug: string
  slugs: LocalizedText
  stepCount: number
  summary: string
  tags: Array<{ id: string; label: string }>
  title: string
}

export type EditorialArticleContext = {
  currentArticle: ResolvedRoadmapArticleNode
  nextArticle: ResolvedRoadmapArticleNode | null
  previousArticle: ResolvedRoadmapArticleNode | null
  roadmap: ResolvedEditorialRoadmap
  stepIndex: number
  totalSteps: number
}

const ROADMAPS = ${JSON.stringify(roadmaps, null, 2)} as EditorialRoadmap[]
const EDITORIAL_LOCALES: EditorialLocale[] = ['en', 'pt-br']

function getLocalizedText(text: LocalizedText, locale: EditorialLocale) {
  return text[locale] ?? text.en
}

function getRoadmapAvailableLocales(roadmap: EditorialRoadmap) {
  return roadmap.locales ? [...roadmap.locales] : EDITORIAL_LOCALES
}

function getRoadmapLevel(roadmap: EditorialRoadmap): RoadmapLevel {
  return roadmap.level ?? 'intermediate'
}

function getEstimatedReadingMinutes(articleNodes: ResolvedRoadmapArticleNode[]) {
  return articleNodes.reduce((sum, node) => sum + getArticleReadingTimeMinutes(node.post), 0)
}

export function getPrimaryEditorialRoadmap() {
  return ROADMAPS[0] ?? null
}

export function getPrimaryEditorialRoadmapHref(locale: EditorialLocale) {
  const primaryRoadmap = ROADMAPS[0]
  return primaryRoadmap ? getTracksHref(locale, getLocalizedText(primaryRoadmap.slug, locale)) : null
}

function resolveRoadmap(
  roadmap: EditorialRoadmap,
  locale: EditorialLocale,
  articles: CollectionEntry<'articles'>[],
): ResolvedEditorialRoadmap {
  const localizedArticles = articles.filter(
    (entry) =>
      entry.data.locale === locale &&
      entry.data.status !== 'archived' &&
      entry.data.trackEligible,
  )
  const byArticleId = new Map(localizedArticles.map((entry) => [entry.data.articleId, entry]))
  const nodes: ResolvedRoadmapNode[] = []

  for (const node of roadmap.nodes) {
    if (node.kind === 'article') {
      const post = byArticleId.get(node.articleId)

      if (!post) {
        continue
      }

      nodes.push({
        articleId: node.articleId,
        href: getArticleHrefFromEntry(post),
        id: node.id,
        isAvailableInLocale: true,
        kind: 'article',
        position: node.position,
        post,
      })
      continue
    }

    nodes.push({
      id: node.id,
      kind: 'concept',
      panelBody: getLocalizedText(node.panelBody, locale),
      position: node.position,
      relatedArticles: node.relatedArticleIds.flatMap((articleId) => {
        const post = byArticleId.get(articleId)
        return post ? [post] : []
      }),
      summary: getLocalizedText(node.summary, locale),
      title: getLocalizedText(node.title, locale),
    })
  }

  const articleNodes = nodes.filter((node): node is ResolvedRoadmapArticleNode => node.kind === 'article')
  const slug = getLocalizedText(roadmap.slug, locale)

  return {
    availableLocales: getRoadmapAvailableLocales(roadmap),
    articleNodes,
    estimatedReadingMinutes: getEstimatedReadingMinutes(articleNodes),
    href: getTracksHref(locale, slug) ?? (locale === 'pt-br' ? \`/pt-br/trilhas/\${slug}\` : \`/tracks/\${slug}\`),
    id: roadmap.id,
    intro: getLocalizedText(roadmap.intro, locale),
    label: getLocalizedText(roadmap.label, locale),
    level: getRoadmapLevel(roadmap),
    locale,
    nodes,
    slug,
    slugs: roadmap.slug,
    stepCount: articleNodes.length,
    summary: getLocalizedText(roadmap.summary, locale),
    tags: roadmap.tags.map((tag) => ({
      id: tag.id,
      label: getLocalizedText(tag.label, locale),
    })),
    title: getLocalizedText(roadmap.title, locale),
  }
}

export function resolveEditorialRoadmaps(
  locale: EditorialLocale,
  articles: CollectionEntry<'articles'>[],
): ResolvedEditorialRoadmap[] {
  return ROADMAPS
    .filter((roadmap) => getRoadmapAvailableLocales(roadmap).includes(locale))
    .map((roadmap) => resolveRoadmap(roadmap, locale, articles))
    .filter((roadmap) => roadmap.articleNodes.length > 0)
}

export function resolveEditorialRoadmap(
  locale: EditorialLocale,
  articles: CollectionEntry<'articles'>[],
  roadmapId = ROADMAPS[0]?.id,
) {
  return roadmapId
    ? resolveEditorialRoadmaps(locale, articles).find((roadmap) => roadmap.id === roadmapId) ?? null
    : null
}

export function resolveEditorialRoadmapBySlug(
  locale: EditorialLocale,
  articles: CollectionEntry<'articles'>[],
  slug: string,
) {
  return resolveEditorialRoadmaps(locale, articles).find((roadmap) => roadmap.slug === slug) ?? null
}

export function getEditorialRoadmapById(
  locale: EditorialLocale,
  articles: CollectionEntry<'articles'>[],
  roadmapId: string,
) {
  return resolveEditorialRoadmap(locale, articles, roadmapId)
}

export function getEditorialRoadmapBySlug(
  locale: EditorialLocale,
  articles: CollectionEntry<'articles'>[],
  slug: string,
) {
  return resolveEditorialRoadmapBySlug(locale, articles, slug)
}

export function getArticleEditorialContext(
  post: CollectionEntry<'articles'>,
  articles: CollectionEntry<'articles'>[],
): EditorialArticleContext | null {
  const locale = post.data.locale === 'pt-br' ? 'pt-br' : 'en'
  const roadmap = resolveEditorialRoadmaps(locale, articles).find((entry) =>
    entry.articleNodes.some((node) => node.articleId === post.data.articleId),
  )

  if (!roadmap) {
    return null
  }

  const stepIndex = roadmap.articleNodes.findIndex((node) => node.articleId === post.data.articleId)

  if (stepIndex < 0) {
    return null
  }

  return {
    currentArticle: roadmap.articleNodes[stepIndex],
    nextArticle: roadmap.articleNodes[stepIndex + 1] ?? null,
    previousArticle: roadmap.articleNodes[stepIndex - 1] ?? null,
    roadmap,
    stepIndex: stepIndex + 1,
    totalSteps: roadmap.articleNodes.length,
  }
}
`
}

async function populateArticleFixtures(contentRoot, { articlePairs, roadmapCount, roadmapStepSize }) {
  const enDir = path.join(contentRoot, 'collections', 'articles', 'en', 'foundations')
  const ptDir = path.join(contentRoot, 'collections', 'articles', 'pt-br', 'fundamentos')
  const trackedArticlePairs = roadmapCount * roadmapStepSize

  await mkdir(enDir, { recursive: true })
  await mkdir(ptDir, { recursive: true })

  for (let index = 1; index <= articlePairs; index += 1) {
    const padded = padNumber(index)
    const articleId = `scale-smoke-${padded}`
    const date = `2026-02-${String(((index - 1) % 28) + 1).padStart(2, '0')}`
    const enSlug = `scale-smoke-${padded}`
    const ptSlug = `escala-editorial-${padded}`
    const trackEligible = index <= trackedArticlePairs

    await writeFile(
      path.join(enDir, `${enSlug}.md`),
      buildArticleFixture({
        articleId,
        date,
        description: `Generated English article ${padded} for editorial scale smoke.`,
        locale: 'en',
        order: index,
        pathLabels: ['Starter', 'Scale smoke'],
        slug: enSlug,
        summary: `Generated English article ${padded} for editorial scale smoke.`,
        title: `Scale smoke article ${padded}`,
        trackEligible,
      }),
      'utf8',
    )

    await writeFile(
      path.join(ptDir, `${ptSlug}.md`),
      buildArticleFixture({
        articleId,
        date,
        description: `Artigo gerado ${padded} para smoke de escala editorial.`,
        locale: 'pt-br',
        order: index,
        pathLabels: ['Starter', 'Escala editorial'],
        slug: ptSlug,
        summary: `Artigo gerado ${padded} para smoke de escala editorial.`,
        title: `Artigo de escala ${padded}`,
        trackEligible,
      }),
      'utf8',
    )
  }
}

async function populateConceptFixtures(contentRoot, conceptPairs) {
  const enDir = path.join(contentRoot, 'collections', 'concepts', 'en')
  const ptDir = path.join(contentRoot, 'collections', 'concepts', 'pt-br')

  await mkdir(enDir, { recursive: true })
  await mkdir(ptDir, { recursive: true })

  for (let index = 1; index <= conceptPairs; index += 1) {
    const padded = padNumber(index)

    await writeFile(
      path.join(enDir, `scale-concept-${padded}.md`),
      buildConceptFixture({
        conceptId: `scale-concept-${padded}`,
        description: `Generated concept ${padded} for editorial scale smoke.`,
        locale: 'en',
        summary: `Generated concept ${padded} for editorial scale smoke.`,
        title: `Scale concept ${padded}`,
      }),
      'utf8',
    )

    await writeFile(
      path.join(ptDir, `conceito-de-escala-${padded}.md`),
      buildConceptFixture({
        conceptId: `scale-concept-${padded}`,
        description: `Conceito gerado ${padded} para smoke de escala editorial.`,
        locale: 'pt-br',
        summary: `Conceito gerado ${padded} para smoke de escala editorial.`,
        title: `Conceito de escala ${padded}`,
      }),
      'utf8',
    )
  }
}

async function populateGlossaryFixtures(contentRoot, glossaryPairs) {
  const enDir = path.join(contentRoot, 'collections', 'glossary', 'en')
  const ptDir = path.join(contentRoot, 'collections', 'glossary', 'pt-br')

  await mkdir(enDir, { recursive: true })
  await mkdir(ptDir, { recursive: true })

  for (let index = 1; index <= glossaryPairs; index += 1) {
    const padded = padNumber(index)

    await writeFile(
      path.join(enDir, `scale-term-${padded}.md`),
      buildGlossaryFixture({
        locale: 'en',
        summary: `Generated glossary term ${padded} for editorial scale smoke.`,
        termId: `scale-term-${padded}`,
        title: `Scale term ${padded}`,
      }),
      'utf8',
    )

    await writeFile(
      path.join(ptDir, `termo-de-escala-${padded}.md`),
      buildGlossaryFixture({
        locale: 'pt-br',
        summary: `Termo gerado ${padded} para smoke de escala editorial.`,
        termId: `scale-term-${padded}`,
        title: `Termo de escala ${padded}`,
      }),
      'utf8',
    )
  }
}

async function populateChallengeFixtures(contentRoot, challengePairs) {
  const enDir = path.join(contentRoot, 'collections', 'challenges', 'en')
  const ptDir = path.join(contentRoot, 'collections', 'challenges', 'pt-br')

  await mkdir(enDir, { recursive: true })
  await mkdir(ptDir, { recursive: true })

  for (let index = 1; index <= challengePairs; index += 1) {
    const padded = padNumber(index)

    await writeFile(
      path.join(enDir, `scale-challenge-${padded}.md`),
      buildChallengeFixture({
        challengeId: `scale-challenge-${padded}`,
        locale: 'en',
        order: index,
        slug: `scale-challenge-${padded}`,
        title: `Scale challenge ${padded}`,
      }),
      'utf8',
    )

    await writeFile(
      path.join(ptDir, `desafio-de-escala-${padded}.md`),
      buildChallengeFixture({
        challengeId: `scale-challenge-${padded}`,
        locale: 'pt-br',
        order: index,
        slug: `desafio-de-escala-${padded}`,
        title: `Desafio de escala ${padded}`,
      }),
      'utf8',
    )
  }
}

async function populateRoadmapFixtures(contentRoot, config) {
  await writeFile(
    path.join(contentRoot, 'collections', 'roadmaps', 'roadmaps.ts'),
    buildRoadmapModule(config),
    'utf8',
  )
}

async function createScaleContentRoot(config) {
  const tempRoot = await mkdtemp(path.join(os.tmpdir(), 'seniorpath-scale-'))
  const contentRoot = path.join(tempRoot, 'content')

  await cp(starterContentRoot, contentRoot, { recursive: true })
  await populateArticleFixtures(contentRoot, config)
  await populateConceptFixtures(contentRoot, config.conceptPairs)
  await populateGlossaryFixtures(contentRoot, config.glossaryPairs)
  await populateChallengeFixtures(contentRoot, config.challengePairs)
  await populateRoadmapFixtures(contentRoot, config)

  return { contentRoot, tempRoot }
}

function tailLines(value, lineCount = 20) {
  return value.trim().split('\n').slice(-lineCount).join('\n')
}

async function runMeasuredBuild(contentRoot) {
  const start = performance.now()

  return new Promise((resolve, reject) => {
    const child = spawn('bash', ['-lc', '/usr/bin/time -v pnpm build:site'], {
      cwd: repoRoot,
      env: {
        ...process.env,
        SITE_CONTENT_DIR: contentRoot,
      },
      stdio: ['ignore', 'pipe', 'pipe'],
    })

    let stdout = ''
    let stderr = ''

    child.stdout.on('data', (chunk) => {
      stdout += chunk.toString()
    })

    child.stderr.on('data', (chunk) => {
      stderr += chunk.toString()
    })

    child.on('error', reject)

    child.on('close', (code) => {
      const durationMs = Math.round(performance.now() - start)

      if (code !== 0) {
        reject(
          new Error(
            [
              `[scale-smoke] build exited with code ${code ?? 'unknown'}.`,
              '',
              '[stdout tail]',
              tailLines(stdout),
              '',
              '[stderr tail]',
              tailLines(stderr),
            ].join('\n'),
          ),
        )
        return
      }

      const rssMatch = stderr.match(/Maximum resident set size \(kbytes\):\s+(\d+)/)
      const pageCountMatch = stdout.match(/\[build\]\s+(\d+) page\(s\) built/i)

      resolve({
        durationMs,
        maxRssKb: rssMatch ? Number.parseInt(rssMatch[1], 10) : null,
        pageCount: pageCountMatch ? Number.parseInt(pageCountMatch[1], 10) : null,
      })
    })
  })
}

async function countHtmlFiles(rootPath) {
  let total = 0
  const entries = await readdir(rootPath, { withFileTypes: true })

  for (const entry of entries) {
    const fullPath = path.join(rootPath, entry.name)

    if (entry.isDirectory()) {
      total += await countHtmlFiles(fullPath)
      continue
    }

    if (entry.isFile() && entry.name.endsWith('.html')) {
      total += 1
    }
  }

  return total
}

async function pathExists(targetPath) {
  try {
    await stat(targetPath)
    return true
  } catch (error) {
    if (error?.code === 'ENOENT') {
      return false
    }

    throw error
  }
}

function formatMilliseconds(value) {
  return `${(value / 1000).toFixed(1)}s`
}

function formatKilobytes(value) {
  return `${(value / 1024).toFixed(1)} MiB`
}

const config = getScaleConfig()
const { contentRoot, tempRoot } = await createScaleContentRoot(config)

try {
  const metrics = await runMeasuredBuild(contentRoot)
  const htmlCount = await countHtmlFiles(distRoot)
  const expectedMinimumHtml =
    (config.articlePairs * 2) +
    (config.conceptPairs * 2) +
    (config.glossaryPairs * 2) +
    (config.challengePairs * 2) +
    (config.roadmapCount * 2)
  const generatedArticleOutput = path.join(distRoot, 'articles', 'foundations', 'scale-smoke-001', 'index.html')
  const generatedTrackOutput = path.join(distRoot, 'tracks', 'scale-smoke-track-001', 'index.html')
  const failures = []

  if (!(await pathExists(generatedArticleOutput))) {
    failures.push('generated article output was not built, so the scaled content root was not used as expected')
  }

  if (!(await pathExists(generatedTrackOutput))) {
    failures.push('generated track output was not built, so the scaled roadmap fixture did not render')
  }

  if (!(await pathExists(path.join(distRoot, 'pagefind', 'pagefind.js')))) {
    failures.push('pagefind runtime is missing after the scaled build')
  }

  if (htmlCount < expectedMinimumHtml) {
    failures.push(`html output count is too low: ${htmlCount} < ${expectedMinimumHtml}`)
  }

  if (metrics.durationMs > config.maxBuildMs) {
    failures.push(`build duration exceeded budget: ${formatMilliseconds(metrics.durationMs)} > ${formatMilliseconds(config.maxBuildMs)}`)
  }

  if (metrics.maxRssKb !== null && metrics.maxRssKb > config.maxRssKb) {
    failures.push(`peak RSS exceeded budget: ${formatKilobytes(metrics.maxRssKb)} > ${formatKilobytes(config.maxRssKb)}`)
  }

  console.log(`[scale-smoke] content root: ${contentRoot}`)
  console.log(
    `[scale-smoke] generated pairs: articles=${config.articlePairs}, concepts=${config.conceptPairs}, glossary=${config.glossaryPairs}, challenges=${config.challengePairs}, roadmaps=${config.roadmapCount}`,
  )
  console.log(
    `[scale-smoke] build metrics: duration=${formatMilliseconds(metrics.durationMs)}, peak_rss=${metrics.maxRssKb === null ? 'n/a' : formatKilobytes(metrics.maxRssKb)}, html=${htmlCount}, pages=${metrics.pageCount ?? 'n/a'}`,
  )

  if (failures.length > 0) {
    throw new Error(`Editorial scale smoke failed:\n${failures.map((failure) => `- ${failure}`).join('\n')}`)
  }

  console.log('[scale-smoke] budgets are within range')
} finally {
  await rm(tempRoot, { force: true, recursive: true })
}
