import type { HierarchyNode, HierarchyPointNode } from 'd3-hierarchy';
import type {
  MindMapNodeData,
  ViewMode,
  LayoutConfig,
  Point,
  HierarchyMindMapNode,
} from '../types';
import { NODE_DEFAULTS, LAYOUT_DEFAULTS } from '../constants';

/**
 * Calculate Tree layout dimensions
 *
 * @param viewMode - View mode
 * @param containerWidth - Container width
 * @param containerHeight - Container height
 * @returns [width, height] for Tree size prop
 */
export function getTreeSize(
  viewMode: ViewMode,
  containerWidth: number,
  containerHeight: number
): [number, number] {
  switch (viewMode) {
    case 'horizontal':
      // Horizontal layout: height is expansion direction, width is node arrangement direction
      return [containerHeight, containerWidth];

    case 'radial':
      // Radial layout: use smaller value as radius
      const radius = Math.min(containerWidth, containerHeight) / 2 - 100;
      return [2 * Math.PI, radius];

    case 'outliner':
      // Outline view: vertical expansion
      return [containerWidth, containerHeight];

    default:
      return [containerHeight, containerWidth];
  }
}

/**
 * Calculate node separation
 *
 * @param config - Layout configuration
 * @returns separation function
 */
export function getNodeSeparation(config: LayoutConfig) {
  return (
    a: HierarchyNode<MindMapNodeData>,
    b: HierarchyNode<MindMapNodeData>
  ): number => {
    // Spacing between child nodes of same parent
    if (a.parent === b.parent) {
      return 1;
    }
    // Spacing between nodes of different parents
    return 1.5;
  };
}

/**
 * Transform visx Tree coordinates to canvas coordinates
 *
 * visx Tree coordinate system:
 * - x: vertical direction (depth level)
 * - y: horizontal direction (same level node arrangement)
 *
 * We need to convert to:
 * - x: horizontal direction (depth level, left to right)
 * - y: vertical direction (same level node arrangement, top to bottom)
 */
export function transformTreeCoordinates(
  node: HierarchyNode<MindMapNodeData>,
  viewMode: ViewMode,
  centerX: number,
  centerY: number
): Point {
  switch (viewMode) {
    case 'horizontal':
      // Horizontal tree: swap x/y
      return {
        x: (node.y ?? 0) + centerX,
        y: (node.x ?? 0) + centerY,
      };

    case 'radial':
      // Radial: polar to cartesian coordinates
      const angle = node.x ?? 0;
      const radius = node.y ?? 0;
      return {
        x: radius * Math.cos(angle - Math.PI / 2) + centerX,
        y: radius * Math.sin(angle - Math.PI / 2) + centerY,
      };

    case 'outliner':
      // Outline view: direct use
      return {
        x: (node.x ?? 0) + centerX,
        y: (node.y ?? 0) + centerY,
      };

    default:
      return {
        x: (node.y ?? 0) + centerX,
        y: (node.x ?? 0) + centerY,
      };
  }
}

/**
 * Calculate content bounds
 */
export function calculateContentBounds(
  nodes: Array<{ x: number; y: number; width?: number; height?: number }>
): { x: number; y: number; width: number; height: number } {
  if (nodes.length === 0) {
    return { x: 0, y: 0, width: 0, height: 0 };
  }

  const nodeWidth = NODE_DEFAULTS.WIDTH;
  const nodeHeight = NODE_DEFAULTS.HEIGHT;

  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  nodes.forEach((node) => {
    const w = node.width ?? nodeWidth;
    const h = node.height ?? nodeHeight;

    minX = Math.min(minX, node.x);
    minY = Math.min(minY, node.y);
    maxX = Math.max(maxX, node.x + w);
    maxY = Math.max(maxY, node.y + h);
  });

  return {
    x: minX,
    y: minY,
    width: maxX - minX,
    height: maxY - minY,
  };
}
