'use client';

import React, { useRef, useState, useCallback, useEffect } from 'react';
import { MindMapNode } from './MindMapNode';
import { MindMapCanvas } from './MindMapCanvas';
import { EditorToolbar } from './EditorToolbar';
import { useMindMapState } from '../hooks/useMindMapState';
import { useDragAndDrop } from '../hooks/useDragAndDrop';
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts';
import { useAutoLayout } from '../hooks/useAutoLayout';
import { clamp } from '../utils/geometry';

const DEFAULT_NODE_SIZE = { width: 150, height: 60 };

export const MindMapEditor: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState<{ x: number; y: number } | null>(
    null
  );
  const [viewportStart, setViewportStart] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const [containerSize, setContainerSize] = useState({
    width: 800,
    height: 600,
  });

  const {
    state,
    createNode,
    updateNode,
    updateNodeSize,
    deleteNode,
    selectNode,
    clearSelection,
    updateViewport,
  } = useMindMapState();

  const { dragState, handleMouseDown } = useDragAndDrop({
    onDrag: (nodeId, position) => {
      updateNode(nodeId, { position });
    },
  });

  const handleLayoutUpdate = useCallback(
    (nodeId: string, position: { x: number; y: number }) => {
      updateNode(nodeId, { position });
    },
    [updateNode]
  );

  const { applyTreeLayout, layoutTriggerKey } = useAutoLayout({
    nodes: state.nodes,
    rootNodeId: state.rootNodeId,
    onLayoutUpdate: handleLayoutUpdate,
  });

  const getCenteredPosition = useCallback(
    (
      size: { width: number; height: number },
      nodeSize: { width: number; height: number } = DEFAULT_NODE_SIZE
    ) => ({
      x: Math.max((size.width - nodeSize.width) / 2, 0),
      y: Math.max((size.height - nodeSize.height) / 2, 0),
    }),
    []
  );

  // 初始化：創建根節點並置中
  useEffect(() => {
    if (state.nodes.size !== 0) return;

    const centeredPosition = getCenteredPosition(containerSize);
    createNode('中心主題', centeredPosition, null);
  }, [state.nodes.size, containerSize, createNode, getCenteredPosition]);

  // 容器尺寸變化時，僅在只有根節點時重新置中
  useEffect(() => {
    if (!state.rootNodeId || state.nodes.size !== 1) return;

    const rootNode = state.nodes.get(state.rootNodeId);
    if (!rootNode) return;

    const targetPosition = getCenteredPosition(containerSize, rootNode.size);
    const isAlreadyCentered =
      Math.abs(rootNode.position.x - targetPosition.x) < 0.5 &&
      Math.abs(rootNode.position.y - targetPosition.y) < 0.5;

    if (isAlreadyCentered) return;

    updateNode(rootNode.id, { position: targetPosition });
    updateViewport({ x: 0, y: 0 });
  }, [
    containerSize,
    state.nodes,
    state.rootNodeId,
    updateNode,
    updateViewport,
    getCenteredPosition,
  ]);

  // 監聽容器大小變化
  useEffect(() => {
    if (!containerRef.current) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setContainerSize({
          width: entry.contentRect.width,
          height: entry.contentRect.height,
        });
      }
    });

    resizeObserver.observe(containerRef.current);
    return () => resizeObserver.disconnect();
  }, []);

  const handleAddNode = useCallback(() => {
    if (state.selectedNodeIds.length === 0 && state.rootNodeId) {
      // 沒有選中節點時，添加到根節點
      const rootNode = state.nodes.get(state.rootNodeId);
      if (rootNode) {
        const newX = rootNode.position.x + 200;
        const newY = rootNode.position.y;
        createNode('新節點', { x: newX, y: newY }, state.rootNodeId);
      }
    } else if (state.selectedNodeIds.length > 0) {
      // 有選中節點時，添加為子節點
      const selectedId = state.selectedNodeIds[0];
      const selectedNode = state.nodes.get(selectedId);
      if (selectedNode) {
        const newX = selectedNode.position.x + 200;
        const newY =
          selectedNode.position.y + selectedNode.children.length * 80;
        createNode('新節點', { x: newX, y: newY }, selectedId);
      }
    }
  }, [state, createNode]);

  const handleDeleteSelected = useCallback(() => {
    state.selectedNodeIds.forEach((nodeId) => {
      if (nodeId !== state.rootNodeId) {
        deleteNode(nodeId);
      }
    });
  }, [state.selectedNodeIds, state.rootNodeId, deleteNode]);

  const handleZoomIn = useCallback(() => {
    updateViewport({ zoom: clamp(state.viewport.zoom + 0.1, 0.1, 3) });
  }, [state.viewport.zoom, updateViewport]);

  const handleZoomOut = useCallback(() => {
    updateViewport({ zoom: clamp(state.viewport.zoom - 0.1, 0.1, 3) });
  }, [state.viewport.zoom, updateViewport]);

  const handleZoomReset = useCallback(() => {
    updateViewport({ zoom: 1, x: 0, y: 0 });
  }, [updateViewport]);

  const handleWheel = useCallback(
    (event: React.WheelEvent<HTMLDivElement>) => {
      if (!event.ctrlKey && !event.metaKey) return;
      event.preventDefault();

      const container = containerRef.current;
      if (!container) return;

      const rect = container.getBoundingClientRect();
      const mouseX = event.clientX - rect.left;
      const mouseY = event.clientY - rect.top;

      const deltaZoom = -event.deltaY * 0.0015;
      const boundedDelta = clamp(deltaZoom, -0.08, 0.08);
      const currentZoom = state.viewport.zoom;
      const nextZoom = clamp(currentZoom + boundedDelta, 0.1, 3);
      if (nextZoom === currentZoom) return;

      const scaleRatio = nextZoom / currentZoom;
      const nextViewportX =
        state.viewport.x * scaleRatio + mouseX * (1 - scaleRatio);
      const nextViewportY =
        state.viewport.y * scaleRatio + mouseY * (1 - scaleRatio);

      updateViewport({
        zoom: nextZoom,
        x: nextViewportX,
        y: nextViewportY,
      });
    },
    [state.viewport, updateViewport]
  );

  const handlePanStart = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      if (event.button !== 0) return;
      const target = event.target as HTMLElement;
      const isNode = target.closest('[data-node-id]');
      if (isNode) return;
      event.preventDefault();
      setIsPanning(true);
      setPanStart({ x: event.clientX, y: event.clientY });
      setViewportStart({ x: state.viewport.x, y: state.viewport.y });
    },
    [state.viewport]
  );

  const handlePanMove = useCallback(
    (event: MouseEvent) => {
      if (!isPanning || !panStart || !viewportStart) return;
      event.preventDefault();
      const dx = event.clientX - panStart.x;
      const dy = event.clientY - panStart.y;
      updateViewport({
        x: viewportStart.x + dx,
        y: viewportStart.y + dy,
      });
    },
    [isPanning, panStart, viewportStart, updateViewport]
  );

  const handlePanEnd = useCallback(() => {
    if (!isPanning) return;
    setIsPanning(false);
    setPanStart(null);
    setViewportStart(null);
  }, [isPanning]);

  useEffect(() => {
    if (!isPanning) return;
    window.addEventListener('mousemove', handlePanMove);
    window.addEventListener('mouseup', handlePanEnd);
    return () => {
      window.removeEventListener('mousemove', handlePanMove);
      window.removeEventListener('mouseup', handlePanEnd);
    };
  }, [isPanning, handlePanMove, handlePanEnd]);

  const handleExport = useCallback(() => {
    const data = {
      nodes: Array.from(state.nodes.values()),
      connections: state.connections,
      rootNodeId: state.rootNodeId,
    };

    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'mindmap.json';
    a.click();
    URL.revokeObjectURL(url);
  }, [state]);

  useKeyboardShortcuts({
    onDelete: handleDeleteSelected,
    onZoomIn: handleZoomIn,
    onZoomOut: handleZoomOut,
    onZoomReset: handleZoomReset,
    onNewNode: handleAddNode,
  });

  const handleCanvasClick = useCallback(() => {
    clearSelection();
  }, [clearSelection]);

  useEffect(() => {
    if (!state.rootNodeId || state.nodes.size === 0) return;
    applyTreeLayout();
  }, [
    applyTreeLayout,
    handleLayoutUpdate,
    layoutTriggerKey,
    state.nodes.size,
    state.rootNodeId,
  ]);

  const handleNodeMouseDown = useCallback(
    (nodeId: string, event: React.MouseEvent) => {
      const node = state.nodes.get(nodeId);
      if (!node) return;

      handleMouseDown(nodeId, event, node.position);
    },
    [state.nodes, handleMouseDown]
  );

  return (
    <div className="w-full h-full flex flex-col bg-gray-50">
      <EditorToolbar
        onAddNode={handleAddNode}
        onAutoLayout={applyTreeLayout}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onZoomReset={handleZoomReset}
        onExport={handleExport}
        zoom={state.viewport.zoom}
      />

      <div
        ref={containerRef}
        className={`flex-1 relative overflow-hidden overscroll-contain touch-none ${
          isPanning ? 'cursor-grabbing' : 'cursor-grab'
        }`}
        onClick={handleCanvasClick}
        onWheel={handleWheel}
        onMouseDown={handlePanStart}
      >
        {/* SVG 連線層 */}
        <MindMapCanvas
          nodes={state.nodes}
          connections={state.connections}
          viewport={state.viewport}
          containerSize={containerSize}
        />

        {/* DOM 節點層 */}
        <div
          className="absolute top-0 left-0 w-full h-full"
          style={{
            transform: `translate(${state.viewport.x}px, ${state.viewport.y}px) scale(${state.viewport.zoom})`,
            transformOrigin: '0 0',
          }}
        >
          {Array.from(state.nodes.values()).map((node) => (
            <MindMapNode
              key={node.id}
              node={node}
              isSelected={state.selectedNodeIds.includes(node.id)}
              onSelect={selectNode}
              onMouseDown={handleNodeMouseDown}
              onContentChange={(nodeId, content) =>
                updateNode(nodeId, { content })
              }
              onDoubleClick={() => {}}
              onSizeChange={(nodeId, size) => updateNodeSize(nodeId, size)}
              zoom={state.viewport.zoom}
            />
          ))}
        </div>

        {/* 拖曳提示 */}
        {dragState.isDragging && (
          <div className="absolute top-4 right-4 bg-blue-500 text-white px-4 py-2 rounded-lg shadow-lg">
            拖曳中...
          </div>
        )}
      </div>

      {/* 狀態列 */}
      <div className="h-8 bg-white border-t border-gray-200 px-4 flex items-center justify-between text-sm text-gray-600">
        <div>
          節點數: {state.nodes.size} | 選中: {state.selectedNodeIds.length}
        </div>
        <div>縮放: {Math.round(state.viewport.zoom * 100)}%</div>
      </div>
    </div>
  );
};
