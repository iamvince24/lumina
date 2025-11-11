/**
 * Topic 詳細頁
 * 路由: /topics/[topicId]
 */

'use client';

import { useEffect } from 'react';
import { TopicHeader } from '@/components/TopicSystem/TopicHeader';
import { TopicViewSwitcher } from '@/components/TopicSystem/TopicViewSwitcher';
import { IntegratedView } from '@/components/TopicSystem/IntegratedView';
import { TopicCardView } from '@/components/TopicSystem/TopicCardView';
import { TimelineView } from '@/components/TopicSystem/TimelineView';
import { useViewModeStore } from '@/stores/viewModeStore';
import { useTabStore } from '@/stores/tabStore';
import { useMockTopicById } from '@/__mocks__/hooks';

interface TopicDetailPageProps {
  params: {
    topicId: string;
  };
}

/**
 * Topic 詳細頁
 */
export default function TopicDetailPage({ params }: TopicDetailPageProps) {
  const { topicId } = params;
  const currentTopicView = useViewModeStore((state) => state.currentTopicView);
  const { addTab } = useTabStore();
  const { data: topic } = useMockTopicById(topicId);

  // 在頁面載入時自動建立 Tab
  useEffect(() => {
    if (topic) {
      addTab({
        type: 'topic',
        title: topic.name,
        url: `/topics/${topicId}`,
        isPinned: false,
      });
    }
  }, [addTab, topicId, topic]);

  return (
    <div className="flex flex-col h-screen bg-white">
      {/* Topic 標題和統計資訊 */}
      <TopicHeader topicId={topicId} />

      {/* 視圖切換器 */}
      <TopicViewSwitcher />

      {/* 視圖內容區域 */}
      <div className="flex-1 overflow-y-auto p-6">
        {currentTopicView === 'integrated' && (
          <IntegratedView topicId={topicId} />
        )}
        {currentTopicView === 'card' && <TopicCardView topicId={topicId} />}
        {currentTopicView === 'timeline' && <TimelineView topicId={topicId} />}
      </div>
    </div>
  );
}
