/**
 * 心智圖編輯器主要組件
 * 整合三種視圖模式和自動儲存功能
 */

'use client';

import { useEffect, useState, useCallback } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import { Download } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useViewModeStore } from '@/stores/viewModeStore';
import { useAutoSave } from '@/hooks/useAutoSave';
import { useMindMapStore } from '@/stores/mindmapStore';
import { useTagStore } from '@/stores/tagStore';
import { SaveStatusIndicator } from '@/components/SaveStatusIndicator';
import { TagDialog } from '@/components/TagSystem/TagDialog';
import { ExportDialog } from '@/components/ExportSystem/ExportDialog';
import { DataManagement } from './DataManagement';
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

  // Tag Dialog 狀態
  const [tagDialogOpen, setTagDialogOpen] = useState(false);
  const [selectedNodeForTag, setSelectedNodeForTag] = useState<string | null>(
    null
  );

  // Export Dialog 狀態
  const [exportDialogOpen, setExportDialogOpen] = useState(false);

  // 取得當前選中的 node
  const selectedNodeIds = useMindMapStore((state) => state.selectedNodeIds);
  const nodes = useMindMapStore((state) => state.nodes);
  const edges = useMindMapStore((state) => state.edges);
  const updateNode = useMindMapStore((state) => state.updateNode);

  // 啟用自動儲存（唯讀模式下不啟用）
  const { saveNow } = useAutoSave({
    mindmapId,
    debounceMs: 2000,
    enableOfflineStorage: true,
    enabled: !readonly,
  });

  /**
   * 開啟 Tag Dialog
   */
  const openTagDialog = useCallback(() => {
    if (selectedNodeIds.length === 0) {
      // TODO: 顯示提示「請先選擇一個 node」
      return;
    }

    // 只支援單個 node 加 tag
    const nodeId = selectedNodeIds[0];
    setSelectedNodeForTag(nodeId);
    setTagDialogOpen(true);
  }, [selectedNodeIds]);

  /**
   * 儲存 Node 的 Tags
   * 直接更新到本地 store，由自動儲存處理 localStorage 同步
   */
  const handleSaveTags = (tagIds: string[]) => {
    if (!selectedNodeForTag) return;

    try {
      // 更新 node 的 tags 資料
      const node = nodes.find((n) => n.id === selectedNodeForTag);
      if (node) {
        // 從 tagStore 取得 tag 資訊
        const tags = useTagStore.getState().tags;
        const nodeTags = tagIds
          .map((tagId) => tags.find((t) => t.id === tagId))
          .filter((t): t is NonNullable<typeof t> => t !== undefined)
          .map((t) => ({ id: t.id, name: t.name, color: t.color }));

        updateNode({
          id: selectedNodeForTag,
          data: {
            ...node.data,
            tags: nodeTags,
          },
        });
      }
    } catch (error) {
      console.error('Failed to update tags:', error);
    }
  };

  // 註冊快捷鍵 Cmd+Shift+T
  useHotkeys('cmd+shift+t, ctrl+shift+t', openTagDialog, {
    enableOnFormTags: false,
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
    <div className="w-full h-screen flex flex-col bg-gray-50 mindmap-editor">
      {/* 儲存狀態指示器（唯讀模式下不顯示） */}
      {!readonly && <SaveStatusIndicator />}

      {/* Header */}
      <div className="h-16 border-b border-gray-200 bg-white px-6 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-gray-800">心智圖編輯器</h1>

        <div className="flex items-center gap-2">
          {/* 資料管理 */}
          <DataManagement />

          {/* 匯出按鈕 */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setExportDialogOpen(true)}
          >
            <Download className="w-4 h-4 mr-2" />
            匯出
          </Button>

          {/* 視圖切換器 */}
          <ViewSwitcher mindmapId={mindmapId} />
        </div>
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

      {/* Tag Dialog */}
      <TagDialog
        open={tagDialogOpen}
        onClose={() => setTagDialogOpen(false)}
        nodeId={selectedNodeForTag || ''}
        currentTags={
          selectedNodeForTag
            ? nodes
                .find((n) => n.id === selectedNodeForTag)
                ?.data.tags?.map((t) => t.id) || []
            : []
        }
        onSave={handleSaveTags}
      />

      {/* 匯出 Dialog */}
      <ExportDialog
        open={exportDialogOpen}
        onClose={() => setExportDialogOpen(false)}
        nodes={nodes}
        edges={edges}
      />
    </div>
  );
}
