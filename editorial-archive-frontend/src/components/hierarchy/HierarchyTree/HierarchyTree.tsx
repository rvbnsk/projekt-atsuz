import { useState } from 'react'
import { ChevronRight, ChevronDown, MapPin } from 'lucide-react'
import type { HierarchyNode } from '@/types/hierarchy.types'
import { cn } from '@/utils/cn'

interface HierarchyTreeNodeProps {
  node: HierarchyNode
  selectedId: string | undefined
  onSelect: (node: HierarchyNode) => void
  depth?: number
}

function HierarchyTreeNode({
  node,
  selectedId,
  onSelect,
  depth = 0,
}: HierarchyTreeNodeProps) {
  const [expanded, setExpanded] = useState(false)
  const hasChildren = node.children && node.children.length > 0
  const isSelected = node.id === selectedId

  return (
    <li>
      <div
        className={cn(
          'flex items-center gap-1 px-2 py-1.5 rounded-lg cursor-pointer transition-colors text-sm',
          isSelected
            ? 'font-semibold'
            : 'hover:bg-[var(--color-surface-variant)]',
        )}
        style={{
          paddingLeft: `${0.5 + depth * 1}rem`,
          background: isSelected ? 'var(--color-primary-fixed)' : undefined,
          color: isSelected ? 'var(--color-primary)' : 'var(--color-on-surface)',
        }}
        onClick={() => onSelect(node)}
        role="button"
        tabIndex={0}
        aria-pressed={isSelected}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            onSelect(node)
          }
        }}
      >
        {hasChildren ? (
          <button
            className="flex items-center shrink-0 rounded hover:bg-[var(--color-surface-variant)] p-0.5"
            aria-label={expanded ? 'Zwiń' : 'Rozwiń'}
            onClick={(e) => {
              e.stopPropagation()
              setExpanded((v) => !v)
            }}
            tabIndex={-1}
          >
            {expanded ? (
              <ChevronDown size={14} aria-hidden="true" />
            ) : (
              <ChevronRight size={14} aria-hidden="true" />
            )}
          </button>
        ) : (
          <MapPin size={12} className="shrink-0 ml-1 mr-0.5" aria-hidden="true" />
        )}
        <span className="truncate">{node.name}</span>
      </div>

      {hasChildren && expanded && (
        <ul role="list">
          {node.children!.map((child) => (
            <HierarchyTreeNode
              key={child.id}
              node={child}
              selectedId={selectedId}
              onSelect={onSelect}
              depth={depth + 1}
            />
          ))}
        </ul>
      )}
    </li>
  )
}

interface HierarchyTreeProps {
  nodes: HierarchyNode[]
  selectedId?: string
  onSelect: (node: HierarchyNode) => void
}

export default function HierarchyTree({ nodes, selectedId, onSelect }: HierarchyTreeProps) {
  return (
    <nav aria-label="Hierarchia lokalizacji">
      <ul role="list" className="flex flex-col gap-0.5">
        {nodes.map((node) => (
          <HierarchyTreeNode
            key={node.id}
            node={node}
            selectedId={selectedId}
            onSelect={onSelect}
          />
        ))}
      </ul>
    </nav>
  )
}
