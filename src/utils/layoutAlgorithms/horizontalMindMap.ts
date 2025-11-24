/**
 * Horizontal Mind Map Layout Algorithm
 * MindMeister 風格的水平思維導圖佈局
 */

import type { Node, Edge } from '@/types/mindmap';

interface LayoutConfig {
  // 中心節點的起始位置
  centerX: number;
  centerY: number;
  // 水平間距（層級之間）
  horizontalSpacing: number;
  // 垂直間距（同層節點之間）
  verticalSpacing: number;
  // 節點尺寸（用於計算）
  nodeWidth: number;
  nodeHeight: number;
}

const DEFAULT_CONFIG: LayoutConfig = {
  centerX: 100,
  centerY: 300,
  horizontalSpacing: 350,
  verticalSpacing: 150,
  nodeWidth: 150,
  nodeHeight: 50,
};

/**
 * 建立節點的父子關係映射
 */
function buildHierarchy(nodes: Node[], edges: Edge[]) {
  const nodeMap = new Map<string, Node>();
  const childrenMap = new Map<string, string[]>();

  // 建立節點映射
  nodes.forEach((node) => {
    nodeMap.set(node.id, node);
    childrenMap.set(node.id, []);
  });

  // 建立父子關係（按照 edges 的順序，保持創建順序）
  edges.forEach((edge) => {
    const children = childrenMap.get(edge.source);
    if (children && !children.includes(edge.target)) {
      children.push(edge.target);
    }
  });

  // 對每個節點的子節點進行排序（按照節點在 nodes 陣列中的順序）
  childrenMap.forEach((children) => {
    children.sort((a, b) => {
      const indexA = nodes.findIndex((n) => n.id === a);
      const indexB = nodes.findIndex((n) => n.id === b);
      return indexA - indexB;
    });
  });

  return { nodeMap, childrenMap };
}

/**
 * 找到根節點（沒有父節點的節點）
 */
function findRootNodes(nodes: Node[], edges: Edge[]): string[] {
  const targetIds = new Set(edges.map((e) => e.target));
  return nodes.filter((node) => !targetIds.has(node.id)).map((node) => node.id);
}

/**
 * 遞迴計算子樹的高度
 */
function calculateSubtreeHeight(
  nodeId: string,
  childrenMap: Map<string, string[]>,
  config: LayoutConfig
): number {
  const children = childrenMap.get(nodeId) || [];

  if (children.length === 0) {
    return config.nodeHeight;
  }

  // 計算所有子節點的總高度
  const childrenHeights = children.map((childId) =>
    calculateSubtreeHeight(childId, childrenMap, config)
  );

  const totalChildrenHeight = childrenHeights.reduce((sum, h) => sum + h, 0);
  const spacingHeight = (children.length - 1) * config.verticalSpacing;

  return totalChildrenHeight + spacingHeight;
}

/**
 * 遞迴佈局節點
 */
function layoutNodes(
  nodeId: string,
  x: number,
  y: number,
  level: number,
  nodeMap: Map<string, Node>,
  childrenMap: Map<string, string[]>,
  config: LayoutConfig,
  positions: Map<string, { x: number; y: number }>
) {
  const node = nodeMap.get(nodeId);
  if (!node) return;

  // 設置當前節點位置
  positions.set(nodeId, { x, y });

  const children = childrenMap.get(nodeId) || [];
  if (children.length === 0) return;

  // 計算子節點的總高度
  const subtreeHeight = calculateSubtreeHeight(nodeId, childrenMap, config);

  // 子節點的起始 Y 位置（置中對齊）
  let currentY = y - subtreeHeight / 2 + config.nodeHeight / 2;

  // 下一層的 X 位置
  const nextX = x + config.horizontalSpacing;

  // 遞迴佈局每個子節點
  children.forEach((childId) => {
    const childHeight = calculateSubtreeHeight(childId, childrenMap, config);
    const childCenterY = currentY + childHeight / 2;

    layoutNodes(
      childId,
      nextX,
      childCenterY,
      level + 1,
      nodeMap,
      childrenMap,
      config,
      positions
    );

    currentY += childHeight + config.verticalSpacing;
  });
}

/**
 * 計算水平思維導圖佈局
 * @param nodes 所有節點
 * @param edges 所有邊
 * @param config 佈局配置（可選）
 * @returns 帶有更新位置的節點陣列
 */
export function calculateHorizontalMindMapLayout(
  nodes: Node[],
  edges: Edge[],
  config: Partial<LayoutConfig> = {}
): Node[] {
  if (nodes.length === 0) return [];

  const layoutConfig = { ...DEFAULT_CONFIG, ...config };
  const { nodeMap, childrenMap } = buildHierarchy(nodes, edges);

  // 找到根節點
  const rootIds = findRootNodes(nodes, edges);

  if (rootIds.length === 0) {
    // 如果沒有找到根節點（可能有循環），使用第一個節點
    rootIds.push(nodes[0].id);
  }

  const positions = new Map<string, { x: number; y: number }>();

  // 如果有多個根節點，垂直排列
  if (rootIds.length === 1) {
    // 單個根節點
    layoutNodes(
      rootIds[0],
      layoutConfig.centerX,
      layoutConfig.centerY,
      0,
      nodeMap,
      childrenMap,
      layoutConfig,
      positions
    );
  } else {
    // 多個根節點，垂直分佈
    const totalRootHeight =
      rootIds.length * layoutConfig.nodeHeight +
      (rootIds.length - 1) * layoutConfig.verticalSpacing;
    let currentY =
      layoutConfig.centerY - totalRootHeight / 2 + layoutConfig.nodeHeight / 2;

    rootIds.forEach((rootId) => {
      layoutNodes(
        rootId,
        layoutConfig.centerX,
        currentY,
        0,
        nodeMap,
        childrenMap,
        layoutConfig,
        positions
      );
      currentY += layoutConfig.nodeHeight + layoutConfig.verticalSpacing;
    });
  }

  // 應用計算出的位置到節點
  return nodes.map((node) => {
    const position = positions.get(node.id);
    if (position) {
      return {
        ...node,
        position: {
          x: position.x,
          y: position.y,
        },
      };
    }
    return node;
  });
}
