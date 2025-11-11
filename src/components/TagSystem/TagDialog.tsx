/**
 * Tag 設定 Dialog
 * 快捷鍵 Cmd+Shift+T 開啟
 */

'use client';

import { useState, useEffect } from 'react';
import { Plus, Check } from 'lucide-react';
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
import { Badge } from '@/components/ui/badge';
import { useTagStore } from '@/stores/tagStore';
// ⚠️ 目前使用假資料 Hook，待後端 API 完成後需替換為真實 API
import { useMockCreateTag } from '@/__mocks__/hooks';

interface TagDialogProps {
  /** 是否開啟 Dialog */
  open: boolean;

  /** 關閉 Dialog 回調 */
  onClose: () => void;

  /** 選中的 Node ID */
  nodeId: string;

  /** Node 當前的 Tags */
  currentTags: string[];

  /** 儲存回調 */
  onSave: (tagIds: string[]) => void;
}

/**
 * 預設 Tag 顏色
 */
const TAG_COLORS = [
  '#ef4444', // 紅色
  '#f97316', // 橙色
  '#f59e0b', // 黃色
  '#84cc16', // 綠色
  '#10b981', // 青綠色
  '#06b6d4', // 青色
  '#3b82f6', // 藍色
  '#8b5cf6', // 紫色
  '#ec4899', // 粉色
  '#6b7280', // 灰色
];

/**
 * Tag 設定 Dialog 組件
 */
export function TagDialog({
  open,
  onClose,
  nodeId,
  currentTags,
  onSave,
}: TagDialogProps) {
  const { tags, addTag } = useTagStore();

  // 選中的 Tag IDs
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>(currentTags);

  // 新增 Tag 模式
  const [isCreatingTag, setIsCreatingTag] = useState(false);
  const [newTagName, setNewTagName] = useState('');
  const [selectedColor, setSelectedColor] = useState(TAG_COLORS[0]);

  // ⚠️ 目前使用假資料 Hook，待後端 API 完成後需替換為真實 API
  const createTagMutation = useMockCreateTag();

  /**
   * 當 currentTags 變化時更新選中狀態
   */
  useEffect(() => {
    setSelectedTagIds(currentTags);
  }, [currentTags]);

  /**
   * 切換 Tag 選中狀態
   */
  const toggleTag = (tagId: string) => {
    setSelectedTagIds((prev) =>
      prev.includes(tagId)
        ? prev.filter((id) => id !== tagId)
        : [...prev, tagId]
    );
  };

  /**
   * 建立新 Tag
   * ⚠️ 目前使用假資料 Hook，待後端 API 完成後需替換為真實 API
   */
  const handleCreateTag = async () => {
    if (!newTagName.trim()) return;

    try {
      // ⚠️ 假資料：模擬建立 Tag，實際應呼叫 createTagMutation.mutateAsync()
      const newTag = await createTagMutation.mutate({
        name: newTagName.trim(),
        color: selectedColor,
      });

      // 加入到 Store
      addTag(newTag);

      // 自動選中新建立的 Tag
      setSelectedTagIds((prev) => [...prev, newTag.id]);

      // 重置表單
      setNewTagName('');
      setSelectedColor(TAG_COLORS[0]);
      setIsCreatingTag(false);
    } catch (error) {
      console.error('Failed to create tag:', error);
    }
  };

  /**
   * 儲存並關閉
   */
  const handleSave = () => {
    onSave(selectedTagIds);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>設定標籤</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* 現有 Tags 列表 */}
          <div className="space-y-2">
            <Label>選擇標籤</Label>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <Badge
                  key={tag.id}
                  variant={
                    selectedTagIds.includes(tag.id) ? 'default' : 'outline'
                  }
                  className="cursor-pointer transition-all hover:scale-105"
                  style={{
                    backgroundColor: selectedTagIds.includes(tag.id)
                      ? tag.color
                      : 'transparent',
                    borderColor: tag.color,
                    color: selectedTagIds.includes(tag.id)
                      ? 'white'
                      : tag.color,
                  }}
                  onClick={() => toggleTag(tag.id)}
                >
                  {selectedTagIds.includes(tag.id) && (
                    <Check className="w-3 h-3 mr-1" />
                  )}
                  {tag.name}
                </Badge>
              ))}
            </div>
          </div>

          {/* 新增 Tag 區域 */}
          {isCreatingTag ? (
            <div className="space-y-3 p-4 border border-gray-200 rounded-lg">
              <div className="space-y-2">
                <Label htmlFor="tagName">標籤名稱</Label>
                <Input
                  id="tagName"
                  value={newTagName}
                  onChange={(e) => setNewTagName(e.target.value)}
                  placeholder="輸入標籤名稱"
                  autoFocus
                />
              </div>

              <div className="space-y-2">
                <Label>選擇顏色</Label>
                <div className="flex flex-wrap gap-2">
                  {TAG_COLORS.map((color) => (
                    <button
                      key={color}
                      type="button"
                      className="w-8 h-8 rounded-full border-2 transition-transform hover:scale-110"
                      style={{
                        backgroundColor: color,
                        borderColor: selectedColor === color ? '#000' : color,
                      }}
                      onClick={() => setSelectedColor(color)}
                    />
                  ))}
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={handleCreateTag}
                  disabled={!newTagName.trim() || createTagMutation.isLoading}
                >
                  建立
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setIsCreatingTag(false);
                    setNewTagName('');
                    setSelectedColor(TAG_COLORS[0]);
                  }}
                >
                  取消
                </Button>
              </div>
            </div>
          ) : (
            <Button
              variant="outline"
              className="w-full"
              onClick={() => setIsCreatingTag(true)}
            >
              <Plus className="w-4 h-4 mr-2" />
              新增標籤
            </Button>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            取消
          </Button>
          <Button onClick={handleSave}>儲存</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
