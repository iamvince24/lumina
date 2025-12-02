import { LAYOUT_DEFAULTS, NODE_DEFAULTS } from '@/lib/mindmap/constants';
import type {
  FlatMindMapNode,
  MindMapNodeData,
  ViewMode,
} from '@/lib/mindmap/types';
import { createHierarchy, flatToTree, getTreeSize } from '@/lib/mindmap/visx';
import { Group } from '@visx/group';
import { Tree } from '@visx/hierarchy';
import type { HierarchyPointLink, HierarchyPointNode } from 'd3-hierarchy';
import { useMemo } from 'react';
import { AnimatePresence } from 'framer-motion';
import { MindMapLinks } from './MindMapLinks';
import { MindMapNodes } from './MindMapNodes';

interface MindMapTreeProps {
  nodes: FlatMindMapNode[];
  viewMode: ViewMode;
  selectedNodeIds: string[];
  editingNodeId: string | null;
  zoom: number;
  ghostNodeRef: React.RefObject<SVGGElement | null>;
}

export function MindMapTree({
  nodes,
  viewMode,
  selectedNodeIds,
  editingNodeId,
  zoom,
  ghostNodeRef,
}: MindMapTreeProps) {
  // Convert flat nodes to tree structure
  const treeData = useMemo(() => flatToTree(nodes), [nodes]);

  // Create visx hierarchy
  const root = useMemo(() => {
    if (!treeData) return null;
    return createHierarchy(treeData);
  }, [treeData]);

  // Calculate layout size
  const treeSize = useMemo(() => getTreeSize(viewMode, 1200, 800), [viewMode]);

  // Node separation - defined inline to ensure type compatibility
  const separation = (
    a: { parent?: unknown },
    b: { parent?: unknown }
  ): number => {
    // Spacing between child nodes of same parent
    if (a.parent === b.parent) {
      return 1;
    }
    // Spacing between nodes of different parents
    return 1.5;
  };

  if (!root) {
    return (
      <Group>
        <text
          textAnchor="middle"
          dominantBaseline="central"
          fill="#9CA3AF"
          fontSize={14}
        >
          Start creating your mind map...
        </text>
      </Group>
    );
  }

  return (
    <Tree<MindMapNodeData>
      root={root}
      size={treeSize}
      separation={separation}
      nodeSize={
        viewMode === 'horizontal'
          ? [
              NODE_DEFAULTS.HEIGHT + LAYOUT_DEFAULTS.VERTICAL_SPACING,
              NODE_DEFAULTS.WIDTH + LAYOUT_DEFAULTS.HORIZONTAL_SPACING,
            ]
          : undefined
      }
    >
      {(tree) => (
        <Group>
          <AnimatePresence mode="sync">
            {/* Connection layer */}
            <MindMapLinks
              key="mindmap-links"
              links={tree.links() as HierarchyPointLink<MindMapNodeData>[]}
              viewMode={viewMode}
            />

            {/* Node layer */}
            <MindMapNodes
              key="mindmap-nodes"
              nodes={
                tree.descendants() as HierarchyPointNode<MindMapNodeData>[]
              }
              viewMode={viewMode}
              selectedNodeIds={selectedNodeIds}
              editingNodeId={editingNodeId}
              zoom={zoom}
              ghostNodeRef={ghostNodeRef}
            />
          </AnimatePresence>
        </Group>
      )}
    </Tree>
  );
}
