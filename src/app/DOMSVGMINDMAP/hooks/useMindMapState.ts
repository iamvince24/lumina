import { useState, useCallback } from 'react';
import { MindMapState, MindMapNode, NodeStyle } from '../types';
import { nodeIdGenerator } from '../utils/nodeIdGenerator';

const defaultNodeStyle: NodeStyle = {
  backgroundColor: 'transparent',
  textColor: '#333333',
  borderColor: 'transparent',
  borderWidth: 0,
  borderRadius: 8,
  fontSize: 14,
  fontWeight: 'normal',
  padding: 12,
};

export const useMindMapState = () => {
  const [state, setState] = useState<MindMapState>({
    nodes: new Map(),
    connections: [],
    selectedNodeIds: [],
    rootNodeId: null,
    viewport: { x: 0, y: 0, zoom: 1 },
  });

  const createNode = useCallback(
    (
      content: string,
      position: { x: number; y: number },
      parentId: string | null = null
    ): string => {
      const newId = nodeIdGenerator.generate();
      const newNode: MindMapNode = {
        id: newId,
        content,
        position,
        size: { width: 150, height: 60 },
        parentId,
        children: [],
        isCollapsed: false,
        style: { ...defaultNodeStyle },
        metadata: {
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      };

      setState((prev) => {
        const newNodes = new Map(prev.nodes);
        newNodes.set(newId, newNode);

        // 如果有父節點，更新父節點的 children
        if (parentId && newNodes.has(parentId)) {
          const parentNode = newNodes.get(parentId)!;
          parentNode.children = [...parentNode.children, newId];
          newNodes.set(parentId, { ...parentNode });
        }

        // 創建連接
        const newConnections = parentId
          ? [
              ...prev.connections,
              {
                id: `conn_${parentId}_${newId}`,
                sourceId: parentId,
                targetId: newId,
                style: {
                  strokeColor: '#94a3b8',
                  strokeWidth: 2,
                  strokeStyle: 'solid' as const,
                  arrowSize: 8,
                },
              },
            ]
          : prev.connections;

        return {
          ...prev,
          nodes: newNodes,
          connections: newConnections,
          rootNodeId: prev.rootNodeId || newId,
        };
      });

      return newId;
    },
    []
  );

  const updateNode = useCallback(
    (nodeId: string, updates: Partial<MindMapNode>) => {
      setState((prev) => {
        const newNodes = new Map(prev.nodes);
        const node = newNodes.get(nodeId);

        if (!node) return prev;

        if (updates.position) {
          const sameX = Math.abs(updates.position.x - node.position.x) < 0.5;
          const sameY = Math.abs(updates.position.y - node.position.y) < 0.5;
          if (sameX && sameY && Object.keys(updates).length === 1) {
            return prev;
          }
        }

        if (
          updates.content !== undefined &&
          updates.content.trim() === node.content
        ) {
          const onlyContent = Object.keys(updates).length === 1;
          if (onlyContent) return prev;
        }

        newNodes.set(nodeId, {
          ...node,
          ...updates,
          metadata: {
            createdAt: node.metadata?.createdAt ?? new Date(),
            updatedAt: new Date(),
          },
        });

        return { ...prev, nodes: newNodes };
      });
    },
    []
  );

  const updateNodeSize = useCallback(
    (nodeId: string, size: { width: number; height: number }) => {
      setState((prev) => {
        const newNodes = new Map(prev.nodes);
        const node = newNodes.get(nodeId);

        if (!node) return prev;

        const hasSizeChanged =
          Math.abs(node.size.width - size.width) > 0.5 ||
          Math.abs(node.size.height - size.height) > 0.5;

        if (!hasSizeChanged) return prev;

        newNodes.set(nodeId, {
          ...node,
          size,
          metadata: {
            createdAt: node.metadata?.createdAt ?? new Date(),
            updatedAt: new Date(),
          },
        });

        return { ...prev, nodes: newNodes };
      });
    },
    []
  );

  const deleteNode = useCallback((nodeId: string) => {
    setState((prev) => {
      const newNodes = new Map(prev.nodes);
      const node = newNodes.get(nodeId);

      if (!node) return prev;

      // 遞歸刪除所有子節點
      const deleteRecursive = (id: string) => {
        const n = newNodes.get(id);
        if (!n) return;

        n.children.forEach(deleteRecursive);
        newNodes.delete(id);
      };

      deleteRecursive(nodeId);

      // 從父節點的 children 中移除
      if (node.parentId && newNodes.has(node.parentId)) {
        const parent = newNodes.get(node.parentId)!;
        parent.children = parent.children.filter((id) => id !== nodeId);
        newNodes.set(node.parentId, { ...parent });
      }

      // 刪除相關連接
      const newConnections = prev.connections.filter(
        (conn) => conn.sourceId !== nodeId && conn.targetId !== nodeId
      );

      return {
        ...prev,
        nodes: newNodes,
        connections: newConnections,
        selectedNodeIds: prev.selectedNodeIds.filter((id) => id !== nodeId),
      };
    });
  }, []);

  const selectNode = useCallback(
    (nodeId: string, multiSelect: boolean = false) => {
      setState((prev) => ({
        ...prev,
        selectedNodeIds: multiSelect
          ? prev.selectedNodeIds.includes(nodeId)
            ? prev.selectedNodeIds.filter((id) => id !== nodeId)
            : [...prev.selectedNodeIds, nodeId]
          : [nodeId],
      }));
    },
    []
  );

  const clearSelection = useCallback(() => {
    setState((prev) => ({
      ...prev,
      selectedNodeIds: [],
    }));
  }, []);

  const updateViewport = useCallback(
    (updates: Partial<MindMapState['viewport']>) => {
      setState((prev) => ({
        ...prev,
        viewport: { ...prev.viewport, ...updates },
      }));
    },
    []
  );

  const toggleNodeCollapse = useCallback((nodeId: string) => {
    setState((prev) => {
      const newNodes = new Map(prev.nodes);
      const node = newNodes.get(nodeId);

      if (!node) return prev;

      newNodes.set(nodeId, {
        ...node,
        isCollapsed: !node.isCollapsed,
      });

      return { ...prev, nodes: newNodes };
    });
  }, []);

  return {
    state,
    createNode,
    updateNode,
    updateNodeSize,
    deleteNode,
    selectNode,
    clearSelection,
    updateViewport,
    toggleNodeCollapse,
  };
};
