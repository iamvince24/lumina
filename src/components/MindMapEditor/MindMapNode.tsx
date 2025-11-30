import { memo, useRef, useState, useEffect, useCallback } from 'react';
import { Group } from '@visx/group';
import { Drag } from '@visx/drag';
import type { HierarchyNode } from 'd3-hierarchy';
import type { MindMapNodeData, ViewMode } from '@/lib/mindmap/types';
import { useMindMapStore } from '@/lib/stores/mindmapStore';
import { NODE_DEFAULTS, COLORS } from '@/lib/mindmap/constants';
import { getDepthColor } from '@/lib/mindmap/visx';

interface MindMapNodeProps {
  node: HierarchyNode<MindMapNodeData>;
  viewMode: ViewMode;
  isSelected: boolean;
  isEditing: boolean;
  zoom: number;
}

export const MindMapNode = memo<MindMapNodeProps>(
  ({ node, viewMode, isSelected, isEditing, zoom }) => {
    const inputRef = useRef<HTMLInputElement>(null);
    const [isHovered, setIsHovered] = useState(false);
    const [inputValue, setInputValue] = useState(node.data.label);

    // Store actions
    const { selectedNodeIds, setSelectedNodes, setEditingNode, updateNode } =
      useMindMapStore();

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
    const borderColor = isSelected
      ? COLORS.NODE_BORDER_SELECTED
      : isHovered
        ? COLORS.NODE_BORDER_HOVER
        : COLORS.NODE_BORDER;
    const borderWidth = isSelected ? 2 : 1;
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

    return (
      <Drag width={width} height={height} x={nodeX} y={nodeY}>
        {({ dragStart, dragEnd, dragMove, isDragging, x, y, dx, dy }) => (
          <Group
            className={`mindmap-node ${isSelected ? 'selected' : ''} ${isDragging ? 'dragging' : ''}`}
            transform={`translate(${(x ?? 0) + (dx ?? 0) - width / 2}, ${(y ?? 0) + (dy ?? 0) - height / 2})`}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onClick={handleClick}
            onDoubleClick={handleDoubleClick}
            onMouseDown={dragStart}
            onMouseMove={dragMove}
            onMouseUp={dragEnd}
            style={{ opacity: isDragging ? 0.7 : 1 }}
          >
            {/* Node background */}
            <rect
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
                transition: 'filter 0.15s ease, stroke 0.15s ease',
              }}
            />

            {/* Depth color indicator */}
            <rect
              x={0}
              y={0}
              width={4}
              height={height}
              rx={2}
              fill={depthColor}
            />

            {/* Topic marker */}
            {node.data.isTopic && (
              <circle cx={width - 10} cy={10} r={4} fill={COLORS.PRIMARY} />
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

            {/* Expand/collapse indicator */}
            {node.children === undefined &&
              node.data.children &&
              node.data.children.length > 0 && (
                <Group transform={`translate(${width - 16}, ${height / 2})`}>
                  <circle
                    r={8}
                    fill={COLORS.NODE_BORDER}
                    style={{ cursor: 'pointer' }}
                    onClick={(e) => {
                      e.stopPropagation();
                      updateNode(node.data.id, { isExpanded: true });
                    }}
                  />
                  <text
                    textAnchor="middle"
                    dominantBaseline="central"
                    fill={COLORS.TEXT_SECONDARY}
                    fontSize={10}
                    style={{ pointerEvents: 'none' }}
                  >
                    +
                  </text>
                </Group>
              )}
          </Group>
        )}
      </Drag>
    );
  }
);

MindMapNode.displayName = 'MindMapNode';
