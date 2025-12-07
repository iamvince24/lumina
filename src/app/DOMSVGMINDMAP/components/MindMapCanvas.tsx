'use client';

import React, { useMemo } from 'react';
import { MindMapNode, Connection, Viewport } from '../types';
import {
  calculateCollapsePoint,
  calculateParentToCollapsePointPath,
  calculateCollapsePointToChildPath,
} from '../utils/connectionCalculator';

interface MindMapCanvasProps {
  nodes: Map<string, MindMapNode>;
  connections: Connection[];
  viewport: Viewport;
  containerSize: { width: number; height: number };
  onToggleCollapse?: (nodeId: string) => void;
}

export const MindMapCanvas: React.FC<MindMapCanvasProps> = ({
  nodes,
  connections,
  viewport,
  containerSize,
  onToggleCollapse,
}) => {
  // 檢查節點是否可見（所有祖先都沒有被收合）
  const isNodeVisible = useMemo(() => {
    const visibilityCache = new Map<string, boolean>();

    const checkVisibility = (nodeId: string): boolean => {
      if (visibilityCache.has(nodeId)) {
        return visibilityCache.get(nodeId)!;
      }

      const node = nodes.get(nodeId);
      if (!node) {
        visibilityCache.set(nodeId, false);
        return false;
      }

      // 如果沒有父節點，則可見
      if (!node.parentId) {
        visibilityCache.set(nodeId, true);
        return true;
      }

      const parent = nodes.get(node.parentId);
      if (!parent) {
        visibilityCache.set(nodeId, false);
        return false;
      }

      // 如果父節點被收合，則不可見
      if (parent.isCollapsed) {
        visibilityCache.set(nodeId, false);
        return false;
      }

      // 遞歸檢查父節點的可見性
      const isVisible = checkVisibility(node.parentId);
      visibilityCache.set(nodeId, isVisible);
      return isVisible;
    };

    return checkVisibility;
  }, [nodes]);

  // 將連接按父節點分組（只包含可見節點的連接）
  const connectionsByParent = useMemo(() => {
    const grouped = new Map<string, Connection[]>();

    connections.forEach((connection) => {
      // 只有當 source 節點可見時才添加連接
      if (!isNodeVisible(connection.sourceId)) return;

      const existing = grouped.get(connection.sourceId) || [];
      existing.push(connection);
      grouped.set(connection.sourceId, existing);
    });

    return grouped;
  }, [connections, isNodeVisible]);

  const svgContent = useMemo(() => {
    const elements: React.ReactNode[] = [];

    connectionsByParent.forEach((childConnections, parentId) => {
      const parentNode = nodes.get(parentId);
      if (!parentNode) return;

      // 如果沒有子節點，不渲染任何東西
      if (childConnections.length === 0) return;

      const collapsePoint = calculateCollapsePoint(parentNode);
      const strokeColor = childConnections[0]?.style.strokeColor || '#94a3b8';
      const strokeWidth = childConnections[0]?.style.strokeWidth || 2;

      // 從父節點到收合點的線
      const parentToCollapsePath =
        calculateParentToCollapsePointPath(parentNode);

      elements.push(
        <g key={`parent-group-${parentId}`}>
          {/* 從父節點右邊緣到收合點的直線 */}
          <path
            d={parentToCollapsePath}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            fill="none"
          />

          {/* 只有在未收合時才顯示子節點連線 */}
          {!parentNode.isCollapsed &&
            childConnections.map((connection) => {
              const targetNode = nodes.get(connection.targetId);
              if (!targetNode) return null;

              const pathToChild = calculateCollapsePointToChildPath(
                collapsePoint,
                targetNode
              );

              return (
                <path
                  key={connection.id}
                  d={pathToChild}
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
              );
            })}

          {/* 收合/展開圓圈 */}
          <circle
            cx={collapsePoint.x}
            cy={collapsePoint.y}
            r={8}
            fill="white"
            stroke={strokeColor}
            strokeWidth={1.5}
            style={{ cursor: 'pointer', pointerEvents: 'auto' }}
            onClick={(e) => {
              e.stopPropagation();
              onToggleCollapse?.(parentId);
            }}
          />
          {/* +/- 符號 */}
          <text
            x={collapsePoint.x}
            y={collapsePoint.y}
            textAnchor="middle"
            dominantBaseline="central"
            fontSize="12"
            fontWeight="bold"
            fill={strokeColor}
            style={{ cursor: 'pointer', pointerEvents: 'auto' }}
            onClick={(e) => {
              e.stopPropagation();
              onToggleCollapse?.(parentId);
            }}
          >
            {parentNode.isCollapsed ? '+' : '−'}
          </text>
        </g>
      );
    });

    return elements;
  }, [nodes, connectionsByParent, onToggleCollapse]);

  return (
    <svg
      className="absolute top-0 left-0 pointer-events-none"
      style={{
        width: `${containerSize.width}px`,
        height: `${containerSize.height}px`,
        transform: `translate(${viewport.x}px, ${viewport.y}px) scale(${viewport.zoom})`,
        transformOrigin: '0 0',
        overflow: 'visible', // 確保超出容器範圍的路徑不會被裁切
      }}
    >
      <g>{svgContent}</g>
    </svg>
  );
};
