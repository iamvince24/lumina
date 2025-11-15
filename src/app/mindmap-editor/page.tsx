'use client';

import { MindMapEditor } from '@/components/MindMapEditor';
import { useMockMindMapByDate } from '@/__mocks__/hooks';

/**
 * 獨立的心智圖編輯器頁面
 * 用於專注開發編輯器功能，無其他 UI 干擾
 * 路由: /mindmap-editor
 */
export default function MindMapEditorPage() {
  // 使用今天的日期載入測試資料
  const { data: mindmap, isLoading, error } = useMockMindMapByDate(new Date());

  // 載入中狀態
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-muted-foreground">載入編輯器中...</div>
      </div>
    );
  }

  // 錯誤狀態
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-4">
        <div className="text-destructive">載入失敗: {error.message}</div>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
        >
          重新載入
        </button>
      </div>
    );
  }

  // 沒有資料
  if (!mindmap) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-muted-foreground">無法載入心智圖資料</div>
      </div>
    );
  }

  // 渲染純粹的編輯器
  return (
    <div className="h-screen w-full">
      <MindMapEditor mindmapId={mindmap.id} />
    </div>
  );
}
