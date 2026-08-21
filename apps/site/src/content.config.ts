import { defineCollection } from 'astro:content'
import { glob } from 'astro/loaders'
import { z } from 'astro/zod'
import { TOPIC_DEFINITIONS } from '@template/content'

import { PREPARATION_AREA_IDS } from '@/lib/preparation-areas'

const topicIdSchema = z.enum(TOPIC_DEFINITIONS.map((topic) => topic.id) as [string, ...string[]])

const articles = defineCollection({
  loader: glob({
    base: './.content/articles',
    pattern: '**/*.md',
  }),
  schema: z.object({
    category: z.string().min(1).default('Programming'),
    branchId: z.string().min(1).optional(),
    description: z.string().min(1),
    articleId: z.string().min(1),
    kind: z.enum(['article', 'note']).default('article'),
    level: z.enum(['beginner', 'intermediate', 'advanced']).default('intermediate'),
    locale: z.string().min(1).default('en'),
    order: z.number().int().nonnegative().default(100),
    path: z.array(z.string().min(1)).min(1),
    pillarId: z.string().min(1).optional(),
    practiceChecklist: z.array(z.string()).default([]),
    pubDate: z.coerce.date(),
    relationships: z.array(z.string().min(1)).default([]),
    relatedDeckIds: z.array(z.string()).default([]),
    readiness: z.object({
      draft_complete: z.boolean().default(false),
      examples_added: z.boolean().default(false),
      interview_angle: z.boolean().default(false),
      language_simple: z.boolean().default(false),
      practice_items_filled: z.boolean().default(false),
      reasoning_complete: z.boolean().default(false),
      relationships_set: z.boolean().default(false),
      senior_layer: z.boolean().default(false),
      takeaways_filled: z.boolean().default(false),
      voice_human: z.boolean().default(false),
    }),
    summary: z.string().min(1),
    status: z.enum(['active', 'archived', 'draft']).default('draft'),
    takeaways: z.array(z.string()).default([]),
    tags: z.array(z.string()).default([]),
    title: z.string().min(1),
    topic: z.string().optional(),
    topicIds: z.array(topicIdSchema).min(1),
    trackEligible: z.boolean().default(true),
    updatedDate: z.coerce.date().optional(),
  }),
})

const glossary = defineCollection({
  loader: glob({
    base: './.content/glossary',
    pattern: '**/*.md',
  }),
  schema: z.object({
    aliases: z.array(z.string().min(1)).default([]),
    description: z.string().min(1),
    locale: z.string().min(1).default('en'),
    pubDate: z.coerce.date(),
    status: z.enum(['active', 'archived', 'draft']).default('active'),
    summary: z.string().min(1),
    tags: z.array(z.string()).default([]),
    termId: z.string().min(1),
    title: z.string().min(1),
    updatedDate: z.coerce.date().optional(),
  }),
})

const concepts = defineCollection({
  loader: glob({
    base: './.content/concepts',
    pattern: '**/*.md',
  }),
  schema: z.object({
    conceptId: z.string().min(1),
    description: z.string().min(1),
    domainId: z.string().min(1),
    groupId: z.string().min(1),
    locale: z.string().min(1).default('en'),
    pubDate: z.coerce.date(),
    relatedArticleIds: z.array(z.string().min(1)).default([]),
    status: z.enum(['active', 'archived', 'draft']).default('active'),
    summary: z.string().min(1),
    tags: z.array(z.string()).default([]),
    title: z.string().min(1),
    updatedDate: z.coerce.date().optional(),
  }),
})

const challenges = defineCollection({
  loader: glob({
    base: './.content/challenges',
    pattern: '**/*.md',
  }),
  schema: z.object({
    branchId: z.string().min(1).optional(),
    commonMistakes: z.array(z.string()).default([]),
    challengeId: z.string().min(1),
    complexity: z
      .object({
        space: z.string().min(1),
        time: z.string().min(1),
      })
      .optional(),
    description: z.string().min(1),
    estimatedMinutes: z.number().int().positive().default(20),
    format: z.enum(['coding', 'debugging', 'system-design', 'incident', 'oral']).default('coding'),
    hints: z.array(z.string()).default([]),
    level: z.enum(['beginner', 'intermediate', 'advanced']).default('intermediate'),
    locale: z.string().min(1).default('en'),
    order: z.number().int().nonnegative().default(100),
    pillarId: z.string().min(1).optional(),
    problemStatement: z.string().optional(),
    walkthrough: z.string().optional(),
    pubDate: z.coerce.date(),
    relatedChallengeIds: z.array(z.string().min(1)).default([]),
    relatedPreparationIds: z.array(z.string().min(1)).default([]),
    relatedArticleIds: z.array(z.string()).default([]),
    solutionLanguage: z.enum(['javascript', 'typescript', 'python']).default('typescript'),
    starterCode: z.string().optional(),
    status: z.enum(['active', 'archived', 'draft']).default('active'),
    summary: z.string().min(1),
    tags: z.array(z.string()).default([]),
    testCases: z
      .array(
        z.object({
          description: z.string(),
          expected: z.unknown(),
          input: z.array(z.unknown()),
        }),
      )
      .default([]),
    title: z.string().min(1),
    type: z.string().min(1),
    typeLabel: z.string().min(1),
    updatedDate: z.coerce.date().optional(),
    whatToNotice: z.array(z.string()).default([]),
  }),
})

const preparation = defineCollection({
  loader: glob({
    base: './.content/preparation',
    pattern: '**/*.md',
  }),
  schema: z.object({
    areaId: z.enum(PREPARATION_AREA_IDS),
    description: z.string().min(1),
    estimatedMinutes: z.number().int().positive(),
    guideId: z.string().min(1),
    glossaryIds: z.array(z.string().min(1)).default([]),
    level: z.enum(['beginner', 'intermediate', 'advanced']),
    locale: z.string().min(1),
    method: z.object({
      ariaLabel: z.string().min(1),
      direction: z.enum(['horizontal', 'vertical']).default('horizontal'),
      steps: z.array(
        z.object({
          hint: z.string().min(1).optional(),
          label: z.string().min(1),
          tone: z.enum(['blue', 'coral', 'lemon', 'mint', 'pink', 'violet']).default('blue'),
        }),
      ).min(2),
    }).optional(),
    objectives: z.array(z.string().min(1)).min(3),
    order: z.number().int().nonnegative(),
    review: z.object({
      editorial: z.boolean(),
      practiced: z.boolean(),
      technical: z.boolean(),
    }),
    practiceIds: z.array(z.string().min(1)).default([]),
    sources: z.array(
      z.object({
        kind: z
          .enum(['interview-reference', 'official-documentation', 'engineering-case-study', 'research'])
          .default('official-documentation'),
        label: z.string().min(1),
        url: z.url(),
      }),
    ).min(4),
    status: z.enum(['active', 'archived', 'draft']).default('draft'),
    subjectId: z.string().min(1),
    title: z.string().min(1),
  }),
})

const preparationPrograms = defineCollection({
  loader: glob({
    base: './.content/preparation/programs',
    pattern: '**/*.json',
  }),
  schema: z.object({
    description: z.string().min(1),
    competencies: z.array(
      z.object({
        goal: z.string().min(1),
        groups: z.array(
          z.object({
            id: z.string().min(1),
            items: z.array(
              z.object({
                id: z.string().min(1),
                kind: z.enum(['guide', 'challenge', 'checkpoint']),
                label: z.string().min(1),
                refId: z.string().min(1).optional(),
              }),
            ).min(1),
            order: z.number().int().positive(),
            priority: z.enum(['essential', 'recommended', 'optional']),
            title: z.string().min(1),
          }),
        ).min(1),
        id: z.string().min(1),
        order: z.number().int().positive(),
        title: z.string().min(1),
      }),
    ).min(1),
    legacyProgramIds: z.array(z.string().min(1)).default([]),
    locale: z.string().min(1),
    programId: z.string().min(1),
    status: z.enum(['active', 'archived', 'draft']).default('draft'),
    title: z.string().min(1),
  }),
})

const preparationCatalogs = defineCollection({
  loader: glob({
    base: './.content/preparation/catalogs',
    pattern: '**/*.json',
  }),
  schema: z.object({
    catalogId: z.literal('preparation-book'),
    competencies: z.array(
      z.object({
        description: z.string().min(1),
        groups: z.array(
          z.object({
            id: z.string().min(1),
            items: z.array(
              z.object({
                kind: z.enum(['guide', 'challenge']),
                refId: z.string().min(1),
              }),
            ).min(1),
            order: z.number().int().positive(),
            title: z.string().min(1),
          }),
        ).min(1),
        id: z.string().min(1),
        order: z.number().int().positive(),
        title: z.string().min(1),
      }),
    ).default([]),
    description: z.string().min(1),
    locale: z.string().min(1),
    schemaVersion: z.literal(2),
    status: z.enum(['active', 'archived', 'draft']).default('draft'),
    title: z.string().min(1),
    volumes: z.array(
      z.object({
        description: z.string().min(1),
        id: z.string().min(1),
        legacyCompetencyIds: z.array(z.string().min(1)).default([]),
        order: z.number().int().positive(),
        parts: z.array(
          z.object({
            chapters: z.array(
              z.object({
                guideId: z.string().min(1),
                order: z.number().int().positive(),
              }),
            ),
            description: z.string().trim().min(1).optional(),
            id: z.string().min(1),
            order: z.number().int().positive(),
            practices: z.array(
              z.object({
                challengeId: z.string().min(1),
                order: z.number().int().positive(),
              }),
            ),
            references: z.array(
              z.object({
                kind: z.enum(['guide', 'challenge']),
                refId: z.string().min(1),
                relation: z.enum(['prerequisite', 'related', 'practice']),
              }),
            ),
            title: z.string().min(1),
          }).refine(
            (part) => part.chapters.length + part.practices.length + part.references.length > 0,
            { message: 'A preparation book part must contain a chapter, practice, or reference.' },
          ),
        ).min(1),
        title: z.string().min(1),
      }),
    ).min(1),
  }),
})

export const collections = {
  articles,
  challenges,
  concepts,
  glossary,
  preparation,
  preparationCatalogs,
  preparationPrograms,
}
