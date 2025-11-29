import { memo, useRef, useEffect, useCallback } from 'react';
import type { MindMapNode } from '@/lib/mindmap/types';
import { NODE_DEFAULTS, COLORS } from '@/lib/mindmap/constants';

interface NodeGroupProps {
  node: MindMapNode;
  isSelected: boolean;
  isEditing: boolean;
  onClick: (event: React.MouseEvent) => void;
  onDoubleClick: () => void;
  onDragStart: (event: React.MouseEvent) => void;
  onLabelChange: (label: string) => void;
  onEditEnd: () => void;
}

export const NodeGroup = memo<NodeGroupProps>(
  ({
    node,
    isSelected,
    isEditing,
    onClick,
    onDoubleClick,
    onDragStart,
    onLabelChange,
    onEditEnd,
  }) => {
    const inputRef = useRef<HTMLInputElement>(null);

    // 進入編輯模式時聚焦
    useEffect(() => {
      if (isEditing && inputRef.current) {
        inputRef.current.focus();
        inputRef.current.select();
      }
    }, [isEditing]);

    // 處理鍵盤事件
    const handleKeyDown = useCallback(
      (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' || e.key === 'Escape') {
          onEditEnd();
        }
      },
      [onEditEnd]
    );

    // 處理滑鼠按下（可能是點擊或拖曳）
    const handleMouseDown = useCallback(
      (e: React.MouseEvent) => {
        e.stopPropagation();
        onDragStart(e);
      },
      [onDragStart]
    );

    const { width, height } = node;
    const borderRadius = NODE_DEFAULTS.BORDER_RADIUS;

    // 決定樣式
    const fillColor = node.isTopic ? COLORS.NODE_TOPIC : COLORS.NODE_DEFAULT;
    const borderColor = isSelected
      ? COLORS.NODE_BORDER_SELECTED
      : COLORS.NODE_BORDER;
    const borderWidth = isSelected ? 2 : 1;
    const filter = isSelected ? 'url(#node-shadow-hover)' : 'url(#node-shadow)';

    return (
      <g
        className={`node-group ${isSelected ? 'selected' : ''}`}
        transform={`translate(${node.position.x}, ${node.position.y})`}
        onMouseDown={handleMouseDown}
        onClick={onClick}
        onDoubleClick={onDoubleClick}
      >
        {/* 節點背景 */}
        <rect
          className="node-rect"
          width={width}
          height={height}
          rx={borderRadius}
          ry={borderRadius}
          fill={fillColor}
          stroke={borderColor}
          strokeWidth={borderWidth}
          filter={filter}
          style={{ cursor: 'move' }}
        />

        {/* 節點內容 */}
        {isEditing ? (
          // 編輯模式：使用 foreignObject 嵌入 HTML input
          <foreignObject width={width} height={height}>
            <input
              ref={inputRef}
              type="text"
              defaultValue={node.label}
              className="node-input"
              onChange={(e) => onLabelChange(e.target.value)}
              onKeyDown={handleKeyDown}
              onBlur={onEditEnd}
              style={{
                width: '100%',
                height: '100%',
                border: 'none',
                background: 'transparent',
                textAlign: 'center',
                outline: 'none',
                fontSize: '14px',
              }}
            />
          </foreignObject>
        ) : (
          // 顯示模式：使用 SVG text
          <text
            className="node-text"
            x={width / 2}
            y={height / 2}
            textAnchor="middle"
            dominantBaseline="middle"
            fill={COLORS.TEXT_PRIMARY}
            fontSize={14}
            fontFamily="Inter, sans-serif"
            pointerEvents="none"
          >
            {node.label || '未命名'}
          </text>
        )}
      </g>
    );
  }
);

NodeGroup.displayName = 'NodeGroup';
