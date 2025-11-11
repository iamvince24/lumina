/**
 * Tab 系統組件
 *
 * 功能：
 * - 顯示所有開啟的 Tab
 * - 達到上限時顯示提示
 * - 支援 Tab 切換、關閉、釘選
 */
'use client';

import { useRouter } from 'next/navigation';
import { AlertCircle } from 'lucide-react';
import { useTabStore, type Tab } from '@/stores/tabStore';
import { TabItem } from './TabItem';
import { Alert, AlertDescription } from '@/components/ui/alert';

export function TabSystem() {
  const router = useRouter();
  const {
    tabs,
    activeTabId,
    closeTab,
    setActiveTab,
    pinTab,
    unpinTab,
    canAddTab,
  } = useTabStore();

  const handleTabClick = (tab: Tab) => {
    setActiveTab(tab.id);
    router.push(tab.url);
  };

  const handleTabClose = (tabId: string) => {
    closeTab(tabId);
  };

  const handleTabPin = (tabId: string) => {
    const tab = tabs.find((t) => t.id === tabId);
    if (tab?.isPinned) {
      unpinTab(tabId);
    } else {
      pinTab(tabId);
    }
  };

  // 檢查是否達到 Tab 上限
  const isAtLimit = tabs.length >= 5;
  const canAdd = canAddTab();

  if (tabs.length === 0) {
    return null;
  }

  return (
    <div>
      {/* Tab 列表 */}
      <div className="flex items-center border-b border-gray-200 bg-gray-50 overflow-x-auto">
        {tabs.map((tab) => (
          <TabItem
            key={tab.id}
            tab={tab}
            isActive={tab.id === activeTabId}
            onClick={() => handleTabClick(tab)}
            onClose={() => handleTabClose(tab.id)}
            onPin={() => handleTabPin(tab.id)}
          />
        ))}
      </div>

      {/* 達到上限提示 */}
      {isAtLimit && !canAdd && (
        <Alert variant="warning" className="m-2">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            已達到 Tab 上限（5 個），且所有 Tab 都被釘選。請取消釘選或關閉某個
            Tab 後再開啟新的。
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
