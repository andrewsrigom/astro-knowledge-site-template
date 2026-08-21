import { normalizeSiteLocale } from '@/lib/locale-config'

export const PREPARATION_AREA_IDS = [
  'javascript',
  'problem-solving',
  'react-frontend',
  'backend-apis',
  'data',
  'browser-interface',
  'system-design',
  'devops-cloud',
  'ai-engineering',
  'engineering',
  'experience',
] as const

export type PreparationAreaId = typeof PREPARATION_AREA_IDS[number]

type AreaDefinition = {
  description: string
  id: PreparationAreaId
  label: string
}

const areaCopy: Record<'en' | 'pt-br', Record<PreparationAreaId, Omit<AreaDefinition, 'id'>>> = {
  en: {
    javascript: {
      description: 'Runtime behavior, asynchronous code, objects and classes.',
      label: 'JavaScript',
    },
    'problem-solving': {
      description: 'Complexity, data structures and repeatable problem-solving patterns.',
      label: 'Problem solving',
    },
    'react-frontend': {
      description: 'Rendering, state, data flow, performance and front-end architecture.',
      label: 'React and front-end',
    },
    'backend-apis': {
      description: 'Node.js, HTTP contracts, authentication and application security.',
      label: 'Backend and APIs',
    },
    data: {
      description: 'SQL, indexes, transactions and data consistency.',
      label: 'Data',
    },
    'browser-interface': {
      description: 'Browser APIs, web performance and accessible interfaces.',
      label: 'Browser and interface',
    },
    'system-design': {
      description: 'Complete sessions on scale, cache, queues, reliability and design cases.',
      label: 'System Design',
    },
    'devops-cloud': {
      description: 'Linux, containers, delivery, cloud, observability and incident response.',
      label: 'DevOps and cloud',
    },
    'ai-engineering': {
      description: 'LLM applications, retrieval, agents, MCP, harnesses and evaluations.',
      label: 'AI Engineering',
    },
    engineering: {
      description: 'Software design, testing, diagnosis and confidence in production changes.',
      label: 'Software design and engineering',
    },
    experience: {
      description: 'Projects, incidents, decisions and technical communication.',
      label: 'Projects and experience',
    },
  },
  'pt-br': {
    javascript: {
      description: 'Runtime, código assíncrono, objetos e classes.',
      label: 'JavaScript',
    },
    'problem-solving': {
      description: 'Complexidade, estruturas de dados e padrões de resolução que podem ser reutilizados.',
      label: 'Resolução de problemas',
    },
    'react-frontend': {
      description: 'Renderização, estado, dados, performance e arquitetura de frontend.',
      label: 'React e frontend',
    },
    'backend-apis': {
      description: 'Node.js, contratos HTTP, autenticação e segurança da aplicação.',
      label: 'Backend e APIs',
    },
    data: {
      description: 'SQL, índices, transações e consistência dos dados.',
      label: 'Dados',
    },
    'browser-interface': {
      description: 'APIs do navegador, performance e interfaces acessíveis.',
      label: 'Browser e interface',
    },
    'system-design': {
      description: 'Sessões completas sobre escala, cache, filas, confiabilidade e casos de projeto.',
      label: 'System Design',
    },
    'devops-cloud': {
      description: 'Linux, containers, entrega, cloud, observabilidade e resposta a incidentes.',
      label: 'DevOps e cloud',
    },
    'ai-engineering': {
      description: 'Aplicações com LLMs, retrieval, agentes, MCP, harnesses e avaliações.',
      label: 'AI Engineering',
    },
    engineering: {
      description: 'Design de software, testes, diagnóstico e segurança para mudar produção.',
      label: 'Design de software e engenharia',
    },
    experience: {
      description: 'Projetos, incidentes, decisões e comunicação técnica.',
      label: 'Projetos e experiência',
    },
  },
}

export function getPreparationAreas(locale?: string | null): AreaDefinition[] {
  const normalizedLocale = normalizeSiteLocale(locale)
  const localizedCopy = areaCopy[normalizedLocale as keyof typeof areaCopy] ?? areaCopy.en

  return PREPARATION_AREA_IDS.map((id) => ({ id, ...localizedCopy[id] }))
}

export function getPreparationArea(areaId: PreparationAreaId, locale?: string | null) {
  return getPreparationAreas(locale).find((area) => area.id === areaId)
}
