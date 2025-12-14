import type { MindMapNode, StoredNode, Connection } from '../types';

/**
 * Serialize nodes Map to array format for storage
 */
export function serializeNodes(nodes: Map<string, MindMapNode>): StoredNode[] {
  return Array.from(nodes.values()).map((node) => ({
    ...node,
    metadata: node.metadata
      ? {
          createdAt: node.metadata.createdAt.toISOString(),
          updatedAt: node.metadata.updatedAt.toISOString(),
        }
      : undefined,
  }));
}

/**
 * Deserialize nodes array to Map format
 */
export function deserializeNodes(
  stored: StoredNode[]
): Map<string, MindMapNode> {
  const map = new Map<string, MindMapNode>();

  for (const node of stored) {
    map.set(node.id, {
      ...node,
      metadata: node.metadata
        ? {
            createdAt: new Date(node.metadata.createdAt),
            updatedAt: new Date(node.metadata.updatedAt),
          }
        : undefined,
    });
  }

  return map;
}

/**
 * Find root node ID from nodes
 */
export function findRootNodeId(nodes: Map<string, MindMapNode>): string | null {
  for (const [id, node] of nodes) {
    if (node.parentId === null) {
      return id;
    }
  }
  return null;
}

/**
 * Rebuild connections from nodes
 */
export function rebuildConnections(
  nodes: Map<string, MindMapNode>
): Connection[] {
  const connections: Connection[] = [];

  for (const [id, node] of nodes) {
    if (node.parentId) {
      connections.push({
        id: `conn_${node.parentId}_${id}`,
        sourceId: node.parentId,
        targetId: id,
        style: {
          strokeColor: '#94a3b8',
          strokeWidth: 2,
          strokeStyle: 'solid',
          arrowSize: 8,
        },
      });
    }
  }

  return connections;
}
