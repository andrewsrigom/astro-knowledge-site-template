export type PreparationCatalogItem = {
  kind: 'guide' | 'challenge'
  refId: string
}

export type PreparationCatalogGroup = {
  id: string
  items: PreparationCatalogItem[]
  order: number
  title: string
}

export type PreparationCompetency = {
  description: string
  groups: PreparationCatalogGroup[]
  id: string
  order: number
  title: string
}

export function getPreparationCompetencyCounts(competency: PreparationCompetency) {
  const items = competency.groups.flatMap((group) => group.items)

  return {
    challenges: new Set(items.filter((item) => item.kind === 'challenge').map((item) => item.refId)).size,
    guides: new Set(items.filter((item) => item.kind === 'guide').map((item) => item.refId)).size,
  }
}

export function getGuideCompetencies(competencies: PreparationCompetency[], subjectId: string) {
  return competencies
    .filter((competency) => competency.groups.some((group) =>
      group.items.some((item) => item.kind === 'guide' && item.refId === subjectId),
    ))
    .sort((left, right) => left.order - right.order)
}
