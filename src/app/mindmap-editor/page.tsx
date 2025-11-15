'use client';

import { useEffect } from 'react';
import { MindMapEditor } from '@/components/MindMapEditor';
import { useMindMapStore } from '@/stores/mindmapStore';
import { loadMindMap } from '@/services/localStorage/mindmapStorage';

/**
 * 獨立的心智圖編輯器頁面
 * 用於專注開發編輯器功能，無其他 UI 干擾
 * 路由: /mindmap-editor
 *
 * 資料完全儲存於 localStorage，無需後端連接
 */
export default function MindMapEditorPage() {
  const loadMindMapData = useMindMapStore((state) => state.loadMindMap);

  // 初始化：從 localStorage 載入資料
  useEffect(() => {
    const data = loadMindMap();
    loadMindMapData(data.nodes, data.edges);
  }, [loadMindMapData]);

  // 渲染純粹的編輯器
  // 使用固定的 ID "local" 因為只有單一心智圖
  return (
    <div className="h-screen w-full">
      <MindMapEditor mindmapId="local" />
    </div>
  );
}
