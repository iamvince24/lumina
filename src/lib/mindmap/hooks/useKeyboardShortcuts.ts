import { useEffect, useCallback, useRef } from 'react';
import { useMindMapStore } from '@/lib/stores/mindmapStore';
import type { MindMapNode } from '../types';

/**
 * 鍵盤快捷鍵 Hook for VisxMindMapEditor
 * 實現標準心智圖編輯器的快捷鍵功能
 */
export const useKeyboardShortcuts = () => {
  const {
    nodes,
    selectedNodeIds,
    editingNodeId,
    addNode,
    deleteNode,
    setSelectedNodes,
    setEditingNode,
  } = useMindMapStore();

  // 使用 ref 來追蹤是否正在編輯，避免閉包問題
  const isEditingRef = useRef(false);

  useEffect(() => {
    isEditingRef.current = editingNodeId !== null;
  }, [editingNodeId]);

  /**
   * 獲取節點的所有子節點
   */
  const getChildren = useCallback(
    (nodeId: string): MindMapNode[] => {
      return nodes.filter((node) => node.parentId === nodeId);
    },
    [nodes]
  );

  /**
   * 獲取節點的所有兄弟節點（包括自己）
   */
  const getSiblings = useCallback(
    (nodeId: string): MindMapNode[] => {
      const node = nodes.find((n) => n.id === nodeId);
      if (!node) return [];

      // 根節點沒有兄弟
      if (node.parentId === null) return [node];

      return nodes.filter((n) => n.parentId === node.parentId);
    },
    [nodes]
  );

  /**
   * 獲取根節點
   */
  const getRootNode = useCallback((): MindMapNode | null => {
    return nodes.find((n) => n.parentId === null) || null;
  }, [nodes]);

  /**
   * 檢查是否為根節點
   */
  const isRootNode = useCallback(
    (nodeId: string): boolean => {
      const node = nodes.find((n) => n.id === nodeId);
      return node?.parentId === null;
    },
    [nodes]
  );

  /**
   * 獲取前一個兄弟節點
   */
  const getPreviousSibling = useCallback(
    (nodeId: string): MindMapNode | null => {
      const siblings = getSiblings(nodeId);
      const currentIndex = siblings.findIndex((n) => n.id === nodeId);

      if (currentIndex <= 0) return null;
      return siblings[currentIndex - 1] || null;
    },
    [getSiblings]
  );

  /**
   * 獲取下一個兄弟節點
   */
  const getNextSibling = useCallback(
    (nodeId: string): MindMapNode | null => {
      const siblings = getSiblings(nodeId);
      const currentIndex = siblings.findIndex((n) => n.id === nodeId);

      if (currentIndex < 0 || currentIndex >= siblings.length - 1) return null;
      return siblings[currentIndex + 1] || null;
    },
    [getSiblings]
  );

  /**
   * 獲取父節點
   */
  const getParent = useCallback(
    (nodeId: string): MindMapNode | null => {
      const node = nodes.find((n) => n.id === nodeId);
      if (!node || !node.parentId) return null;

      return nodes.find((n) => n.id === node.parentId) || null;
    },
    [nodes]
  );

  /**
   * 獲取中間的子節點（或最後選中的子節點）
   */
  const getMiddleChild = useCallback(
    (nodeId: string): MindMapNode | null => {
      const children = getChildren(nodeId);
      if (children.length === 0) return null;

      // 如果有選中的子節點，返回最後一個選中的
      const selectedChildren = children.filter((child) =>
        selectedNodeIds.includes(child.id)
      );
      if (selectedChildren.length > 0) {
        return selectedChildren[selectedChildren.length - 1];
      }

      // 否則返回中間的子節點
      const middleIndex = Math.floor(children.length / 2);
      return children[middleIndex] || null;
    },
    [getChildren, selectedNodeIds]
  );

  /**
   * 處理 Tab: 添加子節點
   */
  const handleTab = useCallback(
    (event: KeyboardEvent) => {
      if (selectedNodeIds.length !== 1) return;

      const selectedId = selectedNodeIds[0];
      // addNode 會自動選取新節點並設置為編輯模式
      addNode(selectedId);
    },
    [selectedNodeIds, addNode]
  );

  /**
   * 處理 Enter: 添加兄弟節點（根節點時添加子節點）
   */
  const handleEnter = useCallback(
    (event: KeyboardEvent) => {
      if (selectedNodeIds.length !== 1) return;

      const selectedId = selectedNodeIds[0];
      const node = nodes.find((n) => n.id === selectedId);
      if (!node) return;

      let parentId: string | null;
      let afterNodeId: string | undefined;

      // 如果是根節點，添加子節點
      if (node.parentId === null) {
        parentId = selectedId;
        // 子節點插入到最後
        afterNodeId = undefined;
      } else {
        // 否則添加兄弟節點，插入到當前節點之後
        parentId = node.parentId;
        afterNodeId = selectedId;
      }

      // addNode 會自動選取新節點並設置為編輯模式
      addNode(parentId, '新節點', afterNodeId);
    },
    [selectedNodeIds, nodes, addNode]
  );

  /**
   * 處理 Delete/Backspace: 刪除選中的節點
   */
  const handleDelete = useCallback(
    (event: KeyboardEvent) => {
      if (selectedNodeIds.length === 0) return;

      // 刪除所有選中的節點
      selectedNodeIds.forEach((nodeId) => {
        deleteNode(nodeId);
      });

      // 清除選取
      setSelectedNodes([]);
    },
    [selectedNodeIds, deleteNode, setSelectedNodes]
  );

  /**
   * 處理 Arrow Left: 移動到父節點
   */
  const handleArrowLeft = useCallback(
    (event: KeyboardEvent) => {
      if (selectedNodeIds.length !== 1) return;

      const selectedId = selectedNodeIds[0];
      const parent = getParent(selectedId);

      if (parent) {
        setSelectedNodes([parent.id]);
      }
    },
    [selectedNodeIds, getParent, setSelectedNodes]
  );

  /**
   * 處理 Arrow Right: 移動到中間子節點
   */
  const handleArrowRight = useCallback(
    (event: KeyboardEvent) => {
      if (selectedNodeIds.length !== 1) return;

      const selectedId = selectedNodeIds[0];
      const child = getMiddleChild(selectedId);

      if (child) {
        setSelectedNodes([child.id]);
      }
    },
    [selectedNodeIds, getMiddleChild, setSelectedNodes]
  );

  /**
   * 處理 Arrow Up: 移動到前一個兄弟節點
   */
  const handleArrowUp = useCallback(
    (event: KeyboardEvent) => {
      if (selectedNodeIds.length !== 1) return;

      const selectedId = selectedNodeIds[0];
      const prevSibling = getPreviousSibling(selectedId);

      if (prevSibling) {
        setSelectedNodes([prevSibling.id]);
      }
    },
    [selectedNodeIds, getPreviousSibling, setSelectedNodes]
  );

  /**
   * 處理 Arrow Down: 移動到下一個兄弟節點
   */
  const handleArrowDown = useCallback(
    (event: KeyboardEvent) => {
      if (selectedNodeIds.length !== 1) return;

      const selectedId = selectedNodeIds[0];
      const nextSibling = getNextSibling(selectedId);

      if (nextSibling) {
        setSelectedNodes([nextSibling.id]);
      }
    },
    [selectedNodeIds, getNextSibling, setSelectedNodes]
  );

  /**
   * 處理 Space: 開始編輯
   */
  const handleSpace = useCallback(
    (event: KeyboardEvent) => {
      if (selectedNodeIds.length !== 1) return;

      const selectedId = selectedNodeIds[0];
      setEditingNode(selectedId);
    },
    [selectedNodeIds, setEditingNode]
  );

  /**
   * 主鍵盤事件處理器
   */
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      // 檢查是否正在編輯
      if (isEditingRef.current) return;

      // 檢查是否在輸入框中
      const activeElement = document.activeElement;
      if (
        activeElement instanceof HTMLElement &&
        (activeElement.tagName === 'INPUT' ||
          activeElement.tagName === 'TEXTAREA' ||
          activeElement.isContentEditable)
      ) {
        return;
      }

      const { key, metaKey, ctrlKey } = event;
      const isMod = metaKey || ctrlKey;

      // 如果按了修飾鍵，不處理（讓瀏覽器處理）
      if (isMod) return;

      switch (key) {
        case 'Tab':
          event.preventDefault();
          handleTab(event);
          break;

        case 'Enter':
          event.preventDefault();
          handleEnter(event);
          break;

        case 'Delete':
        case 'Backspace':
          event.preventDefault();
          handleDelete(event);
          break;

        case 'ArrowLeft':
          event.preventDefault();
          handleArrowLeft(event);
          break;

        case 'ArrowRight':
          event.preventDefault();
          handleArrowRight(event);
          break;

        case 'ArrowUp':
          event.preventDefault();
          handleArrowUp(event);
          break;

        case 'ArrowDown':
          event.preventDefault();
          handleArrowDown(event);
          break;

        case ' ':
          event.preventDefault();
          handleSpace(event);
          break;

        default:
          break;
      }
    },
    [
      handleTab,
      handleEnter,
      handleDelete,
      handleArrowLeft,
      handleArrowRight,
      handleArrowUp,
      handleArrowDown,
      handleSpace,
    ]
  );

  // 監聽鍵盤事件
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);
};
