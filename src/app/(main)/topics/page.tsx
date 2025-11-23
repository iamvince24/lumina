/**
 * Topic 列表頁
 * 顯示和管理所有 Topics
 */

'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search,
  Pin,
  MoreVertical,
  Edit,
  Trash,
  LayoutGrid,
  List,
} from 'lucide-react';
import { useParentTopics } from '@/hooks/useTopics';
import { useTopicStore } from '@/stores/topicStore';
import { TopicDialog } from '@/components/TopicSystem/TopicDialog';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { ParentTopicWithChildren } from '@/types/topic';

export default function TopicsPage() {
  const router = useRouter();
  const { data: parentTopics, isLoading, error } = useParentTopics();
  const { togglePinTopic, deleteTopic } = useTopicStore();

  // 對話框狀態
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTopic, setEditingTopic] = useState<
    ParentTopicWithChildren | undefined
  >(undefined);

  // 搜尋與檢視狀態
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  /**
   * 計算統計資料
   */
  const stats = useMemo(() => {
    if (!parentTopics) {
      return {
        totalTopics: 0,
        totalNodes: 0,
        pinnedCount: 0,
      };
    }

    const totalTopics = parentTopics.length;
    const totalNodes = parentTopics.reduce(
      (sum, topic) => sum + topic.accumulationCount,
      0
    );
    const pinnedCount = parentTopics.filter((t) => t.isPinned).length;

    return {
      totalTopics,
      totalNodes,
      pinnedCount,
    };
  }, [parentTopics]);

  /**
   * 過濾和排序 Topics
   */
  const filteredAndSortedTopics = useMemo(() => {
    if (!parentTopics) return [];

    // 1. 過濾
    const filtered = parentTopics.filter((topic) =>
      topic.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // 2. 排序：已釘選的排前面，其次按更新時間降序
    return filtered.sort((a, b) => {
      // 釘選的排在前面
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;

      // 釘選狀態相同時，按更新時間降序
      return b.updatedAt.getTime() - a.updatedAt.getTime();
    });
  }, [parentTopics, searchQuery]);

  /**
   * 處理卡片點擊 - 導航到 Topic 詳細頁
   */
  const handleCardClick = (topicId: string) => {
    router.push(`/topics/${topicId}`);
  };

  /**
   * 處理釘選切換
   */
  const handleTogglePin = (e: React.MouseEvent, topicId: string) => {
    e.stopPropagation();
    togglePinTopic(topicId);
  };

  /**
   * 處理編輯
   */
  const handleEdit = (e: React.MouseEvent, topic: ParentTopicWithChildren) => {
    e.stopPropagation();
    setEditingTopic(topic);
    setDialogOpen(true);
  };

  /**
   * 處理刪除
   */
  const handleDelete = (e: React.MouseEvent, topicId: string) => {
    e.stopPropagation();
    if (confirm('確定要刪除這個 Topic 嗎？')) {
      deleteTopic(topicId);
    }
  };

  /**
   * 關閉對話框
   */
  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingTopic(undefined);
  };

  /**
   * 格式化相對時間
   */
  const formatRelativeTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();

    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    const weeks = Math.floor(diff / 604800000);

    if (minutes < 60) return `更新於 ${minutes} 分鐘前`;
    if (hours < 24) return `更新於 ${hours} 小時前`;
    if (days < 7) return `更新於 ${days} 天前`;
    if (weeks < 4) return `更新於 ${weeks} 週前`;
    return `更新於 ${date.toLocaleDateString('zh-TW')}`;
  };

  // 載入中狀態
  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center bg-white">
        <div className="text-gray-600">載入中...</div>
      </div>
    );
  }

  // 錯誤狀態
  if (error) {
    return (
      <div className="h-full flex items-center justify-center bg-white">
        <div className="text-red-600">載入失敗: {error.message}</div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-auto bg-white">
      <div className="max-w-[1200px] mx-auto p-8">
        {/* 頁面標題 */}
        <div className="mb-8">
          <h1 className="text-2xl font-normal text-gray-900 mb-2">所有主題</h1>
          <p className="text-gray-500 text-sm">管理和探索你的知識網絡</p>
        </div>

        {/* 搜尋與檢視切換 */}
        <div className="flex items-center justify-between mb-8 gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="搜尋主題..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-gray-50 border-none focus-visible:ring-1 focus-visible:ring-gray-200"
            />
          </div>
          <div className="flex items-center bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-md transition-all ${
                viewMode === 'grid'
                  ? 'bg-white shadow-sm text-gray-900'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-md transition-all ${
                viewMode === 'list'
                  ? 'bg-white shadow-sm text-gray-900'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 統計區域 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="p-6 rounded-2xl border border-gray-100 bg-white hover:border-gray-200 transition-colors">
            <div className="text-4xl font-normal text-gray-900 mb-2">
              {stats.totalTopics}
            </div>
            <div className="text-sm text-gray-500">總主題數</div>
          </div>

          <div className="p-6 rounded-2xl border border-gray-100 bg-white hover:border-gray-200 transition-colors">
            <div className="text-4xl font-normal text-gray-900 mb-2">
              {stats.totalNodes}
            </div>
            <div className="text-sm text-gray-500">總節點數</div>
          </div>

          <div className="p-6 rounded-2xl border border-gray-100 bg-white hover:border-gray-200 transition-colors">
            <div className="text-4xl font-normal text-gray-900 mb-2">
              {stats.pinnedCount}
            </div>
            <div className="text-sm text-gray-500">已釘選</div>
          </div>
        </div>

        {/* Topics 列表 */}
        {filteredAndSortedTopics.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-500 text-lg">
              {searchQuery ? '找不到符合條件的 Topic' : '還沒有任何 Topic'}
            </p>
          </div>
        ) : (
          <div
            className={
              viewMode === 'grid'
                ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
                : 'flex flex-col gap-4'
            }
            style={{
              overflowY: 'auto',
              maxHeight: '70vh',
            }}
          >
            {filteredAndSortedTopics.map((topic) => {
              return (
                <Card
                  key={topic.id}
                  className="p-6 cursor-pointer hover:shadow-lg transition-all duration-300 bg-white group border-gray-100 hover:border-gray-200"
                  onClick={() => handleCardClick(topic.id)}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex gap-4 flex-1 min-w-0">
                      {/* Topic 資訊 */}
                      <div className="flex-1 min-w-0 pt-1">
                        <h3 className="font-medium text-lg text-gray-900 truncate mb-1">
                          {topic.name}
                        </h3>
                        <div className="text-sm text-gray-500">
                          {topic.accumulationCount} 個節點
                        </div>
                      </div>
                    </div>

                    {/* 釘選按鈕 */}
                    <button
                      onClick={(e) => handleTogglePin(e, topic.id)}
                      className={`p-1.5 rounded-full transition-colors ${
                        topic.isPinned
                          ? 'text-blue-600 bg-blue-50'
                          : 'text-gray-300 hover:text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      <Pin
                        className={`w-4 h-4 ${topic.isPinned ? 'fill-current' : ''}`}
                      />
                    </button>
                  </div>

                  {/* Tags（子 Topics） */}
                  <div className="flex flex-wrap gap-2 mb-6 min-h-[24px]">
                    {topic.childTopics.slice(0, 3).map((childTopic) => (
                      <span
                        key={childTopic.id}
                        className="px-2.5 py-1 text-xs font-medium bg-gray-100 text-gray-600 rounded-full"
                      >
                        {childTopic.name}
                      </span>
                    ))}
                    {topic.childTopics.length > 3 && (
                      <span className="px-2.5 py-1 text-xs font-medium bg-gray-50 text-gray-500 rounded-full">
                        +{topic.childTopics.length - 3}
                      </span>
                    )}
                  </div>

                  {/* 底部資訊 */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                    <div className="text-xs text-gray-400">
                      {formatRelativeTime(topic.updatedAt)}
                    </div>

                    {/* 更多選項 */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button
                          onClick={(e) => e.stopPropagation()}
                          className="p-1.5 hover:bg-gray-100 rounded-md transition-colors opacity-0 group-hover:opacity-100"
                        >
                          <MoreVertical className="w-4 h-4 text-gray-400" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={(e) => handleEdit(e, topic)}>
                          <Edit className="w-4 h-4 mr-2" />
                          編輯
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={(e) => handleDelete(e, topic.id)}
                          className="text-red-600 focus:text-red-600"
                        >
                          <Trash className="w-4 h-4 mr-2" />
                          刪除
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Topic 對話框 */}
      <TopicDialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        topic={editingTopic}
      />
    </div>
  );
}
