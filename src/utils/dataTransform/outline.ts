/**
 * Outliner 視圖的資料轉換工具
 * 將 Node/Edge 結構轉換為階層式大綱格式
 */

import type { Node, Edge } from '@/types/mindmap';
import type { OutlineItem } from '@/types/view';

/**
 * 將 Nodes 和 Edges 轉換為 Outline 結構
 *
 * @param nodes - 所有 Nodes
 * @param edges - 所有 Edges
 * @param rootId - 根節點 ID（可選）
 * @returns Outline 項目陣列
 */
export function nodesToOutline(
  nodes: Node[],
  edges: Edge[],
  rootId?: string
): OutlineItem[] {
  // 步驟 1: 建立 ID -> Node 的快速查找表
  const nodeMap = new Map(nodes.map((n) => [n.id, n]));

  // 步驟 2: 建立父節點 -> 子節點的對應表
  const childrenMap = new Map<string, Node[]>();
  edges.forEach((edge) => {
    const children = childrenMap.get(edge.source) || [];
    const child = nodeMap.get(edge.target);
    if (child) {
      children.push(child);
      childrenMap.set(edge.source, children);
    }
  });

  /**
   * 遞迴建立 OutlineItem 樹狀結構
   */
  function buildOutlineTree(nodeId: string, level: number): OutlineItem | null {
    const node = nodeMap.get(nodeId);
    if (!node) return null;

    // 取得子節點
    const children = childrenMap.get(nodeId) || [];

    return {
      id: nodeId,
      label: node.data.label,
      level,
      children: children
        .map((child) => buildOutlineTree(child.id, level + 1))
        .filter(Boolean) as OutlineItem[],
      isCollapsed: false,
      isFocused: false,
      nodeRef: node,
    };
  }

  // 步驟 3: 找出根節點
  let rootNodes: Node[];
  if (rootId) {
    // 如果指定了 rootId，只從該節點開始
    const rootNode = nodeMap.get(rootId);
    if (!rootNode) return [];
    rootNodes = [rootNode];
  } else {
    // 否則找出所有根節點（沒有 incoming edge 的節點）
    rootNodes = nodes.filter(
      (node) => !edges.some((edge) => edge.target === node.id)
    );
  }

  // 步驟 4: 建立完整的 Outline 結構
  return rootNodes
    .map((node) => buildOutlineTree(node.id, 0))
    .filter(Boolean) as OutlineItem[];
}

/**
 * 將 Outline 結構轉換回 Nodes 和 Edges
 *
 * @param outline - Outline 項目陣列
 * @returns Nodes 和 Edges
 */
export function outlineToNodes(outline: OutlineItem[]): {
  nodes: Node[];
  edges: Edge[];
} {
  const nodes: Node[] = [];
  const edges: Edge[] = [];

  /**
   * 遞迴處理 OutlineItem，提取 Nodes 和 Edges
   */
  function traverse(item: OutlineItem, parentId?: string) {
    // 加入 Node
    nodes.push(item.nodeRef);

    // 如果有父節點，建立 Edge
    if (parentId) {
      edges.push({
        id: `edge_${parentId}_${item.id}`,
        source: parentId,
        target: item.id,
      });
    }

    // 處理子項目
    item.children.forEach((child) => traverse(child, item.id));
  }

  outline.forEach((item) => traverse(item));

  return { nodes, edges };
}

/**
 * 扁平化 Outline 項目（用於虛擬滾動）
 * 將樹狀結構轉為一維陣列，同時考慮收合狀態
 *
 * @param items - Outline 項目陣列
 * @returns 扁平化的項目陣列
 */
export function flattenOutlineItems(items: OutlineItem[]): OutlineItem[] {
  const result: OutlineItem[] = [];

  function traverse(item: OutlineItem) {
    // 加入當前項目
    result.push(item);

    // 如果未收合，繼續處理子項目
    if (!item.isCollapsed) {
      item.children.forEach(traverse);
    }
  }

  items.forEach(traverse);
  return result;
}

/**
 * 改變項目的縮排層級
 *
 * @param items - Outline 項目陣列
 * @param itemId - 要改變的項目 ID
 * @param direction - 增加或減少縮排
 * @returns 更新後的項目陣列
 */
export function changeIndentation(
  items: OutlineItem[],
  itemId: string,
  direction: 'increase' | 'decrease'
): OutlineItem[] {
  // 複製整個結構（深拷貝）
  const newItems = JSON.parse(JSON.stringify(items)) as OutlineItem[];

  /**
   * 在樹狀結構中尋找並更新目標項目
   */
  function updateInTree(
    items: OutlineItem[],
    parentItem?: OutlineItem,
    parentArray?: OutlineItem[],
    itemIndex?: number
  ): boolean {
    for (let i = 0; i < items.length; i++) {
      const item = items[i];

      if (item.id === itemId) {
        if (direction === 'increase') {
          // 增加縮排：移到上一個 sibling 的 children
          if (i > 0) {
            const previousSibling = items[i - 1];
            item.level++;
            // 更新所有子項目的 level
            function updateChildrenLevel(child: OutlineItem, newLevel: number) {
              child.level = newLevel;
              child.children.forEach((c) =>
                updateChildrenLevel(c, newLevel + 1)
              );
            }
            updateChildrenLevel(item, item.level);
            previousSibling.children.push(item);
            items.splice(i, 1);
            return true;
          }
        } else {
          // 減少縮排：移到 parent 的 sibling（同層級）
          if (
            parentItem &&
            parentArray !== undefined &&
            itemIndex !== undefined &&
            item.level > 0
          ) {
            item.level--;
            // 更新所有子項目的 level
            function updateChildrenLevel(child: OutlineItem, newLevel: number) {
              child.level = newLevel;
              child.children.forEach((c) =>
                updateChildrenLevel(c, newLevel + 1)
              );
            }
            updateChildrenLevel(item, item.level);
            // 將項目插入到 parent 之後
            const parentIndex = parentArray.findIndex(
              (p) => p.id === parentItem.id
            );
            if (parentIndex !== -1) {
              parentArray.splice(parentIndex + 1, 0, item);
              items.splice(i, 1);
              return true;
            }
          } else if (parentArray === undefined && item.level > 0) {
            // 如果沒有 parent，但 level > 0，表示是頂層項目，無法再減少
            return false;
          }
        }
        return false;
      }

      // 遞迴處理子項目
      if (updateInTree(item.children, item, items, i)) {
        return true;
      }
    }

    return false;
  }

  updateInTree(newItems);
  return newItems;
}
