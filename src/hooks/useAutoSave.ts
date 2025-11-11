/**
 * 自動儲存 Hook
 * 當 MindMap 資料變更時，自動觸發儲存
 *
 * ⚠️ 目前使用假資料 Hook，待後端 API 完成後需替換為真實 API
 */

import { useEffect, useRef, useMemo } from 'react';
import { debounce } from 'lodash-es';
import { useMindMapStore } from '@/stores/mindmapStore';
import { useSaveStatusStore } from '@/stores/saveStatusStore';
import type { Node, Edge } from '@/types/mindmap';
// ⚠️ 暫時使用假資料 Hook，待後端 API 完成後替換為真實 API
import { useMockUpdateMindMap } from '@/__mocks__/hooks';
// import { api } from '@/utils/api';

interface UseAutoSaveOptions {
  /** MindMap ID */
  mindmapId: string;

  /** 防抖延遲時間（毫秒），預設 2000ms */
  debounceMs?: number;

  /** 是否啟用離線儲存 */
  enableOfflineStorage?: boolean;

  /** 是否啟用自動儲存（預設 true） */
  enabled?: boolean;
}

/**
 * 自動儲存 Hook
 */
export function useAutoSave(options: UseAutoSaveOptions) {
  const {
    mindmapId,
    debounceMs = 2000,
    enableOfflineStorage = true,
    enabled = true,
  } = options;

  // 取得 Store
  const nodes = useMindMapStore((state) => state.nodes);
  const edges = useMindMapStore((state) => state.edges);
  const { setStatus, setError, setSaved } = useSaveStatusStore();

  // 儲存函式參考（避免重新建立）
  // 使用 useMemo 確保 debounceMs 改變時重新建立 debounce 函式
  const saveRef = useRef<ReturnType<typeof debounce> | null>(null);

  // ⚠️ 暫時使用假資料 mutation，待後端 API 完成後替換為真實 API
  const updateMindMapMutation = useMockUpdateMindMap({
    onSuccess: () => {
      // 儲存成功
      setSaved();

      // 如果啟用離線儲存，清除 localStorage buffer
      if (enableOfflineStorage) {
        localStorage.removeItem(`mindmap_buffer_${mindmapId}`);
      }
    },
    onError: (error) => {
      console.error('Auto-save failed:', error);
      setError('儲存失敗，請檢查網路連線');

      // 如果啟用離線儲存，將資料暫存到 localStorage
      // 從 Store 取得最新的 nodes 和 edges
      if (enableOfflineStorage) {
        try {
          const currentNodes = useMindMapStore.getState().nodes;
          const currentEdges = useMindMapStore.getState().edges;
          localStorage.setItem(
            `mindmap_buffer_${mindmapId}`,
            JSON.stringify({
              nodes: currentNodes,
              edges: currentEdges,
              timestamp: Date.now(),
            })
          );
        } catch (storageError) {
          console.error('Failed to save to localStorage:', storageError);
        }
      }
    },
  });
  // const updateMindMapMutation = api.mindmap.update.useMutation();

  // 建立 debounce 函式（當 debounceMs 改變時重新建立）
  const debouncedSave = useMemo(
    () =>
      debounce(async (mindmapId: string, nodes: Node[], edges: Edge[]) => {
        try {
          setStatus('saving');

          // ⚠️ 暫時使用假資料 API，待後端 API 完成後替換為真實 API
          await updateMindMapMutation.mutate({
            mindmapId,
            nodes,
            edges,
          });
        } catch (error) {
          // 錯誤處理已在 onError callback 中處理
          console.error('Auto-save error:', error);
        }
      }, debounceMs),
    [debounceMs, setStatus, updateMindMapMutation]
  );

  // 將 debouncedSave 儲存到 ref，以便在 cleanup 時取消
  // 使用 useEffect 確保在 render 後更新 ref
  useEffect(() => {
    saveRef.current = debouncedSave;
  }, [debouncedSave]);

  // 監聽 nodes 和 edges 的變化
  useEffect(() => {
    // 如果未啟用自動儲存，直接返回
    if (!enabled) {
      return;
    }

    if (nodes.length === 0 && edges.length === 0) {
      // 空白狀態，不需要儲存
      return;
    }

    // 標記為未儲存
    setStatus('unsaved');

    // 觸發自動儲存
    debouncedSave(mindmapId, nodes, edges);
  }, [nodes, edges, mindmapId, setStatus, enabled, debouncedSave]);

  // 組件卸載時取消待處理的儲存
  useEffect(() => {
    return () => {
      saveRef.current?.cancel();
    };
  }, []);

  return {
    /** 手動觸發儲存 */
    saveNow: () => {
      saveRef.current?.flush();
    },
  };
}
