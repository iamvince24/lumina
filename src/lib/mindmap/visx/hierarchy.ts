import { hierarchy as d3Hierarchy } from '@visx/hierarchy';
import type { HierarchyNode } from 'd3-hierarchy';
import type { MindMapNodeData, FlatMindMapNode } from '../types';

/**
 * Convert flat node array to tree structure
 *
 * @param flatNodes - Flat node array
 * @returns Tree structure root node
 */
export function flatToTree(
  flatNodes: FlatMindMapNode[]
): MindMapNodeData | null {
  if (flatNodes.length === 0) return null;

  // Find root node
  const rootNode = flatNodes.find((n) => n.parentId === null);
  if (!rootNode) return null;

  // Create parentId -> children mapping
  const childrenMap = new Map<string, FlatMindMapNode[]>();

  flatNodes.forEach((node) => {
    if (node.parentId) {
      const siblings = childrenMap.get(node.parentId) || [];
      siblings.push(node);
      childrenMap.set(node.parentId, siblings);
    }
  });

  // Recursively build tree structure
  function buildNode(flat: FlatMindMapNode): MindMapNodeData {
    const children = childrenMap.get(flat.id) || [];
    return {
      id: flat.id,
      label: flat.label,
      color: flat.color,
      fontSize: flat.fontSize,
      isTopic: flat.isTopic,
      topicId: flat.topicId,
      isExpanded: flat.isExpanded,
      children: children.length > 0 ? children.map(buildNode) : undefined,
      createdAt: flat.createdAt,
      updatedAt: flat.updatedAt,
    };
  }

  return buildNode(rootNode);
}

/**
 * Convert tree structure to flat node array
 *
 * @param root - Tree structure root node
 * @param parentId - Parent node ID
 * @returns Flat node array
 */
export function treeToFlat(
  root: MindMapNodeData,
  parentId: string | null = null
): FlatMindMapNode[] {
  const result: FlatMindMapNode[] = [];

  function traverse(node: MindMapNodeData, pId: string | null): void {
    result.push({
      id: node.id,
      parentId: pId,
      label: node.label,
      position: { x: 0, y: 0 }, // Position calculated by layout
      width: 160,
      height: 40,
      color: node.color,
      fontSize: node.fontSize,
      isTopic: node.isTopic,
      topicId: node.topicId,
      isExpanded: node.isExpanded,
      createdAt: node.createdAt,
      updatedAt: node.updatedAt,
    });

    if (node.children) {
      node.children.forEach((child) => traverse(child, node.id));
    }
  }

  traverse(root, parentId);
  return result;
}

/**
 * Create visx hierarchy structure
 *
 * @param data - Tree structure root node data
 * @returns visx HierarchyNode
 */
export function createHierarchy(data: MindMapNodeData) {
  return d3Hierarchy<MindMapNodeData>(data, (d) => {
    // Only return children if node is expanded
    if (d.isExpanded && d.children) {
      return d.children;
    }
    return undefined;
  });
}

/**
 * Get depth-based color for nodes
 *
 * @param depth - Node depth
 * @returns Color string
 */
export function getDepthColor(depth: number): string {
  const colors = [
    '#3B82F6', // depth 0 - Blue
    '#10B981', // depth 1 - Green
    '#F59E0B', // depth 2 - Amber
    '#EF4444', // depth 3 - Red
    '#8B5CF6', // depth 4 - Purple
    '#EC4899', // depth 5 - Pink
    '#06B6D4', // depth 6 - Cyan
    '#F97316', // depth 7 - Orange
  ];
  return colors[depth % colors.length];
}

/**
 * Filter expanded nodes
 *
 * @param root - hierarchy root node
 * @returns Expanded node array
 */
export function getVisibleNodes<T>(root: HierarchyNode<T>): HierarchyNode<T>[] {
  return root.descendants();
}

/**
 * Filter expanded links
 *
 * @param root - hierarchy root node
 * @returns Expanded link array
 */
export function getVisibleLinks<T>(
  root: HierarchyNode<T>
): { source: HierarchyNode<T>; target: HierarchyNode<T> }[] {
  return root.links();
}
