/**
 * 自動儲存 Hook
 * 當 MindMap 資料變更時，自動觸發儲存到 localStorage
 */

import { useEffect, useRef, useMemo } from 'react';
import { debounce } from 'lodash-es';
import { useMindMapStore } from '@/stores/mindmapStore';
import { useSaveStatusStore } from '@/stores/saveStatusStore';
import type { Node, Edge } from '@/types/mindmap';
import { saveMindMap } from '@/services/localStorage/mindmapStorage';
import { toast } from 'sonner';

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
  const saveRef = useRef<ReturnType<typeof debounce> | null>(null);

  // 取得當前時間戳記
  const timestamp = new Date().toISOString();

  // 建立 debounce 函式（當 debounceMs 改變時重新建立）
  const debouncedSave = useMemo(
    () =>
      debounce((mindmapId: string, nodes: Node[], edges: Edge[]) => {
        try {
          setStatus('saving');

          // 儲存到 localStorage
          const result = saveMindMap(nodes, edges);

          if (result.success) {
            // 儲存成功
            setSaved();

            // 如果啟用離線儲存，清除 buffer（現在已經直接儲存，不再需要 buffer）
            if (enableOfflineStorage) {
              try {
                localStorage.removeItem(`mindmap_buffer_${mindmapId}`);
              } catch (error) {
                console.error('Failed to clear buffer:', error);
              }
            }
          } else {
            // 儲存失敗
            console.error('Save failed:', result.error);
            setError(result.error || '儲存失敗');

            // 顯示錯誤提示
            toast.error('儲存失敗', {
              description:
                result.error === 'QuotaExceededError'
                  ? 'localStorage 容量不足，請匯出資料或清理舊資料'
                  : '無法儲存資料，請檢查瀏覽器設定',
            });

            // 如果啟用離線儲存且儲存失敗，將資料暫存到 buffer
            if (enableOfflineStorage) {
              try {
                localStorage.setItem(
                  `mindmap_buffer_${mindmapId}`,
                  JSON.stringify({
                    nodes,
                    edges,
                    timestamp: timestamp,
                  })
                );
              } catch (bufferError) {
                console.error('Failed to save to buffer:', bufferError);
              }
            }
          }
        } catch (error) {
          console.error('Auto-save error:', error);
          setError('儲存過程發生錯誤');
        }
      }, debounceMs),
    [debounceMs, setStatus, setSaved, setError, enableOfflineStorage]
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
