/**
 * 主應用 Layout
 * 包含側邊欄和 Header
 */
'use client';

import { Suspense, useEffect } from 'react';
import Link from 'next/link';
import { Trash2, FileText, Hash, Calendar, Home, Star } from 'lucide-react';
import { TabSystem } from '@/components/TabSystem';
import { Header } from '@/components/Header';
import { CommandPalette } from '@/components/CommandPalette';
import { Onboarding } from '@/components/Onboarding';
import { useAuthStore } from '@/stores/authStore';
import { useTabStore } from '@/stores/tabStore';

// 假資料：最近的文件
const mockRecentFiles = [
  { id: '1', title: 'React 狀態管理', date: '2024-11-15', url: '/editor/1' },
  { id: '2', title: 'TypeScript 進階技巧', date: '2024-11-14', url: '/editor/2' },
  { id: '3', title: 'Next.js 路由系統', date: '2024-11-13', url: '/editor/3' },
  { id: '4', title: '資料庫設計原則', date: '2024-11-12', url: '/editor/4' },
  { id: '5', title: 'API 設計最佳實踐', date: '2024-11-11', url: '/editor/5' },
];

// 假資料：Topics
const mockTopics = [
  { id: 't1', name: 'React', count: 12, color: '#61dafb' },
  { id: 't2', name: 'TypeScript', count: 8, color: '#3178c6' },
  { id: 't3', name: 'Next.js', count: 15, color: '#000000' },
  { id: 't4', name: '資料庫', count: 6, color: '#4479a1' },
  { id: 't5', name: 'DevOps', count: 4, color: '#326ce5' },
];

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);
  const addTab = useTabStore((state) => state.addTab);
  const tabs = useTabStore((state) => state.tabs);

  // 初始化假的使用者資料
  useEffect(() => {
    if (!user) {
      setUser(
        {
          id: 'user-001',
          email: 'demo@lumina.app',
          name: '示範用戶',
        },
        'mock-token-12345'
      );
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
  }, []); // 只在首次渲染時執行

  // 判斷是否為新使用者（註冊後 24 小時內）
  const isNewUser = user
    ? false // 簡化版本，實際應該檢查 user.createdAt
    : false;

  return (
    <>
      <div className="flex h-screen bg-gray-50">
        {/* 側邊欄 */}
        <aside className="w-64 bg-white border-r border-gray-200 flex flex-col overflow-y-auto">
          <div className="p-4">
            <h2 className="text-lg font-semibold">Lumina</h2>
          </div>

          {/* 主要導航 */}
          <nav className="px-4 mb-6">
            <Link
              href="/today"
              className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors rounded-lg mb-1"
            >
              <Home className="w-5 h-5" />
              <span>首頁</span>
            </Link>
            <Link
              href="/calendar"
              className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors rounded-lg mb-1"
            >
              <Calendar className="w-5 h-5" />
              <span>月曆視圖</span>
            </Link>
            <Link
              href="/recently-deleted"
              className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors rounded-lg"
            >
              <Trash2 className="w-5 h-5" />
              <span>最近刪除</span>
            </Link>
          </nav>

          {/* 最近的文件 */}
          <div className="px-4 mb-6">
            <div className="flex items-center gap-2 px-4 mb-2">
              <FileText className="w-4 h-4 text-gray-500" />
              <h3 className="text-sm font-semibold text-gray-600">最近的文件</h3>
            </div>
            <div className="space-y-1">
              {mockRecentFiles.map((file) => (
                <Link
                  key={file.id}
                  href={file.url}
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors rounded-lg"
                >
                  <div className="font-medium truncate">{file.title}</div>
                  <div className="text-xs text-gray-500">{file.date}</div>
                </Link>
              ))}
            </div>
          </div>

          {/* Topics */}
          <div className="px-4 mb-6">
            <div className="flex items-center gap-2 px-4 mb-2">
              <Hash className="w-4 h-4 text-gray-500" />
              <h3 className="text-sm font-semibold text-gray-600">Topics</h3>
            </div>
            <div className="space-y-1">
              {mockTopics.map((topic) => (
                <Link
                  key={topic.id}
                  href={`/topics/${topic.id}`}
                  className="flex items-center justify-between px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors rounded-lg group"
                >
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: topic.color }}
                    />
                    <span className="font-medium">{topic.name}</span>
                  </div>
                  <span className="text-xs text-gray-500 group-hover:text-gray-700">
                    {topic.count}
                  </span>
                </Link>
              ))}
            </div>
          </div>

          {/* 收藏夾 */}
          <div className="px-4 mt-auto pb-4">
            <div className="flex items-center gap-2 px-4 mb-2">
              <Star className="w-4 h-4 text-gray-500" />
              <h3 className="text-sm font-semibold text-gray-600">收藏夾</h3>
            </div>
            <div className="text-sm text-gray-500 px-4 py-2">
              尚無收藏的項目
            </div>
          </div>
        </aside>

        {/* 主內容區域 */}
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <Header />

          {/* Tab 系統 - 使用 Suspense 包裹以優化載入 */}
          <Suspense fallback={<div className="h-10 bg-gray-50" />}>
            <TabSystem />
          </Suspense>

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
