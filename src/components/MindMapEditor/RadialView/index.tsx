/**
 * Radial View 主要組件
 * 使用 React Flow 實作放射狀心智圖編輯器
 */

import { useCallback, useEffect, useMemo, useRef } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
  type Connection,
  type OnNodesChange,
  type OnEdgesChange,
  type NodeChange,
} from 'reactflow';
import 'reactflow/dist/style.css';

import { CustomNode } from './CustomNode';
import { useMindMapStore } from '@/stores/mindmapStore';
import { calculateRadialLayout } from '@/utils/layoutAlgorithms/radial';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import type { Node, Edge } from '@/types/mindmap';

/**
 * Node 類型對應表
 * 將自訂的 Node 類型對應到 React Flow 組件
 */
const nodeTypes = {
  custom: CustomNode,
  topic: CustomNode,
};

/**
 * Radial View 組件
 * 提供放射狀心智圖的編輯介面
 */
export function RadialView() {
  // 從 Store 取得資料和操作函式
  const {
    nodes: storeNodes,
    edges: storeEdges,
    selectedNodeIds,
    updateNodes,
    updateEdges,
    setSelectedNodes,
  } = useMindMapStore();

  // React Flow 的 Nodes 和 Edges 狀態
  const [nodes, setNodes, onNodesChange] = useNodesState(storeNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(storeEdges);

  // Debounce timer ref
  const nodesUpdateTimerRef = useRef<NodeJS.Timeout | null>(null);
  const edgesUpdateTimerRef = useRef<NodeJS.Timeout | null>(null);

  /**
   * 當 Store 的資料變更時，同步到 React Flow
   */
  useEffect(() => {
    setNodes(storeNodes);
    setEdges(storeEdges);
  }, [storeNodes, storeEdges, setNodes, setEdges]);

  /**
   * 處理 Node 變更（移動、選擇等）
   */
  const handleNodesChange: OnNodesChange = useCallback(
    (changes: NodeChange[]) => {
      // 先讓 React Flow 處理變更
      onNodesChange(changes);

      // 處理選擇變更（立即同步）
      const selectChanges = changes.filter(
        (change) => change.type === 'select'
      );
      if (selectChanges.length > 0) {
        // 使用函數形式取得最新狀態
        setNodes((currentNodes) => {
          const selectedIds = currentNodes
            .filter((node) => {
              const change = selectChanges.find(
                (c) => 'id' in c && c.id === node.id
              );
              if (change && 'selected' in change) {
                return change.selected;
              }
              return node.selected;
            })
            .map((node) => node.id);
          setSelectedNodes(selectedIds);
          return currentNodes;
        });
      }

      // 清除之前的 timer
      if (nodesUpdateTimerRef.current) {
        clearTimeout(nodesUpdateTimerRef.current);
      }

      // 更新位置到 Store（debounced，避免過於頻繁）
      nodesUpdateTimerRef.current = setTimeout(() => {
        setNodes((currentNodes) => {
          // 只更新有位置變更的 nodes
          const hasPositionChanges = changes.some(
            (change) => change.type === 'position'
          );
          if (hasPositionChanges) {
            updateNodes(currentNodes as Node[]);
          }
          return currentNodes;
        });
      }, 500);
    },
    [onNodesChange, updateNodes, setSelectedNodes, setNodes]
  );

  /**
   * 處理 Edge 變更
   */
  const handleEdgesChange: OnEdgesChange = useCallback(
    (changes) => {
      onEdgesChange(changes);

      // 清除之前的 timer
      if (edgesUpdateTimerRef.current) {
        clearTimeout(edgesUpdateTimerRef.current);
      }

      // 更新到 Store
      edgesUpdateTimerRef.current = setTimeout(() => {
        updateEdges(edges as Edge[]);
      }, 500);
    },
    [edges, onEdgesChange, updateEdges]
  );

  /**
   * 處理連線建立
   */
  const handleConnect = useCallback(
    (connection: Connection) => {
      if (!connection.source || !connection.target) return;

      const newEdge = addEdge(connection, edges);
      setEdges(newEdge);
      updateEdges(newEdge as Edge[]);
    },
    [edges, setEdges, updateEdges]
  );

  /**
   * 自動佈局
   * 使用 Dagre 演算法計算 Node 位置
   */
  const handleAutoLayout = useCallback(() => {
    const layoutedNodes = calculateRadialLayout(
      nodes as Node[],
      edges as Edge[]
    );
    setNodes(layoutedNodes);
    updateNodes(layoutedNodes);
  }, [nodes, edges, setNodes, updateNodes]);

  /**
   * 同步選中的 Node IDs 到 React Flow
   */
  useEffect(() => {
    setNodes((nds) =>
      nds.map((node) => ({
        ...node,
        selected: selectedNodeIds.includes(node.id),
      }))
    );
  }, [selectedNodeIds, setNodes]);

  /**
   * 使用快捷鍵 Hook
   */
  const selectedNodeId = useMemo(
    () => selectedNodeIds[0] || undefined,
    [selectedNodeIds]
  );
  useKeyboardShortcuts({
    enabled: true,
    selectedNodeId,
  });

  /**
   * 組件設定
   */
  const proOptions = useMemo(
    () => ({
      hideAttribution: true, // 隱藏 React Flow 浮水印
    }),
    []
  );

  /**
   * 清理 timer
   */
  useEffect(() => {
    return () => {
      if (nodesUpdateTimerRef.current) {
        clearTimeout(nodesUpdateTimerRef.current);
      }
      if (edgesUpdateTimerRef.current) {
        clearTimeout(edgesUpdateTimerRef.current);
      }
    };
  }, []);

  return (
    <div className="w-full h-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={handleNodesChange}
        onEdgesChange={handleEdgesChange}
        onConnect={handleConnect}
        nodeTypes={nodeTypes}
        proOptions={proOptions}
        fitView
        attributionPosition="bottom-left"
      >
        {/* 背景網格 */}
        <Background />

        {/* 控制按鈕（縮放、適應畫面等） */}
        <Controls />

        {/* 迷你地圖 */}
        <MiniMap
          nodeColor={(node) => {
            return node.data?.isTopic ? '#3b82f6' : '#e5e7eb';
          }}
          className="bg-white! border-gray-300!"
        />

        {/* 自訂控制按鈕 */}
        <div className="absolute top-4 right-4 z-10">
          <button
            onClick={handleAutoLayout}
            className="px-4 py-2 bg-white border border-gray-300 rounded-lg shadow-md hover:bg-gray-50 transition-colors"
          >
            自動排列
          </button>
        </div>
      </ReactFlow>
    </div>
  );
}
