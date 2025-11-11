/**
 * Layout 計算 Web Worker
 * 用於大型心智圖的佈局計算
 */

import * as d3 from 'd3';
import type { Node, Edge } from '@/types/mindmap';
import type { TreeNode, LayoutDirection } from '@/types/view';

/**
 * Worker 訊息類型
 */
interface LayoutMessage {
  type: 'calculate';
  nodes: Node[];
  edges: Edge[];
  direction: LayoutDirection;
}

/**
 * Worker 回應類型
 */
interface LayoutResponse {
  type: 'result';
  nodes: TreeNode[];
}

/**
 * Worker 錯誤回應類型
 */
interface LayoutErrorResponse {
  type: 'error';
  message: string;
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
 * 建立樹狀結構
 */
function buildTreeStructure(
  nodes: Node[],
  edges: Edge[]
): HierarchyData | null {
  const nodeMap = new Map(nodes.map((n) => [n.id, n]));
  const childrenMap = new Map<string, string[]>();

  edges.forEach((edge) => {
    const children = childrenMap.get(edge.source) || [];
    children.push(edge.target);
    childrenMap.set(edge.source, children);
  });

  const rootNodes = nodes.filter(
    (node) => !edges.some((edge) => edge.target === node.id)
  );

  if (rootNodes.length === 0) {
    return null;
  }

  const rootId = rootNodes[0].id;

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

  return buildHierarchy(rootId);
}

/**
 * 計算佈局（在 Worker 中執行）
 */
function calculateLayout(
  nodes: Node[],
  edges: Edge[],
  direction: LayoutDirection
): TreeNode[] {
  const hierarchyData = buildTreeStructure(nodes, edges);
  if (!hierarchyData) {
    return [];
  }

  const root = d3.hierarchy(hierarchyData);

  const treeLayout = d3
    .tree<HierarchyData>()
    .nodeSize(direction === 'TB' ? [80, 150] : [150, 80]);

  treeLayout(root);

  const treeNodes: TreeNode[] = [];

  root.descendants().forEach((d) => {
    const node = d.data.data as Node;
    const dX = d.x ?? 0;
    const dY = d.y ?? 0;

    let x, y;
    if (direction === 'TB') {
      x = dX;
      y = dY;
    } else {
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

/**
 * 監聽主執行緒訊息
 */
self.onmessage = (event: MessageEvent<LayoutMessage>) => {
  const { type, nodes, edges, direction } = event.data;

  if (type === 'calculate') {
    try {
      const result = calculateLayout(nodes, edges, direction);

      self.postMessage({
        type: 'result',
        nodes: result,
      } as LayoutResponse);
    } catch (error) {
      self.postMessage({
        type: 'error',
        message: error instanceof Error ? error.message : 'Unknown error',
      } as LayoutErrorResponse);
    }
  }
};
