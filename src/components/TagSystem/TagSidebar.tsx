/**
 * 側邊欄 Tag 管理區塊
 * 顯示所有 Tags 和統計
 */

'use client';

import { Tag as TagIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useTagStore } from '@/stores/tagStore';
// ⚠️ 目前使用假資料 Hook，待後端 API 完成後需替換為真實 API
import { useMockGetAllTags } from '@/__mocks__/hooks';

/**
 * Tag 側邊欄組件
 */
export function TagSidebar() {
  const { tags, activeFilter, setFilter, clearFilter } = useTagStore();

  // ⚠️ 目前使用假資料 Hook，待後端 API 完成後需替換為真實 API
  const { data: tagsFromAPI, isLoading } = useMockGetAllTags();

  /**
   * 點擊 Tag 進行篩選
   */
  const handleTagClick = (tagId: string) => {
    if (activeFilter?.tagIds.includes(tagId)) {
      // 如果已經在篩選中，移除
      const newTagIds = activeFilter.tagIds.filter((id) => id !== tagId);

      if (newTagIds.length === 0) {
        clearFilter();
      } else {
        setFilter({
          tagIds: newTagIds,
          mode: activeFilter.mode,
        });
      }
    } else {
      // 新增到篩選
      setFilter({
        tagIds: activeFilter ? [...activeFilter.tagIds, tagId] : [tagId],
        mode: 'any',
      });
    }
  };

  if (isLoading) {
    return <div className="p-4 text-sm text-gray-500">載入中...</div>;
  }

  if (!tags || tags.length === 0) {
    return (
      <div className="p-4 text-sm text-gray-500">
        尚無標籤，使用 Cmd+Shift+T 建立標籤
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
          <TagIcon className="w-4 h-4" />
          標籤
        </h3>

        {activeFilter && (
          <Button
            size="sm"
            variant="ghost"
            onClick={clearFilter}
            className="h-6 px-2 text-xs"
          >
            清除篩選
          </Button>
        )}
      </div>

      <div className="space-y-2">
        {tags.map((tag) => {
          const isActive = activeFilter?.tagIds.includes(tag.id);

          return (
            <button
              key={tag.id}
              onClick={() => handleTagClick(tag.id)}
              className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: tag.color }}
                />
                <span className={`text-sm ${isActive ? 'font-semibold' : ''}`}>
                  {tag.name}
                </span>
              </div>

              <Badge variant="secondary" className="text-xs">
                {tag.usageCount}
              </Badge>
            </button>
          );
        })}
      </div>
    </div>
  );
}
