/**
 * 特定日期編輯器
 * 路由: /editor/[date]
 */

'use client';

import { useEffect } from 'react';
import { notFound } from 'next/navigation';
import { isValid, parseISO } from 'date-fns';
import { MindMapEditor } from '@/components/MindMapEditor';
import { useMockMindMapByDate } from '@/__mocks__/hooks';
import { useTabStore } from '@/stores/tabStore';

interface EditorPageProps {
  params: {
    date: string;
  };
}

export default function EditorPage({ params }: EditorPageProps) {
  // 驗證日期格式
  const parsedDate = parseISO(params.date);

  if (!isValid(parsedDate)) {
    notFound(); // 顯示 404 頁面
  }

  // 取得該日期的 MindMap
  const { data: mindmap, isLoading, error } = useMockMindMapByDate(parsedDate);
  const { addTab } = useTabStore();

  // 在頁面載入時自動建立 Tab
  useEffect(() => {
    addTab({
      type: 'editor',
      title: `編輯器 - ${params.date}`,
      url: `/editor/${params.date}`,
      isPinned: false,
    });
  }, [addTab, params.date]);

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

  // 沒有 mindmap
  if (!mindmap) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-gray-600">無法載入心智圖</div>
      </div>
    );
  }

  return <MindMapEditor mindmapId={mindmap.id} />;
}
