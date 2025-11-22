/**
 * 今天的編輯頁面
 * 路由: /today
 */

'use client';

import { useEffect } from 'react';
import { MindMapEditor } from '@/components/MindMapEditor';
import { RecentTopicsSidebar } from '@/components/TopicSystem/RecentTopicsSidebar';
import { useMindMapByDate } from '@/hooks/useMindmap';
import { useTabStore } from '@/stores/tabStore';
import { useMindMapStore } from '@/stores/mindmapStore';

export default function TodayPage() {
  // 取得今天的 MindMap
  const today = new Date();
  const { data: mindmap, isLoading, error } = useMindMapByDate(today);
  const { addTab } = useTabStore();
  const { loadMindMap, reset } = useMindMapStore();

  // 在頁面載入時自動建立 Tab
  useEffect(() => {
    addTab({
      type: 'today',
      title: '今天',
      url: '/today',
      isPinned: true, // 預設釘選
    });
  }, [addTab]);

  // 當 mindmap 資料載入完成後，載入到 store
  useEffect(() => {
    if (mindmap) {
      loadMindMap(mindmap.nodes, mindmap.edges);
    } else if (!isLoading && !error) {
      // 如果沒有資料且不是載入中或錯誤狀態，則重置 store（顯示空白畫布）
      reset();
    }
  }, [mindmap, isLoading, error, loadMindMap, reset]);

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

  return (
    <div className="flex h-screen">
      {/* 主編輯區域 */}
      <div className="flex-1">
        <MindMapEditor mindmapId={mindmap?.id || 'today'} />
      </div>

      {/* 右側邊欄：最近使用的 Topics */}
      <RecentTopicsSidebar />
    </div>
  );
}
