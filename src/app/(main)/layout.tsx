/**
 * 主應用 Layout
 * 包含側邊欄和 Header
 */
'use client';

import { Suspense, useEffect } from 'react';
import { CommandPalette } from '@/components/CommandPalette';
import { Onboarding } from '@/components/Onboarding';
import { Sidebar } from '@/components/Sidebar/Sidebar';
import { useAuthStore } from '@/stores/authStore';
import { useTabStore } from '@/stores/tabStore';
import { useSidebarStore } from '@/stores/sidebarStore';
import { useAppShortcuts } from '@/hooks/useAppShortcuts';
import { cn } from '@/utils';

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);
  const addTab = useTabStore((state) => state.addTab);
  const tabs = useTabStore((state) => state.tabs);
  const { isCollapsed } = useSidebarStore();

  // 統一管理應用層級快捷鍵
  useAppShortcuts();

  // 初始化真實的 Supabase 使用者資料
  useEffect(() => {
    const initAuth = async () => {
      // 動態導入以避免 SSR 問題
      const { createClient } = await import('@/lib/supabase/client');
      const supabase = createClient();

      // 獲取當前 session
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session?.user) {
        setUser(
          {
            id: session.user.id,
            email: session.user.email || null,
            name:
              session.user.user_metadata?.name || session.user.email || null,
          },
          session.access_token
        );
      }
    };

    if (!user) {
      initAuth();
    }
  }, [user, setUser]);

  // 初始化假的 tabs
  useEffect(() => {
    if (tabs.length === 0) {
      // 添加今天的編輯頁面
      addTab({
        type: 'today',
        title: '今天',
        url: '/today',
        isPinned: true,
      });

      // 添加一個 topic
      addTab({
        type: 'topic',
        title: 'React',
        url: '/topics/t1',
        isPinned: false,
      });

      // 添加月曆視圖
      addTab({
        type: 'calendar',
        title: '月曆',
        url: '/calendar',
        isPinned: false,
      });
    }
  }, [addTab, tabs]); // 只在首次渲染時執行

  // 判斷是否為新使用者（註冊後 24 小時內）
  const isNewUser = user
    ? false // 簡化版本，實際應該檢查 user.createdAt
    : false;

  return (
    <>
      <div
        className={cn(
          'flex h-screen bg-gray-100 p-3 overflow-hidden',
          !isCollapsed && 'gap-3'
        )}
      >
        {/* 側邊欄 */}
        <Sidebar className="rounded-2xl border border-gray-200/60 shadow-sm bg-white/80 backdrop-blur-xl" />

        {/* 主內容區域 */}
        <div className="flex-1 flex flex-col overflow-hidden rounded-2xl border border-gray-200/60 shadow-sm bg-white mt-[40px]">
          {/* Header */}
          {/* <Header /> */}

          {/* Tab 系統 - 使用 Suspense 包裹以優化載入 */}
          {/* <Suspense fallback={<div className="h-10 bg-gray-50" />}>
            <TabSystem />
          </Suspense> */}

          {/* 頁面內容 - 使用 Suspense 包裹以優化載入 */}
          <main className="flex-1 overflow-auto">
            <Suspense
              fallback={
                <div className="flex items-center justify-center h-full">
                  <div className="text-gray-600">載入中...</div>
                </div>
              }
            >
              {children}
            </Suspense>
          </main>
        </div>

        {/* 命令面板（全域） */}
        <CommandPalette />
      </div>

      {/* Onboarding */}
      <Onboarding isNewUser={isNewUser} />
    </>
  );
}
