export type ContentStatus = 'active' | 'archived' | 'draft'

export function isVisibleContentStatus(status: ContentStatus, includeDrafts: boolean) {
  return status === 'active' || (includeDrafts && status === 'draft')
}
