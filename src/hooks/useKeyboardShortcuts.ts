/**
 * 鍵盤快捷鍵 Hook
 * 處理心智圖編輯器的所有快捷鍵
 */

import { useHotkeys } from 'react-hotkeys-hook';
import { useMindMapStore } from '@/stores/mindmapStore';
import { toast } from 'sonner';

/**
 * 快捷鍵設定
 */
export interface ShortcutConfig {
  /** 是否啟用快捷鍵 */
  enabled?: boolean;

  /** 當前選中的 Node ID */
  selectedNodeId?: string;
}

/**
 * 鍵盤快捷鍵 Hook
 *
 * @param config - 快捷鍵設定
 */
export function useKeyboardShortcuts(config: ShortcutConfig = {}) {
  const { enabled = true, selectedNodeId } = config;

  const { addNode, deleteNode, updateNode } = useMindMapStore();

  /**
   * Enter: 新增同層 Node
   */
  useHotkeys(
    'enter',
    (e) => {
      e.preventDefault();

      if (!selectedNodeId) {
        toast.error('請先選擇一個 Node');
        return;
      }

      // 取得選中 Node 的父節點
      const selectedNode = useMindMapStore
        .getState()
        .nodes.find((n) => n.id === selectedNodeId);

      const parentId = selectedNode?.parentNode;

      // 在相同層級新增 Node
      addNode({
        label: '新節點',
        parentId,
      });

      toast.success('已新增節點');
    },
    {
      enabled,
      enableOnFormTags: false,
      enableOnContentEditable: false,
      preventDefault: true,
    }
  );

  /**
   * Shift+Enter: 新增子 Node
   */
  useHotkeys(
    'shift+enter',
    (e) => {
      e.preventDefault();

      if (!selectedNodeId) {
        toast.error('請先選擇一個 Node');
        return;
      }

      // 新增為選中 Node 的子節點
      addNode({
        label: '子節點',
        parentId: selectedNodeId,
      });

      toast.success('已新增子節點');
    },
    {
      enabled,
      enableOnFormTags: false,
      enableOnContentEditable: false,
      preventDefault: true,
    }
  );

  /**
   * Delete / Backspace: 刪除 Node
   */
  useHotkeys(
    'delete,backspace',
    (e) => {
      e.preventDefault();

      if (!selectedNodeId) {
        toast.error('請先選擇一個 Node');
        return;
      }

      deleteNode(selectedNodeId);
      toast.success('已刪除節點');
    },
    {
      enabled,
      enableOnFormTags: false,
      enableOnContentEditable: false,
      preventDefault: true,
    }
  );

  /**
   * Cmd/Ctrl + Z: 復原（TODO: 需要實作 history）
   */
  useHotkeys(
    'mod+z',
    (e) => {
      e.preventDefault();
      toast.info('復原功能開發中');
    },
    {
      enabled,
      enableOnFormTags: false,
      enableOnContentEditable: false,
      preventDefault: true,
    }
  );

  /**
   * Cmd/Ctrl + Shift + Z: 重做（TODO: 需要實作 history）
   */
  useHotkeys(
    'mod+shift+z',
    (e) => {
      e.preventDefault();
      toast.info('重做功能開發中');
    },
    {
      enabled,
      enableOnFormTags: false,
      enableOnContentEditable: false,
      preventDefault: true,
    }
  );

  /**
   * Cmd/Ctrl + T: 設為 Topic
   */
  useHotkeys(
    'mod+t',
    (e) => {
      e.preventDefault();

      if (!selectedNodeId) {
        toast.error('請先選擇一個 Node');
        return;
      }

      updateNode({
        id: selectedNodeId,
        data: { isTopic: true },
      });

      toast.success('已設為 Topic');
    },
    {
      enabled,
      enableOnFormTags: false,
      enableOnContentEditable: false,
      preventDefault: true,
    }
  );
}
