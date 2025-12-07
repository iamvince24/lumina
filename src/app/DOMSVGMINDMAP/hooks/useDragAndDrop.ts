'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { Position, DragState, DropTarget, MindMapNode } from '../types';

interface UseDragAndDropProps {
  nodes: Map<string, MindMapNode>;
  rootNodeId: string | null;
  viewport: { x: number; y: number; zoom: number };
  onDragStart?: (nodeId: string, position: Position) => void;
  onDrag?: (nodeId: string, position: Position) => void;
  onDragEnd?: (nodeId: string, position: Position) => void;
  onDropTargetChange?: (target: DropTarget | null) => void;
}

const SIBLING_DROP_ZONE_HEIGHT = 20; // Height of the drop zone between siblings

export const useDragAndDrop = ({
  nodes,
  rootNodeId,
  viewport,
  onDragStart,
  onDrag,
  onDragEnd,
  onDropTargetChange,
}: UseDragAndDropProps) => {
  const [dragState, setDragState] = useState<DragState>({
    isDragging: false,
    nodeId: null,
    startPosition: null,
    offset: null,
  });

  const [dropTarget, setDropTarget] = useState<DropTarget | null>(null);

  const dragStateRef = useRef(dragState);
  const nodesRef = useRef(nodes);
  const viewportRef = useRef(viewport);

  useEffect(() => {
    dragStateRef.current = dragState;
  }, [dragState]);

  useEffect(() => {
    nodesRef.current = nodes;
  }, [nodes]);

  useEffect(() => {
    viewportRef.current = viewport;
  }, [viewport]);

  // Get all descendants of a node
  const getDescendants = useCallback(
    (nodeId: string, allNodes: Map<string, MindMapNode>): Set<string> => {
      const descendants = new Set<string>();
      const node = allNodes.get(nodeId);
      if (!node) return descendants;

      const traverse = (id: string) => {
        const n = allNodes.get(id);
        if (!n) return;
        n.children.forEach((childId) => {
          descendants.add(childId);
          traverse(childId);
        });
      };

      traverse(nodeId);
      return descendants;
    },
    []
  );

  // Calculate drop target based on mouse position
  const calculateDropTarget = useCallback(
    (
      mouseX: number,
      mouseY: number,
      draggingNodeId: string
    ): DropTarget | null => {
      const allNodes = nodesRef.current;
      const vp = viewportRef.current;

      // Get descendants of dragging node (can't drop on them)
      const descendants = getDescendants(draggingNodeId, allNodes);

      let closestTarget: DropTarget | null = null;
      let closestDistance = Infinity;

      allNodes.forEach((node, nodeId) => {
        // Skip the dragging node and its descendants
        if (nodeId === draggingNodeId || descendants.has(nodeId)) return;

        // Calculate node position in screen coordinates
        const nodeScreenX = node.position.x * vp.zoom + vp.x;
        const nodeScreenY = node.position.y * vp.zoom + vp.y;
        const nodeWidth = node.size.width * vp.zoom;
        const nodeHeight = node.size.height * vp.zoom;
        const nodeCenterY = nodeScreenY + nodeHeight / 2;

        // Check if mouse is over this node (for "child" drop)
        const isOverNode =
          mouseX >= nodeScreenX &&
          mouseX <= nodeScreenX + nodeWidth &&
          mouseY >= nodeScreenY &&
          mouseY <= nodeScreenY + nodeHeight;

        if (isOverNode) {
          const distanceToCenter = Math.hypot(
            mouseX - (nodeScreenX + nodeWidth / 2),
            mouseY - nodeCenterY
          );
          if (distanceToCenter < closestDistance) {
            closestDistance = distanceToCenter;
            closestTarget = {
              nodeId,
              type: 'child',
              parentId: nodeId,
            };
          }
          return;
        }

        // Check for sibling insertion zones
        const parentId = node.parentId;
        if (!parentId) return; // Root node can't have siblings

        const parent = allNodes.get(parentId);
        if (!parent) return;

        // Check if mouse is in the horizontal range of this node
        if (
          mouseX >= nodeScreenX - 20 &&
          mouseX <= nodeScreenX + nodeWidth + 20
        ) {
          // Check "sibling-before" zone (above current node)
          const beforeZoneTop = nodeScreenY - SIBLING_DROP_ZONE_HEIGHT;
          const beforeZoneBottom = nodeScreenY + SIBLING_DROP_ZONE_HEIGHT / 2;

          if (mouseY >= beforeZoneTop && mouseY <= beforeZoneBottom) {
            const distToZone = Math.abs(mouseY - nodeScreenY);
            if (distToZone < closestDistance) {
              const siblingIndex = parent.children.indexOf(nodeId);
              closestDistance = distToZone;
              closestTarget = {
                nodeId,
                type: 'sibling-before',
                parentId,
                siblingIndex,
              };
            }
          }

          // Check "sibling-after" zone (below current node)
          const afterZoneTop =
            nodeScreenY + nodeHeight - SIBLING_DROP_ZONE_HEIGHT / 2;
          const afterZoneBottom =
            nodeScreenY + nodeHeight + SIBLING_DROP_ZONE_HEIGHT;

          if (mouseY >= afterZoneTop && mouseY <= afterZoneBottom) {
            const distToZone = Math.abs(mouseY - (nodeScreenY + nodeHeight));
            if (distToZone < closestDistance) {
              const siblingIndex = parent.children.indexOf(nodeId);
              closestDistance = distToZone;
              closestTarget = {
                nodeId,
                type: 'sibling-after',
                parentId,
                siblingIndex: siblingIndex + 1,
              };
            }
          }
        }
      });

      return closestTarget;
    },
    [getDescendants]
  );

  const handleMouseDown = useCallback(
    (nodeId: string, event: React.MouseEvent, nodePosition: Position) => {
      event.stopPropagation();

      const vp = viewportRef.current;

      // Calculate node position in screen coordinates
      const nodeScreenX = nodePosition.x * vp.zoom + vp.x;
      const nodeScreenY = nodePosition.y * vp.zoom + vp.y;

      const startPos = {
        x: event.clientX,
        y: event.clientY,
      };

      // Offset is the difference between mouse and node in screen coords
      const offset = {
        x: event.clientX - nodeScreenX,
        y: event.clientY - nodeScreenY,
      };

      setDragState({
        isDragging: true,
        nodeId,
        startPosition: startPos,
        offset,
      });

      onDragStart?.(nodeId, nodePosition);
    },
    [onDragStart]
  );

  const handleMouseMove = useCallback(
    (event: MouseEvent) => {
      const state = dragStateRef.current;

      if (!state.isDragging || !state.nodeId || !state.offset) return;

      const isRootNode = state.nodeId === rootNodeId;
      const vp = viewportRef.current;

      if (isRootNode) {
        // Root node: free drag
        // offset is the difference between mouse and node position in screen coords
        // So node screen position = mouse screen position - offset
        // Then convert to canvas coords: (nodeScreen - vp) / zoom
        const nodeScreenX = event.clientX - state.offset.x;
        const nodeScreenY = event.clientY - state.offset.y;
        const newPosition = {
          x: (nodeScreenX - vp.x) / vp.zoom,
          y: (nodeScreenY - vp.y) / vp.zoom,
        };
        onDrag?.(state.nodeId, newPosition);
      } else {
        // Child node: calculate drop target
        const newTarget = calculateDropTarget(
          event.clientX,
          event.clientY,
          state.nodeId
        );

        setDropTarget(newTarget);
        onDropTargetChange?.(newTarget);
      }
    },
    [rootNodeId, onDrag, onDropTargetChange, calculateDropTarget]
  );

  const handleMouseUp = useCallback(
    (event: MouseEvent) => {
      const state = dragStateRef.current;

      if (!state.isDragging || !state.nodeId || !state.offset) return;

      const vp = viewportRef.current;
      const nodeScreenX = event.clientX - state.offset.x;
      const nodeScreenY = event.clientY - state.offset.y;
      const finalPosition = {
        x: (nodeScreenX - vp.x) / vp.zoom,
        y: (nodeScreenY - vp.y) / vp.zoom,
      };

      onDragEnd?.(state.nodeId, finalPosition);

      setDragState({
        isDragging: false,
        nodeId: null,
        startPosition: null,
        offset: null,
      });

      setDropTarget(null);
      onDropTargetChange?.(null);
    },
    [onDragEnd, onDropTargetChange]
  );

  useEffect(() => {
    if (dragState.isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);

      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [dragState.isDragging, handleMouseMove, handleMouseUp]);

  return {
    dragState,
    dropTarget,
    handleMouseDown,
  };
};
