/**
 * Topic 視圖切換器
 * 提供三種視圖模式的切換：整合、卡片、時間軸
 */

'use client';

import { Grid, List, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useViewModeStore } from '@/stores/viewModeStore';
import type { TopicViewMode } from '@/types/view';

/**
 * 視圖選項配置
 */
const VIEW_OPTIONS: Array<{
  mode: TopicViewMode;
  label: string;
  icon: React.ReactNode;
  description: string;
}> = [
  {
    mode: 'integrated',
    label: '整合視圖',
    icon: <Grid className="w-4 h-4" />,
    description: '合併所有相關 nodes',
  },
  {
    mode: 'card',
    label: '卡片視圖',
    icon: <List className="w-4 h-4" />,
    description: '顯示第一層子 nodes',
  },
  {
    mode: 'timeline',
    label: '時間軸視圖',
    icon: <Clock className="w-4 h-4" />,
    description: '按日期顯示',
  },
];

/**
 * Topic 視圖切換器
 */
export function TopicViewSwitcher() {
  // 從 Zustand store 取得當前視圖模式和切換函式
  const currentView = useViewModeStore((state) => state.currentTopicView);
  const setTopicView = useViewModeStore((state) => state.setTopicView);

  return (
    <div className="border-b border-gray-200 px-6 py-4">
      <div className="flex items-center gap-2">
        {VIEW_OPTIONS.map((option) => {
          const isActive = currentView === option.mode;

          return (
            <Button
              key={option.mode}
              variant={isActive ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTopicView(option.mode)}
              className="flex items-center gap-2"
              title={option.description}
            >
              {option.icon}
              <span>{option.label}</span>
            </Button>
          );
        })}
      </div>
    </div>
  );
}
