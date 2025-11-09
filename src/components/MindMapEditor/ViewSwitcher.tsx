/**
 * 視圖切換組件
 * 提供三種視圖模式的切換介面
 */

import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useViewModeStore } from '@/stores/viewModeStore';
import type { ViewMode } from '@/types/view';

/**
 * 視圖模式選項
 */
const viewModeOptions: Array<{
  value: ViewMode;
  label: string;
  icon: string;
}> = [
  { value: 'radial', label: '放射狀', icon: '🎯' },
  { value: 'outliner', label: '大綱', icon: '📋' },
  { value: 'logicChart', label: '邏輯圖', icon: '🌳' },
];

interface ViewSwitcherProps {
  /** 當前 MindMap ID（用於儲存偏好） */
  mindmapId?: string;
}

/**
 * 視圖切換組件
 */
export function ViewSwitcher({ mindmapId }: ViewSwitcherProps) {
  const { currentView, switchView, isSwitching } = useViewModeStore();

  /**
   * 處理視圖切換
   */
  const handleViewChange = (value: string) => {
    switchView(value as ViewMode, mindmapId);
  };

  return (
    <Tabs
      value={currentView}
      onValueChange={handleViewChange}
      className="w-auto"
    >
      <TabsList>
        {viewModeOptions.map((option) => (
          <TabsTrigger
            key={option.value}
            value={option.value}
            disabled={isSwitching}
            className="gap-2"
          >
            <span>{option.icon}</span>
            <span>{option.label}</span>
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}
