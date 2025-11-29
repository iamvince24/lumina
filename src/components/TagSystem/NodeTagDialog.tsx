'use client';

import { useState, useEffect } from 'react';
import { useTagStore } from '@/stores/tagStore';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { getTagsAction } from '@/app/actions/tagActions';
import { Tag } from '@/types/tag';
import { Loader2 } from 'lucide-react';

interface NodeTagDialogProps {
  /** 是否開啟對話框 */
  open: boolean;

  /** 關閉對話框的回調 */
  onClose: () => void;

  /** 當前已選擇的 tag IDs */
  currentTags: string[];

  /** 儲存選中的 tags 回調 */
  onSave: (tagIds: string[]) => void;
}

/**
 * Node Tag 分配對話框
 * 用於為 MindMap Node 分配 Tags
 */
export function NodeTagDialog({
  open,
  onClose,
  currentTags,
  onSave,
}: NodeTagDialogProps) {
  const [availableTags, setAvailableTags] = useState<Tag[]>([]);
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>(currentTags);
  const [isLoading, setIsLoading] = useState(false);

  // 載入所有可用的 tags (Force refresh)
  useEffect(() => {
    if (open) {
      (async () => {
        setIsLoading(true);
        const result = await getTagsAction();
        if (result.success && result.data) {
          setAvailableTags(result.data);
        }
        setIsLoading(false);
      })();
    }
  }, [open]);

  // 當 currentTags 改變或對話框開啟時，更新選中的 tags
  // 使用 JSON.stringify 比較內容，避免因 reference 改變導致的無窮迴圈
  const currentTagsJson = JSON.stringify([...currentTags].sort());

  useEffect(() => {
    if (open) {
      setSelectedTagIds(currentTags);
    }
    // 我們依賴 currentTagsJson 來判斷是否需要更新，忽略 currentTags 的 reference 變化
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, currentTagsJson]);

  const handleToggleTag = (tagId: string) => {
    setSelectedTagIds((prev) =>
      prev.includes(tagId)
        ? prev.filter((id) => id !== tagId)
        : [...prev, tagId]
    );
  };

  const handleSave = () => {
    onSave(selectedTagIds);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>管理節點標籤</DialogTitle>
        </DialogHeader>

        <div className="py-4">
          {isLoading ? (
            <div className="py-8 flex items-center justify-center text-sm text-gray-500">
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
              載入標籤中...
            </div>
          ) : availableTags.length === 0 ? (
            <div className="py-8 text-center text-sm text-gray-500">
              沒有可用的標籤
            </div>
          ) : (
            <div className="space-y-3 max-h-[400px] overflow-y-auto">
              {availableTags.map((tag) => (
                <div
                  key={tag.id}
                  className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                  onClick={() => handleToggleTag(tag.id)}
                >
                  <Checkbox
                    checked={selectedTagIds.includes(tag.id)}
                    onCheckedChange={() => handleToggleTag(tag.id)}
                  />
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: tag.color }}
                  />
                  <span className="flex-1 text-sm font-medium">{tag.name}</span>
                  <span className="text-xs text-gray-400">
                    {tag.usageCount} nodes
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            取消
          </Button>
          <Button onClick={handleSave} disabled={isLoading}>
            儲存
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
