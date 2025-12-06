import { useCallback, useEffect, useMemo, useRef } from 'react';
import { MindMapNode } from '../types';
import { calculateTreeLayout, LayoutConfig } from '../utils/layoutAlgorithm';

interface UseAutoLayoutProps {
  nodes: Map<string, MindMapNode>;
  rootNodeId: string | null;
  onLayoutUpdate: (nodeId: string, position: { x: number; y: number }) => void;
}

export const useAutoLayout = ({
  nodes,
  rootNodeId,
  onLayoutUpdate,
}: UseAutoLayoutProps) => {
  const nodesRef = useRef(nodes);

  // Keep ref in sync outside render path
  useEffect(() => {
    nodesRef.current = nodes;
  }, [nodes]);

  const applyTreeLayout = useCallback(
    (config?: Partial<LayoutConfig>) => {
      if (!rootNodeId) return;

      const anchor = nodesRef.current.get(rootNodeId)?.position ?? {
        x: 0,
        y: 0,
      };

      const positions = calculateTreeLayout(
        nodesRef.current,
        rootNodeId,
        config
      );

      const newRootPos = positions.get(rootNodeId) ?? { x: 0, y: 0 };
      const delta = { x: anchor.x - newRootPos.x, y: anchor.y - newRootPos.y };

      positions.forEach((position, nodeId) => {
        onLayoutUpdate(nodeId, {
          x: position.x + delta.x,
          y: position.y + delta.y,
        });
      });
    },
    [rootNodeId, onLayoutUpdate]
  );

  const layoutTriggerKey = useMemo(() => {
    const entries = Array.from(nodes.values()).map((node) => {
      const sizeKey = `${node.size.width.toFixed(2)}x${node.size.height.toFixed(2)}`;
      const structureKey = `${node.parentId ?? 'root'}-${node.children.join(',')}`;
      return `${node.id}:${sizeKey}:${structureKey}:${node.isCollapsed ? '1' : '0'}`;
    });

    entries.sort();
    return `${rootNodeId ?? 'none'}|${entries.join('|')}`;
  }, [nodes, rootNodeId]);

  return {
    applyTreeLayout,
    layoutTriggerKey,
  };
};
