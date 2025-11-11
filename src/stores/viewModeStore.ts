/**
 * 視圖模式狀態管理 Store
 * 管理視圖切換、偏好儲存等功能
 */

import { create } from 'zustand';
import { devtools, persist, type StorageValue } from 'zustand/middleware';
import type {
  ViewMode,
  LayoutDirection,
  ViewPreference,
  TopicViewMode,
} from '@/types/view';

// ========================================
// Store 介面定義
// ========================================

interface ViewModeStore {
  // === 狀態 ===
  /** 當前視圖模式 */
  currentView: ViewMode;

  /** 當前佈局方向（用於 Logic Chart） */
  layoutDirection: LayoutDirection;

  /** 視圖偏好（key: mindmapId, value: ViewPreference） */
  viewPreferences: Map<string, ViewPreference>;

  /** 是否正在切換視圖 */
  isSwitching: boolean;

  /** Topic 詳細頁的當前視圖模式 */
  currentTopicView: TopicViewMode;

  // === 視圖切換 ===
  /** 切換視圖模式 */
  switchView: (mode: ViewMode, mindmapId?: string) => void;

  /** 設定佈局方向 */
  setLayoutDirection: (direction: LayoutDirection) => void;

  // === 偏好管理 ===
  /** 儲存視圖偏好 */
  saveViewPreference: (
    mindmapId: string,
    mode: ViewMode,
    direction?: LayoutDirection
  ) => void;

  /** 取得視圖偏好 */
  getViewPreference: (mindmapId: string) => ViewPreference | null;

  /** 清除視圖偏好 */
  clearViewPreference: (mindmapId: string) => void;

  // === Topic 視圖切換 ===
  /** 切換 Topic 視圖模式 */
  setTopicView: (view: TopicViewMode) => void;

  // === 工具函式 ===
  /** 重置 Store */
  reset: () => void;
}

// ========================================
// 初始狀態
// ========================================

const initialState = {
  currentView: 'radial' as ViewMode,
  layoutDirection: 'TB' as LayoutDirection,
  viewPreferences: new Map<string, ViewPreference>(),
  isSwitching: false,
  currentTopicView: 'integrated' as TopicViewMode,
};

// ========================================
// Store 實作
// ========================================

export const useViewModeStore = create<ViewModeStore>()(
  devtools(
    persist(
      (set, get) => ({
        ...initialState,

        // === 視圖切換 ===

        switchView: (mode: ViewMode, mindmapId?: string) => {
          set({ isSwitching: true });

          // 儲存偏好
          if (mindmapId) {
            get().saveViewPreference(mindmapId, mode, get().layoutDirection);
          }

          // 切換視圖
          setTimeout(() => {
            set({
              currentView: mode,
              isSwitching: false,
            });
          }, 300); // 等待動畫完成
        },

        setLayoutDirection: (direction: LayoutDirection) => {
          set({ layoutDirection: direction });
        },

        // === 偏好管理 ===

        saveViewPreference: (
          mindmapId: string,
          mode: ViewMode,
          direction?: LayoutDirection
        ) => {
          const preference: ViewPreference = {
            mindmapId,
            viewMode: mode,
            layoutDirection: direction,
            lastUpdated: new Date(),
          };

          set((state) => {
            const newPreferences = new Map(state.viewPreferences);
            newPreferences.set(mindmapId, preference);
            return { viewPreferences: newPreferences };
          });
        },

        getViewPreference: (mindmapId: string) => {
          return get().viewPreferences.get(mindmapId) || null;
        },

        clearViewPreference: (mindmapId: string) => {
          set((state) => {
            const newPreferences = new Map(state.viewPreferences);
            newPreferences.delete(mindmapId);
            return { viewPreferences: newPreferences };
          });
        },

        // === Topic 視圖切換 ===

        setTopicView: (view: TopicViewMode) => {
          set({ currentTopicView: view });
        },

        // === 工具函式 ===

        reset: () => {
          set(initialState);
        },
      }),
      {
        name: 'view-mode-storage',
        version: 2, // 增加版本號以處理 localStorage 遷移
        // 自訂序列化，因為 Map 無法直接序列化
        storage: {
          getItem: (name: string) => {
            const str = localStorage.getItem(name);
            if (!str) return null;
            const parsed = JSON.parse(str);
            return {
              state: {
                ...parsed.state,
                viewPreferences: new Map(parsed.state.viewPreferences || []),
              },
              version: parsed.version,
            };
          },
          setItem: (name: string, value: StorageValue<ViewModeStore>) => {
            const serialized = {
              state: {
                ...value.state,
                viewPreferences: Array.from(
                  value.state.viewPreferences.entries()
                ),
              },
              version: value.version,
            };
            localStorage.setItem(name, JSON.stringify(serialized));
          },
          removeItem: (name: string) => localStorage.removeItem(name),
        },
      }
    ),
    { name: 'ViewModeStore' }
  )
);
