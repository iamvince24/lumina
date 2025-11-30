/**
 * 鍵盤快捷鍵 Hook
 * 處理心智圖編輯器的所有快捷鍵
 */

import { useHotkeys } from 'react-hotkeys-hook';
import { useMindMapStore } from '@/lib/stores/mindmapStore';
import { toast } from 'sonner';
import type { ViewMode } from '@/types/view';

/**
 * 快捷鍵設定
 */
export interface ShortcutConfig {
  /** 是否啟用快捷鍵 */
  enabled?: boolean;

  /** 當前選中的 Node ID */
  selectedNodeId?: string;

  /** 當前視圖模式 */
  currentView?: ViewMode;
}

/**
 * 鍵盤快捷鍵 Hook
 *
 * @param config - 快捷鍵設定
 */
export function useKeyboardShortcuts(config: ShortcutConfig = {}) {
  const { enabled = true, selectedNodeId, currentView } = config;

  const { addNode, deleteNode, updateNode, undo, redo } = useMindMapStore();

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

      const parentId = selectedNode?.parentId;

      // 在相同層級新增 Node
      addNode(parentId ?? null, '新節點');

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
      addNode(selectedNodeId, '子節點');

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
   * Cmd/Ctrl + Z: 復原
   */
  useHotkeys(
    'mod+z',
    (e) => {
      e.preventDefault();
      const state = useMindMapStore.getState();
      if (state.historyIndex > 0) {
        undo();
        toast.success('已復原');
      } else {
        toast.info('沒有可復原的操作');
      }
    },
    {
      enabled,
      enableOnFormTags: false,
      enableOnContentEditable: false,
      preventDefault: true,
    }
  );

  /**
   * Cmd/Ctrl + Shift + Z: 重做
   */
  useHotkeys(
    'mod+shift+z',
    (e) => {
      e.preventDefault();
      const state = useMindMapStore.getState();
      if (state.historyIndex < state.history.length - 1) {
        redo();
        toast.success('已重做');
      } else {
        toast.info('沒有可重做的操作');
      }
    },
    {
      enabled,
      enableOnFormTags: false,
      enableOnContentEditable: false,
      preventDefault: true,
    }
  );

  /**
   * F2: 進入編輯模式
   */
  useHotkeys(
    'f2',
    (e) => {
      e.preventDefault();

      if (!selectedNodeId) {
        toast.error('請先選擇一個 Node');
        return;
      }

      const { setEditingNode } = useMindMapStore.getState();
      setEditingNode(selectedNodeId);
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

      updateNode(selectedNodeId, { isTopic: true });

      toast.success('已設為 Topic');
    },
    {
      enabled,
      enableOnFormTags: false,
      enableOnContentEditable: false,
      preventDefault: true,
    }
  );

  /**
   * Tab: 新增子 Node
   */
  useHotkeys(
    'tab',
    (e) => {
      e.preventDefault();

      if (!selectedNodeId) {
        toast.error('請先選擇一個 Node');
        return;
      }

      // 新增為選中 Node 的子節點
      addNode(selectedNodeId, '子節點');

      toast.success('已新增子節點');
    },
    {
      enabled,
      enableOnFormTags: false,
      enableOnContentEditable: false,
      preventDefault: true,
    }
  );
}
