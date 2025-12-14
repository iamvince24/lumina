import { hierarchy, tree } from 'd3-hierarchy';
import { MindMapNode, Position, Size } from '../types';

export interface LayoutConfig {
  horizontalSpacing: number;
  verticalSpacing: number;
}

const defaultConfig: LayoutConfig = {
  horizontalSpacing: 80,
  verticalSpacing: 24,
};

interface HierarchyDatum {
  id: string;
  size: Size;
  children: HierarchyDatum[];
  ref: MindMapNode;
}

const buildHierarchy = (
  nodes: Map<string, MindMapNode>,
  nodeId: string | null
): HierarchyDatum | null => {
  if (!nodeId) return null;
  const node = nodes.get(nodeId);
  if (!node) return null;

  const children = node.isCollapsed
    ? []
    : node.children
        .map((childId) => buildHierarchy(nodes, childId))
        .filter((child): child is HierarchyDatum => Boolean(child));

  return {
    id: node.id,
    size: node.size,
    children,
    ref: node,
  };
};

export const calculateTreeLayout = (
  nodes: Map<string, MindMapNode>,
  rootId: string,
  config: Partial<LayoutConfig> = {}
): Map<string, Position> => {
  const finalConfig = { ...defaultConfig, ...config };
  const positions = new Map<string, Position>();
  const rootData = buildHierarchy(nodes, rootId);

  if (!rootData) return positions;

  const hierarchyRoot = hierarchy<HierarchyDatum>(rootData, (d) => d.children);

  const treeLayout = tree<HierarchyDatum>()
    // x 軸用於垂直分佈（top），依節點高度決定間距
    .nodeSize([1, finalConfig.horizontalSpacing])
    .separation((a, b) => {
      const aHeight = a.data.size.height;
      const bHeight = b.data.size.height;
      return (aHeight + bHeight) / 2 + finalConfig.verticalSpacing;
    });

  const positionedRoot = treeLayout(hierarchyRoot);

  const assignPositions = (node: typeof positionedRoot) => {
    const parent = node.parent;
    const parentPos = parent ? positions.get(parent.data.id) : null;
    const horizontal =
      parentPos && parent
        ? parentPos.x + parent.data.size.width + finalConfig.horizontalSpacing
        : 0;

    const vertical = (node.x ?? 0) - node.data.size.height / 2;

    positions.set(node.data.id, { x: horizontal, y: vertical });

    (node.children ?? []).forEach(assignPositions);
  };

  assignPositions(positionedRoot);

  return positions;
};
