export interface HierarchyNode {
  id: string
  parentId: string | null
  name: string
  slug: string
  level: number
  description: string | null
  children?: HierarchyNode[]
  createdAt: string
}

export interface Breadcrumb {
  id: string
  name: string
  slug: string
  level: number
}
