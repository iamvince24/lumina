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
import { Plus } from 'lucide-react';

import { CustomNode } from './CustomNode';
import { CenterNode } from './CenterNode';
import { TopicNode } from './TopicNode';
import { MindMapEdge } from './MindMapEdge';
import { DirectionToggle } from '../LogicChartView/DirectionToggle';
import { useMindMapStore } from '@/stores/mindmapStore';
import { useViewModeStore } from '@/stores/viewModeStore';
import { calculateHorizontalMindMapLayout } from '@/utils/layoutAlgorithms/horizontalMindMap';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import type { Node, Edge } from '@/types/mindmap';
import './mindMapStyles.css';

/**
 * Node 類型對應表
 * 將自訂的 Node 類型對應到 React Flow 組件
 */
const nodeTypes = {
  custom: CustomNode,
  topic: TopicNode,
  center: CenterNode,
};

/**
 * Edge 類型對應表
 * 自定義邊類型
 */
const edgeTypes = {
  mindmap: MindMapEdge,
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
    addNode,
  } = useMindMapStore();

  // 從 ViewModeStore 取得佈局方向
  const { layoutDirection, setLayoutDirection } = useViewModeStore();

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
   * 使用水平思維導圖演算法計算 Node 位置
   */
  const handleAutoLayout = useCallback(() => {
    const layoutedNodes = calculateHorizontalMindMapLayout(
      nodes as Node[],
      edges as Edge[]
    );
    setNodes(layoutedNodes);
    updateNodes(layoutedNodes);
  }, [nodes, edges, setNodes, updateNodes]);

  /**
   * 新增節點
   * 如果沒有節點，新增根節點；否則新增到選中節點
   */
  const handleAddNode = useCallback(() => {
    if (nodes.length === 0) {
      // 新增第一個中心節點
      addNode({
        label: '中心主題',
        isTopic: true,
        nodeType: 'center',
        position: { x: 100, y: 300 },
      });
    } else if (selectedNodeIds.length > 0) {
      // 新增子節點到選中的節點
      addNode({
        label: '新主題',
        parentId: selectedNodeIds[0],
        nodeType: 'topic',
      });
    } else {
      // 沒有選中節點，新增主題節點
      addNode({
        label: '新主題',
        isTopic: true,
        nodeType: 'topic',
      });
    }
  }, [nodes.length, selectedNodeIds, addNode]);

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
    currentView: 'radial',
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
    <div
      className="w-full h-full relative"
      tabIndex={0}
      onKeyDown={() => {
        // 確保快捷鍵能夠觸發，不做任何處理
        // 只是確保容器可以接收鍵盤事件
      }}
    >
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={handleNodesChange}
        onEdgesChange={handleEdgesChange}
        onConnect={handleConnect}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        defaultEdgeOptions={{
          type: 'mindmap',
          animated: false,
        }}
        proOptions={proOptions}
        fitView
        attributionPosition="bottom-left"
        className="mindmap-view"
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
        <div className="absolute top-4 right-4 z-10 flex gap-2">
          {/* 方向切換 */}
          <DirectionToggle
            direction={layoutDirection}
            onChange={setLayoutDirection}
          />

          <button
            onClick={handleAddNode}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            新增節點
          </button>
          {nodes.length > 0 && (
            <button
              onClick={handleAutoLayout}
              className="px-4 py-2 bg-white border border-gray-300 rounded-lg shadow-md hover:bg-gray-50 transition-colors"
            >
              自動排列
            </button>
          )}
        </div>
      </ReactFlow>

      {/* 空狀態提示 */}
      {nodes.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
          <div className="text-center">
            <div className="text-gray-400 text-lg mb-2">尚未建立任何節點</div>
            <div className="text-gray-300 text-sm">
              點擊右上角的「新增節點」按鈕開始建立心智圖
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
