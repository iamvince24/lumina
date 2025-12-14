/**
 * 特定日期編輯器
 * 路由: /editor/[date]
 */

'use client';

import { useEffect } from 'react';
import { notFound } from 'next/navigation';
import { isValid, parseISO } from 'date-fns';
import { NewMindMapEditor } from '@/components/NewMindMapEditor';
import { useMockMindMapByDate } from '@/__mocks__/hooks';
import { useTabStore } from '@/stores/tabStore';
import { useNewMindMapStore } from '@/stores/newMindMapStore';

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
  const { loadFromSerialized, reset } = useNewMindMapStore();

  // 在頁面載入時自動建立 Tab
  useEffect(() => {
    addTab({
      type: 'editor',
      title: `編輯器 - ${params.date}`,
      url: `/editor/${params.date}`,
      isPinned: false,
    });
  }, [addTab, params.date]);

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

  // 沒有 mindmap
  if (!mindmap) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-gray-600">無法載入心智圖</div>
      </div>
    );
  }

  return <NewMindMapEditor mindmapId={mindmap.id} />;
}
