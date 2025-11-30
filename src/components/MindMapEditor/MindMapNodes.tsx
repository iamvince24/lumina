import { memo } from 'react';
import { Group } from '@visx/group';
import type { HierarchyPointNode } from 'd3-hierarchy';
import type { MindMapNodeData, ViewMode } from '@/lib/mindmap/types';
import { MindMapNode } from './MindMapNode';

interface MindMapNodesProps {
  nodes: HierarchyPointNode<MindMapNodeData>[];
  viewMode: ViewMode;
  selectedNodeIds: string[];
  editingNodeId: string | null;
  zoom: number;
}

export const MindMapNodes = memo<MindMapNodesProps>(
  ({ nodes, viewMode, selectedNodeIds, editingNodeId, zoom }) => {
    return (
      <Group className="nodes-layer">
        {nodes.map((node) => (
          <MindMapNode
            key={node.data.id}
            node={node}
            viewMode={viewMode}
            isSelected={selectedNodeIds.includes(node.data.id)}
            isEditing={editingNodeId === node.data.id}
            zoom={zoom}
          />
        ))}
      </Group>
    );
  }
);

MindMapNodes.displayName = 'MindMapNodes';
