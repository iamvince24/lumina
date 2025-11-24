'use client';

import { useEffect } from 'react';
import { KonvaView } from '@/components/MindMapEditor/KonvaView';
import { useMindMapStore } from '@/stores/mindmapStore';
import { loadMindMap } from '@/services/localStorage/mindmapStorage';

/**
 * Konva.js + Canvas 心智圖編輯器實驗頁面
 * 用於驗證 Konva.js 實作的可行性
 * 路由: /konva-mindmap-editor
 *
 * 資料完全儲存於 localStorage，無需後端連接
 */
export default function KonvaMindMapEditorPage() {
  const loadMindMapData = useMindMapStore((state) => state.loadMindMap);

  // 初始化：從 localStorage 載入資料
  useEffect(() => {
    const data = loadMindMap();
    loadMindMapData(data.nodes, data.edges);
  }, [loadMindMapData]);

  // 渲染 KonvaView 組件
  return (
    <div className="h-screen w-full">
      <KonvaView />
    </div>
  );
}
