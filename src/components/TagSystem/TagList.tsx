'use client';

import { useState, useMemo } from 'react';
import { Tag } from '@/types/tag';
import { TagCard } from './TagCard';
import { Search, LayoutGrid, List, Plus } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface TagListProps {
  tags: Tag[];
  onAddTag: () => void;
  onEditTag: (tag: Tag) => void;
  onDeleteTag: (tag: Tag) => void;
  onTagClick: (tag: Tag) => void;
}

type SortOption = 'name' | 'usage' | 'date';

export function TagList({
  tags,
  onAddTag,
  onEditTag,
  onDeleteTag,
  onTagClick,
}: TagListProps) {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('date');

  const filteredAndSortedTags = useMemo(() => {
    let result = tags;

    // Filter
    if (searchQuery) {
      result = result.filter((tag) =>
        tag.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Sort
    return [...result].sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'usage':
          return b.usageCount - a.usageCount;
        case 'date':
        default:
          return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
      }
    });
  }, [tags, searchQuery, sortBy]);

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative flex-1 w-full md:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="搜尋標籤..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-white border-gray-200"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <Select
            value={sortBy}
            onValueChange={(value) => setSortBy(value as SortOption)}
          >
            <SelectTrigger className="w-[140px] bg-white border-gray-200">
              <SelectValue placeholder="排序方式" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="date">最新建立</SelectItem>
              <SelectItem value="usage">使用次數</SelectItem>
              <SelectItem value="name">名稱排序</SelectItem>
            </SelectContent>
          </Select>

          <div className="flex items-center bg-gray-100 rounded-lg p-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setViewMode('grid')}
              className={`h-8 w-8 p-0 hover:bg-white ${
                viewMode === 'grid'
                  ? 'bg-white shadow-sm text-gray-900'
                  : 'text-gray-500'
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setViewMode('list')}
              className={`h-8 w-8 p-0 hover:bg-white ${
                viewMode === 'list'
                  ? 'bg-white shadow-sm text-gray-900'
                  : 'text-gray-500'
              }`}
            >
              <List className="w-4 h-4" />
            </Button>
          </div>

          <Button
            onClick={onAddTag}
            className="bg-blue-600 hover:bg-blue-700 text-white gap-2"
          >
            <Plus className="w-4 h-4" />
            新增 Tag
          </Button>
        </div>
      </div>

      {/* List */}
      {filteredAndSortedTags.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-gray-200">
          <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-1">
            {searchQuery ? '找不到符合的標籤' : '還沒有任何標籤'}
          </h3>
          <p className="text-gray-500 mb-4">
            {searchQuery
              ? '試試看其他關鍵字'
              : '使用標籤來分類和管理你的 nodes，例如「待驗證」、「重要」、「靈感」'}
          </p>
          {!searchQuery && (
            <Button onClick={onAddTag} variant="outline">
              新增第一個 Tag
            </Button>
          )}
        </div>
      ) : (
        <div
          className={
            viewMode === 'grid'
              ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'
              : 'flex flex-col gap-3'
          }
        >
          {filteredAndSortedTags.map((tag) => (
            <TagCard
              key={tag.id}
              tag={tag}
              viewMode={viewMode}
              onEdit={onEditTag}
              onDelete={onDeleteTag}
              onClick={onTagClick}
            />
          ))}
        </div>
      )}
    </div>
  );
}
