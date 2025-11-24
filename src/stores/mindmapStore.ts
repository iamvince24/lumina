/**
 * MindMap 狀態管理 Store
 * 使用 Zustand 管理心智圖的所有狀態和操作
 */

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type {
  Node,
  Edge,
  AddNodeParams,
  UpdateNodeParams,
} from '@/types/mindmap';

// ========================================
// Store 介面定義
// ========================================

interface MindMapStore {
  // === 狀態 ===
  /** 所有 Nodes */
  nodes: Node[];

  /** 所有 Edges */
  edges: Edge[];

  /** 當前選中的 Node IDs */
  selectedNodeIds: string[];

  /** 是否正在載入 */
  isLoading: boolean;

  /** 錯誤訊息 */
  error: string | null;

  // === Node 操作 ===
  /** 新增 Node */
  addNode: (params: AddNodeParams) => string;

  /** 更新 Node */
  updateNode: (params: UpdateNodeParams) => void;

  /** 刪除 Node */
  deleteNode: (nodeId: string) => void;

  /** 批次更新 Nodes */
  updateNodes: (nodes: Node[]) => void;

  // === Edge 操作 ===
  /** 新增 Edge */
  addEdge: (sourceId: string, targetId: string) => void;

  /** 刪除 Edge */
  deleteEdge: (edgeId: string) => void;

  /** 更新 Edges */
  updateEdges: (edges: Edge[]) => void;

  // === 選擇操作 ===
  /** 設定選中的 Nodes */
  setSelectedNodes: (nodeIds: string[]) => void;

  /** 清除選擇 */
  clearSelection: () => void;

  // === 資料載入 ===
  /** 載入完整的 MindMap 資料 */
  loadMindMap: (nodes: Node[], edges: Edge[]) => void;

  /** 重置 Store */
  reset: () => void;
}

// ========================================
// 初始狀態
// ========================================

const initialState = {
  nodes: [],
  edges: [],
  selectedNodeIds: [],
  isLoading: false,
  error: null,
};

// ========================================
// Store 實作
// ========================================

export const useMindMapStore = create<MindMapStore>()(
  devtools(
    (set, get) => ({
      ...initialState,

      // === Node 操作 ===

      addNode: (params: AddNodeParams) => {
        // 生成唯一 ID
        const nodeId = `node_${Date.now()}_${Math.random()
          .toString(36)
          .substr(2, 9)}`;

        // 計算初始位置
        const position = params.position || {
          x: Math.random() * 500,
          y: Math.random() * 500,
        };

        // 決定 Node 類型（優先使用 nodeType，否則根據 isTopic）
        const nodeType =
          params.nodeType || (params.isTopic ? 'topic' : 'custom');

        // 建立新 Node
        const newNode: Node = {
          id: nodeId,
          type: nodeType,
          position,
          data: {
            label: params.label,
            isTopic: params.isTopic,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          parentNode: params.parentId,
        };

        set((state) => ({
          nodes: [...state.nodes, newNode],
        }));

        // 如果有父節點，建立 Edge
        if (params.parentId) {
          get().addEdge(params.parentId, nodeId);
        }

        return nodeId;
      },

      updateNode: (params: UpdateNodeParams) => {
        set((state) => ({
          nodes: state.nodes.map((node) =>
            node.id === params.id
              ? {
                  ...node,
                  ...(params.position && { position: params.position }),
                  ...(params.data && {
                    data: {
                      ...node.data,
                      ...params.data,
                      updatedAt: new Date(),
                    },
                  }),
                }
              : node
          ),
        }));
      },

      deleteNode: (nodeId: string) => {
        const nodesToDelete = new Set<string>();

        /**
         * 遞迴收集要刪除的 Node（包含所有子孫節點）
         */
        const collectNodesToDelete = (id: string) => {
          nodesToDelete.add(id);

          // 找出所有子節點
          const childEdges = get().edges.filter((edge) => edge.source === id);
          childEdges.forEach((edge) => {
            collectNodesToDelete(edge.target);
          });
        };

        collectNodesToDelete(nodeId);

        set((state) => ({
          nodes: state.nodes.filter((node) => !nodesToDelete.has(node.id)),
          edges: state.edges.filter(
            (edge) =>
              !nodesToDelete.has(edge.source) && !nodesToDelete.has(edge.target)
          ),
          selectedNodeIds: state.selectedNodeIds.filter(
            (id) => !nodesToDelete.has(id)
          ),
        }));
      },

      updateNodes: (nodes: Node[]) => {
        set({ nodes });
      },

      // === Edge 操作 ===

      addEdge: (sourceId: string, targetId: string) => {
        const edgeId = `edge_${sourceId}_${targetId}`;

        // 檢查 Edge 是否已存在
        const edgeExists = get().edges.some((edge) => edge.id === edgeId);
        if (edgeExists) return;

        const newEdge: Edge = {
          id: edgeId,
          source: sourceId,
          target: targetId,
        };

        set((state) => ({
          edges: [...state.edges, newEdge],
        }));
      },

      deleteEdge: (edgeId: string) => {
        set((state) => ({
          edges: state.edges.filter((edge) => edge.id !== edgeId),
        }));
      },

      updateEdges: (edges: Edge[]) => {
        set({ edges });
      },

      // === 選擇操作 ===

      setSelectedNodes: (nodeIds: string[]) => {
        set({ selectedNodeIds: nodeIds });
      },

      clearSelection: () => {
        set({ selectedNodeIds: [] });
      },

      // === 資料載入 ===

      loadMindMap: (nodes: Node[], edges: Edge[]) => {
        set({
          nodes,
          edges,
          selectedNodeIds: [],
          isLoading: false,
          error: null,
        });
      },

      reset: () => {
        set(initialState);
      },
    }),
    { name: 'MindMapStore' }
  )
);
