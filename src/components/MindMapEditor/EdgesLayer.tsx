import { memo, useMemo } from 'react';
import type { MindMapNode, MindMapEdge, BezierType } from '@/lib/mindmap/types';
import {
  calculateEdgePath,
  getEdgeEndpoints,
} from '@/lib/mindmap/calculations';
import { COLORS } from '@/lib/mindmap/constants';

interface EdgesLayerProps {
  nodes: MindMapNode[];
  edges: MindMapEdge[];
  bezierType?: BezierType;
}

export const EdgesLayer = memo<EdgesLayerProps>(
  ({ nodes, edges, bezierType = 'quadratic' }) => {
    // 建立節點查詢表
    const nodeMap = useMemo(
      () => new Map(nodes.map((n) => [n.id, n])),
      [nodes]
    );

    // 計算所有連線路徑
    const edgePaths = useMemo(() => {
      return edges.map((edge, index) => {
        const sourceNode = nodeMap.get(edge.sourceId);
        const targetNode = nodeMap.get(edge.targetId);

        if (!sourceNode || !targetNode) {
          return { id: edge.id, path: '', color: COLORS.EDGE_DEFAULT };
        }

        // 計算連線端點
        const { source, target } = getEdgeEndpoints(sourceNode, targetNode);

        // 計算貝茲曲線路徑
        const path = calculateEdgePath(source, target, bezierType);

        // 決定顏色
        const color =
          edge.color || COLORS.EDGE_COLORS[index % COLORS.EDGE_COLORS.length];

        return { id: edge.id, path, color };
      });
    }, [edges, nodeMap, bezierType]);

    return (
      <g className="edges-layer">
        {edgePaths.map(({ id, path, color }) => (
          <path
            key={id}
            d={path}
            className="edge"
            fill="none"
            stroke={color}
            strokeWidth={2}
            strokeLinecap="round"
          />
        ))}
      </g>
    );
  }
);

EdgesLayer.displayName = 'EdgesLayer';
