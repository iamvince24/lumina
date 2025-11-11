/**
 * 今天的編輯頁面
 * 路由: /today
 */

'use client';

import { useEffect } from 'react';
import { MindMapEditor } from '@/components/MindMapEditor';
import { RecentTopicsSidebar } from '@/components/TopicSystem/RecentTopicsSidebar';
import { useMockMindMapByDate } from '@/__mocks__/hooks';
import { useTabStore } from '@/stores/tabStore';

export default function TodayPage() {
  // 取得今天的 MindMap
  const today = new Date();
  const { data: mindmap, isLoading, error } = useMockMindMapByDate(today);
  const { addTab } = useTabStore();

  // 在頁面載入時自動建立 Tab
  useEffect(() => {
    addTab({
      type: 'today',
      title: '今天',
      url: '/today',
      isPinned: true, // 預設釘選
    });
  }, [addTab]);

  // 載入中狀態
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-gray-600">載入中...</div>
      </div>
    );
  }

  // 錯誤狀態
  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-red-600">載入失敗: {error.message}</div>
      </div>
    );
  }

  // 沒有 mindmap (不應該發生)
  if (!mindmap) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-gray-600">無法載入心智圖</div>
      </div>
    );
  }

  return (
    <div className="flex h-screen">
      {/* 主編輯區域 */}
      <div className="flex-1">
        <MindMapEditor mindmapId={mindmap.id} />
      </div>

      {/* 右側邊欄：最近使用的 Topics */}
      <RecentTopicsSidebar />
    </div>
  );
}
