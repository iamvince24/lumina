/**
 * Radial 佈局演算法
 * 使用 Dagre 計算 Node 的位置
 */

import dagre from 'dagre';
import type { Node, Edge } from '@/types/mindmap';
import type { LayoutDirection } from '@/types/view';

/**
 * 計算 Radial 佈局
 *
 * @param nodes - 所有 Nodes
 * @param edges - 所有 Edges
 * @param direction - 佈局方向（'TB': 上到下, 'LR': 左到右）
 * @returns 計算後的 Nodes（包含新的 position）
 */
export function calculateRadialLayout(
  nodes: Node[],
  edges: Edge[],
  direction: LayoutDirection = 'TB'
): Node[] {
  // 建立 Dagre 圖
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));

  // 設定圖的方向和間距
  dagreGraph.setGraph({
    rankdir: direction, // 佈局方向：'TB' (Top to Bottom) 或 'LR' (Left to Right)
    nodesep: 100, // Node 之間的水平間距
    ranksep: 150, // 階層之間的垂直間距
  });

  // 加入所有 Nodes
  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, {
      width: 150, // Node 的預設寬度
      height: 50, // Node 的預設高度
    });
  });

  // 加入所有 Edges
  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  // 執行佈局計算
  dagre.layout(dagreGraph);

  // 更新 Nodes 的位置
  const layoutedNodes = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);

    return {
      ...node,
      position: {
        // Dagre 回傳的是中心點座標，需要轉換為左上角座標
        x: nodeWithPosition.x - 75, // 寬度的一半
        y: nodeWithPosition.y - 25, // 高度的一半
      },
    };
  });

  return layoutedNodes;
}
