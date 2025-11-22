/**
 * 應用層級快捷鍵 Hook
 * 統一管理所有全域快捷鍵（非編輯器專用）
 */

import { useHotkeys } from 'react-hotkeys-hook';
import { useSidebarStore } from '@/stores/sidebarStore';

/**
 * 應用層級快捷鍵配置
 */
interface AppShortcutsConfig {
  /** 是否啟用快捷鍵（預設為 true） */
  enabled?: boolean;
}

/**
 * 應用層級快捷鍵 Hook
 * 在 MainLayout 中使用，統一管理所有全域快捷鍵
 *
 * @param config - 快捷鍵配置
 */
export function useAppShortcuts(config: AppShortcutsConfig = {}) {
  const { enabled = true } = config;
  const { toggleSidebar } = useSidebarStore();

  /**
   * ⌘ \ (Cmd/Ctrl + Backslash): 切換側邊欄
   */
  useHotkeys(
    'mod+\\',
    (e) => {
      e.preventDefault();
      toggleSidebar();
    },
    {
      enabled,
      enableOnFormTags: false, // 在輸入框中不觸發
      enableOnContentEditable: false, // 在可編輯內容中不觸發
      preventDefault: true,
    },
    [toggleSidebar]
  );

  /**
   * 未來可以在這裡新增更多全域快捷鍵
   * 例如:
   * - ⌘ K: 開啟命令面板
   * - ⌘ P: 快速搜尋
   * - ⌘ N: 新增文件
   * 等等...
   */

  // 範例: ⌘ K - 開啟命令面板
  // useHotkeys(
  //   'mod+k',
  //   (e) => {
  //     e.preventDefault();
  //     // 開啟命令面板的邏輯
  //   },
  //   {
  //     enabled,
  //     enableOnFormTags: false,
  //     enableOnContentEditable: false,
  //     preventDefault: true,
  //   }
  // );
}
