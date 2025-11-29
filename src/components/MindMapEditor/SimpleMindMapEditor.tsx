'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useMindMapStore } from '@/lib/stores/mindmapStore';
import { useNodeDrag } from '@/lib/mindmap/hooks/useNodeDrag';
import { useCanvasPan } from '@/lib/mindmap/hooks/useCanvasPan';
import { useNodeSelection } from '@/lib/mindmap/hooks/useNodeSelection';
import { useKeyboardShortcuts } from '@/lib/mindmap/hooks/useKeyboardShortcuts';
import { SVGCanvas } from './SVGCanvas';
import { EdgesLayer } from './EdgesLayer';
import { NodesLayer } from './NodesLayer';

export function MindMapEditor() {
  const svgRef = useRef<SVGSVGElement>(null);

  // Get state from store
  const nodes = useMindMapStore((state) => state.nodes);
  const edges = useMindMapStore((state) => state.edges);
  const viewport = useMindMapStore((state) => state.viewport);
  const selectedNodeIds = useMindMapStore((state) => state.selectedNodeIds);
  const editingNodeId = useMindMapStore((state) => state.editingNodeId);

  // Get actions from store
  const setViewport = useMindMapStore((state) => state.setViewport);
  const addNode = useMindMapStore((state) => state.addNode);
  const updateNode = useMindMapStore((state) => state.updateNode);
  const deleteNode = useMindMapStore((state) => state.deleteNode);
  const setSelectedNodes = useMindMapStore((state) => state.setSelectedNodes);
  const setEditingNode = useMindMapStore((state) => state.setEditingNode);
  const undo = useMindMapStore((state) => state.undo);
  const redo = useMindMapStore((state) => state.redo);

  // Initialize with demo data if empty
  useEffect(() => {
    if (nodes.length === 0) {
      // Create root node
      const rootId = addNode(null, 'Mind Map');
      // Create some child nodes
      const child1Id = addNode(rootId, 'Idea 1');
      const child2Id = addNode(rootId, 'Idea 2');
      const child3Id = addNode(rootId, 'Idea 3');
      // Create grandchildren
      addNode(child1Id, 'Detail 1.1');
      addNode(child1Id, 'Detail 1.2');
      addNode(child2Id, 'Detail 2.1');
    }
  }, []);

  // Node drag hook
  const { handleDragStart: handleNodeDragStart } = useNodeDrag({
    viewport,
    onDragStart: (nodeId) => {
      // Position tracking handled by hook
    },
    onDrag: (nodeId, position) => {
      updateNode(nodeId, { position });
    },
    onDragEnd: (nodeId, position) => {
      updateNode(nodeId, { position });
    },
  });

  // Canvas pan hook
  const { handlePanStart } = useCanvasPan({
    viewport,
    onViewportChange: setViewport,
  });

  // Node selection hook
  const { handleNodeClick, handleCanvasClick } = useNodeSelection({
    selectedNodeIds,
    onSelectionChange: setSelectedNodes,
  });

  // Handle node double click (enter edit mode)
  const handleNodeDoubleClick = useCallback(
    (nodeId: string) => {
      setEditingNode(nodeId);
    },
    [setEditingNode]
  );

  // Handle node label change
  const handleNodeLabelChange = useCallback(
    (nodeId: string, label: string) => {
      updateNode(nodeId, { label });
    },
    [updateNode]
  );

  // Handle edit end
  const handleNodeEditEnd = useCallback(() => {
    setEditingNode(null);
  }, [setEditingNode]);

  // Keyboard shortcuts
  useKeyboardShortcuts({
    enabled: true,
    isEditing: editingNodeId !== null,
    onAddSibling: () => {
      if (selectedNodeIds.length === 1) {
        const selectedNode = nodes.find((n) => n.id === selectedNodeIds[0]);
        if (selectedNode) {
          addNode(selectedNode.parentId, '新節點');
        }
      }
    },
    onAddChild: () => {
      if (selectedNodeIds.length === 1) {
        addNode(selectedNodeIds[0], '新節點');
      }
    },
    onDelete: () => {
      if (selectedNodeIds.length > 0) {
        selectedNodeIds.forEach((id) => deleteNode(id));
      }
    },
    onEdit: () => {
      if (selectedNodeIds.length === 1) {
        setEditingNode(selectedNodeIds[0]);
      }
    },
    onUndo: undo,
    onRedo: redo,
    onSelectAll: () => {
      setSelectedNodes(nodes.map((n) => n.id));
    },
    onSetTopic: () => {
      if (selectedNodeIds.length === 1) {
        const node = nodes.find((n) => n.id === selectedNodeIds[0]);
        if (node) {
          updateNode(node.id, { isTopic: !node.isTopic });
        }
      }
    },
  });

  return (
    <div className="relative w-full h-full bg-slate-50">
      <SVGCanvas
        ref={svgRef}
        width={1200}
        height={800}
        viewport={viewport}
        onViewportChange={setViewport}
      >
        <g onMouseDown={handlePanStart} onClick={handleCanvasClick}>
          <EdgesLayer nodes={nodes} edges={edges} />
          <NodesLayer
            nodes={nodes}
            selectedNodeIds={selectedNodeIds}
            editingNodeId={editingNodeId}
            onNodeClick={handleNodeClick}
            onNodeDoubleClick={handleNodeDoubleClick}
            onNodeDragStart={handleNodeDragStart}
            onNodeLabelChange={handleNodeLabelChange}
            onNodeEditEnd={handleNodeEditEnd}
          />
        </g>
      </SVGCanvas>
    </div>
  );
}
