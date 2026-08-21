export type ProgramPriority = 'essential' | 'recommended' | 'optional'

export type ProgramItem = {
  href: string | null
  id: string
  kind: 'guide' | 'challenge' | 'checkpoint'
  label: string
}

export type ProgramGroup = {
  id: string
  items: ProgramItem[]
  order: number
  priority: ProgramPriority
  title: string
}

export type ProgramCompetency = {
  goal: string
  groups: ProgramGroup[]
  id: string
  order: number
  title: string
}

export function getProgramItemIds(
  competencies: ProgramCompetency[],
  priority?: ProgramPriority,
) {
  return competencies.flatMap((competency) =>
    competency.groups
      .filter((group) => !priority || group.priority === priority)
      .flatMap((group) => group.items.map((item) => item.id)),
  )
}

export function filterKnownProgramItemIds(
  competencies: ProgramCompetency[],
  candidateIds: unknown,
) {
  if (!Array.isArray(candidateIds)) return []

  const knownIds = new Set(getProgramItemIds(competencies))
  return [...new Set(candidateIds.filter((id): id is string => typeof id === 'string' && knownIds.has(id)))]
}

export function getProgramProgress(requiredIds: string[], completedIds: string[]) {
  const completed = new Set(completedIds)
  const completedRequired = requiredIds.filter((id) => completed.has(id)).length

  return {
    completedRequired,
    progress: requiredIds.length === 0 ? 0 : Math.round((completedRequired / requiredIds.length) * 100),
  }
}

export function getProgramStorageKey(prefix: string, programId: string, version = 'v2') {
  return `${prefix}.${programId}.${version}`
}
