/**
 * NewMindMap 狀態管理 Store
 * 使用 Zustand 管理心智圖的所有狀態和操作
 * 基於 DOMSVGMINDMAP 的 useMindMapState hook 設計
 */

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type {
  MindMapNode,
  Connection,
  Viewport,
  ViewMode,
  Position,
  Size,
  StoredNode,
  NodeStyle,
} from '@/components/NewMindMapEditor/types';
import {
  serializeNodes,
  deserializeNodes,
  findRootNodeId,
  rebuildConnections,
} from '@/components/NewMindMapEditor/utils/serialization';
import { nodeIdGenerator } from '@/components/NewMindMapEditor/utils/nodeIdGenerator';

// ========================================
// Default Values
// ========================================

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

const defaultConnectionStyle = {
  strokeColor: '#94a3b8',
  strokeWidth: 2,
  strokeStyle: 'solid' as const,
  arrowSize: 8,
};

// ========================================
// Store Interface
// ========================================

interface NewMindMapStore {
  // === State ===
  nodes: Map<string, MindMapNode>;
  connections: Connection[];
  selectedNodeIds: string[];
  rootNodeId: string | null;
  viewport: Viewport;
  viewMode: ViewMode;
  isLoading: boolean;
  error: string | null;

  // === Node Operations ===
  createNode: (
    content: string,
    position: Position,
    parentId: string | null,
    afterNodeId?: string | null
  ) => string;
  updateNode: (nodeId: string, updates: Partial<MindMapNode>) => void;
  updateNodeSize: (nodeId: string, size: Size) => void;
  deleteNode: (nodeId: string) => void;
  toggleNodeCollapse: (nodeId: string) => void;
  moveNode: (nodeId: string, newParentId: string, insertIndex?: number) => void;
  reorderNodeInParent: (nodeId: string, direction: 'up' | 'down') => void;

  // === Selection Operations ===
  selectNode: (nodeId: string, multiSelect?: boolean) => void;
  clearSelection: () => void;

  // === Viewport Operations ===
  updateViewport: (updates: Partial<Viewport>) => void;

  // === View Mode ===
  setViewMode: (mode: ViewMode) => void;

  // === Data Loading/Reset ===
  loadMindMap: (
    nodes: Map<string, MindMapNode>,
    connections: Connection[],
    rootNodeId: string | null
  ) => void;
  loadFromSerialized: (nodes: StoredNode[], connections?: Connection[]) => void;
  reset: () => void;

  // === Derived Data ===
  getVisibleNodes: () => MindMapNode[];
  getSerializedData: () => { nodes: StoredNode[]; connections: Connection[] };
}

// ========================================
// Initial State
// ========================================

const initialState = {
  nodes: new Map<string, MindMapNode>(),
  connections: [] as Connection[],
  selectedNodeIds: [] as string[],
  rootNodeId: null as string | null,
  viewport: { x: 0, y: 0, zoom: 2 },
  viewMode: 'mindmap' as ViewMode,
  isLoading: false,
  error: null as string | null,
};

// ========================================
// Store Implementation
// ========================================

export const useNewMindMapStore = create<NewMindMapStore>()(
  devtools(
    (set, get) => ({
      ...initialState,

      // === Node Operations ===

      createNode: (
        content: string,
        position: Position,
        parentId: string | null = null,
        afterNodeId: string | null = null
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

        set((state) => {
          const newNodes = new Map(state.nodes);

          // Prevent duplicate adds in React Strict Mode
          if (newNodes.has(newId)) {
            return state;
          }

          newNodes.set(newId, newNode);

          // If has parent, update parent's children
          if (parentId && newNodes.has(parentId)) {
            const parentNode = newNodes.get(parentId)!;
            if (!parentNode.children.includes(newId)) {
              let newChildren: string[];

              // Insert after specified node if provided
              if (afterNodeId && parentNode.children.includes(afterNodeId)) {
                const afterIndex = parentNode.children.indexOf(afterNodeId);
                newChildren = [
                  ...parentNode.children.slice(0, afterIndex + 1),
                  newId,
                  ...parentNode.children.slice(afterIndex + 1),
                ];
              } else {
                newChildren = [...parentNode.children, newId];
              }

              newNodes.set(parentId, { ...parentNode, children: newChildren });
            }
          }

          // Create connection (prevent duplicates)
          const connectionExists = state.connections.some(
            (conn) => conn.sourceId === parentId && conn.targetId === newId
          );

          const newConnections =
            parentId && !connectionExists
              ? [
                  ...state.connections,
                  {
                    id: `conn_${parentId}_${newId}`,
                    sourceId: parentId,
                    targetId: newId,
                    style: defaultConnectionStyle,
                  },
                ]
              : state.connections;

          return {
            nodes: newNodes,
            connections: newConnections,
            rootNodeId: state.rootNodeId || newId,
          };
        });

        return newId;
      },

      updateNode: (nodeId: string, updates: Partial<MindMapNode>) => {
        set((state) => {
          const newNodes = new Map(state.nodes);
          const node = newNodes.get(nodeId);

          if (!node) return state;

          // Optimize: skip if position unchanged
          if (updates.position) {
            const sameX = Math.abs(updates.position.x - node.position.x) < 0.5;
            const sameY = Math.abs(updates.position.y - node.position.y) < 0.5;
            if (sameX && sameY && Object.keys(updates).length === 1) {
              return state;
            }
          }

          // Optimize: skip if content unchanged
          if (
            updates.content !== undefined &&
            updates.content.trim() === node.content
          ) {
            const onlyContent = Object.keys(updates).length === 1;
            if (onlyContent) return state;
          }

          newNodes.set(nodeId, {
            ...node,
            ...updates,
            metadata: {
              createdAt: node.metadata?.createdAt ?? new Date(),
              updatedAt: new Date(),
            },
          });

          return { nodes: newNodes };
        });
      },

      updateNodeSize: (nodeId: string, size: Size) => {
        set((state) => {
          const newNodes = new Map(state.nodes);
          const node = newNodes.get(nodeId);

          if (!node) return state;

          const hasSizeChanged =
            Math.abs(node.size.width - size.width) > 0.5 ||
            Math.abs(node.size.height - size.height) > 0.5;

          if (!hasSizeChanged) return state;

          newNodes.set(nodeId, {
            ...node,
            size,
            metadata: {
              createdAt: node.metadata?.createdAt ?? new Date(),
              updatedAt: new Date(),
            },
          });

          return { nodes: newNodes };
        });
      },

      deleteNode: (nodeId: string) => {
        set((state) => {
          const newNodes = new Map(state.nodes);
          const node = newNodes.get(nodeId);

          if (!node) return state;

          // Recursively delete all children
          const deleteRecursive = (id: string) => {
            const n = newNodes.get(id);
            if (!n) return;

            n.children.forEach(deleteRecursive);
            newNodes.delete(id);
          };

          deleteRecursive(nodeId);

          // Remove from parent's children
          if (node.parentId && newNodes.has(node.parentId)) {
            const parent = newNodes.get(node.parentId)!;
            parent.children = parent.children.filter((id) => id !== nodeId);
            newNodes.set(node.parentId, { ...parent });
          }

          // Remove related connections
          const newConnections = state.connections.filter(
            (conn) => conn.sourceId !== nodeId && conn.targetId !== nodeId
          );

          return {
            nodes: newNodes,
            connections: newConnections,
            selectedNodeIds: state.selectedNodeIds.filter(
              (id) => id !== nodeId
            ),
          };
        });
      },

      toggleNodeCollapse: (nodeId: string) => {
        set((state) => {
          const newNodes = new Map(state.nodes);
          const node = newNodes.get(nodeId);

          if (!node) return state;

          newNodes.set(nodeId, {
            ...node,
            isCollapsed: !node.isCollapsed,
          });

          return { nodes: newNodes };
        });
      },

      moveNode: (nodeId: string, newParentId: string, insertIndex?: number) => {
        set((state) => {
          const newNodes = new Map(state.nodes);
          const node = newNodes.get(nodeId);
          const newParent = newNodes.get(newParentId);

          if (!node || !newParent) return state;

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

          if (isDescendant(nodeId, newParentId)) return state;

          const oldParentId = node.parentId;

          // Skip if moving to same parent at same position
          if (oldParentId === newParentId) {
            const currentIndex = newParent.children.indexOf(nodeId);
            if (
              insertIndex === undefined ||
              insertIndex === currentIndex ||
              insertIndex === currentIndex + 1
            ) {
              return state;
            }
          }

          // Remove from old parent's children
          if (oldParentId && newNodes.has(oldParentId)) {
            const oldParent = newNodes.get(oldParentId)!;
            oldParent.children = oldParent.children.filter(
              (id) => id !== nodeId
            );
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
          const newConnections = state.connections.filter(
            (c) => c.targetId !== nodeId
          );
          newConnections.push({
            id: `conn_${newParentId}_${nodeId}`,
            sourceId: newParentId,
            targetId: nodeId,
            style: defaultConnectionStyle,
          });

          // Update rootNodeId if moving root to become child
          const newRootNodeId =
            nodeId === state.rootNodeId ? newParentId : state.rootNodeId;

          return {
            nodes: newNodes,
            connections: newConnections,
            rootNodeId: newRootNodeId,
          };
        });
      },

      reorderNodeInParent: (nodeId: string, direction: 'up' | 'down') => {
        set((state) => {
          const node = state.nodes.get(nodeId);
          if (!node || !node.parentId) return state;

          const parent = state.nodes.get(node.parentId);
          if (!parent) return state;

          const currentIndex = parent.children.indexOf(nodeId);
          if (currentIndex === -1) return state;

          const newIndex =
            direction === 'up' ? currentIndex - 1 : currentIndex + 1;

          // Check bounds
          if (newIndex < 0 || newIndex >= parent.children.length) return state;

          // Swap positions
          const newChildren = [...parent.children];
          [newChildren[currentIndex], newChildren[newIndex]] = [
            newChildren[newIndex],
            newChildren[currentIndex],
          ];

          const newNodes = new Map(state.nodes);
          newNodes.set(node.parentId, { ...parent, children: newChildren });

          return { nodes: newNodes };
        });
      },

      // === Selection Operations ===

      selectNode: (nodeId: string, multiSelect: boolean = false) => {
        set((state) => ({
          selectedNodeIds: multiSelect
            ? state.selectedNodeIds.includes(nodeId)
              ? state.selectedNodeIds.filter((id) => id !== nodeId)
              : [...state.selectedNodeIds, nodeId]
            : [nodeId],
        }));
      },

      clearSelection: () => {
        set({ selectedNodeIds: [] });
      },

      // === Viewport Operations ===

      updateViewport: (updates: Partial<Viewport>) => {
        set((state) => ({
          viewport: { ...state.viewport, ...updates },
        }));
      },

      // === View Mode ===

      setViewMode: (mode: ViewMode) => {
        set({ viewMode: mode });
      },

      // === Data Loading/Reset ===

      loadMindMap: (
        nodes: Map<string, MindMapNode>,
        connections: Connection[],
        rootNodeId: string | null
      ) => {
        set({
          nodes,
          connections,
          rootNodeId,
          selectedNodeIds: [],
          isLoading: false,
          error: null,
        });
      },

      loadFromSerialized: (nodes: StoredNode[], connections?: Connection[]) => {
        const deserializedNodes = deserializeNodes(nodes);
        const rootNodeId = findRootNodeId(deserializedNodes);
        const finalConnections =
          connections || rebuildConnections(deserializedNodes);

        set({
          nodes: deserializedNodes,
          connections: finalConnections,
          rootNodeId,
          selectedNodeIds: [],
          isLoading: false,
          error: null,
        });
      },

      reset: () => {
        nodeIdGenerator.reset();
        set({
          nodes: new Map(),
          connections: [],
          selectedNodeIds: [],
          rootNodeId: null,
          viewport: { x: 0, y: 0, zoom: 2 },
          viewMode: 'mindmap',
          isLoading: false,
          error: null,
        });
      },

      // === Derived Data ===

      getVisibleNodes: () => {
        const { nodes, rootNodeId } = get();
        if (!rootNodeId) return [];

        const visibleNodes: MindMapNode[] = [];

        const traverse = (nodeId: string) => {
          const node = nodes.get(nodeId);
          if (!node) return;

          visibleNodes.push(node);

          // If node is not collapsed, traverse its children
          if (!node.isCollapsed) {
            node.children.forEach(traverse);
          }
        };

        traverse(rootNodeId);
        return visibleNodes;
      },

      getSerializedData: () => {
        const { nodes, connections } = get();
        return {
          nodes: serializeNodes(nodes),
          connections,
        };
      },
    }),
    { name: 'NewMindMapStore' }
  )
);
