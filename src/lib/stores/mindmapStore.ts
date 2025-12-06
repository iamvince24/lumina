import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import type {
  MindMapNode,
  MindMapEdge,
  Viewport,
  ViewMode,
} from '../mindmap/types';
import { calculateLayout, centerLayout } from '../mindmap/calculations';
import { NODE_DEFAULTS } from '../mindmap/constants';

interface MindMapState {
  // 資料
  nodes: MindMapNode[];
  edges: MindMapEdge[];

  // 視圖狀態
  viewport: Viewport;
  viewMode: ViewMode;

  // 選取狀態
  selectedNodeIds: string[];
  editingNodeId: string | null;

  // 拖曳狀態
  draggingNodeId: string | null;

  // 歷史紀錄（Undo/Redo）
  history: { nodes: MindMapNode[]; edges: MindMapEdge[] }[];
  historyIndex: number;
}

interface MindMapActions {
  // 節點操作
  addNode: (
    parentId: string | null,
    label?: string,
    afterNodeId?: string
  ) => string;
  updateNode: (nodeId: string, updates: Partial<MindMapNode>) => void;
  deleteNode: (nodeId: string) => void;
  moveNode: (
    nodeId: string,
    targetId: string,
    position: 'before' | 'after' | 'child'
  ) => void;

  // 連線操作
  addEdge: (sourceId: string, targetId: string) => void;
  deleteEdge: (edgeId: string) => void;

  // 選取操作
  setSelectedNodes: (nodeIds: string[]) => void;
  setEditingNode: (nodeId: string | null) => void;

  // 拖曳操作
  setDraggingNode: (nodeId: string | null) => void;

  // 視圖操作
  setViewport: (viewport: Viewport) => void;
  setViewMode: (mode: ViewMode) => void;

  // 佈局操作
  applyLayout: () => void;
  centerView: (canvasWidth: number, canvasHeight: number) => void;

  // 歷史操作
  undo: () => void;
  redo: () => void;
  saveToHistory: () => void;

  // 資料操作
  loadMindMap: (nodes: MindMapNode[], edges: MindMapEdge[]) => void;
  reset: () => void;
}

const initialState: MindMapState = {
  nodes: [],
  edges: [],
  viewport: { x: 0, y: 0, zoom: 1 },
  viewMode: 'horizontal',
  selectedNodeIds: [],
  editingNodeId: null,
  draggingNodeId: null,
  history: [],
  historyIndex: -1,
};

export const useMindMapStore = create<MindMapState & MindMapActions>()(
  devtools(
    persist(
      immer((set, get) => ({
        ...initialState,

        // === 節點操作 ===

        addNode: (parentId, label = '新節點', afterNodeId) => {
          const id = crypto.randomUUID();

          set((state) => {
            const newNode: MindMapNode = {
              id,
              parentId,
              label,
              position: { x: 0, y: 0 },
              width: NODE_DEFAULTS.WIDTH,
              height: NODE_DEFAULTS.HEIGHT,
              isExpanded: true,
              isTopic: false,
              createdAt: new Date(),
              updatedAt: new Date(),
            };

            // 如果指定了 afterNodeId，插入到該節點之後
            if (afterNodeId) {
              const afterIndex = state.nodes.findIndex(
                (n: MindMapNode) => n.id === afterNodeId
              );
              if (afterIndex !== -1) {
                state.nodes.splice(afterIndex + 1, 0, newNode);
              } else {
                state.nodes.push(newNode);
              }
            } else {
              state.nodes.push(newNode);
            }

            // 如果有父節點，建立連線
            if (parentId) {
              state.edges.push({
                id: crypto.randomUUID(),
                sourceId: parentId,
                targetId: id,
              });
            }

            // 自動選取新節點
            state.selectedNodeIds = [id];
            // 延遲設置編輯模式，讓 React 先完成位置更新
            state.editingNodeId = null;
          });

          // 套用佈局
          get().applyLayout();

          // 延遲進入編輯模式，確保佈局已更新
          setTimeout(() => {
            set({ editingNodeId: id });
          }, 100);

          get().saveToHistory();

          return id;
        },

        updateNode: (nodeId, updates) => {
          set((state) => {
            const node = state.nodes.find((n: MindMapNode) => n.id === nodeId);
            if (node) {
              Object.assign(node, updates, { updatedAt: new Date() });
            }
          });
        },

        deleteNode: (nodeId) => {
          set((state) => {
            // 刪除節點及其所有後代
            const idsToDelete = new Set<string>();

            const collectDescendants = (id: string) => {
              idsToDelete.add(id);
              state.nodes
                .filter((n: MindMapNode) => n.parentId === id)
                .forEach((n: MindMapNode) => collectDescendants(n.id));
            };

            collectDescendants(nodeId);

            // 刪除節點
            state.nodes = state.nodes.filter(
              (n: MindMapNode) => !idsToDelete.has(n.id)
            );

            // 刪除相關連線
            state.edges = state.edges.filter(
              (e: MindMapEdge) =>
                !idsToDelete.has(e.sourceId) && !idsToDelete.has(e.targetId)
            );

            // 清除選取
            state.selectedNodeIds = state.selectedNodeIds.filter(
              (id: string) => !idsToDelete.has(id)
            );
          });

          get().saveToHistory();
        },

        moveNode: (nodeId, targetId, position) => {
          set((state) => {
            const nodeToMove = state.nodes.find(
              (n: MindMapNode) => n.id === nodeId
            );
            const targetNode = state.nodes.find(
              (n: MindMapNode) => n.id === targetId
            );

            if (!nodeToMove || !targetNode) return;

            if (position === 'child') {
              // Reparent: Make nodeToMove a child of targetNode
              nodeToMove.parentId = targetId;
              nodeToMove.updatedAt = new Date();
            } else {
              // Reorder: Make nodeToMove a sibling of targetNode
              // Get target's parent (siblings share the same parent)
              const targetParentId = targetNode.parentId;

              // Update the moved node's parent to match target's parent
              // This makes them siblings
              nodeToMove.parentId = targetParentId;
              nodeToMove.updatedAt = new Date();

              // For sibling reordering, we need to control the order of siblings
              // Since the layout algorithm processes nodes in array order when building the tree,
              // we need to reorder the nodes array to reflect the desired position.

              // Get all siblings (nodes with the same parentId as target, including target and nodeToMove)
              const siblings = state.nodes.filter(
                (n: MindMapNode) => n.parentId === targetParentId
              );

              // Remove nodeToMove from siblings array temporarily
              const siblingsWithoutMoved = siblings.filter(
                (n: MindMapNode) => n.id !== nodeId
              );

              // Find target's index in siblings (without moved node)
              const targetIndex = siblingsWithoutMoved.findIndex(
                (n: MindMapNode) => n.id === targetId
              );

              if (targetIndex === -1) return;

              // Calculate insertion index based on position
              const insertIndex =
                position === 'before' ? targetIndex : targetIndex + 1;

              // Rebuild siblings array with nodeToMove in the correct position
              const newSiblings = [
                ...siblingsWithoutMoved.slice(0, insertIndex),
                nodeToMove,
                ...siblingsWithoutMoved.slice(insertIndex),
              ];

              // Reorder the nodes array: place all siblings in the correct order
              // We'll do this by finding the first sibling's position and replacing the section
              const firstSiblingIndex = state.nodes.findIndex(
                (n: MindMapNode) => n.parentId === targetParentId
              );

              if (firstSiblingIndex !== -1) {
                // Remove all siblings from the array
                for (let i = state.nodes.length - 1; i >= 0; i--) {
                  if (state.nodes[i].parentId === targetParentId) {
                    state.nodes.splice(i, 1);
                  }
                }

                // Insert all siblings in the correct order at the original position
                state.nodes.splice(firstSiblingIndex, 0, ...newSiblings);
              }
            }
          });

          // Recalculate layout to reflect the new position
          get().applyLayout();
          get().saveToHistory();
        },

        // === 連線操作 ===

        addEdge: (sourceId, targetId) => {
          set((state) => {
            state.edges.push({
              id: crypto.randomUUID(),
              sourceId,
              targetId,
            });
          });
        },

        deleteEdge: (edgeId) => {
          set((state) => {
            state.edges = state.edges.filter(
              (e: MindMapEdge) => e.id !== edgeId
            );
          });
        },

        // === 選取操作 ===

        setSelectedNodes: (nodeIds) => {
          set({ selectedNodeIds: nodeIds });
        },

        setEditingNode: (nodeId) => {
          set({ editingNodeId: nodeId });
        },

        // === 拖曳操作 ===

        setDraggingNode: (nodeId) => {
          set({ draggingNodeId: nodeId });
        },

        // === 視圖操作 ===

        setViewport: (viewport) => {
          set({ viewport });
        },

        setViewMode: (mode) => {
          set({ viewMode: mode });
          get().applyLayout();
        },

        // === 佈局操作 ===

        applyLayout: () => {
          set((state) => {
            const layoutMode =
              state.viewMode === 'radial' ? 'radial' : 'horizontal';
            state.nodes = calculateLayout(state.nodes, layoutMode);
          });
        },

        centerView: (canvasWidth, canvasHeight) => {
          set((state) => {
            state.nodes = centerLayout(state.nodes, canvasWidth, canvasHeight);
          });
        },

        // === 歷史操作 ===

        saveToHistory: () => {
          set((state) => {
            const snapshot = {
              nodes: JSON.parse(JSON.stringify(state.nodes)),
              edges: JSON.parse(JSON.stringify(state.edges)),
            };

            // 截斷未來的歷史
            state.history = state.history.slice(0, state.historyIndex + 1);
            state.history.push(snapshot);
            state.historyIndex = state.history.length - 1;

            // 限制歷史長度
            if (state.history.length > 50) {
              state.history = state.history.slice(-50);
              state.historyIndex = state.history.length - 1;
            }
          });
        },

        undo: () => {
          set((state) => {
            if (state.historyIndex > 0) {
              state.historyIndex -= 1;
              const snapshot = state.history[state.historyIndex];
              state.nodes = snapshot.nodes;
              state.edges = snapshot.edges;
            }
          });
        },

        redo: () => {
          set((state) => {
            if (state.historyIndex < state.history.length - 1) {
              state.historyIndex += 1;
              const snapshot = state.history[state.historyIndex];
              state.nodes = snapshot.nodes;
              state.edges = snapshot.edges;
            }
          });
        },

        // === 資料操作 ===

        loadMindMap: (nodes, edges) => {
          set({
            nodes: nodes.map((node) => ({
              ...node,
              isExpanded: node.isExpanded ?? true, // Ensure all nodes are expanded by default
            })),
            edges,
            selectedNodeIds: [],
            editingNodeId: null,
          });
          get().applyLayout();
          get().saveToHistory();
        },

        reset: () => {
          set(initialState);
        },
      })),
      {
        name: 'lumina-mindmap',
        partialize: (state) => ({
          nodes: state.nodes,
          edges: state.edges,
          viewMode: state.viewMode,
        }),
      }
    ),
    { name: 'MindMapStore' }
  )
);
