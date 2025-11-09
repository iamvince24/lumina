/**
 * Topic 側邊欄組件
 * 顯示所有 Topics 和釘選的 Topics
 */

import { useState } from 'react';
import { Pin, Plus, MoreVertical, Edit2, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useTopicStore } from '@/stores/topicStore';
import { TopicDialog } from './TopicDialog';
import type { Topic } from '@/types/topic';

/**
 * Topic 項目組件
 */
function TopicItem({
  topic,
  onSelect,
  onEdit,
  onDelete,
}: {
  topic: Topic;
  onSelect: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const { togglePinTopic } = useTopicStore();

  return (
    <div className="group flex items-center gap-2 px-3 py-2 hover:bg-gray-100 rounded-lg transition-colors">
      {/* Topic 顏色指示器 */}
      <div
        className="w-3 h-3 rounded-full shrink-0"
        style={{ backgroundColor: topic.color }}
      />

      {/* Topic 名稱 */}
      <button
        onClick={onSelect}
        className="flex-1 text-left text-sm text-gray-700 hover:text-gray-900 truncate"
      >
        {topic.name}
      </button>

      {/* 操作選單 */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <MoreVertical className="w-4 h-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={onEdit}>
            <Edit2 className="w-4 h-4 mr-2" />
            編輯
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => togglePinTopic(topic.id)}>
            <Pin className="w-4 h-4 mr-2" />
            {topic.isPinned ? '取消釘選' : '釘選'}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={onDelete} className="text-red-600">
            <Trash2 className="w-4 h-4 mr-2" />
            刪除
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

/**
 * Topic 側邊欄組件
 */
export function TopicSidebar() {
  const { topics, getPinnedTopics, deleteTopic } = useTopicStore();

  // 對話框狀態
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTopic, setEditingTopic] = useState<Topic | undefined>();

  // 釘選的 Topics
  const pinnedTopics = getPinnedTopics();

  /**
   * 處理 Topic 選擇
   */
  const handleSelectTopic = (topic: Topic) => {
    // TODO: 開啟 Topic 詳細頁
    console.log('Selected topic:', topic);
  };

  /**
   * 處理編輯 Topic
   */
  const handleEditTopic = (topic: Topic) => {
    setEditingTopic(topic);
    setDialogOpen(true);
  };

  /**
   * 處理刪除 Topic
   */
  const handleDeleteTopic = (topic: Topic) => {
    if (confirm(`確定要刪除 "${topic.name}" 嗎？`)) {
      deleteTopic(topic.id);
    }
  };

  return (
    <>
      <div className="w-64 h-full bg-white border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-800">Topics</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setEditingTopic(undefined);
              setDialogOpen(true);
            }}
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>

        {/* 釘選的 Topics */}
        {pinnedTopics.length > 0 && (
          <div className="px-4 py-3 border-b border-gray-200">
            <h3 className="text-xs font-medium text-gray-500 mb-2 uppercase">
              釘選
            </h3>
            <div className="space-y-1">
              {pinnedTopics.map((topic) => (
                <TopicItem
                  key={topic.id}
                  topic={topic}
                  onSelect={() => handleSelectTopic(topic)}
                  onEdit={() => handleEditTopic(topic)}
                  onDelete={() => handleDeleteTopic(topic)}
                />
              ))}
            </div>
          </div>
        )}

        {/* 所有 Topics */}
        <div className="flex-1 overflow-y-auto px-4 py-3">
          <h3 className="text-xs font-medium text-gray-500 mb-2 uppercase">
            所有 Topics
          </h3>
          <div className="space-y-1">
            {topics.length === 0 ? (
              <div className="text-sm text-gray-500 py-4 text-center">
                尚無 Topics
              </div>
            ) : (
              topics.map((topic) => (
                <TopicItem
                  key={topic.id}
                  topic={topic}
                  onSelect={() => handleSelectTopic(topic)}
                  onEdit={() => handleEditTopic(topic)}
                  onDelete={() => handleDeleteTopic(topic)}
                />
              ))
            )}
          </div>
        </div>
      </div>

      {/* Topic 設定對話框 */}
      <TopicDialog
        open={dialogOpen}
        onClose={() => {
          setDialogOpen(false);
          setEditingTopic(undefined);
        }}
        topic={editingTopic}
      />
    </>
  );
}
