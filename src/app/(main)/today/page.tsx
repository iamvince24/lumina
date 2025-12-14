/**
 * 今天的編輯頁面
 * 路由: /today
 */

'use client';

import { useEffect } from 'react';
import { NewMindMapEditor } from '@/components/NewMindMapEditor';
import { RecentTopicsSidebar } from '@/components/TopicSystem/RecentTopicsSidebar';
import { DecoratorDots } from '@/components/DecoratorDots';
import { useMindMapByDate } from '@/hooks/useMindmap';
import { useTabStore } from '@/stores/tabStore';
import { useNewMindMapStore } from '@/stores/newMindMapStore';

export default function TodayPage() {
  // 取得今天的 MindMap
  const today = new Date();
  const { data: mindmap, isLoading, error } = useMindMapByDate(today);
  const { addTab } = useTabStore();
  const { loadFromSerialized, reset } = useNewMindMapStore();

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
      // 將 API 格式的 nodes 轉換為新格式
      const storedNodes = mindmap.nodes.map((node) => ({
        id: node.id,
        content: node.data.label || '',
        position: node.position,
        size: { width: 200, height: 40 },
        parentId: (node as { parentNode?: string }).parentNode || null,
        children: [] as string[],
        isCollapsed: false,
        style: {
          backgroundColor: 'transparent',
          textColor: '#333333',
          borderColor: 'transparent',
          borderWidth: 0,
          borderRadius: 8,
          fontSize: 14,
          fontWeight: 'normal' as const,
          padding: 12,
        },
        tags: (
          node.data as {
            tags?: Array<{ id: string; name: string; color: string }>;
          }
        ).tags,
        metadata: {
          createdAt:
            (node.data as { createdAt?: Date }).createdAt?.toISOString() ||
            new Date().toISOString(),
          updatedAt:
            (node.data as { updatedAt?: Date }).updatedAt?.toISOString() ||
            new Date().toISOString(),
        },
      }));

      // 重建 children 關係
      storedNodes.forEach((node) => {
        const children = storedNodes
          .filter((n) => n.parentId === node.id)
          .map((n) => n.id);
        node.children = children;
      });

      loadFromSerialized(storedNodes);
    } else if (!isLoading && !error) {
      // 如果沒有資料且不是載入中或錯誤狀態，則重置 store（顯示空白畫布）
      reset();
    }
  }, [mindmap, isLoading, error, loadFromSerialized, reset]);

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
    <div className="flex h-full gap-4">
      {/* 左側欄：日期與最近筆記 */}
      <div className="w-80 flex flex-col gap-4">
        {/* 日期 Header */}
        <div className="px-2">
          <div className="text-4xl font-black text-gray-900">
            {today.getFullYear()}
          </div>
          <div className="text-3xl font-black text-gray-900">
            {today.getMonth() + 1}.{today.getDate()}{' '}
            {today.toLocaleDateString('en-US', { weekday: 'short' })}.
          </div>
        </div>

        {/* 最近的筆記 Card */}
        <div className="flex-1 bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
          <div className="p-6 pb-2">
            <h2 className="text-lg font-medium text-gray-700">最近的筆記</h2>
          </div>
          <div className="flex-1 overflow-hidden">
            <RecentTopicsSidebar />
          </div>
        </div>
      </div>

      {/* 中間裝飾點點 */}
      <DecoratorDots />

      {/* 右側主編輯區域 Card */}
      <div className="flex-1 bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden relative">
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          {/* Placeholder for Editor Label if needed, or just keep it clean as per design */}
          {/* <span className="text-gray-400 font-medium">編輯器</span> */}
        </div>
        <NewMindMapEditor mindmapId={mindmap?.id || 'today'} />
      </div>
    </div>
  );
}
