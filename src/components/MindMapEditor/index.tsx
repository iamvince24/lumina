/**
 * 心智圖編輯器主要組件
 * 整合三種視圖模式和自動儲存功能
 */

'use client';

import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useViewModeStore } from '@/stores/viewModeStore';
import { useAutoSave } from '@/hooks/useAutoSave';
import { SaveStatusIndicator } from '@/components/SaveStatusIndicator';
import { ViewSwitcher } from './ViewSwitcher';
import { RadialView } from './RadialView';
import { OutlinerView } from './OutlinerView';
import { LogicChartView } from './LogicChartView';

interface MindMapEditorProps {
  /** MindMap ID */
  mindmapId: string;

  /** 是否唯讀模式 */
  readonly?: boolean;
}

/**
 * 心智圖編輯器組件
 */
export function MindMapEditor({
  mindmapId,
  readonly = false,
}: MindMapEditorProps) {
  const { currentView, getViewPreference } = useViewModeStore();

  // 啟用自動儲存（唯讀模式下不啟用）
  const { saveNow } = useAutoSave({
    mindmapId,
    debounceMs: 2000,
    enableOfflineStorage: true,
    enabled: !readonly,
  });

  /**
   * 載入視圖偏好（僅在首次載入時）
   */
  useEffect(() => {
    const preference = getViewPreference(mindmapId);
    if (preference && preference.viewMode !== currentView) {
      // 直接設定視圖，不觸發動畫（因為是初始載入）
      useViewModeStore.setState({
        currentView: preference.viewMode,
        layoutDirection: preference.layoutDirection || 'TB',
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mindmapId]); // 只在 mindmapId 變更時執行

  /**
   * 視圖切換動畫配置
   */
  const viewAnimationVariants = {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.95 },
  };

  return (
    <div className="w-full h-screen flex flex-col bg-gray-50">
      {/* 儲存狀態指示器（唯讀模式下不顯示） */}
      {!readonly && <SaveStatusIndicator />}

      {/* Header */}
      <div className="h-16 border-b border-gray-200 bg-white px-6 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-gray-800">心智圖編輯器</h1>

        {/* 視圖切換器 */}
        <ViewSwitcher mindmapId={mindmapId} />
      </div>

      {/* 視圖容器 */}
      <div className="flex-1 relative overflow-hidden">
        <AnimatePresence mode="wait">
          {currentView === 'radial' && (
            <motion.div
              key="radial"
              className="absolute inset-0"
              variants={viewAnimationVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.2 }}
            >
              <RadialView />
            </motion.div>
          )}

          {currentView === 'outliner' && (
            <motion.div
              key="outliner"
              className="absolute inset-0"
              variants={viewAnimationVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.2 }}
            >
              <OutlinerView />
            </motion.div>
          )}

          {currentView === 'logicChart' && (
            <motion.div
              key="logicChart"
              className="absolute inset-0"
              variants={viewAnimationVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.2 }}
            >
              <LogicChartView />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 手動儲存按鈕（可選，用於測試） */}
      {!readonly && process.env.NODE_ENV === 'development' && (
        <button
          onClick={saveNow}
          className="absolute bottom-4 right-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors z-50"
        >
          立即儲存
        </button>
      )}
    </div>
  );
}
