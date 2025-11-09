/**
 * D3 Tree Layout 演算法
 * 計算樹狀圖的節點位置
 */

import * as d3 from 'd3';
import type { Node, Edge } from '@/types/mindmap';
import type { TreeNode, LayoutDirection } from '@/types/view';

/**
 * Tree Layout 配置
 */
interface TreeLayoutConfig {
  /** 佈局方向 */
  direction: LayoutDirection;

  /** 節點之間的間距 */
  nodeSpacing?: number;

  /** 階層之間的間距 */
  levelSpacing?: number;
}

/**
 * 計算 Tree Layout
 *
 * @param nodes - 所有 Nodes
 * @param edges - 所有 Edges
 * @param config - 佈局配置
 * @returns 計算後的 TreeNodes
 */
export function calculateTreeLayout(
  nodes: Node[],
  edges: Edge[],
  config: TreeLayoutConfig
): TreeNode[] {
  const { direction = 'TB', nodeSpacing = 80, levelSpacing = 150 } = config;

  // 步驟 1: 建立 Node Map
  const nodeMap = new Map(nodes.map((n) => [n.id, n]));

  // 步驟 2: 建立父子關係
  const childrenMap = new Map<string, string[]>();
  edges.forEach((edge) => {
    const children = childrenMap.get(edge.source) || [];
    children.push(edge.target);
    childrenMap.set(edge.source, children);
  });

  // 步驟 3: 找出根節點（沒有被任何 Edge 指向的節點）
  const rootNodes = nodes.filter(
    (node) => !edges.some((edge) => edge.target === node.id)
  );

  // 如果沒有根節點或有多個根節點，使用第一個
  const rootId = rootNodes[0]?.id;
  if (!rootId) {
    return [];
  }

  /**
   * D3 Hierarchy 資料結構
   */
  interface HierarchyData {
    id: string;
    data: Node;
    children?: HierarchyData[];
  }

  /**
   * 遞迴建立 D3 Hierarchy
   */
  function buildHierarchy(nodeId: string): HierarchyData | null {
    const node = nodeMap.get(nodeId);
    if (!node) return null;

    const children = childrenMap.get(nodeId) || [];

    return {
      id: nodeId,
      data: node,
      children: children.map(buildHierarchy).filter(Boolean) as HierarchyData[],
    };
  }

  // 步驟 4: 建立 D3 Hierarchy
  const hierarchyData = buildHierarchy(rootId);
  if (!hierarchyData) {
    return [];
  }

  const root = d3.hierarchy(hierarchyData);

  // 步驟 5: 計算 Tree Layout
  const treeLayout = d3
    .tree<HierarchyData>()
    .nodeSize([nodeSpacing, levelSpacing]);

  treeLayout(root);

  // 步驟 6: 轉換為 TreeNode 格式
  const treeNodes: TreeNode[] = [];

  root.descendants().forEach((d) => {
    const node = d.data.data as Node;

    // 根據方向調整座標
    // d.x 和 d.y 在 tree layout 後應該都有值，但為了類型安全加上預設值
    const dX = d.x ?? 0;
    const dY = d.y ?? 0;

    let x, y;
    if (direction === 'TB') {
      // Top to Bottom
      x = dX;
      y = dY;
    } else {
      // Left to Right
      x = dY;
      y = dX;
    }

    treeNodes.push({
      ...node,
      children: d.children?.map((c) => c.data.data) as TreeNode[],
      depth: d.depth,
      x,
      y,
    });
  });

  return treeNodes;
}
