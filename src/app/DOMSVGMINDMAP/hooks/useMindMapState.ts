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
    viewport: { x: 0, y: 0, zoom: 2 }, // x, y will be adjusted in MindMapEditor
  });

  const createNode = useCallback(
    (
      content: string,
      position: { x: number; y: number },
      parentId: string | null = null,
      afterNodeId: string | null = null // 新增：在此節點後插入
    ): string => {
      const newId = nodeIdGenerator.generate();
      const newNode: MindMapNode = {
        id: newId,
        content,
        position,
        size: { width: 200, height: 40 },
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

        // 防止 React Strict Mode 下重複添加節點
        if (newNodes.has(newId)) {
          return prev;
        }

        newNodes.set(newId, newNode);

        // 如果有父節點，更新父節點的 children（防止重複添加）
        if (parentId && newNodes.has(parentId)) {
          const parentNode = newNodes.get(parentId)!;
          // 檢查是否已經存在此子節點
          if (!parentNode.children.includes(newId)) {
            let newChildren: string[];

            // 如果指定了 afterNodeId，則在該節點後插入
            if (afterNodeId && parentNode.children.includes(afterNodeId)) {
              const afterIndex = parentNode.children.indexOf(afterNodeId);
              newChildren = [
                ...parentNode.children.slice(0, afterIndex + 1),
                newId,
                ...parentNode.children.slice(afterIndex + 1),
              ];
            } else {
              // 否則添加到末尾
              newChildren = [...parentNode.children, newId];
            }

            parentNode.children = newChildren;
            newNodes.set(parentId, { ...parentNode });
          }
        }

        // 創建連接（防止重複添加）
        const connectionExists = prev.connections.some(
          (conn) => conn.sourceId === parentId && conn.targetId === newId
        );

        const newConnections =
          parentId && !connectionExists
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

  // Move node to a new parent or reorder among siblings
  const moveNode = useCallback(
    (nodeId: string, newParentId: string, insertIndex?: number) => {
      setState((prev) => {
        const newNodes = new Map(prev.nodes);
        const node = newNodes.get(nodeId);
        const newParent = newNodes.get(newParentId);

        if (!node || !newParent) return prev;

        // Prevent moving a node to be its own descendant
        const isDescendant = (
          ancestorId: string,
          descendantId: string
        ): boolean => {
          const ancestor = newNodes.get(ancestorId);
          if (!ancestor) return false;
          if (ancestor.children.includes(descendantId)) return true;
          return ancestor.children.some((childId) =>
            isDescendant(childId, descendantId)
          );
        };

        if (isDescendant(nodeId, newParentId)) return prev;

        const oldParentId = node.parentId;

        // If moving to same parent at same position, skip
        if (oldParentId === newParentId) {
          const currentIndex = newParent.children.indexOf(nodeId);
          if (
            insertIndex === undefined ||
            insertIndex === currentIndex ||
            insertIndex === currentIndex + 1
          ) {
            return prev;
          }
        }

        // Remove from old parent's children
        if (oldParentId && newNodes.has(oldParentId)) {
          const oldParent = newNodes.get(oldParentId)!;
          oldParent.children = oldParent.children.filter((id) => id !== nodeId);
          newNodes.set(oldParentId, { ...oldParent });
        }

        // Add to new parent's children at specified index
        const newChildren = newParent.children.filter((id) => id !== nodeId);
        const targetIndex =
          insertIndex !== undefined
            ? Math.min(insertIndex, newChildren.length)
            : newChildren.length;
        newChildren.splice(targetIndex, 0, nodeId);
        newNodes.set(newParentId, { ...newParent, children: newChildren });

        // Update node's parentId
        newNodes.set(nodeId, { ...node, parentId: newParentId });

        // Update connections: remove old connection, add new one
        const newConnections = prev.connections.filter(
          (c) => c.targetId !== nodeId
        );
        newConnections.push({
          id: `conn_${newParentId}_${nodeId}`,
          sourceId: newParentId,
          targetId: nodeId,
          style: {
            strokeColor: '#94a3b8',
            strokeWidth: 2,
            strokeStyle: 'solid' as const,
            arrowSize: 8,
          },
        });

        // Update rootNodeId if moving root to become child
        const newRootNodeId =
          nodeId === prev.rootNodeId ? newParentId : prev.rootNodeId;

        return {
          ...prev,
          nodes: newNodes,
          connections: newConnections,
          rootNodeId: newRootNodeId,
        };
      });
    },
    []
  );

  // Reorder node within its parent's children array (move up/down)
  const reorderNodeInParent = useCallback(
    (nodeId: string, direction: 'up' | 'down') => {
      setState((prev) => {
        const node = prev.nodes.get(nodeId);
        if (!node || !node.parentId) return prev;

        const parent = prev.nodes.get(node.parentId);
        if (!parent) return prev;

        const currentIndex = parent.children.indexOf(nodeId);
        if (currentIndex === -1) return prev;

        const newIndex =
          direction === 'up' ? currentIndex - 1 : currentIndex + 1;

        // Check bounds
        if (newIndex < 0 || newIndex >= parent.children.length) return prev;

        // Swap positions
        const newChildren = [...parent.children];
        [newChildren[currentIndex], newChildren[newIndex]] = [
          newChildren[newIndex],
          newChildren[currentIndex],
        ];

        const newNodes = new Map(prev.nodes);
        newNodes.set(node.parentId, { ...parent, children: newChildren });

        return { ...prev, nodes: newNodes };
      });
    },
    []
  );

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
    moveNode,
    reorderNodeInParent,
  };
};
