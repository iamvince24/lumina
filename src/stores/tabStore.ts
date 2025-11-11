/**
 * Tab 系統狀態管理
 *
 * 設計決策：
 * - Tab 上限：5 個（避免效能問題）
 * - 持久化：使用 localStorage（當前 session + 關閉瀏覽器後保留）
 * - 釘選的 Tab 不能關閉
 */
import { create } from 'zustand';
import { persist, type StorageValue } from 'zustand/middleware';

export interface Tab {
  id: string;
  type: 'today' | 'editor' | 'topic' | 'calendar';
  title: string;
  url: string;
  isPinned: boolean;
  createdAt: Date;
}

interface TabStore {
  tabs: Tab[];
  activeTabId: string | null;

  // Actions
  addTab: (tab: Omit<Tab, 'id' | 'createdAt'>) => void;
  closeTab: (tabId: string) => void;
  setActiveTab: (tabId: string) => void;
  pinTab: (tabId: string) => void;
  unpinTab: (tabId: string) => void;
  getTabs: () => Tab[];
  canAddTab: () => boolean;
}

// 常數定義
const MAX_TABS = 5; // Tab 上限

// 生成唯一 ID
function generateTabId(): string {
  return `tab_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export const useTabStore = create<TabStore>()(
  persist(
    (set, get) => ({
      tabs: [],
      activeTabId: null,

      /**
       * 新增 Tab
       * - 檢查是否已存在相同 URL 的 Tab
       * - 檢查是否達到 Tab 上限（5 個）
       * - 如果達到上限，關閉最舊的未釘選 Tab
       */
      addTab: (tabData) => {
        const { tabs } = get();

        // 檢查是否已存在相同 URL 的 Tab
        const existingTab = tabs.find((t) => t.url === tabData.url);

        if (existingTab) {
          // 如果已存在，直接切換到該 Tab
          set({ activeTabId: existingTab.id });
          return;
        }

        // 檢查是否達到 Tab 上限
        if (tabs.length >= MAX_TABS) {
          // 找出最舊的未釘選 Tab
          const unpinnedTabs = tabs
            .filter((t) => !t.isPinned)
            .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());

          if (unpinnedTabs.length > 0) {
            // 關閉最舊的未釘選 Tab
            const oldestTab = unpinnedTabs[0];
            get().closeTab(oldestTab.id);
          } else {
            // 如果所有 Tab 都被釘選，無法新增
            console.warn('無法新增 Tab：已達上限且所有 Tab 都被釘選');
            return;
          }
        }

        // 創建新 Tab
        const newTab: Tab = {
          ...tabData,
          id: generateTabId(),
          createdAt: new Date(),
        };

        set({
          tabs: [...get().tabs, newTab],
          activeTabId: newTab.id,
        });
      },

      /**
       * 關閉 Tab
       * - 釘選的 Tab 不能關閉
       * - 如果關閉的是當前 Tab，自動切換到下一個
       */
      closeTab: (tabId) => {
        const { tabs, activeTabId } = get();

        // 檢查是否為釘選的 Tab
        const tabToClose = tabs.find((t) => t.id === tabId);
        if (tabToClose?.isPinned) {
          console.warn('釘選的 Tab 不能關閉');
          return;
        }

        const newTabs = tabs.filter((t) => t.id !== tabId);

        // 如果關閉的是當前 Tab，切換到下一個
        let newActiveId = activeTabId;
        if (tabId === activeTabId) {
          const closedIndex = tabs.findIndex((t) => t.id === tabId);

          // 優先選擇右邊的 Tab，如果沒有則選左邊
          newActiveId =
            newTabs[closedIndex]?.id || newTabs[closedIndex - 1]?.id || null;
        }

        set({ tabs: newTabs, activeTabId: newActiveId });
      },

      /**
       * 設定當前 Tab
       */
      setActiveTab: (tabId) => {
        set({ activeTabId: tabId });
      },

      /**
       * 釘選 Tab
       */
      pinTab: (tabId) => {
        set((state) => ({
          tabs: state.tabs.map((t) =>
            t.id === tabId ? { ...t, isPinned: true } : t
          ),
        }));
      },

      /**
       * 取消釘選 Tab
       */
      unpinTab: (tabId) => {
        set((state) => ({
          tabs: state.tabs.map((t) =>
            t.id === tabId ? { ...t, isPinned: false } : t
          ),
        }));
      },

      /**
       * 取得所有 Tab
       */
      getTabs: () => get().tabs,

      /**
       * 檢查是否可以新增 Tab
       */
      canAddTab: () => {
        const { tabs } = get();

        // 如果未達上限，可以新增
        if (tabs.length < MAX_TABS) {
          return true;
        }

        // 如果達到上限，檢查是否有未釘選的 Tab
        const unpinnedTabs = tabs.filter((t) => !t.isPinned);
        return unpinnedTabs.length > 0;
      },
    }),
    {
      name: 'lumina-tabs', // localStorage key
      version: 1,
      // 自訂序列化，處理 Date 物件
      storage: {
        getItem: (name: string): StorageValue<TabStore> | null => {
          const str = localStorage.getItem(name);
          if (!str) return null;
          const parsed = JSON.parse(str) as {
            state: {
              tabs: Array<{
                id: string;
                type: Tab['type'];
                title: string;
                url: string;
                isPinned: boolean;
                createdAt: string;
              }>;
              activeTabId: string | null;
            };
            version: number;
          };
          return {
            state: {
              ...parsed.state,
              tabs: parsed.state.tabs.map((tab) => ({
                ...tab,
                createdAt: new Date(tab.createdAt),
              })),
            },
            version: parsed.version,
          } as StorageValue<TabStore>;
        },
        setItem: (name: string, value: StorageValue<TabStore>) => {
          const serialized = {
            state: {
              ...value.state,
              tabs: value.state.tabs.map((tab) => ({
                ...tab,
                createdAt: tab.createdAt.toISOString(),
              })),
            },
            version: value.version,
          };
          localStorage.setItem(name, JSON.stringify(serialized));
        },
        removeItem: (name: string) => localStorage.removeItem(name),
      },
    }
  )
);
