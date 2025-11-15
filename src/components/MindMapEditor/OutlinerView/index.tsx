/**
 * Outliner 視圖主要組件
 * 使用虛擬滾動處理大量項目
 */

import { useEffect, useState, useMemo, useRef } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { Download } from 'lucide-react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useMindMapStore } from '@/stores/mindmapStore';
import {
  nodesToOutline,
  flattenOutlineItems,
  outlineToNodes,
} from '@/utils/dataTransform/outline';
import { DraggableOutlineItem } from './DraggableOutlineItem';
import { Button } from '@/components/ui/button';
import { exportOutlinerToMarkdown } from '@/utils/export/outlinerMarkdown';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import type { OutlineItem } from '@/types/view';

/**
 * 在樹狀結構中尋找項目
 */
function findItemInTree(
  items: OutlineItem[],
  itemId: string
): {
  item: OutlineItem;
  parent: OutlineItem | null;
  siblings: OutlineItem[];
  index: number;
} | null {
  function search(
    currentItems: OutlineItem[],
    parent: OutlineItem | null = null
  ): {
    item: OutlineItem;
    parent: OutlineItem | null;
    siblings: OutlineItem[];
    index: number;
  } | null {
    for (let i = 0; i < currentItems.length; i++) {
      const item = currentItems[i];
      if (item.id === itemId) {
        return { item, parent, siblings: currentItems, index: i };
      }
      const found = search(item.children, item);
      if (found) return found;
    }
    return null;
  }
  return search(items);
}

/**
 * Outliner 視圖組件
 */
export const OutlinerView = () => {
  // 從 Store 取得資料
  const {
    nodes,
    edges,
    updateNode,
    updateNodes,
    updateEdges,
    addNode,
    selectedNodeIds,
  } = useMindMapStore();

  // Outline 狀態
  const [outlineItems, setOutlineItems] = useState<OutlineItem[]>([]);
  const [focusedId, setFocusedId] = useState<string | null>(null);
  const [collapsedIds, setCollapsedIds] = useState<Set<string>>(new Set());

  // 父容器 ref（用於虛擬滾動）
  const parentRef = useRef<HTMLDivElement>(null);

  // 啟用全局快捷鍵（只在沒有聚焦到 input 時）
  const selectedNodeId = useMemo(
    () => selectedNodeIds[0] || focusedId || undefined,
    [selectedNodeIds, focusedId]
  );

  useKeyboardShortcuts({
    enabled: true,
    selectedNodeId,
  });

  // 拖曳感應器
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  /**
   * 當 Nodes 或 Edges 變更時，更新 Outline
   */
  useEffect(() => {
    const outline = nodesToOutline(nodes, edges);
    setOutlineItems(outline);
  }, [nodes, edges]);

  /**
   * 扁平化的項目列表（用於虛擬滾動）
   */
  const flatItems = useMemo(() => {
    // 先更新 outlineItems 的收合狀態
    const updateCollapsedState = (items: OutlineItem[]): OutlineItem[] => {
      return items.map((item) => ({
        ...item,
        isCollapsed: collapsedIds.has(item.id),
        children: updateCollapsedState(item.children),
      }));
    };

    const updatedItems = updateCollapsedState(outlineItems);
    return flattenOutlineItems(updatedItems);
  }, [outlineItems, collapsedIds]);

  /**
   * 虛擬滾動設定
   * Note: React Compiler 會跳過此 API 的 memoization，因為 TanStack Virtual
   * 返回的函數無法被安全地 memoize。這是預期行為，不影響功能。
   */
  const virtualizer = useVirtualizer({
    count: flatItems.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 32, // 每個項目的預估高度
    overscan: 10, // 預先渲染的項目數量
  });

  /**
   * 編輯項目
   */
  const handleEdit = (id: string, newLabel: string) => {
    updateNode({
      id,
      data: { label: newLabel },
    });
  };

  /**
   * 切換收合狀態
   */
  const handleToggleCollapse = (id: string) => {
    setCollapsedIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  /**
   * 聚焦項目
   */
  const handleFocus = (id: string) => {
    setFocusedId(id);
  };

  /**
   * 按下 Enter：新增同層項目
   */
  const handleEnter = (id: string) => {
    const found = findItemInTree(outlineItems, id);
    if (!found) return;

    const { item } = found;
    const newItemId = addNode({
      label: '',
      parentId: found.parent?.id,
    });

    // 更新 outlineItems，在當前項目之後插入新項目
    const newOutlineItems = JSON.parse(
      JSON.stringify(outlineItems)
    ) as OutlineItem[];

    function insertSibling(items: OutlineItem[]): boolean {
      for (let i = 0; i < items.length; i++) {
        if (items[i].id === id) {
          // 找到當前項目，在它之後插入新項目
          const newNode = nodes.find((n) => n.id === newItemId);
          if (newNode) {
            const newOutlineItem: OutlineItem = {
              id: newItemId,
              label: '',
              level: item.level,
              children: [],
              isCollapsed: false,
              isFocused: false,
              nodeRef: newNode,
            };
            items.splice(i + 1, 0, newOutlineItem);
            return true;
          }
        }
        if (insertSibling(items[i].children)) {
          return true;
        }
      }
      return false;
    }

    insertSibling(newOutlineItems);
    setOutlineItems(newOutlineItems);

    // 轉換回 nodes 和 edges 並更新 store
    const { nodes: updatedNodes, edges: updatedEdges } =
      outlineToNodes(newOutlineItems);
    updateNodes(updatedNodes);
    updateEdges(updatedEdges);

    // 聚焦到新項目
    setFocusedId(newItemId);
  };

  /**
   * 按下 Tab：增加縮排
   */
  const handleTab = (id: string) => {
    const found = findItemInTree(outlineItems, id);
    if (!found) return;

    const { index } = found;

    // 如果沒有上一個 sibling，無法增加縮排
    if (index === 0) return;

    const newOutlineItems = JSON.parse(
      JSON.stringify(outlineItems)
    ) as OutlineItem[];

    function increaseIndent(items: OutlineItem[]): boolean {
      for (let i = 0; i < items.length; i++) {
        if (items[i].id === id) {
          // 找到當前項目
          if (i > 0) {
            const previousSibling = items[i - 1];
            const currentItem = items[i];

            // 更新 level
            function updateLevel(child: OutlineItem, newLevel: number) {
              child.level = newLevel;
              child.children.forEach((c) => updateLevel(c, newLevel + 1));
            }
            updateLevel(currentItem, previousSibling.level + 1);

            // 將當前項目移到上一個 sibling 的 children
            previousSibling.children.push(currentItem);
            items.splice(i, 1);
            return true;
          }
          return false;
        }
        if (increaseIndent(items[i].children)) {
          return true;
        }
      }
      return false;
    }

    if (increaseIndent(newOutlineItems)) {
      setOutlineItems(newOutlineItems);

      // 轉換回 nodes 和 edges 並更新 store
      const { nodes: updatedNodes, edges: updatedEdges } =
        outlineToNodes(newOutlineItems);
      updateNodes(updatedNodes);
      updateEdges(updatedEdges);
    }
  };

  /**
   * 按下 Shift+Tab：減少縮排
   */
  const handleShiftTab = (id: string) => {
    const found = findItemInTree(outlineItems, id);
    if (!found) return;

    const { item, parent } = found;

    // 如果已經是頂層，無法減少縮排
    if (!parent || item.level === 0) return;

    const newOutlineItems = JSON.parse(
      JSON.stringify(outlineItems)
    ) as OutlineItem[];

    function decreaseIndent(
      items: OutlineItem[],
      parentItem: OutlineItem | null = null,
      parentArray: OutlineItem[] | null = null
    ): boolean {
      for (let i = 0; i < items.length; i++) {
        if (items[i].id === id) {
          // 找到當前項目
          const currentItem = items[i];

          if (parentItem && parentArray && currentItem.level > 0) {
            // 更新 level
            function updateLevel(child: OutlineItem, newLevel: number) {
              child.level = newLevel;
              child.children.forEach((c) => updateLevel(c, newLevel + 1));
            }
            updateLevel(currentItem, currentItem.level - 1);

            // 找到 parent 在 parentArray 中的位置
            const parentIndex = parentArray.findIndex(
              (p) => p.id === parentItem.id
            );
            if (parentIndex !== -1) {
              // 將項目插入到 parent 之後
              items.splice(i, 1);
              parentArray.splice(parentIndex + 1, 0, currentItem);
              return true;
            }
          }
          return false;
        }

        // 遞迴處理子項目
        if (decreaseIndent(items[i].children, items[i], items)) {
          return true;
        }
      }
      return false;
    }

    if (decreaseIndent(newOutlineItems)) {
      setOutlineItems(newOutlineItems);

      // 轉換回 nodes 和 edges 並更新 store
      const { nodes: updatedNodes, edges: updatedEdges } =
        outlineToNodes(newOutlineItems);
      updateNodes(updatedNodes);
      updateEdges(updatedEdges);
    }
  };

  /**
   * 處理拖曳結束
   */
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    // 找到拖曳項目的索引
    const oldIndex = flatItems.findIndex((item) => item.id === active.id);
    const newIndex = flatItems.findIndex((item) => item.id === over.id);

    if (oldIndex === -1 || newIndex === -1) {
      return;
    }

    // 檢查是否為同層級（簡化版本，只支援同層級拖曳）
    const draggedItem = flatItems[oldIndex];
    const targetItem = flatItems[newIndex];

    if (draggedItem.level !== targetItem.level) {
      // 不同層級，不處理（未來可以擴展）
      return;
    }

    // 重新排列 flatItems
    const newFlatItems = arrayMove(flatItems, oldIndex, newIndex);

    // 重建樹狀結構
    // 這是一個簡化版本，只處理同層級的重新排序
    const newOutlineItems = JSON.parse(
      JSON.stringify(outlineItems)
    ) as OutlineItem[];

    // 找到兩個項目在樹中的位置
    const draggedFound = findItemInTree(newOutlineItems, draggedItem.id);
    const targetFound = findItemInTree(newOutlineItems, targetItem.id);

    if (!draggedFound || !targetFound) {
      return;
    }

    // 如果它們在同一個父節點下
    if (
      draggedFound.parent?.id === targetFound.parent?.id ||
      (!draggedFound.parent && !targetFound.parent)
    ) {
      const siblings = draggedFound.siblings;
      const draggedSiblingIndex = draggedFound.index;
      const targetSiblingIndex = targetFound.index;

      // 重新排列
      const [movedItem] = siblings.splice(draggedSiblingIndex, 1);
      siblings.splice(targetSiblingIndex, 0, movedItem);

      setOutlineItems(newOutlineItems);

      // 轉換回 nodes 和 edges 並更新 store
      const { nodes: updatedNodes, edges: updatedEdges } =
        outlineToNodes(newOutlineItems);
      updateNodes(updatedNodes);
      updateEdges(updatedEdges);
    }
  };

  /**
   * 處理 Markdown 匯出
   */
  const handleExport = () => {
    const markdown = exportOutlinerToMarkdown(outlineItems);

    // 複製到剪貼簿
    navigator.clipboard.writeText(markdown).then(() => {
      // TODO: 顯示成功提示（可以使用 toast）
      console.log('Markdown 已複製到剪貼簿');
    });
  };

  return (
    <div className="w-full h-full bg-white">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-800">大綱視圖</h2>
        <Button size="sm" onClick={handleExport} variant="outline">
          <Download className="w-4 h-4 mr-2" />
          匯出 Markdown
        </Button>
      </div>

      {/* 虛擬滾動容器 */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={flatItems.map((item) => item.id)}
          strategy={verticalListSortingStrategy}
        >
          <div ref={parentRef} className="h-[calc(100%-60px)] overflow-auto">
            <div
              style={{
                height: `${virtualizer.getTotalSize()}px`,
                width: '100%',
                position: 'relative',
              }}
            >
              {virtualizer.getVirtualItems().map((virtualItem) => {
                const item = flatItems[virtualItem.index];

                return (
                  <div
                    key={virtualItem.key}
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: `${virtualItem.size}px`,
                      transform: `translateY(${virtualItem.start}px)`,
                    }}
                  >
                    <DraggableOutlineItem
                      item={item}
                      isFocused={focusedId === item.id}
                      onEdit={handleEdit}
                      onToggleCollapse={handleToggleCollapse}
                      onFocus={handleFocus}
                      onEnter={handleEnter}
                      onTab={handleTab}
                      onShiftTab={handleShiftTab}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
};
