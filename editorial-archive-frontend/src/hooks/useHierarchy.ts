import { useQuery } from '@tanstack/react-query'
import { hierarchyApi } from '@/api/hierarchy.api'

export const hierarchyKeys = {
  all: ['hierarchy'] as const,
  tree: () => [...hierarchyKeys.all, 'tree'] as const,
  node: (id: string) => [...hierarchyKeys.all, 'node', id] as const,
  breadcrumbs: (id: string) => [...hierarchyKeys.all, 'breadcrumbs', id] as const,
}

export function useHierarchyTree() {
  return useQuery({
    queryKey: hierarchyKeys.tree(),
    queryFn: hierarchyApi.getTree,
    staleTime: 5 * 60 * 1000, // hierarchy changes rarely
  })
}

export function useHierarchyNode(id: string | undefined) {
  return useQuery({
    queryKey: hierarchyKeys.node(id!),
    queryFn: () => hierarchyApi.getById(id!),
    enabled: !!id,
  })
}

export function useBreadcrumbs(id: string | undefined) {
  return useQuery({
    queryKey: hierarchyKeys.breadcrumbs(id!),
    queryFn: () => hierarchyApi.getBreadcrumbs(id!),
    enabled: !!id,
  })
}
