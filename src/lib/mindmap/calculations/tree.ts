import type { MindMapNode } from '../types';

/**
 * 建立節點的父子對照表
 */
export function buildNodeMap(nodes: MindMapNode[]): Map<string, MindMapNode> {
  return new Map(nodes.map((node) => [node.id, node]));
}

/**
 * 取得節點的所有子節點
 */
export function getChildNodes(
  nodes: MindMapNode[],
  parentId: string
): MindMapNode[] {
  return nodes.filter((node) => node.parentId === parentId);
}

/**
 * 取得節點的所有後代節點（遞迴）
 */
export function getDescendantNodes(
  nodes: MindMapNode[],
  parentId: string
): MindMapNode[] {
  const children = getChildNodes(nodes, parentId);
  let descendants = [...children];

  for (const child of children) {
    descendants = descendants.concat(getDescendantNodes(nodes, child.id));
  }

  return descendants;
}

/**
 * 取得節點的所有祖先節點
 */
export function getAncestorNodes(
  nodes: MindMapNode[],
  nodeId: string
): MindMapNode[] {
  const nodeMap = buildNodeMap(nodes);
  const ancestors: MindMapNode[] = [];

  let currentNode = nodeMap.get(nodeId);
  while (currentNode?.parentId) {
    const parent = nodeMap.get(currentNode.parentId);
    if (parent) {
      ancestors.push(parent);
      currentNode = parent;
    } else {
      break;
    }
  }

  return ancestors;
}

/**
 * 取得根節點
 */
export function getRootNode(nodes: MindMapNode[]): MindMapNode | undefined {
  return nodes.find((node) => node.parentId === null);
}

/**
 * 取得節點的深度（從根節點開始計算）
 */
export function getNodeDepth(nodes: MindMapNode[], nodeId: string): number {
  return getAncestorNodes(nodes, nodeId).length;
}

/**
 * 取得指定深度的所有節點
 */
export function getNodesAtDepth(
  nodes: MindMapNode[],
  depth: number
): MindMapNode[] {
  return nodes.filter((node) => getNodeDepth(nodes, node.id) === depth);
}

/**
 * 計算樹的最大深度
 */
export function getTreeMaxDepth(nodes: MindMapNode[]): number {
  if (nodes.length === 0) return 0;

  return Math.max(...nodes.map((node) => getNodeDepth(nodes, node.id))) + 1;
}

/**
 * 將節點轉換為樹狀結構
 */
export interface TreeNode extends MindMapNode {
  children: TreeNode[];
}

export function buildTree(nodes: MindMapNode[]): TreeNode | null {
  const root = getRootNode(nodes);
  if (!root) return null;

  const buildSubtree = (node: MindMapNode): TreeNode => {
    const children = getChildNodes(nodes, node.id);
    return {
      ...node,
      children: children.map(buildSubtree),
    };
  };

  return buildSubtree(root);
}
