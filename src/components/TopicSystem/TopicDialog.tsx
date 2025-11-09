/**
 * Topic 設定對話框
 * 用於建立或編輯 Topic
 */

import { useState, useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useTopicStore } from '@/stores/topicStore';
import type { Topic } from '@/types/topic';

/**
 * Topic 顏色選項
 */
const TOPIC_COLORS = [
  { value: '#3b82f6', label: '藍色' },
  { value: '#10b981', label: '綠色' },
  { value: '#f59e0b', label: '橙色' },
  { value: '#ef4444', label: '紅色' },
  { value: '#8b5cf6', label: '紫色' },
  { value: '#ec4899', label: '粉色' },
];

interface TopicDialogProps {
  /** 是否開啟對話框 */
  open: boolean;

  /** 關閉對話框的回調 */
  onClose: () => void;

  /** 要編輯的 Topic（如果有） */
  topic?: Topic;

  /** 預設的 Topic 名稱 */
  defaultName?: string;
}

/**
 * 表單內容組件（內部組件，使用 key 重置狀態）
 */
function TopicDialogForm({
  topic,
  defaultName,
  onSave,
  onClose,
}: {
  topic?: Topic;
  defaultName: string;
  onSave: (data: {
    name: string;
    color: string;
    parentTopicId?: string;
    isPinned: boolean;
  }) => void;
  onClose: () => void;
}) {
  // Topic Store
  const { topics } = useTopicStore();

  // 計算初始表單值
  const initialFormState = useMemo(() => {
    if (topic) {
      return {
        name: topic.name,
        color: topic.color,
        parentTopicId: topic.parentTopicId || '',
        isPinned: topic.isPinned,
      };
    }
    return {
      name: defaultName,
      color: TOPIC_COLORS[0].value,
      parentTopicId: '',
      isPinned: false,
    };
  }, [topic, defaultName]);

  // 表單狀態
  const [formState, setFormState] = useState(initialFormState);

  const { name, color, parentTopicId, isPinned } = formState;
  const setName = (value: string) =>
    setFormState((prev) => ({ ...prev, name: value }));
  const setColor = (value: string) =>
    setFormState((prev) => ({ ...prev, color: value }));
  const setParentTopicId = (value: string) =>
    setFormState((prev) => ({ ...prev, parentTopicId: value }));
  const setIsPinned = (value: boolean) =>
    setFormState((prev) => ({ ...prev, isPinned: value }));

  /**
   * 處理儲存
   */
  const handleSave = () => {
    if (!name.trim()) {
      return;
    }

    onSave({
      name: name.trim(),
      color,
      parentTopicId: parentTopicId || undefined,
      isPinned,
    });
  };

  /**
   * 取得可選的父 Topics（排除自己和自己的子孫）
   */
  const availableParentTopics = topics.filter((t) => {
    if (!topic) return true;
    return t.id !== topic.id && t.parentTopicId !== topic.id;
  });

  return (
    <>
      <DialogHeader>
        <DialogTitle>{topic ? '編輯 Topic' : '建立 Topic'}</DialogTitle>
      </DialogHeader>

      <div className="grid gap-4 py-4">
        {/* Topic 名稱 */}
        <div className="grid gap-2">
          <Label htmlFor="name">Topic 名稱</Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="輸入 Topic 名稱..."
            autoFocus
          />
        </div>

        {/* 父 Topic */}
        <div className="grid gap-2">
          <Label htmlFor="parent">父 Topic（可選）</Label>
          <Select value={parentTopicId} onValueChange={setParentTopicId}>
            <SelectTrigger id="parent">
              <SelectValue placeholder="選擇父 Topic..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">無（根層級）</SelectItem>
              {availableParentTopics.map((t) => (
                <SelectItem key={t.id} value={t.id}>
                  {t.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* 顏色 */}
        <div className="grid gap-2">
          <Label>顏色</Label>
          <div className="flex gap-2">
            {TOPIC_COLORS.map((c) => (
              <button
                key={c.value}
                onClick={() => setColor(c.value)}
                className={`
                  w-8 h-8 rounded-full border-2 transition-transform
                  ${
                    color === c.value
                      ? 'scale-110 border-gray-800'
                      : 'border-transparent'
                  }
                `}
                style={{ backgroundColor: c.value }}
                title={c.label}
              />
            ))}
          </div>
        </div>

        {/* 釘選 */}
        <div className="flex items-center gap-2">
          <Checkbox
            id="pin"
            checked={isPinned}
            onCheckedChange={(checked) => setIsPinned(checked as boolean)}
          />
          <Label htmlFor="pin" className="cursor-pointer">
            釘選到側邊欄
          </Label>
        </div>
      </div>

      <DialogFooter>
        <Button variant="outline" onClick={onClose}>
          取消
        </Button>
        <Button onClick={handleSave} disabled={!name.trim()}>
          {topic ? '更新' : '建立'}
        </Button>
      </DialogFooter>
    </>
  );
}

/**
 * Topic 設定對話框組件
 */
export function TopicDialog({
  open,
  onClose,
  topic,
  defaultName = '',
}: TopicDialogProps) {
  // Topic Store
  const { createTopic, updateTopic } = useTopicStore();

  /**
   * 處理儲存
   */
  const handleSave = (data: {
    name: string;
    color: string;
    parentTopicId?: string;
    isPinned: boolean;
  }) => {
    if (topic) {
      // 更新既有 Topic
      updateTopic({
        id: topic.id,
        data: {
          ...data,
          updatedAt: new Date(),
        },
      });
    } else {
      // 建立新 Topic
      createTopic(data);
    }

    onClose();
  };

  // 使用 key 在對話框打開時重置表單狀態
  const formKey = useMemo(
    () => `${open ? 'open' : 'closed'}-${topic?.id || 'new'}-${defaultName}`,
    [open, topic?.id, defaultName]
  );

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <TopicDialogForm
          key={formKey}
          topic={topic}
          defaultName={defaultName}
          onSave={handleSave}
          onClose={onClose}
        />
      </DialogContent>
    </Dialog>
  );
}
