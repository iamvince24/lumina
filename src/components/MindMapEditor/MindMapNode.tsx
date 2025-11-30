import { memo, useRef, useState, useEffect, useCallback } from 'react';
import { Group } from '@visx/group';
import { Drag } from '@visx/drag';
import type { HierarchyPointNode } from 'd3-hierarchy';
import type { MindMapNodeData, ViewMode } from '@/lib/mindmap/types';
import { useMindMapStore } from '@/lib/stores/mindmapStore';
import { NODE_DEFAULTS, COLORS, ANIMATION } from '@/lib/mindmap/constants';
import { getDepthColor } from '@/lib/mindmap/visx';
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

export const MindMapNode = memo<MindMapNodeProps>(
  ({ node, viewMode, isSelected, isEditing, allNodes }) => {
    const inputRef = useRef<HTMLInputElement>(null);
    const [isHovered, setIsHovered] = useState(false);
    const [inputValue, setInputValue] = useState(node.data.label);
    const [potentialTargetIds, setPotentialTargetIds] = useState<string[]>([]);

    // Store actions
    const {
      selectedNodeIds,
      setSelectedNodes,
      setEditingNode,
      updateNode,
      draggingNodeId,
      setDraggingNode,
    } = useMindMapStore();

    // Calculate node position (visx Tree x/y are swapped)
    const nodeX = viewMode === 'horizontal' ? node.y : node.x;
    const nodeY = viewMode === 'horizontal' ? node.x : node.y;

    // Node styling
    const width = NODE_DEFAULTS.WIDTH;
    const height = NODE_DEFAULTS.HEIGHT;
    const borderRadius = NODE_DEFAULTS.BORDER_RADIUS;

    const fillColor =
      node.data.color ||
      (node.data.isTopic ? COLORS.NODE_TOPIC : COLORS.NODE_DEFAULT);
    const borderColor = potentialTargetIds.includes(node.data.id)
      ? '#3B82F6' // 藍色高亮
      : isSelected
        ? COLORS.NODE_BORDER_SELECTED
        : isHovered
          ? COLORS.NODE_BORDER_HOVER
          : COLORS.NODE_BORDER;
    const borderWidth = potentialTargetIds.includes(node.data.id)
      ? 3
      : isSelected
        ? 2
        : 1;
    const filter = isSelected
      ? 'url(#node-shadow-selected)'
      : 'url(#node-shadow)';

    // Connection color based on depth
    const depthColor = getDepthColor(node.depth);

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
          updateNode(node.data.id, { label: inputValue });
          setEditingNode(null);
        } else if (e.key === 'Escape') {
          e.preventDefault();
          setInputValue(node.data.label);
          setEditingNode(null);
        }
      },
      [node.data.id, node.data.label, inputValue, updateNode, setEditingNode]
    );

    const handleInputBlur = useCallback(() => {
      updateNode(node.data.id, { label: inputValue });
      setEditingNode(null);
    }, [node.data.id, inputValue, updateNode, setEditingNode]);

    const handleDragStart = useCallback(() => {
      setDraggingNode(node.data.id);
      setPotentialTargetIds([]);
    }, [node.data.id, setDraggingNode]);

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

    // Create throttled drag move handler
    const handleDragMoveThrottled = useRef(
      throttle(
        (
          finalX: number,
          finalY: number,
          allNodes: HierarchyPointNode<MindMapNodeData>[],
          viewMode: ViewMode,
          descendantIds: Set<string>,
          parentId: string | undefined
        ) => {
          // 找出距離 < 100px 的有效目標
          const targets: string[] = [];
          const THRESHOLD = 100;

          for (const target of allNodes) {
            if (
              descendantIds.has(target.data.id) ||
              target.data.id === parentId
            ) {
              continue;
            }

            const targetX = viewMode === 'horizontal' ? target.y : target.x;
            const targetY = viewMode === 'horizontal' ? target.x : target.y;

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
      )
    ).current;

    const handleDragMove = useCallback(
      ({ dx, dy }: { dx: number; dy: number }) => {
        const finalX = (nodeX ?? 0) + dx;
        const finalY = (nodeY ?? 0) + dy;

        handleDragMoveThrottled(
          finalX,
          finalY,
          allNodes,
          viewMode,
          descendantsRef.current,
          node.parent?.data.id
        );
      },
      [
        nodeX,
        nodeY,
        allNodes,
        viewMode,
        node.parent?.data.id,
        handleDragMoveThrottled,
      ]
    );

    const handleDragEnd = useCallback(
      ({ dx, dy }: { dx: number; dy: number }) => {
        // 清除拖曳狀態
        setDraggingNode(null);
        setPotentialTargetIds([]);

        if (Math.abs(dx) < 5 && Math.abs(dy) < 5) return;
        if (!node.parent) return; // Cannot re-parent root

        const finalX = (nodeX ?? 0) + dx;
        const finalY = (nodeY ?? 0) + dy;

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

        if (nearestNodeId) {
          updateNode(node.data.id, { parentId: nearestNodeId });
        }
      },
      [node, nodeX, nodeY, allNodes, updateNode, viewMode, setDraggingNode]
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

    return (
      <Drag
        width={width}
        height={height}
        x={nodeX}
        y={nodeY}
        onDragStart={handleDragStart}
        onDragMove={handleDragMove}
        onDragEnd={handleDragEnd}
      >
        {({ dragStart, dragEnd, dragMove, isDragging, x, y, dx, dy }) => (
          <Group
            className={`mindmap-node ${isSelected ? 'selected' : ''} ${isDraggingThis ? 'dragging' : ''} ${isPotentialTarget ? 'potential-target' : ''}`}
            transform={`translate(${(nodeX ?? 0) + (isDragging ? dx : 0) - width / 2}, ${(nodeY ?? 0) + (isDragging ? dy : 0) - height / 2})`}
            opacity={isDraggingThis ? 0.7 : 1}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onClick={handleClick}
            onDoubleClick={handleDoubleClick}
            onMouseDown={dragStart}
            onMouseMove={dragMove}
            onMouseUp={dragEnd}
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
                  cursor: isEditing ? 'text' : isDragging ? 'grabbing' : 'grab',
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

              {/* Depth color indicator */}
              <MotionRect
                x={0}
                y={0}
                width={4}
                height={height}
                rx={2}
                fill={depthColor}
                animate={{ fill: depthColor }}
                transition={{ duration: ANIMATION.DURATION_FAST / 1000 }}
              />

              {/* Topic marker */}
              {node.data.isTopic && (
                <MotionCircle
                  cx={width - 10}
                  cy={10}
                  r={4}
                  fill={COLORS.PRIMARY}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.1 }}
                />
              )}

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

              {/* Expand/collapse toggle button */}
              {hasChildren && (
                <Group transform={`translate(${width - 16}, ${height / 2})`}>
                  <MotionCircle
                    r={8}
                    fill={COLORS.NODE_BORDER}
                    style={{ cursor: 'pointer' }}
                    onClick={(e) => {
                      e.stopPropagation();
                      updateNode(node.data.id, {
                        isExpanded: !node.data.isExpanded,
                      });
                    }}
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
        )}
      </Drag>
    );
  },
  arePropsEqual
);

MindMapNode.displayName = 'MindMapNode';
