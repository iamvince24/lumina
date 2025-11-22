/**
 * 最近使用的 Topics 側邊欄
 * 使用 Mock 資料顯示最近的 Topics
 */

'use client';

import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { Clock, TrendingUp } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { useMockRecentTopics } from '@/__mocks__/hooks';

/**
 * Topic 項目組件
 */
interface TopicItemProps {
  /** Topic ID */
  topicId: string;

  /** Topic 名稱 */
  name: string;

  /** 累積次數 */
  count: number;

  /** 最後更新時間 */
  lastUpdated: Date;

  /** Topic 顏色 */
  color?: string;

  /** 點擊回調 */
  onClick: () => void;
}

function TopicItem({
  name,
  count,
  lastUpdated,
  color,
  onClick,
}: TopicItemProps) {
  return (
    <div
      onClick={onClick}
      className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
    >
      {/* Topic 名稱 */}
      <div className="flex items-center gap-2 mb-2">
        {/* 顏色標記 */}
        {color && (
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: color }}
          />
        )}
        <div className="font-medium text-gray-900">{name}</div>
      </div>

      {/* 統計資訊 */}
      <div className="flex items-center justify-between text-sm text-gray-600">
        {/* 累積次數 */}
        <div className="flex items-center gap-1">
          <TrendingUp className="w-4 h-4" />
          <span>{count} 次</span>
        </div>

        {/* 最後更新時間 */}
        <div className="flex items-center gap-1">
          <Clock className="w-4 h-4" />
          <span>{format(lastUpdated, 'MM/dd')}</span>
        </div>
      </div>
    </div>
  );
}

/**
 * 最近使用的 Topics 側邊欄
 */
export function RecentTopicsSidebar() {
  const router = useRouter();

  // 使用 Mock Hook 查詢最近的 Topics
  const { data: recentTopics, isLoading } = useMockRecentTopics(10);

  /**
   * 處理 Topic 點擊
   */
  const handleTopicClick = (topicId: string) => {
    router.push(`/topics/${topicId}`);
  };

  return (
    <div className="h-full overflow-y-auto">
      <div className="px-4 pb-4">
        {/* 載入中狀態 */}
        {isLoading && (
          <div className="text-center text-gray-600 py-8">載入中...</div>
        )}

        {/* 沒有 Topics */}
        {!isLoading && (!recentTopics || recentTopics.length === 0) && (
          <div className="text-center text-gray-500 py-8">
            <p className="mb-2">尚未建立任何 Topic</p>
            <p className="text-sm">開始編輯心智圖時建立 Topic 吧！</p>
          </div>
        )}

        {/* Topics 列表 */}
        {!isLoading && recentTopics && recentTopics.length > 0 && (
          <div className="space-y-3">
            {recentTopics.map((topic) => (
              <TopicItem
                key={topic.id}
                topicId={topic.id}
                name={topic.name}
                count={topic.nodeCount}
                lastUpdated={topic.lastUpdated}
                color={topic.color}
                onClick={() => handleTopicClick(topic.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
