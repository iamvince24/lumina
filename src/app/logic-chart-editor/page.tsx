'use client';

import { useEffect } from 'react';
import { LogicChartView } from '@/components/MindMapEditor/LogicChartView';
import { useMindMapStore } from '@/stores/mindmapStore';
import { loadMindMap } from '@/services/localStorage/mindmapStorage';
import { SaveStatusIndicator } from '@/components/SaveStatusIndicator';
import { useAutoSave } from '@/hooks/useAutoSave';
import { DataManagement } from '@/components/MindMapEditor/DataManagement';

/**
 * 獨立的邏輯圖編輯器頁面
 * 用於專注開發編輯器功能，無其他 UI 干擾
 * 路由: /logic-chart-editor
 *
 * 資料完全儲存於 localStorage，無需後端連接
 */
export default function LogicChartEditorPage() {
  const loadMindMapData = useMindMapStore((state) => state.loadMindMap);

  // 初始化：從 localStorage 載入資料
  useEffect(() => {
    const data = loadMindMap();
    loadMindMapData(data.nodes, data.edges);
  }, [loadMindMapData]);

  // 啟用自動儲存
  useAutoSave({
    mindmapId: 'local',
    debounceMs: 2000,
    enableOfflineStorage: true,
    enabled: true,
  });

  return (
    <div className="h-screen w-full flex flex-col">
      {/* 儲存狀態指示器 */}
      <SaveStatusIndicator />

      {/* Header */}
      <div className="h-16 border-b border-gray-200 bg-white px-6 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-gray-800">邏輯圖編輯器</h1>

        <div className="flex items-center gap-2">
          {/* 資料管理 */}
          <DataManagement />
        </div>
      </div>

      {/* 邏輯圖視圖 */}
      <div className="flex-1">
        <LogicChartView />
      </div>
    </div>
  );
}
