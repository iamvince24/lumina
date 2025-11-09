/**
 * Logic Chart 視圖組件
 * 使用 SVG 繪製樹狀圖
 */

import { useMemo, useRef } from 'react';
import type { ReactElement } from 'react';
import { useMindMapStore } from '@/stores/mindmapStore';
import { useViewModeStore } from '@/stores/viewModeStore';
import { calculateTreeLayout } from '@/utils/layoutAlgorithms/d3Tree';

/**
 * Logic Chart 視圖組件
 */
export function LogicChartView() {
  // 從 Store 取得資料
  const { nodes, edges } = useMindMapStore();
  const { layoutDirection, setLayoutDirection } = useViewModeStore();

  // SVG Container ref
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  /**
   * 計算 Tree Layout（使用 useMemo 避免不必要的重新計算）
   */
  const treeNodes = useMemo(
    () =>
      calculateTreeLayout(nodes, edges, {
        direction: layoutDirection,
      }),
    [nodes, edges, layoutDirection]
  );

  /**
   * 計算 SVG 的 viewBox（讓圖形置中）
   */
  const viewBox = useMemo(() => {
    if (treeNodes.length === 0) return '0 0 800 600';

    const xs = treeNodes.map((n) => n.x);
    const ys = treeNodes.map((n) => n.y);

    const minX = Math.min(...xs) - 100;
    const maxX = Math.max(...xs) + 100;
    const minY = Math.min(...ys) - 100;
    const maxY = Math.max(...ys) + 100;

    const width = maxX - minX;
    const height = maxY - minY;

    return `${minX} ${minY} ${width} ${height}`;
  }, [treeNodes]);

  /**
   * 繪製連線（Edge）
   */
  const renderEdges = () => {
    const paths: ReactElement[] = [];

    treeNodes.forEach((node) => {
      if (node.children) {
        node.children.forEach((child) => {
          // 找到子節點的完整資料
          const childNode = treeNodes.find((n) => n.id === child.id);
          if (!childNode) return;

          // 計算連線路徑
          const path =
            layoutDirection === 'TB'
              ? `M ${node.x} ${node.y}
               C ${node.x} ${(node.y + childNode.y) / 2},
                 ${childNode.x} ${(node.y + childNode.y) / 2},
                 ${childNode.x} ${childNode.y}`
              : `M ${node.x} ${node.y}
               C ${(node.x + childNode.x) / 2} ${node.y},
                 ${(node.x + childNode.x) / 2} ${childNode.y},
                 ${childNode.x} ${childNode.y}`;

          paths.push(
            <path
              key={`edge-${node.id}-${child.id}`}
              d={path}
              fill="none"
              stroke="#cbd5e1"
              strokeWidth={2}
            />
          );
        });
      }
    });

    return paths;
  };

  /**
   * 繪製節點（Node）
   */
  const renderNodes = () => {
    return treeNodes.map((node) => (
      <g key={node.id} transform={`translate(${node.x}, ${node.y})`}>
        {/* 節點背景 */}
        <rect
          x={-60}
          y={-20}
          width={120}
          height={40}
          rx={8}
          fill={node.data.isTopic ? '#dbeafe' : 'white'}
          stroke={node.data.isTopic ? '#3b82f6' : '#cbd5e1'}
          strokeWidth={2}
        />

        {/* 節點文字 */}
        <text
          x={0}
          y={5}
          textAnchor="middle"
          fontSize={14}
          fill={node.data.isTopic ? '#1e40af' : '#374151'}
          fontWeight={node.data.isTopic ? 600 : 400}
        >
          {node.data.label}
        </text>
      </g>
    ));
  };

  /**
   * 切換佈局方向
   */
  const handleToggleDirection = () => {
    setLayoutDirection(layoutDirection === 'TB' ? 'LR' : 'TB');
  };

  return (
    <div ref={containerRef} className="w-full h-full bg-white relative">
      {/* Header */}
      <div className="absolute top-4 right-4 z-10 flex gap-2">
        <button
          onClick={handleToggleDirection}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          {layoutDirection === 'TB' ? '水平佈局' : '垂直佈局'}
        </button>
      </div>

      {/* SVG Canvas */}
      <svg ref={svgRef} className="w-full h-full" viewBox={viewBox}>
        {/* 繪製連線 */}
        <g>{renderEdges()}</g>

        {/* 繪製節點 */}
        <g>{renderNodes()}</g>
      </svg>
    </div>
  );
}
