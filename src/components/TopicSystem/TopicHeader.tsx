/**
 * Topic 詳細頁標題組件
 * 使用 Mock 資料顯示 Topic 資訊
 */

'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { Edit2, Check, X, Calendar, TrendingUp, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useMockTopicById, useMockUpdateTopicName } from '@/__mocks__/hooks';

interface TopicHeaderProps {
  /** Topic ID */
  topicId: string;
}

/**
 * Topic 詳細頁標題
 */
export function TopicHeader({ topicId }: TopicHeaderProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState('');

  // 使用 Mock Hook 查詢 Topic 資料
  const { data: topic, isLoading } = useMockTopicById(topicId);

  // 使用 Mock Hook 更新 Topic 名稱
  const { mutate: updateName, isLoading: isUpdating } =
    useMockUpdateTopicName();

  /**
   * 開始編輯 Topic 名稱
   */
  const handleStartEdit = () => {
    if (topic) {
      setEditedName(topic.name);
      setIsEditing(true);
    }
  };

  /**
   * 儲存編輯後的 Topic 名稱
   */
  const handleSaveEdit = async () => {
    if (editedName.trim() && editedName !== topic?.name) {
      await updateName({
        topicId,
        name: editedName.trim(),
      });
      setIsEditing(false);
    } else {
      setIsEditing(false);
    }
  };

  /**
   * 取消編輯
   */
  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditedName('');
  };

  // 載入中狀態
  if (isLoading) {
    return (
      <div className="border-b border-gray-200 p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="flex gap-6">
            <div className="h-4 bg-gray-200 rounded w-20"></div>
            <div className="h-4 bg-gray-200 rounded w-20"></div>
            <div className="h-4 bg-gray-200 rounded w-20"></div>
          </div>
        </div>
      </div>
    );
  }

  // 沒有找到 Topic
  if (!topic) {
    return (
      <div className="border-b border-gray-200 p-6">
        <div className="text-red-600">找不到此 Topic</div>
      </div>
    );
  }

  return (
    <div className="border-b border-gray-200 p-6">
      {/* Topic 名稱 */}
      <div className="flex items-center gap-3 mb-4">
        {isEditing ? (
          // 編輯模式
          <>
            <Input
              value={editedName}
              onChange={(e) => setEditedName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSaveEdit();
                if (e.key === 'Escape') handleCancelEdit();
              }}
              className="text-2xl font-bold"
              autoFocus
            />
            <Button
              size="sm"
              variant="ghost"
              onClick={handleSaveEdit}
              disabled={isUpdating}
            >
              <Check className="w-5 h-5 text-green-600" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={handleCancelEdit}
              disabled={isUpdating}
            >
              <X className="w-5 h-5 text-red-600" />
            </Button>
          </>
        ) : (
          // 一般顯示模式
          <>
            <h1 className="text-2xl font-bold">{topic.name}</h1>
            <Button size="sm" variant="ghost" onClick={handleStartEdit}>
              <Edit2 className="w-4 h-4" />
            </Button>
          </>
        )}
      </div>

      {/* 統計資訊 */}
      <div className="flex items-center gap-6 text-sm text-gray-600">
        {/* 累積次數 */}
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4" />
          <span>{topic.nodeCount} 次累積</span>
        </div>

        {/* 相關日期數量 */}
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4" />
          <span>{topic.relatedDatesCount} 天記錄</span>
        </div>

        {/* 最後更新時間 */}
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4" />
          <span>最後更新: {format(topic.lastUpdated, 'yyyy/MM/dd')}</span>
        </div>
      </div>

      {/* Topic 顏色標籤 */}
      {topic.color && (
        <div className="mt-4">
          <div
            className="inline-block px-3 py-1 rounded-full text-sm text-white"
            style={{
              backgroundColor: topic.color,
            }}
          >
            {topic.name}
          </div>
        </div>
      )}
    </div>
  );
}
