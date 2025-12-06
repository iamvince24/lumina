import type { MindMapNode, LayoutConfig, Point } from '../types';
import { LAYOUT_DEFAULTS, NODE_DEFAULTS } from '../constants';
import { getRootNode, buildTree, type TreeNode } from './tree';

/**
 * 水平樹狀佈局（向右展開）
 *
 * @description
 * 這是主要的佈局演算法，未來可以替換為 Dagre 或 d3-hierarchy。
 */
export function calculateHorizontalTreeLayout(
  nodes: MindMapNode[],
  config: Partial<LayoutConfig> = {}
): MindMapNode[] {
  const {
    horizontalSpacing = LAYOUT_DEFAULTS.HORIZONTAL_SPACING,
    verticalSpacing = LAYOUT_DEFAULTS.VERTICAL_SPACING,
    nodeWidth = NODE_DEFAULTS.WIDTH,
    nodeHeight = NODE_DEFAULTS.HEIGHT,
  } = config;

  const root = getRootNode(nodes);
  if (!root) return nodes;

  const nodeMap = new Map(nodes.map((n) => [n.id, { ...n }]));

  // 計算每個節點的子樹高度
  const subtreeHeights = new Map<string, number>();

  function calculateSubtreeHeight(nodeId: string): number {
    if (subtreeHeights.has(nodeId)) {
      return subtreeHeights.get(nodeId)!;
    }

    // Get children from nodeMap to ensure consistency with setPositions
    const children = Array.from(nodeMap.values()).filter(
      (n) => n.parentId === nodeId
    );

    if (children.length === 0) {
      subtreeHeights.set(nodeId, nodeHeight);
      return nodeHeight;
    }

    const childrenHeight = children.reduce(
      (sum, child) => sum + calculateSubtreeHeight(child.id),
      0
    );
    const totalHeight =
      childrenHeight + (children.length - 1) * verticalSpacing;

    subtreeHeights.set(nodeId, totalHeight);
    return totalHeight;
  }

  // 遞迴設定位置
  function setPositions(nodeId: string, x: number, y: number): void {
    const node = nodeMap.get(nodeId);
    if (!node) return;

    node.position = { x, y };

    // Get children from nodeMap to ensure we have the latest width values
    const children = Array.from(nodeMap.values()).filter(
      (n) => n.parentId === nodeId
    );
    if (children.length === 0) return;

    const subtreeHeight = subtreeHeights.get(nodeId) || 0;
    let currentY = y - subtreeHeight / 2 + nodeHeight / 2;

    // Use the current node's actual width for child positioning
    const currentNodeWidth = node.width || nodeWidth;

    for (const child of children) {
      const childSubtreeHeight = subtreeHeights.get(child.id) || nodeHeight;
      const childY = currentY + childSubtreeHeight / 2 - nodeHeight / 2;

      // Position children based on parent's actual width
      setPositions(child.id, x + currentNodeWidth + horizontalSpacing, childY);

      currentY += childSubtreeHeight + verticalSpacing;
    }
  }

  // 從根節點開始計算
  calculateSubtreeHeight(root.id);
  setPositions(root.id, 0, 0);

  return Array.from(nodeMap.values());
}

/**
 * 放射狀佈局（以根節點為中心）
 */
export function calculateRadialLayout(
  nodes: MindMapNode[],
  config: Partial<LayoutConfig> = {}
): MindMapNode[] {
  const root = getRootNode(nodes);
  if (!root) return nodes;

  const tree = buildTree(nodes);
  if (!tree) return nodes;

  const { nodeWidth = NODE_DEFAULTS.WIDTH, nodeHeight = NODE_DEFAULTS.HEIGHT } =
    config;

  const radiusBase = LAYOUT_DEFAULTS.RADIAL_RADIUS_BASE;
  const radiusIncrement = LAYOUT_DEFAULTS.RADIAL_RADIUS_INCREMENT;

  const positionMap = new Map<string, Point>();

  // 根節點置中
  positionMap.set(root.id, { x: 0, y: 0 });

  // 遞迴計算每層的角度分配
  function calculatePositions(
    node: TreeNode,
    startAngle: number,
    endAngle: number,
    depth: number
  ): void {
    if (node.children.length === 0) return;

    const radius = radiusBase + depth * radiusIncrement;
    const angleRange = endAngle - startAngle;
    const angleStep = angleRange / node.children.length;

    node.children.forEach((child, index) => {
      const angle = startAngle + angleStep * (index + 0.5);
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;

      positionMap.set(child.id, { x, y });

      // 遞迴處理子節點
      const childStartAngle = startAngle + angleStep * index;
      const childEndAngle = childStartAngle + angleStep;
      calculatePositions(child, childStartAngle, childEndAngle, depth + 1);
    });
  }

  // 從根節點開始，角度範圍 0 到 2π
  calculatePositions(tree, 0, Math.PI * 2, 1);

  // 套用位置並置中
  return nodes.map((node) => ({
    ...node,
    position: positionMap.get(node.id) || node.position,
  }));
}

/**
 * 統一的佈局計算函式
 *
 * @description
 * 這是主要的 API，未來遷移到 D3 或 Dagre 時只需修改這個函式的內部實作。
 */
export function calculateLayout(
  nodes: MindMapNode[],
  viewMode: 'radial' | 'horizontal' = 'horizontal',
  config: Partial<LayoutConfig> = {}
): MindMapNode[] {
  switch (viewMode) {
    case 'radial':
      return calculateRadialLayout(nodes, config);
    case 'horizontal':
    default:
      return calculateHorizontalTreeLayout(nodes, config);
  }
}

/**
 * 將佈局後的節點置中到指定的畫布中心
 */
export function centerLayout(
  nodes: MindMapNode[],
  canvasWidth: number,
  canvasHeight: number
): MindMapNode[] {
  if (nodes.length === 0) return nodes;

  // 計算邊界
  const minX = Math.min(...nodes.map((n) => n.position.x));
  const maxX = Math.max(...nodes.map((n) => n.position.x + n.width));
  const minY = Math.min(...nodes.map((n) => n.position.y));
  const maxY = Math.max(...nodes.map((n) => n.position.y + n.height));

  // 計算偏移量
  const contentWidth = maxX - minX;
  const contentHeight = maxY - minY;
  const offsetX = (canvasWidth - contentWidth) / 2 - minX;
  const offsetY = (canvasHeight - contentHeight) / 2 - minY;

  // 套用偏移
  return nodes.map((node) => ({
    ...node,
    position: {
      x: node.position.x + offsetX,
      y: node.position.y + offsetY,
    },
  }));
}
