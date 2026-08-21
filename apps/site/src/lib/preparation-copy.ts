import { normalizeSiteLocale } from '@/lib/locale-config'

const copy = {
  en: {
    availableInPortuguese: 'The Web Components pilot is currently available in Portuguese.',
    draft: 'Local draft',
    draftsPending: 'The chapters are still being reviewed before publication.',
    emptyCta: 'Open the Portuguese pilot',
    inThisManual: 'On this page',
    level: {
      advanced: 'Advanced',
      beginner: 'Beginner',
      intermediate: 'Intermediate',
    },
    manual: 'Technical guide',
    note: 'guide',
    notes: 'guides',
    objectives: 'In this guide',
    practice: 'Practice',
    practiceCount: 'practice',
    practices: 'practices',
    relatedGlossary: 'Related glossary',
    sources: 'Official references',
    sourceKinds: {
      'engineering-case-study': 'Real engineering cases',
      'interview-reference': 'Question and interview references',
      'official-documentation': 'Official documentation',
      research: 'Research',
    },
    studyLoop: 'Choose a volume and open the chapter you need to understand or review.',
    studyLoopTitle: 'How to use',
    subjects: 'Subjects',
  },
  'pt-br': {
    availableInPortuguese: 'O piloto de Web Components está disponível em português.',
    draft: 'Rascunho local',
    draftsPending: 'Os capítulos ainda estão em revisão antes da publicação.',
    emptyCta: 'Abrir o piloto em português',
    inThisManual: 'Nesta página',
    level: {
      advanced: 'Avançado',
      beginner: 'Iniciante',
      intermediate: 'Intermediário',
    },
    manual: 'Guia técnico',
    note: 'guia',
    notes: 'guias',
    objectives: 'Neste guia',
    practice: 'Prática',
    practiceCount: 'prática',
    practices: 'práticas',
    relatedGlossary: 'Glossário relacionado',
    sources: 'Referências oficiais',
    sourceKinds: {
      'engineering-case-study': 'Casos reais de engenharia',
      'interview-reference': 'Referências de perguntas e processos',
      'official-documentation': 'Documentação oficial',
      research: 'Pesquisas',
    },
    studyLoop: 'Escolha um volume e abra o capítulo que precisa entender ou revisar.',
    studyLoopTitle: 'Como usar',
    subjects: 'Assuntos',
  },
} as const

export function getPreparationCopy(locale?: string | null) {
  const normalizedLocale = normalizeSiteLocale(locale)
  return copy[normalizedLocale as keyof typeof copy] ?? copy.en
}
