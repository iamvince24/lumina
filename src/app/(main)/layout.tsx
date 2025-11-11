/**
 * 主應用 Layout
 * 包含側邊欄和 Header
 */
import { Suspense } from 'react';
import Link from 'next/link';
import { Trash2 } from 'lucide-react';
import { TabSystem } from '@/components/TabSystem';
import { Header } from '@/components/Header';
import { CommandPalette } from '@/components/CommandPalette';

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen bg-gray-50">
      {/* TODO: 側邊欄組件 */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4">
          <h2 className="text-lg font-semibold">Lumina</h2>
        </div>
        <nav className="flex-1 px-4">
          <Link
            href="/recently-deleted"
            className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors rounded-lg"
          >
            <Trash2 className="w-5 h-5" />
            <span>最近刪除</span>
          </Link>
        </nav>
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
  );
}
