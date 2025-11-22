/**
 * Sidebar 狀態管理 Store
 * 管理側邊欄的展開/收合狀態
 */

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

// ========================================
// Store 介面定義
// ========================================

interface SidebarStore {
  // === 狀態 ===
  /** 側邊欄是否收合 */
  isCollapsed: boolean;

  // === 操作 ===
  /** 切換側邊欄收合狀態 */
  toggleSidebar: () => void;

  /** 設定側邊欄收合狀態 */
  setCollapsed: (collapsed: boolean) => void;
}

// ========================================
// 初始狀態
// ========================================

const initialState = {
  isCollapsed: false,
};

// ========================================
// Store 實作
// ========================================

export const useSidebarStore = create<SidebarStore>()(
  devtools(
    (set) => ({
      ...initialState,

      toggleSidebar: () => {
        set((state) => ({ isCollapsed: !state.isCollapsed }));
      },

      setCollapsed: (collapsed: boolean) => {
        set({ isCollapsed: collapsed });
      },
    }),
    { name: 'SidebarStore' }
  )
);
