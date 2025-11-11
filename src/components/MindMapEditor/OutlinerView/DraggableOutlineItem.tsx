/**
 * 可拖曳的 Outline Item 包裝組件
 */

'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical } from 'lucide-react';
import { OutlineItemComponent } from './OutlineItem';
import type { OutlineItem } from '@/types/view';

interface DraggableOutlineItemProps {
  /** 項目資料 */
  item: OutlineItem;

  /** 是否為焦點項目 */
  isFocused: boolean;

  /** 編輯項目的回調 */
  onEdit: (id: string, newLabel: string) => void;

  /** 切換收合狀態的回調 */
  onToggleCollapse: (id: string) => void;

  /** 聚焦項目的回調 */
  onFocus: (id: string) => void;

  /** 按下 Enter 的回調 */
  onEnter: (id: string) => void;

  /** 按下 Tab 的回調 */
  onTab: (id: string) => void;

  /** 按下 Shift+Tab 的回調 */
  onShiftTab: (id: string) => void;
}

/**
 * 可拖曳的 Outline Item 組件
 */
export function DraggableOutlineItem({
  item,
  isFocused,
  onEdit,
  onToggleCollapse,
  onFocus,
  onEnter,
  onTab,
  onShiftTab,
}: DraggableOutlineItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="flex items-center group">
      {/* 拖曳手柄 */}
      <button
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600 p-1 opacity-0 group-hover:opacity-100 transition-opacity"
        aria-label="拖曳排序"
      >
        <GripVertical className="w-4 h-4" />
      </button>

      {/* 原始 OutlineItem */}
      <div className="flex-1">
        <OutlineItemComponent
          item={item}
          isFocused={isFocused}
          onEdit={onEdit}
          onToggleCollapse={onToggleCollapse}
          onFocus={onFocus}
          onEnter={onEnter}
          onTab={onTab}
          onShiftTab={onShiftTab}
        />
      </div>
    </div>
  );
}
