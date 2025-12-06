import { memo, useRef, useState, useEffect, useCallback, useMemo } from 'react';
import { Group } from '@visx/group';
import type { HierarchyPointNode } from 'd3-hierarchy';
import type { MindMapNodeData, ViewMode } from '@/lib/mindmap/types';
import { useMindMapStore } from '@/lib/stores/mindmapStore';
import {
  NODE_DEFAULTS,
  COLORS,
  ANIMATION,
  LAYOUT_DEFAULTS,
} from '@/lib/mindmap/constants';
import { throttle } from '@/lib/utils/performance';
import {
  MotionGroup,
  MotionRect,
  MotionCircle,
  MotionText,
} from './MotionComponents';

interface MindMapNodeProps {
  node: HierarchyPointNode<MindMapNodeData>;
  viewMode: ViewMode;
  isSelected: boolean;
  isEditing: boolean;
  zoom: number;
  allNodes: HierarchyPointNode<MindMapNodeData>[];
  ghostNodeRef: React.RefObject<SVGGElement | null>;
}

// Custom comparison function for memo to prevent unnecessary re-renders
function arePropsEqual(
  prevProps: MindMapNodeProps,
  nextProps: MindMapNodeProps
): boolean {
  // Check if node data changed
  if (
    prevProps.node.data.id !== nextProps.node.data.id ||
    prevProps.node.data.label !== nextProps.node.data.label ||
    prevProps.node.data.isExpanded !== nextProps.node.data.isExpanded ||
    prevProps.node.data.color !== nextProps.node.data.color ||
    prevProps.node.data.isTopic !== nextProps.node.data.isTopic
  ) {
    return false;
  }

  // Check if position changed
  if (
    prevProps.node.x !== nextProps.node.x ||
    prevProps.node.y !== nextProps.node.y
  ) {
    return false;
  }

  // Check if selection/editing state changed
  if (
    prevProps.isSelected !== nextProps.isSelected ||
    prevProps.isEditing !== nextProps.isEditing
  ) {
    return false;
  }

  // Check if view mode changed
  if (prevProps.viewMode !== nextProps.viewMode) {
    return false;
  }

  // Check if children count changed (for expand/collapse button)
  const prevChildrenCount = prevProps.node.children?.length ?? 0;
  const nextChildrenCount = nextProps.node.children?.length ?? 0;
  if (prevChildrenCount !== nextChildrenCount) {
    return false;
  }

  // Don't compare allNodes array reference, only length
  // This prevents re-render when array reference changes but content is the same
  if (prevProps.allNodes.length !== nextProps.allNodes.length) {
    return false;
  }

  return true;
}

// Helper function to update ghost node position (moved outside component to avoid ref access during render)
function updateGhostNodePosition(
  finalX: number,
  finalY: number,
  allNodesParam: HierarchyPointNode<MindMapNodeData>[],
  viewModeParam: ViewMode,
  descendantIds: Set<string>,
  parentId: string | undefined,
  ghostRef: React.RefObject<SVGGElement | null>,
  dropIntent: React.MutableRefObject<{
    type: 'reparent' | 'reorder' | null;
    targetId: string | null;
    position?: 'before' | 'after' | 'child';
    positionCoords: { x: number; y: number };
  } | null>
) {
  if (!ghostRef.current) return;

  const THRESHOLD = 100;
  let minDistance = Infinity;
  let nearestTarget: HierarchyPointNode<MindMapNodeData> | null = null;
  let ghostPosition: { x: number; y: number } | null = null;
  let dropType: 'reparent' | 'reorder' = 'reparent';
  let reorderPosition: 'before' | 'after' | undefined = undefined;

  // Find nearest valid target
  for (const target of allNodesParam) {
    if (descendantIds.has(target.data.id) || target.data.id === parentId) {
      continue;
    }

    const targetX = viewModeParam === 'horizontal' ? target.y : target.x;
    const targetY = viewModeParam === 'horizontal' ? target.x : target.y;

    const dist = Math.sqrt(
      Math.pow(finalX - targetX, 2) + Math.pow(finalY - targetY, 2)
    );

    if (dist < minDistance && dist < THRESHOLD) {
      minDistance = dist;
      nearestTarget = target;

      // Calculate cursor position relative to target node's bounding box
      const targetWidth = NODE_DEFAULTS.WIDTH;
      const targetHeight = NODE_DEFAULTS.HEIGHT;

      // Calculate relative position (cursor position relative to target center)
      // For hit testing, we need to check the cursor position relative to the target's bounding box
      // relX and relY are relative to target center, so we need to convert to bounding box coordinates
      const relX = finalX - targetX;
      const relY = finalY - targetY;

      // Calculate bounding box boundaries (relative to center)
      const halfWidth = targetWidth / 2;
      const halfHeight = targetHeight / 2;
      const topBound = -halfHeight;
      const bottomBound = halfHeight;
      const leftBound = -halfWidth;
      const rightBound = halfWidth;

      // Determine drop zone based on cursor position using three-zone hit testing
      if (viewModeParam === 'horizontal') {
        // Horizontal layout: Three zones based on Y position
        // Zone A (Top 30%): reorder-before
        // Zone B (Bottom 30%): reorder-after
        // Zone C (Middle/Right 40%): reparent-child

        const top30Bound = topBound + targetHeight * 0.3;
        const bottom30Bound = bottomBound - targetHeight * 0.3;

        if (relY <= top30Bound) {
          // Zone A: Top 30% - Insert before
          dropType = 'reorder';
          reorderPosition = 'before';
          ghostPosition = {
            x: targetX,
            y:
              targetY - targetHeight / 2 - LAYOUT_DEFAULTS.VERTICAL_SPACING / 2,
          };
        } else if (relY >= bottom30Bound) {
          // Zone B: Bottom 30% - Insert after
          dropType = 'reorder';
          reorderPosition = 'after';
          ghostPosition = {
            x: targetX,
            y:
              targetY + targetHeight / 2 + LAYOUT_DEFAULTS.VERTICAL_SPACING / 2,
          };
        } else {
          // Zone C: Middle 40% or Right side - Reparent (become child)
          dropType = 'reparent';
          ghostPosition = {
            x: targetX + targetWidth + LAYOUT_DEFAULTS.HORIZONTAL_SPACING / 2,
            y: targetY,
          };
        }
      } else {
        // Vertical layout: Three zones based on X position
        // Zone A (Left 30%): reorder-before
        // Zone B (Right 30%): reorder-after
        // Zone C (Middle/Bottom 40%): reparent-child

        const left30Bound = leftBound + targetWidth * 0.3;
        const right30Bound = rightBound - targetWidth * 0.3;

        if (relX <= left30Bound) {
          // Zone A: Left 30% - Insert before
          dropType = 'reorder';
          reorderPosition = 'before';
          ghostPosition = {
            x:
              targetX -
              targetWidth / 2 -
              LAYOUT_DEFAULTS.HORIZONTAL_SPACING / 2,
            y: targetY,
          };
        } else if (relX >= right30Bound) {
          // Zone B: Right 30% - Insert after
          dropType = 'reorder';
          reorderPosition = 'after';
          ghostPosition = {
            x:
              targetX +
              targetWidth / 2 +
              LAYOUT_DEFAULTS.HORIZONTAL_SPACING / 2,
            y: targetY,
          };
        } else {
          // Zone C: Middle 40% or Bottom side - Reparent (become child)
          dropType = 'reparent';
          ghostPosition = {
            x: targetX,
            y: targetY + targetHeight + LAYOUT_DEFAULTS.VERTICAL_SPACING / 2,
          };
        }
      }
    }
  }

  // Update Ghost Node DOM directly (zero React state updates)
  if (nearestTarget && ghostPosition && ghostRef.current) {
    // Store drop intent for use on drop
    dropIntent.current = {
      type: dropType,
      targetId: nearestTarget.data.id,
      position: reorderPosition,
      positionCoords: ghostPosition,
    };

    // Position ghost node (center it on the calculated position)
    ghostRef.current.setAttribute(
      'transform',
      `translate(${ghostPosition.x - NODE_DEFAULTS.WIDTH / 2}, ${ghostPosition.y - NODE_DEFAULTS.HEIGHT / 2})`
    );
    ghostRef.current.setAttribute('opacity', '0.8');
    ghostRef.current.setAttribute(
      'style',
      'pointer-events: none; transition: transform 0.1s ease-out;'
    );

    // Update the rect element inside the ghost group
    const rectElement = ghostRef.current.querySelector('rect');
    if (rectElement) {
      rectElement.setAttribute('fill', '#E5E7EB');
      rectElement.setAttribute('rx', '4');
      rectElement.setAttribute('ry', '4');
    }
  } else {
    // Hide ghost node if no valid target
    dropIntent.current = null;
    if (ghostRef.current) {
      ghostRef.current.setAttribute('opacity', '0');
    }
  }
}

export const MindMapNode = memo<MindMapNodeProps>(
  ({ node, viewMode, isSelected, isEditing, allNodes, zoom, ghostNodeRef }) => {
    const inputRef = useRef<HTMLInputElement>(null);
    const nodeGroupRef = useRef<SVGGElement>(null);
    const [isHovered, setIsHovered] = useState(false);
    const [inputValue, setInputValue] = useState(node.data.label);
    const [potentialTargetIds, setPotentialTargetIds] = useState<string[]>([]);
    const isDraggingRef = useRef(false);
    const dragStartPositionRef = useRef<{ x: number; y: number } | null>(null);

    // Drop intent: stores where the node will be dropped if released now
    const dropIntentRef = useRef<{
      type: 'reparent' | 'reorder' | null;
      targetId: string | null;
      position?: 'before' | 'after' | 'child';
      positionCoords: { x: number; y: number };
    } | null>(null);

    // Optimize Zustand subscriptions - use individual selectors to prevent unnecessary re-renders
    const selectedNodeIds = useMindMapStore((state) => state.selectedNodeIds);
    const setSelectedNodes = useMindMapStore((state) => state.setSelectedNodes);
    const setEditingNode = useMindMapStore((state) => state.setEditingNode);
    const updateNode = useMindMapStore((state) => state.updateNode);
    const deleteNode = useMindMapStore((state) => state.deleteNode);
    const setDraggingNode = useMindMapStore((state) => state.setDraggingNode);
    // Only subscribe to draggingNodeId if this node is the one being dragged
    const draggingNodeId = useMindMapStore((state) => state.draggingNodeId);

    // Calculate node position (visx Tree x/y are swapped)
    const nodeX = viewMode === 'horizontal' ? node.y : node.x;
    const nodeY = viewMode === 'horizontal' ? node.x : node.y;

    // Node styling - calculate width based on text content
    // Estimate approximately 8px per character + padding
    const estimatedTextWidth =
      (node.data.label?.length || 0) * 8 + NODE_DEFAULTS.PADDING * 4;
    const width = Math.max(
      NODE_DEFAULTS.MIN_WIDTH,
      Math.min(NODE_DEFAULTS.MAX_WIDTH, estimatedTextWidth)
    );
    const height = NODE_DEFAULTS.HEIGHT;
    const borderRadius = NODE_DEFAULTS.BORDER_RADIUS;

    // Node styling - transparent by default, only show border when selected
    const fillColor = 'transparent';
    const borderColor = potentialTargetIds.includes(node.data.id)
      ? '#3B82F6' // 藍色高亮
      : isSelected
        ? COLORS.NODE_BORDER_SELECTED
        : 'transparent';
    const borderWidth = potentialTargetIds.includes(node.data.id)
      ? 3
      : isSelected
        ? 2
        : 0;
    const filter = isSelected ? 'url(#node-shadow-selected)' : 'none';

    // Track previous values to detect changes
    const prevIsEditingRef = useRef(isEditing);
    const prevLabelRef = useRef(node.data.label);

    useEffect(() => {
      const wasEditing = prevIsEditingRef.current;
      const prevLabel = prevLabelRef.current;

      prevIsEditingRef.current = isEditing;
      prevLabelRef.current = node.data.label;

      // Defer state updates to avoid synchronous setState in effect
      // This breaks the synchronous execution chain and prevents cascading renders
      if (
        (wasEditing && !isEditing) ||
        (!isEditing && prevLabel !== node.data.label)
      ) {
        queueMicrotask(() => {
          setInputValue(node.data.label);
        });
      }
    }, [isEditing, node.data.label]);

    // Focus when entering edit mode
    useEffect(() => {
      if (isEditing && inputRef.current) {
        inputRef.current.focus();
        inputRef.current.select();
      }
    }, [isEditing]);

    // Event handlers
    const handleClick = useCallback(
      (event: React.MouseEvent) => {
        event.stopPropagation();

        const isMultiSelect = event.shiftKey || event.metaKey || event.ctrlKey;

        if (isMultiSelect) {
          if (selectedNodeIds.includes(node.data.id)) {
            setSelectedNodes(
              selectedNodeIds.filter((id) => id !== node.data.id)
            );
          } else {
            setSelectedNodes([...selectedNodeIds, node.data.id]);
          }
        } else {
          setSelectedNodes([node.data.id]);
        }
      },
      [node.data.id, selectedNodeIds, setSelectedNodes]
    );

    const handleDoubleClick = useCallback(
      (event: React.MouseEvent) => {
        event.stopPropagation();
        setEditingNode(node.data.id);
      },
      [node.data.id, setEditingNode]
    );

    const handleInputChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        setInputValue(e.target.value);
      },
      []
    );

    const handleInputKeyDown = useCallback(
      (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          // If content is empty, delete the node
          if (!inputValue.trim()) {
            deleteNode(node.data.id);
          } else {
            updateNode(node.data.id, { label: inputValue });
          }
          setEditingNode(null);
        } else if (e.key === 'Escape') {
          e.preventDefault();
          // If original label and current input are both empty, delete the node
          if (!node.data.label && !inputValue.trim()) {
            deleteNode(node.data.id);
          } else {
            setInputValue(node.data.label);
          }
          setEditingNode(null);
        }
      },
      [
        node.data.id,
        node.data.label,
        inputValue,
        updateNode,
        deleteNode,
        setEditingNode,
      ]
    );

    const handleInputBlur = useCallback(() => {
      // If content is empty, delete the node
      if (!inputValue.trim() && !node.data.label) {
        deleteNode(node.data.id);
      } else {
        updateNode(node.data.id, { label: inputValue });
      }
      setEditingNode(null);
    }, [
      node.data.id,
      node.data.label,
      inputValue,
      updateNode,
      deleteNode,
      setEditingNode,
    ]);

    // Store initial mouse position and node position for drag calculations
    const dragStartMouseRef = useRef<{ x: number; y: number } | null>(null);

    const handleMouseDown = useCallback(
      (event: React.MouseEvent) => {
        // Don't start drag if editing or clicking on interactive elements
        if (isEditing) return;

        // Check if clicking on expand/collapse button
        const target = event.target as HTMLElement;
        if (target.closest('.expand-button')) return;

        event.stopPropagation();
        event.preventDefault();

        isDraggingRef.current = true;
        setDraggingNode(node.data.id);
        setPotentialTargetIds([]);
        dropIntentRef.current = null;

        // Hide ghost node initially
        if (ghostNodeRef.current) {
          ghostNodeRef.current.setAttribute('opacity', '0');
        }

        // Store initial mouse position in screen coordinates
        dragStartMouseRef.current = { x: event.clientX, y: event.clientY };

        // Store initial node position (in unscaled SVG coordinates)
        const startX = viewMode === 'horizontal' ? node.y : node.x;
        const startY = viewMode === 'horizontal' ? node.x : node.y;
        dragStartPositionRef.current = { x: startX ?? 0, y: startY ?? 0 };
      },
      [
        node.data.id,
        node.x,
        node.y,
        viewMode,
        setDraggingNode,
        isEditing,
        ghostNodeRef,
      ]
    );

    // Use ref to store descendants to avoid recalculating on every drag move
    const descendantsRef = useRef<Set<string>>(new Set());

    useEffect(() => {
      const descendantIds = new Set<string>();
      const traverse = (n: HierarchyPointNode<MindMapNodeData>) => {
        descendantIds.add(n.data.id);
        n.children?.forEach(traverse);
      };
      traverse(node);
      descendantsRef.current = descendantIds;
    }, [node]);

    // Create throttled drag move handler using useMemo to avoid ref access during render
    // Note: The throttled function captures allNodes, viewMode, and parentId from closure
    // We keep dependencies minimal to avoid recreating the throttled function unnecessarily
    const handleDragMoveThrottled = useMemo(
      () =>
        throttle(
          (
            finalX: number,
            finalY: number,
            allNodesParam: HierarchyPointNode<MindMapNodeData>[],
            viewModeParam: ViewMode,
            descendantIds: Set<string>,
            parentId: string | undefined
          ) => {
            // 找出距離 < 100px 的有效目標
            const targets: string[] = [];
            const THRESHOLD = 100;

            for (const target of allNodesParam) {
              if (
                descendantIds.has(target.data.id) ||
                target.data.id === parentId
              ) {
                continue;
              }

              const targetX =
                viewModeParam === 'horizontal' ? target.y : target.x;
              const targetY =
                viewModeParam === 'horizontal' ? target.x : target.y;

              const dist = Math.sqrt(
                Math.pow(finalX - targetX, 2) + Math.pow(finalY - targetY, 2)
              );

              if (dist < THRESHOLD) {
                targets.push(target.data.id);
              }
            }

            setPotentialTargetIds(targets);
          },
          16 // ~60fps
        ),
      // Empty deps - throttled function is stable and captures values from closure when called
      []
    );

    // Throttled Ghost Node position update handler
    // This calculates where the ghost node should appear and updates it directly via DOM
    // Note: Using helper function outside component to avoid ref access during render
    const updateGhostNodeThrottled = useMemo(
      () => throttle(updateGhostNodePosition, 50), // Update ghost position every 50ms (throttled for performance)
      []
    );

    const handleDragEnd = useCallback(
      (event: React.MouseEvent) => {
        event.stopPropagation();

        if (
          !isDraggingRef.current ||
          !nodeGroupRef.current ||
          !dragStartPositionRef.current
        ) {
          return;
        }

        isDraggingRef.current = false;

        // Hide ghost node
        if (ghostNodeRef.current) {
          ghostNodeRef.current.setAttribute('opacity', '0');
        }

        // Get final position from DOM (single source of truth)
        const transform = nodeGroupRef.current.getAttribute('transform');
        if (!transform) {
          setDraggingNode(null);
          setPotentialTargetIds([]);
          dragStartPositionRef.current = null;
          return;
        }

        // Parse transform to get final position
        const match = transform.match(/translate\(([^,]+),\s*([^)]+)\)/);
        if (!match) {
          setDraggingNode(null);
          setPotentialTargetIds([]);
          dragStartPositionRef.current = null;
          return;
        }

        const finalX = parseFloat(match[1]) + width / 2;
        const finalY = parseFloat(match[2]) + height / 2;

        const dx = finalX - dragStartPositionRef.current.x;
        const dy = finalY - dragStartPositionRef.current.y;

        // Calculate original position
        const originalX = viewMode === 'horizontal' ? node.y : node.x;
        const originalY = viewMode === 'horizontal' ? node.x : node.y;

        // Only proceed if moved significantly
        if (Math.abs(dx) < 5 && Math.abs(dy) < 5) {
          // Reset position to original if not moved
          nodeGroupRef.current.setAttribute(
            'transform',
            `translate(${(originalX ?? 0) - width / 2}, ${(originalY ?? 0) - height / 2})`
          );
          return;
        }

        if (!node.parent) {
          // Reset position if root node
          nodeGroupRef.current.setAttribute(
            'transform',
            `translate(${(originalX ?? 0) - width / 2}, ${(originalY ?? 0) - height / 2})`
          );
          return;
        }

        // Find all descendants to exclude them as potential parents
        const descendantIds = new Set<string>();
        const traverse = (n: HierarchyPointNode<MindMapNodeData>) => {
          descendantIds.add(n.data.id);
          n.children?.forEach(traverse);
        };
        traverse(node);

        let minDistance = Infinity;
        let nearestNodeId: string | null = null;
        const THRESHOLD = 100;

        allNodes.forEach((target) => {
          // Skip self, descendants, and current parent
          if (
            descendantIds.has(target.data.id) ||
            target.data.id === node.parent?.data.id
          ) {
            return;
          }

          const targetX = viewMode === 'horizontal' ? target.y : target.x;
          const targetY = viewMode === 'horizontal' ? target.x : target.y;

          const dist = Math.sqrt(
            Math.pow(finalX - targetX, 2) + Math.pow(finalY - targetY, 2)
          );

          if (dist < minDistance && dist < THRESHOLD) {
            minDistance = dist;
            nearestNodeId = target.data.id;
          }
        });

        // Use drop intent if available (from Ghost Node calculation), otherwise fall back to nearest node
        const dropIntent = dropIntentRef.current;
        const targetId = dropIntent?.targetId || nearestNodeId;

        // Sync final position to store only on dragEnd
        // The layout will recalculate positions, so we don't need to update position here
        if (dropIntent && dropIntent.targetId) {
          // Handle both reorder and reparent using moveNode
          const moveNode = useMindMapStore.getState().moveNode;
          if (moveNode) {
            // Determine the position parameter for moveNode
            let movePosition: 'before' | 'after' | 'child';
            if (dropIntent.type === 'reorder' && dropIntent.position) {
              // Reorder: use the position from dropIntent
              movePosition = dropIntent.position;
            } else if (dropIntent.type === 'reparent') {
              // Reparent: use 'child'
              movePosition = 'child';
            } else {
              // Fallback: use 'child' for reparenting
              movePosition = 'child';
            }
            moveNode(node.data.id, dropIntent.targetId, movePosition);
          } else {
            // Fallback: if moveNode doesn't exist, use reparent logic
            if (targetId) {
              updateNode(node.data.id, { parentId: targetId });
            }
          }
        } else if (targetId) {
          // Handle reparenting (existing logic) - fallback when no dropIntent
          updateNode(node.data.id, { parentId: targetId });
        } else {
          // Reset position if no valid target found
          nodeGroupRef.current.setAttribute(
            'transform',
            `translate(${(originalX ?? 0) - width / 2}, ${(originalY ?? 0) - height / 2})`
          );
        }

        // Clear dragging state
        setDraggingNode(null);
        setPotentialTargetIds([]);
        dragStartPositionRef.current = null;
        dragStartMouseRef.current = null;
        dropIntentRef.current = null;
      },
      [
        node,
        allNodes,
        updateNode,
        viewMode,
        setDraggingNode,
        width,
        height,
        ghostNodeRef,
      ]
    );

    // Determine if node has children (for expand/collapse button)
    const hasChildren = node.data.children && node.data.children.length > 0;
    const isCollapsed = hasChildren && !node.children;
    const isExpanded = hasChildren && node.children && node.children.length > 0;

    // Animation variants
    const nodeVariants = {
      initial: {
        scale: 0,
        opacity: 0,
      },
      animate: {
        scale: 1,
        opacity: 1,
        transition: {
          type: 'spring',
          stiffness: 300,
          damping: 25,
          duration: ANIMATION.DURATION_NORMAL / 1000,
        },
      },
      exit: {
        scale: 0,
        opacity: 0,
        transition: {
          duration: ANIMATION.DURATION_FAST / 1000,
        },
      },
    };

    // Visual feedback states
    const isDraggingThis = draggingNodeId === node.data.id;
    const isPotentialTarget = potentialTargetIds.includes(node.data.id);

    // Handle mouse move globally when dragging - Zero-lag implementation
    useEffect(() => {
      if (!isDraggingThis) {
        // Reset drag state when not dragging this node
        isDraggingRef.current = false;
        dragStartMouseRef.current = null;
        return;
      }

      const handleGlobalMouseMove = (event: MouseEvent) => {
        // Use refs to avoid dependency issues - critical for zero-lag performance
        if (
          !isDraggingRef.current ||
          !nodeGroupRef.current ||
          !dragStartPositionRef.current ||
          !dragStartMouseRef.current
        ) {
          return;
        }

        // Calculate mouse delta in screen coordinates
        const dx = (event.clientX - dragStartMouseRef.current.x) / zoom;
        const dy = (event.clientY - dragStartMouseRef.current.y) / zoom;

        // Calculate new position in unscaled SVG coordinate space
        const finalX = dragStartPositionRef.current.x + dx;
        const finalY = dragStartPositionRef.current.y + dy;

        // CRITICAL: Direct DOM manipulation - NO React state updates here
        // This bypasses React's render cycle completely for 60fps dragging
        nodeGroupRef.current.setAttribute(
          'transform',
          `translate(${finalX - width / 2}, ${finalY - height / 2})`
        );

        // Throttled re-parenting detection (runs independently, doesn't affect visual update)
        handleDragMoveThrottled(
          finalX,
          finalY,
          allNodes,
          viewMode,
          descendantsRef.current,
          node.parent?.data.id
        );

        // Update Ghost Node position (throttled, direct DOM manipulation)
        updateGhostNodeThrottled(
          finalX,
          finalY,
          allNodes,
          viewMode,
          descendantsRef.current,
          node.parent?.data.id,
          ghostNodeRef,
          dropIntentRef
        );
      };

      const handleGlobalMouseUp = (event: MouseEvent) => {
        if (!isDraggingRef.current) return;

        // Create synthetic event for handleDragEnd
        const syntheticEvent = {
          ...event,
          stopPropagation: () => event.stopPropagation(),
          preventDefault: () => event.preventDefault(),
        } as unknown as React.MouseEvent;

        handleDragEnd(syntheticEvent);
      };

      // Use capture phase to ensure we catch events before other handlers
      window.addEventListener('mousemove', handleGlobalMouseMove, {
        passive: true,
      });
      window.addEventListener('mouseup', handleGlobalMouseUp, {
        capture: true,
      });

      return () => {
        window.removeEventListener('mousemove', handleGlobalMouseMove);
        window.removeEventListener('mouseup', handleGlobalMouseUp, {
          capture: true,
        });
      };
    }, [
      isDraggingThis,
      zoom,
      width,
      height,
      allNodes,
      viewMode,
      node.parent?.data.id,
      handleDragMoveThrottled,
      updateGhostNodeThrottled,
      handleDragEnd,
      ghostNodeRef,
    ]);

    // Initialize position on mount - use ref to track if initialized
    const isInitializedRef = useRef(false);
    useEffect(() => {
      if (!isInitializedRef.current && nodeGroupRef.current) {
        nodeGroupRef.current.setAttribute(
          'transform',
          `translate(${(nodeX ?? 0) - width / 2}, ${(nodeY ?? 0) - height / 2})`
        );
        isInitializedRef.current = true;
      }
    }, [nodeX, nodeY, width, height]);

    // Sync position from props ONLY when not dragging
    // This prevents React from resetting the position during drag
    useEffect(() => {
      // CRITICAL: Only update DOM if we're NOT dragging this node
      // This prevents the "ghosting" at (0,0) issue
      if (!isDraggingThis && !isDraggingRef.current && nodeGroupRef.current) {
        nodeGroupRef.current.setAttribute(
          'transform',
          `translate(${(nodeX ?? 0) - width / 2}, ${(nodeY ?? 0) - height / 2})`
        );
      }
    }, [nodeX, nodeY, width, height, isDraggingThis]);

    return (
      <Group
        ref={nodeGroupRef}
        className={`mindmap-node ${isSelected ? 'selected' : ''} ${isDraggingThis ? 'dragging' : ''} ${isPotentialTarget ? 'potential-target' : ''}`}
        // CRITICAL: Do NOT set transform prop - we manage it via direct DOM manipulation
        // Setting transform prop here causes conflicts and ghosting issues
        opacity={isDraggingThis ? 0.7 : 1}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={handleClick}
        onDoubleClick={handleDoubleClick}
        onMouseDown={handleMouseDown}
        style={{
          cursor: isEditing ? 'text' : isDraggingThis ? 'grabbing' : 'grab',
        }}
      >
        <MotionGroup
          initial="initial"
          animate="animate"
          exit="exit"
          variants={nodeVariants}
        >
          {/* Node background */}
          <MotionRect
            width={width}
            height={height}
            rx={borderRadius}
            ry={borderRadius}
            fill={fillColor}
            stroke={borderColor}
            strokeWidth={borderWidth}
            filter={filter}
            style={{
              cursor: isEditing ? 'text' : isDraggingThis ? 'grabbing' : 'grab',
            }}
            animate={{
              fill: fillColor,
              stroke: borderColor,
              strokeWidth: borderWidth,
            }}
            transition={{
              duration: ANIMATION.DURATION_FAST / 1000,
            }}
          />

          {/* Depth color indicator - hidden for minimal design */}
          {/* Topic marker - hidden for minimal design */}

          {/* Node content */}
          {isEditing ? (
            <foreignObject
              x={NODE_DEFAULTS.PADDING}
              y={0}
              width={width - NODE_DEFAULTS.PADDING * 2}
              height={height}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '100%',
                  height: '100%',
                }}
              >
                <input
                  ref={inputRef}
                  type="text"
                  value={inputValue}
                  onChange={handleInputChange}
                  onKeyDown={handleInputKeyDown}
                  onBlur={handleInputBlur}
                  style={{
                    width: '100%',
                    border: 'none',
                    background: 'transparent',
                    textAlign: 'center',
                    outline: 'none',
                    fontSize: node.data.fontSize || 14,
                    fontFamily: 'Inter, system-ui, sans-serif',
                    color: COLORS.TEXT_PRIMARY,
                  }}
                />
              </div>
            </foreignObject>
          ) : (
            <text
              x={width / 2}
              y={height / 2}
              textAnchor="middle"
              dominantBaseline="central"
              fill={COLORS.TEXT_PRIMARY}
              fontSize={node.data.fontSize || 14}
              fontFamily="Inter, system-ui, sans-serif"
              style={{ pointerEvents: 'none', userSelect: 'none' }}
            >
              {node.data.label || 'Untitled'}
            </text>
          )}

          {/* Expand/collapse toggle button - positioned outside node on the right */}
          {hasChildren && (
            <Group
              transform={`translate(${width + 12}, ${height / 2})`}
              className="expand-button"
              aria-hidden="true"
            >
              <MotionCircle
                r={8}
                fill={COLORS.NODE_BORDER}
                style={{ cursor: 'pointer' }}
                tabIndex={-1}
                onClick={(e) => {
                  e.stopPropagation();
                  updateNode(node.data.id, {
                    isExpanded: !node.data.isExpanded,
                  });
                }}
                onMouseDown={(e) => e.stopPropagation()}
                onFocus={(e) => e.preventDefault()}
                whileHover={{ scale: 1.1, fill: COLORS.NODE_BORDER_HOVER }}
                whileTap={{ scale: 0.95 }}
              />
              <MotionText
                textAnchor="middle"
                dominantBaseline="central"
                fill={COLORS.TEXT_SECONDARY}
                fontSize={10}
                style={{ pointerEvents: 'none' }}
                animate={{
                  rotate: isExpanded ? 0 : 0,
                }}
              >
                {isCollapsed ? '+' : '−'}
              </MotionText>
            </Group>
          )}
        </MotionGroup>
      </Group>
    );
  },
  arePropsEqual
);

MindMapNode.displayName = 'MindMapNode';
