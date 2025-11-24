/**
 * MindMap Edge Component
 * 自訂邊組件 - MindMeister 風格的平滑貝茲曲線
 */

import { memo } from 'react';
import { getBezierPath, type EdgeProps } from 'reactflow';

/**
 * MindMap 邊組件
 * 藍色平滑貝茲曲線，用於連接思維導圖節點
 */
export const MindMapEdge = memo(
  ({
    id,
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    style = {},
    markerEnd,
    selected,
  }: EdgeProps) => {
    // 計算貝茲曲線路徑
    const [edgePath] = getBezierPath({
      sourceX,
      sourceY,
      sourcePosition,
      targetX,
      targetY,
      targetPosition,
    });

    return (
      <>
        {/* 邊路徑 */}
        <path
          id={id}
          className="react-flow__edge-path"
          d={edgePath}
          strokeWidth={selected ? 3 : 2.5}
          stroke={selected ? '#2563eb' : '#4169E1'}
          fill="none"
          style={style}
          markerEnd={markerEnd}
        />

        {/* 選中狀態的背景路徑（增加點擊區域） */}
        {selected && (
          <path
            d={edgePath}
            strokeWidth={8}
            stroke="rgba(37, 99, 235, 0.1)"
            fill="none"
            strokeLinecap="round"
          />
        )}
      </>
    );
  }
);

MindMapEdge.displayName = 'MindMapEdge';
