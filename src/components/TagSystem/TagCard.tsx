'use client';

import { Tag } from '@/types/tag';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MoreVertical, Edit, Trash, Hash } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { formatDistanceToNow } from 'date-fns';
import { zhTW } from 'date-fns/locale';

interface TagCardProps {
  tag: Tag;
  viewMode: 'grid' | 'list';
  onEdit: (tag: Tag) => void;
  onDelete: (tag: Tag) => void;
  onClick: (tag: Tag) => void;
}

export function TagCard({
  tag,
  viewMode,
  onEdit,
  onDelete,
  onClick,
}: TagCardProps) {
  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit(tag);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(tag);
  };

  if (viewMode === 'list') {
    return (
      <div
        className="group flex items-center justify-between p-4 bg-white border border-gray-100 rounded-xl hover:border-gray-200 hover:shadow-sm transition-all cursor-pointer"
        onClick={() => onClick(tag)}
      >
        <div className="flex items-center gap-4">
          <div
            className="w-3 h-10 rounded-full"
            style={{ backgroundColor: tag.color }}
          />
          <div>
            <h3 className="font-medium text-gray-900">{tag.name}</h3>
            <p className="text-sm text-gray-500 mt-0.5">
              已使用於 {tag.usageCount} 個 nodes
            </p>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <span className="text-xs text-gray-400">
            最後使用：
            {formatDistanceToNow(new Date(tag.createdAt), {
              addSuffix: true,
              locale: zhTW,
            })}
          </span>

          <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-gray-400 hover:text-gray-600"
              onClick={handleEdit}
            >
              <Edit className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-gray-400 hover:text-red-600"
              onClick={handleDelete}
            >
              <Trash className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Card
      className="group relative p-6 cursor-pointer hover:shadow-lg transition-all duration-300 border-gray-100 hover:border-gray-200 overflow-hidden"
      onClick={() => onClick(tag)}
    >
      {/* Background Color Accent */}
      <div
        className="absolute top-0 left-0 w-full h-1.5"
        style={{ backgroundColor: tag.color }}
      />

      <div className="flex flex-col items-center text-center pt-2">
        <div
          className="w-12 h-12 rounded-full flex items-center justify-center mb-4 transition-transform group-hover:scale-110"
          style={{ backgroundColor: `${tag.color}20` }}
        >
          <Hash className="w-6 h-6" style={{ color: tag.color }} />
        </div>

        <h3 className="font-medium text-lg text-gray-900 mb-2">{tag.name}</h3>

        <div className="text-sm text-gray-500 bg-gray-50 px-3 py-1 rounded-full">
          {tag.usageCount} 個 nodes
        </div>
      </div>

      {/* Hover Actions */}
      <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-gray-400 hover:text-gray-600"
              onClick={(e) => e.stopPropagation()}
            >
              <MoreVertical className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={handleEdit}>
              <Edit className="w-4 h-4 mr-2" />
              編輯
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={handleDelete}
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
}
