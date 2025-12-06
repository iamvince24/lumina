'use client';

import React, { useMemo } from 'react';
import { MindMapNode, Connection, Viewport } from '../types';
import {
  calculateConnectionPath,
  calculateArrowPoints,
} from '../utils/connectionCalculator';
import { calculateNodeCenter } from '../utils/geometry';

interface MindMapCanvasProps {
  nodes: Map<string, MindMapNode>;
  connections: Connection[];
  viewport: Viewport;
  containerSize: { width: number; height: number };
}

export const MindMapCanvas: React.FC<MindMapCanvasProps> = ({
  nodes,
  connections,
  viewport,
  containerSize,
}) => {
  const svgContent = useMemo(() => {
    return connections.map((connection) => {
      const sourceNode = nodes.get(connection.sourceId);
      const targetNode = nodes.get(connection.targetId);

      if (!sourceNode || !targetNode) return null;

      // 如果父節點折疊了，不顯示連線
      if (sourceNode.isCollapsed) return null;

      const path = calculateConnectionPath(sourceNode, targetNode, 'curved');

      // 計算箭頭位置
      const targetCenter = calculateNodeCenter(
        targetNode.position,
        targetNode.size
      );
      const sourceCenter = calculateNodeCenter(
        sourceNode.position,
        sourceNode.size
      );
      const arrowPath = calculateArrowPoints(
        sourceCenter,
        targetCenter,
        connection.style.arrowSize
      );

      return (
        <g key={connection.id}>
          {/* 連線路徑 */}
          <path
            d={path}
            stroke={connection.style.strokeColor}
            strokeWidth={connection.style.strokeWidth}
            fill="none"
            strokeDasharray={
              connection.style.strokeStyle === 'dashed'
                ? '5,5'
                : connection.style.strokeStyle === 'dotted'
                  ? '2,2'
                  : '0'
            }
          />
          {/* 箭頭 */}
          <path
            d={arrowPath}
            stroke={connection.style.strokeColor}
            strokeWidth={connection.style.strokeWidth}
            fill="none"
          />
        </g>
      );
    });
  }, [nodes, connections]);

  return (
    <svg
      className="absolute top-0 left-0 pointer-events-none"
      style={{
        width: `${containerSize.width}px`,
        height: `${containerSize.height}px`,
        transform: `translate(${viewport.x}px, ${viewport.y}px) scale(${viewport.zoom})`,
        transformOrigin: '0 0',
      }}
    >
      <g>{svgContent}</g>
    </svg>
  );
};
