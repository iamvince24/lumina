'use client';

import React, { useRef, useState, useCallback, useEffect } from 'react';
import { useNewMindMapStore } from '@/stores/newMindMapStore';
import { MindMapNode } from './components/MindMapNode';
import { MindMapCanvas } from './components/MindMapCanvas';
import { EditorToolbar } from './components/EditorToolbar';
import { DropIndicator } from './components/DropIndicator';
import { OutlineListView } from './components/OutlineListView';
import { useDragAndDrop } from './hooks/useDragAndDrop';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { useAutoLayout } from './hooks/useAutoLayout';
import { clamp } from './utils/geometry';
import type {
  DropTarget,
  ViewMode,
  MindMapNode as MindMapNodeType,
} from './types';

const DEFAULT_NODE_SIZE = { width: 200, height: 40 };
const directionVectors = {
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 },
} as const;

// 計算可見節點（排除被收合父節點的子孫節點）
const getVisibleNodes = (
  nodes: Map<string, MindMapNodeType>,
  rootNodeId: string | null
): MindMapNodeType[] => {
  if (!rootNodeId) return [];

  const visibleNodes: MindMapNodeType[] = [];

  const traverse = (nodeId: string) => {
    const node = nodes.get(nodeId);
    if (!node) return;

    visibleNodes.push(node);

    // 如果節點沒有被收合，則遍歷它的子節點
    if (!node.isCollapsed) {
      node.children.forEach(traverse);
    }
  };

  traverse(rootNodeId);
  return visibleNodes;
};

interface NewMindMapEditorProps {
  /** MindMap ID for auto-save */
  mindmapId: string;
  /** Readonly mode */
  readonly?: boolean;
}

export function NewMindMapEditor({
  mindmapId,
  readonly = false,
}: NewMindMapEditorProps) {
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
  // 追蹤需要進入編輯模式的節點 (Command + Enter)
  const [editingNodeId, setEditingNodeId] = useState<string | null>(null);
  // 追蹤 Outline View 中需要 focus 的節點
  const [outlineFocusNodeId, setOutlineFocusNodeId] = useState<string | null>(
    null
  );

  // Get state and actions from store
  const {
    nodes,
    connections,
    selectedNodeIds,
    rootNodeId,
    viewport,
    viewMode,
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
    setViewMode,
  } = useNewMindMapStore();

  // Track current drop target for rendering indicators
  const [currentDropTarget, setCurrentDropTarget] = useState<DropTarget | null>(
    null
  );

  const handleDragEnd = useCallback(
    (nodeId: string) => {
      if (currentDropTarget) {
        // Handle drop based on target type
        if (currentDropTarget.type === 'child') {
          // Move node to become child of target
          moveNode(nodeId, currentDropTarget.nodeId);
        } else if (
          currentDropTarget.type === 'sibling-before' ||
          currentDropTarget.type === 'sibling-after'
        ) {
          // Move node to new sibling position
          if (currentDropTarget.parentId) {
            moveNode(
              nodeId,
              currentDropTarget.parentId,
              currentDropTarget.siblingIndex
            );
          }
        }
      }
      // Layout will be recalculated automatically
    },
    [currentDropTarget, moveNode]
  );

  // 追蹤拖拉 root node 時的起始 viewport 和滑鼠位置
  const rootDragStartRef = useRef<{
    viewportX: number;
    viewportY: number;
    mouseX: number;
    mouseY: number;
  } | null>(null);

  const handleRootDragStart = useCallback(
    (nodeId: string, mouseX: number, mouseY: number) => {
      if (nodeId === rootNodeId) {
        rootDragStartRef.current = {
          viewportX: viewport.x,
          viewportY: viewport.y,
          mouseX,
          mouseY,
        };
      }
    },
    [rootNodeId, viewport.x, viewport.y]
  );

  const handleRootDrag = useCallback(
    (mouseX: number, mouseY: number) => {
      if (rootDragStartRef.current) {
        const dx = mouseX - rootDragStartRef.current.mouseX;
        const dy = mouseY - rootDragStartRef.current.mouseY;
        updateViewport({
          x: rootDragStartRef.current.viewportX + dx,
          y: rootDragStartRef.current.viewportY + dy,
        });
      }
    },
    [updateViewport]
  );

  const handleRootDragEnd = useCallback((_nodeId: string) => {
    rootDragStartRef.current = null;
  }, []);

  const { dragState, dropTarget, handleMouseDown } = useDragAndDrop({
    nodes,
    rootNodeId,
    viewport,
    onDragEnd: handleDragEnd,
    onDropTargetChange: setCurrentDropTarget,
    // Root node panning callbacks
    onRootDragStart: handleRootDragStart,
    onRootDrag: handleRootDrag,
    onRootDragEnd: handleRootDragEnd,
  });

  const handleLayoutUpdate = useCallback(
    (nodeId: string, position: { x: number; y: number }) => {
      updateNode(nodeId, { position });
    },
    [updateNode]
  );

  const { applyTreeLayout, layoutTriggerKey } = useAutoLayout({
    nodes,
    rootNodeId,
    onLayoutUpdate: handleLayoutUpdate,
  });

  // 初始化：創建根節點並置中
  useEffect(() => {
    if (nodes.size !== 0) return;

    // 在 (0, 0) 創建根節點
    const newRootId = createNode('中心主題', { x: 0, y: 0 }, null);

    // 計算 viewport 偏移量，讓根節點顯示在畫面中心
    const nodeWidth = DEFAULT_NODE_SIZE.width;
    const nodeHeight = DEFAULT_NODE_SIZE.height;
    const viewportX = (containerSize.width - nodeWidth * viewport.zoom) / 2;
    const viewportY = (containerSize.height - nodeHeight * viewport.zoom) / 2;

    updateViewport({ x: viewportX, y: viewportY });

    // Select the newly created root node
    if (newRootId) {
      selectNode(newRootId);
    }
  }, [
    nodes.size,
    containerSize,
    createNode,
    viewport.zoom,
    updateViewport,
    selectNode,
  ]);

  // 容器尺寸變化時，重新計算 viewport 偏移量讓 root node 置中
  useEffect(() => {
    if (!rootNodeId) return;
    // 只在只有根節點時自動置中
    if (nodes.size !== 1) return;

    const rootNode = nodes.get(rootNodeId);
    if (!rootNode) return;

    // 計算讓節點中心顯示在畫面中心的 viewport 偏移
    const zoom = viewport.zoom;
    const viewportX =
      containerSize.width / 2 -
      (rootNode.position.x + rootNode.size.width / 2) * zoom;
    const viewportY =
      containerSize.height / 2 -
      (rootNode.position.y + rootNode.size.height / 2) * zoom;

    updateViewport({ x: viewportX, y: viewportY });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [containerSize.width, containerSize.height]);

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
    if (selectedNodeIds.length === 0 && rootNodeId) {
      // 沒有選中節點時，添加到根節點
      const rootNode = nodes.get(rootNodeId);
      if (rootNode) {
        const newX = rootNode.position.x + 200;
        const newY = rootNode.position.y;
        createNode('', { x: newX, y: newY }, rootNodeId);
      }
    } else if (selectedNodeIds.length > 0) {
      // 有選中節點時，添加為子節點
      const selectedId = selectedNodeIds[0];
      const selectedNode = nodes.get(selectedId);
      if (selectedNode) {
        const newX = selectedNode.position.x + 200;
        const newY =
          selectedNode.position.y + selectedNode.children.length * 80;
        createNode('', { x: newX, y: newY }, selectedId);
      }
    }
  }, [nodes, selectedNodeIds, rootNodeId, createNode]);

  // 新增同層兄弟節點（Enter 鍵行為）
  const handleAddSiblingNode = useCallback(() => {
    if (selectedNodeIds.length === 0) return;

    const selectedId = selectedNodeIds[0];
    const selectedNode = nodes.get(selectedId);
    if (!selectedNode) return;

    // 如果是 root node，則新增子節點
    if (selectedId === rootNodeId) {
      const newX = selectedNode.position.x + 200;
      const newY = selectedNode.position.y + selectedNode.children.length * 80;
      createNode('', { x: newX, y: newY }, selectedId);
      return;
    }

    // 非 root node：新增同層兄弟節點
    const parentId = selectedNode.parentId;
    if (!parentId) return;

    const newX = selectedNode.position.x;
    const newY = selectedNode.position.y + 80;
    createNode('', { x: newX, y: newY }, parentId, selectedId);
  }, [nodes, selectedNodeIds, rootNodeId, createNode]);

  const handleDeleteSelected = useCallback(() => {
    selectedNodeIds.forEach((nodeId) => {
      if (nodeId !== rootNodeId) {
        deleteNode(nodeId);
      }
    });
  }, [selectedNodeIds, rootNodeId, deleteNode]);

  // Outline View 專用：在指定節點後新增同層兄弟節點
  const handleOutlineAddSiblingNode = useCallback(
    (nodeId: string): string | null => {
      const node = nodes.get(nodeId);
      if (!node) return null;

      // 如果是 root node，新增子節點
      if (nodeId === rootNodeId) {
        const newX = node.position.x + 200;
        const newY = node.position.y + node.children.length * 80;
        const newNodeId = createNode('', { x: newX, y: newY }, nodeId);
        setOutlineFocusNodeId(newNodeId);
        return newNodeId;
      }

      // 非 root node：新增同層兄弟節點
      const parentId = node.parentId;
      if (!parentId) return null;

      const newX = node.position.x;
      const newY = node.position.y + 80;
      const newNodeId = createNode('', { x: newX, y: newY }, parentId, nodeId);
      setOutlineFocusNodeId(newNodeId);
      return newNodeId;
    },
    [nodes, rootNodeId, createNode]
  );

  // Outline View 專用：縮排（成為上一個兄弟節點的子節點）
  const handleIndentNode = useCallback(
    (nodeId: string) => {
      const node = nodes.get(nodeId);
      if (!node || !node.parentId) return;

      const parent = nodes.get(node.parentId);
      if (!parent) return;

      const currentIndex = parent.children.indexOf(nodeId);
      if (currentIndex <= 0) return; // 沒有上一個兄弟節點

      const previousSiblingId = parent.children[currentIndex - 1];
      // 移動到上一個兄弟節點成為其子節點
      moveNode(nodeId, previousSiblingId);
      // 保持 focus
      setOutlineFocusNodeId(nodeId);
    },
    [nodes, moveNode]
  );

  // Outline View 專用：退縮（提升到父節點層級）
  const handleOutdentNode = useCallback(
    (nodeId: string) => {
      const node = nodes.get(nodeId);
      if (!node || !node.parentId) return;

      const parent = nodes.get(node.parentId);
      if (!parent || !parent.parentId) return; // 父節點是 root，無法再提升

      const grandparentId = parent.parentId;
      const grandparent = nodes.get(grandparentId);
      if (!grandparent) return;

      // 計算插入位置：在父節點之後
      const parentIndex = grandparent.children.indexOf(parent.id);
      moveNode(nodeId, grandparentId, parentIndex + 1);
      // 保持 focus
      setOutlineFocusNodeId(nodeId);
    },
    [nodes, moveNode]
  );

  // Outline View 專用：向上移動節點
  const handleMoveNodeUp = useCallback(
    (nodeId: string) => {
      reorderNodeInParent(nodeId, 'up');
    },
    [reorderNodeInParent]
  );

  // Outline View 專用：向下移動節點
  const handleMoveNodeDown = useCallback(
    (nodeId: string) => {
      reorderNodeInParent(nodeId, 'down');
    },
    [reorderNodeInParent]
  );

  const findDirectionalNeighbor = useCallback(
    (direction: keyof typeof directionVectors) => {
      if (selectedNodeIds.length === 0) return null;

      const currentId = selectedNodeIds[0];
      const currentNode = nodes.get(currentId);
      if (!currentNode) return null;

      const directionVector = directionVectors[direction];
      const currentCenter = {
        x: currentNode.position.x + currentNode.size.width / 2,
        y: currentNode.position.y + currentNode.size.height / 2,
      };

      let bestId: string | null = null;
      let bestScore = Number.POSITIVE_INFINITY;

      nodes.forEach((node, id) => {
        if (id === currentId) return;

        const targetCenter = {
          x: node.position.x + node.size.width / 2,
          y: node.position.y + node.size.height / 2,
        };

        const vx = targetCenter.x - currentCenter.x;
        const vy = targetCenter.y - currentCenter.y;

        const dot = vx * directionVector.x + vy * directionVector.y;
        if (dot <= 0) return;

        const distance = Math.hypot(vx, vy);
        if (distance === 0) return;

        const angle = Math.acos(dot / distance);
        const score = angle * 1000 + distance;

        if (score < bestScore) {
          bestScore = score;
          bestId = id;
        }
      });

      return bestId;
    },
    [nodes, selectedNodeIds]
  );

  const handleArrowNavigation = useCallback(
    (direction: keyof typeof directionVectors) => {
      const nextId = findDirectionalNeighbor(direction);
      if (!nextId) return;
      selectNode(nextId, false);
    },
    [findDirectionalNeighbor, selectNode]
  );

  const handleZoomIn = useCallback(() => {
    updateViewport({ zoom: clamp(viewport.zoom + 0.1, 0.1, 3) });
  }, [viewport.zoom, updateViewport]);

  const handleZoomOut = useCallback(() => {
    updateViewport({ zoom: clamp(viewport.zoom - 0.1, 0.1, 3) });
  }, [viewport.zoom, updateViewport]);

  const handleZoomReset = useCallback(() => {
    // 重置縮放到 2x，並計算 viewport 偏移量讓 root node 置中
    const zoom = 2;
    const rootNode = rootNodeId ? nodes.get(rootNodeId) : null;
    const nodeWidth = rootNode?.size.width ?? DEFAULT_NODE_SIZE.width;
    const nodeHeight = rootNode?.size.height ?? DEFAULT_NODE_SIZE.height;
    const nodeX = rootNode?.position.x ?? 0;
    const nodeY = rootNode?.position.y ?? 0;

    // 計算讓節點中心顯示在畫面中心的 viewport 偏移
    const viewportX = containerSize.width / 2 - (nodeX + nodeWidth / 2) * zoom;
    const viewportY =
      containerSize.height / 2 - (nodeY + nodeHeight / 2) * zoom;

    updateViewport({ zoom, x: viewportX, y: viewportY });
  }, [rootNodeId, nodes, containerSize, updateViewport]);

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
      const currentZoom = viewport.zoom;
      const nextZoom = clamp(currentZoom + boundedDelta, 0.1, 3);
      if (nextZoom === currentZoom) return;

      const scaleRatio = nextZoom / currentZoom;
      const nextViewportX = viewport.x * scaleRatio + mouseX * (1 - scaleRatio);
      const nextViewportY = viewport.y * scaleRatio + mouseY * (1 - scaleRatio);

      updateViewport({
        zoom: nextZoom,
        x: nextViewportX,
        y: nextViewportY,
      });
    },
    [viewport, updateViewport]
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
      setViewportStart({ x: viewport.x, y: viewport.y });
    },
    [viewport]
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
      nodes: Array.from(nodes.values()),
      connections,
      rootNodeId,
    };

    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'mindmap.json';
    a.click();
    URL.revokeObjectURL(url);
  }, [nodes, connections, rootNodeId]);

  useKeyboardShortcuts({
    onDelete: handleDeleteSelected,
    onZoomIn: handleZoomIn,
    onZoomOut: handleZoomOut,
    onZoomReset: handleZoomReset,
    onNewNode: handleAddNode,
    onNewSiblingNode: handleAddSiblingNode,
    onEditNode: () => {
      if (selectedNodeIds.length > 0) {
        setEditingNodeId(selectedNodeIds[0]);
      }
    },
    onArrowUp: () => handleArrowNavigation('up'),
    onArrowDown: () => handleArrowNavigation('down'),
    onArrowLeft: () => handleArrowNavigation('left'),
    onArrowRight: () => handleArrowNavigation('right'),
    onSwitchToMindmap: () => setViewMode('mindmap'),
    onSwitchToOutline: () => setViewMode('outline'),
  });

  const handleCanvasClick = useCallback(() => {
    clearSelection();
  }, [clearSelection]);

  useEffect(() => {
    if (!rootNodeId || nodes.size === 0) return;
    applyTreeLayout();
  }, [
    applyTreeLayout,
    handleLayoutUpdate,
    layoutTriggerKey,
    nodes.size,
    rootNodeId,
  ]);

  const handleNodeMouseDown = useCallback(
    (nodeId: string, event: React.MouseEvent) => {
      const node = nodes.get(nodeId);
      if (!node) return;

      handleMouseDown(nodeId, event, node.position);
    },
    [nodes, handleMouseDown]
  );

  return (
    <div className="w-full h-full flex flex-col bg-gray-50">
      <EditorToolbar
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        onAddNode={handleAddNode}
        onAutoLayout={applyTreeLayout}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onZoomReset={handleZoomReset}
        onExport={handleExport}
        zoom={viewport.zoom}
      />

      {/* 心智圖視圖 - 使用 hidden 而非條件渲染，保持 containerRef 掛載 */}
      <div
        ref={containerRef}
        className={`flex-1 relative overflow-hidden overscroll-contain touch-none ${
          isPanning ? 'cursor-grabbing' : 'cursor-grab'
        } ${viewMode !== 'mindmap' ? 'hidden' : ''}`}
        onClick={handleCanvasClick}
        onWheel={handleWheel}
        onMouseDown={handlePanStart}
      >
        {/* SVG 連線層 */}
        <MindMapCanvas
          nodes={nodes}
          connections={connections}
          viewport={viewport}
          containerSize={containerSize}
          onToggleCollapse={toggleNodeCollapse}
        />

        {/* DOM 節點層 */}
        <div
          className="absolute top-0 left-0 w-full h-full pointer-events-none"
          style={{
            transform: `translate(${viewport.x}px, ${viewport.y}px) scale(${viewport.zoom})`,
            transformOrigin: '0 0',
          }}
        >
          {getVisibleNodes(nodes, rootNodeId).map((node) => (
            <MindMapNode
              key={node.id}
              node={node}
              isSelected={selectedNodeIds.includes(node.id)}
              isBeingDragged={
                dragState.isDragging &&
                dragState.nodeId !== node.id &&
                dragState.nodeId !== rootNodeId
              }
              isDropTarget={
                dropTarget?.nodeId === node.id && dropTarget?.type === 'child'
              }
              isDragSource={
                dragState.isDragging && dragState.nodeId === node.id
              }
              editRequested={editingNodeId === node.id}
              onSelect={selectNode}
              onMouseDown={handleNodeMouseDown}
              onContentChange={(nodeId, content) =>
                updateNode(nodeId, { content })
              }
              onDoubleClick={() => {}}
              onSizeChange={(nodeId, size) => updateNodeSize(nodeId, size)}
              onWidthChange={(nodeId, width) =>
                updateNodeSize(nodeId, {
                  width,
                  height: nodes.get(nodeId)?.size.height || 40,
                })
              }
              onCancelNode={(nodeId) => {
                if (nodeId !== rootNodeId) {
                  deleteNode(nodeId);
                }
              }}
              onEditComplete={() => setEditingNodeId(null)}
              zoom={viewport.zoom}
            />
          ))}

          {/* Drop Indicator */}
          <DropIndicator
            dropTarget={dropTarget}
            nodes={nodes}
            draggingNodeId={dragState.nodeId}
          />
        </div>
      </div>

      {/* 列表視圖 */}
      {viewMode === 'outline' && (
        <OutlineListView
          nodes={nodes}
          rootNodeId={rootNodeId}
          onContentChange={(nodeId, content) => updateNode(nodeId, { content })}
          onToggleCollapse={toggleNodeCollapse}
          onAddSiblingNode={handleOutlineAddSiblingNode}
          onIndentNode={handleIndentNode}
          onOutdentNode={handleOutdentNode}
          onMoveNodeUp={handleMoveNodeUp}
          onMoveNodeDown={handleMoveNodeDown}
          onSelectNode={selectNode}
          onDeleteNode={deleteNode}
          focusNodeId={outlineFocusNodeId}
          onClearFocusNode={() => setOutlineFocusNodeId(null)}
        />
      )}

      {/* 狀態列 */}
      <div className="h-8 bg-white border-t border-gray-200 px-4 flex items-center justify-between text-sm text-gray-600">
        <div>節點數: {nodes.size}</div>
      </div>
    </div>
  );
}
