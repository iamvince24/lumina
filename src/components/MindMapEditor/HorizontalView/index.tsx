/**
 * Horizontal View - MindMeister-Style
 * Left-to-right horizontal mind map with clean, professional aesthetic
 */

import { useCallback, useEffect, useMemo, useRef } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
  ConnectionLineType,
  type Connection,
  type OnNodesChange,
  type OnEdgesChange,
  type NodeChange,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { Plus } from 'lucide-react';

import { MindMeisterNode } from './MindMeisterNode';
import { useMindMapStore } from '@/stores/mindmapStore';
import { calculateHorizontalMindMapLayout } from '@/utils/layoutAlgorithms/horizontalMindMap';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import type { Node, Edge } from '@/types/mindmap';

/**
 * Node types mapping
 */
const nodeTypes = {
  custom: MindMeisterNode,
  topic: MindMeisterNode,
  center: MindMeisterNode,
};

/**
 * Horizontal View Component
 * Implements MindMeister-style horizontal mind map
 */
export function HorizontalView() {
  // Get data and actions from store
  const {
    nodes: storeNodes,
    edges: storeEdges,
    selectedNodeIds,
    updateNodes,
    updateEdges,
    setSelectedNodes,
    addNode,
  } = useMindMapStore();

  // React Flow states
  const [nodes, setNodes, onNodesChange] = useNodesState(storeNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(storeEdges);

  // Debounce timers
  const nodesUpdateTimerRef = useRef<NodeJS.Timeout | null>(null);
  const edgesUpdateTimerRef = useRef<NodeJS.Timeout | null>(null);

  /**
   * Sync store data to React Flow
   */
  useEffect(() => {
    setNodes(storeNodes);
    setEdges(storeEdges);
  }, [storeNodes, storeEdges, setNodes, setEdges]);

  /**
   * Auto Layout
   * Calculate positions using horizontal mind map algorithm
   */
  const handleAutoLayout = useCallback(() => {
    const layoutedNodes = calculateHorizontalMindMapLayout(
      nodes as Node[],
      edges as Edge[],
      {
        centerX: 100,
        centerY: 300,
        horizontalSpacing: 350,
        verticalSpacing: 150,
        nodeWidth: 150,
        nodeHeight: 50,
      }
    );
    setNodes(layoutedNodes);
    updateNodes(layoutedNodes);
  }, [nodes, edges, setNodes, updateNodes]);

  /**
   * Auto-layout on mount and when nodes change
   */
  const hasAutoLayoutedRef = useRef(false);
  useEffect(() => {
    if (nodes.length > 0 && !hasAutoLayoutedRef.current) {
      handleAutoLayout();
      hasAutoLayoutedRef.current = true;
    }
  }, [nodes.length, handleAutoLayout]);

  /**
   * Handle node changes (drag, select, etc.)
   */
  const handleNodesChange: OnNodesChange = useCallback(
    (changes: NodeChange[]) => {
      // Process changes in React Flow
      onNodesChange(changes);

      // Handle selection changes (immediate sync)
      const selectChanges = changes.filter(
        (change) => change.type === 'select'
      );
      if (selectChanges.length > 0) {
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

      // Clear previous timer
      if (nodesUpdateTimerRef.current) {
        clearTimeout(nodesUpdateTimerRef.current);
      }

      // Update positions to store (debounced)
      nodesUpdateTimerRef.current = setTimeout(() => {
        setNodes((currentNodes) => {
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
   * Handle edge changes
   */
  const handleEdgesChange: OnEdgesChange = useCallback(
    (changes) => {
      onEdgesChange(changes);

      // Clear previous timer
      if (edgesUpdateTimerRef.current) {
        clearTimeout(edgesUpdateTimerRef.current);
      }

      // Update to store
      edgesUpdateTimerRef.current = setTimeout(() => {
        updateEdges(edges as Edge[]);
      }, 500);
    },
    [edges, onEdgesChange, updateEdges]
  );

  /**
   * Handle edge connection
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
   * Add new node
   */
  const handleAddNode = useCallback(() => {
    if (nodes.length === 0) {
      // Add root node
      addNode({
        label: '中心主題',
        isTopic: true,
        nodeType: 'center',
        position: { x: 100, y: 300 },
      });
    } else if (selectedNodeIds.length > 0) {
      // Add child to selected node
      addNode({
        label: '新主題',
        parentId: selectedNodeIds[0],
        nodeType: 'topic',
      });
      // Trigger auto-layout after a short delay
      setTimeout(() => {
        handleAutoLayout();
      }, 100);
    } else {
      // Add standalone node
      addNode({
        label: '新主題',
        isTopic: true,
        nodeType: 'topic',
      });
    }
  }, [nodes.length, selectedNodeIds, addNode, handleAutoLayout]);

  /**
   * Sync selected node IDs to React Flow
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
   * Keyboard shortcuts
   */
  const selectedNodeId = useMemo(
    () => selectedNodeIds[0] || undefined,
    [selectedNodeIds]
  );
  useKeyboardShortcuts({
    enabled: true,
    selectedNodeId,
    currentView: 'horizontal',
  });

  /**
   * React Flow options
   */
  const proOptions = useMemo(
    () => ({
      hideAttribution: true,
    }),
    []
  );

  /**
   * Cleanup timers
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
        // Ensure keyboard events can be captured
      }}
    >
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={handleNodesChange}
        onEdgesChange={handleEdgesChange}
        onConnect={handleConnect}
        nodeTypes={nodeTypes}
        defaultEdgeOptions={{
          type: 'default',
          animated: false,
          style: {
            strokeWidth: 2.5,
            stroke: '#cbd5e1', // Cool gray
          },
        }}
        connectionLineType={ConnectionLineType.Bezier}
        proOptions={proOptions}
        fitView
        attributionPosition="bottom-left"
        className="mindmap-view"
      >
        {/* Background grid */}
        <Background />

        {/* Controls (zoom, fit view) */}
        <Controls />

        {/* Mini map */}
        <MiniMap
          nodeColor={(node) => {
            return node.data?.isTopic ? '#3b82f6' : '#e5e7eb';
          }}
          className="bg-white! border-gray-300!"
        />

        {/* Custom controls */}
        <div className="absolute top-4 right-4 z-10 flex gap-2">
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

      {/* Empty state */}
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
