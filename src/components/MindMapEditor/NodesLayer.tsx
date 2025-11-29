import { memo } from 'react';
import type { MindMapNode } from '@/lib/mindmap/types';
import { NodeGroup } from './NodeGroup';

interface NodesLayerProps {
  nodes: MindMapNode[];
  selectedNodeIds: string[];
  editingNodeId: string | null;
  onNodeClick: (nodeId: string, event: React.MouseEvent) => void;
  onNodeDoubleClick: (nodeId: string) => void;
  onNodeDragStart: (nodeId: string, event: React.MouseEvent) => void;
  onNodeLabelChange: (nodeId: string, label: string) => void;
  onNodeEditEnd: () => void;
}

export const NodesLayer = memo<NodesLayerProps>(
  ({
    nodes,
    selectedNodeIds,
    editingNodeId,
    onNodeClick,
    onNodeDoubleClick,
    onNodeDragStart,
    onNodeLabelChange,
    onNodeEditEnd,
  }) => {
    return (
      <g className="nodes-layer">
        {nodes.map((node) => (
          <NodeGroup
            key={node.id}
            node={node}
            isSelected={selectedNodeIds.includes(node.id)}
            isEditing={editingNodeId === node.id}
            onClick={(e) => onNodeClick(node.id, e)}
            onDoubleClick={() => onNodeDoubleClick(node.id)}
            onDragStart={(e) => onNodeDragStart(node.id, e)}
            onLabelChange={(label) => onNodeLabelChange(node.id, label)}
            onEditEnd={onNodeEditEnd}
          />
        ))}
      </g>
    );
  }
);

NodesLayer.displayName = 'NodesLayer';
