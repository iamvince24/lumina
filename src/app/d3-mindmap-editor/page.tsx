'use client';

import { useEffect } from 'react';
import { D3View } from '@/components/MindMapEditor/D3View';
import { useMindMapStore } from '@/stores/mindmapStore';
import { loadMindMap } from '@/services/localStorage/mindmapStorage';

/**
 * D3.js + SVG 心智圖編輯器實驗頁面
 * 用於驗證 D3.js 實作的可行性
 * 路由: /d3-mindmap-editor
 *
 * 資料完全儲存於 localStorage，無需後端連接
 */
export default function D3MindMapEditorPage() {
  const loadMindMapData = useMindMapStore((state) => state.loadMindMap);

  // 初始化：從 localStorage 載入資料
  useEffect(() => {
    const data = loadMindMap();
    loadMindMapData(data.nodes, data.edges);
  }, [loadMindMapData]);

  // 渲染 D3View 組件
  return (
    <div className="h-screen w-full">
      <D3View />
    </div>
  );
}
