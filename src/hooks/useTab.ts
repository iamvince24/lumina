/**
 * Tab 管理 Hook
 * 提供便利的 Tab 操作函式
 */
'use client';

import { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useTabStore } from '@/stores/tabStore';
import type { Tab } from '@/stores/tabStore';

export function useTab() {
  const router = useRouter();
  const { addTab, closeTab, setActiveTab } = useTabStore();

  /**
   * 開啟新 Tab
   */
  const openTab = useCallback(
    (tabData: Omit<Tab, 'id' | 'createdAt'>) => {
      addTab(tabData);
      router.push(tabData.url);
    },
    [addTab, router]
  );

  /**
   * 開啟特定日期的編輯器
   */
  const openEditorTab = useCallback(
    (date: string) => {
      openTab({
        type: 'editor',
        title: `編輯器 - ${date}`,
        url: `/editor/${date}`,
        isPinned: false,
      });
    },
    [openTab]
  );

  /**
   * 開啟 Topic 詳細頁
   */
  const openTopicTab = useCallback(
    (topicId: string, topicName: string) => {
      openTab({
        type: 'topic',
        title: topicName,
        url: `/topics/${topicId}`,
        isPinned: false,
      });
    },
    [openTab]
  );

  /**
   * 開啟今天的編輯頁面
   */
  const openTodayTab = useCallback(() => {
    openTab({
      type: 'today',
      title: '今天',
      url: '/today',
      isPinned: true, // 預設釘選
    });
  }, [openTab]);

  /**
   * 開啟月曆視圖
   */
  const openCalendarTab = useCallback(() => {
    openTab({
      type: 'calendar',
      title: '月曆',
      url: '/calendar',
      isPinned: false,
    });
  }, [openTab]);

  return {
    openTab,
    openEditorTab,
    openTopicTab,
    openTodayTab,
    openCalendarTab,
    closeTab,
    setActiveTab,
  };
}
