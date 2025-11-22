/**
 * 單一 Tab 項目組件
 */
'use client';

import { X, Pin } from 'lucide-react';
import { cn } from '@/utils';
import type { Tab } from '@/stores/tabStore';

interface TabItemProps {
  tab: Tab;
  isActive: boolean;
  onClick: () => void;
  onClose: () => void;
  onPin: () => void;
}

export function TabItem({
  tab,
  isActive,
  onClick,
  onClose,
  onPin,
}: TabItemProps) {
  return (
    <div
      className={cn(
        'group flex items-center gap-2 px-4 py-2 border-r border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors',
        isActive && 'bg-white border-b-2 border-b-blue-500'
      )}
      onClick={onClick}
      role="tab"
      aria-selected={isActive}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      }}
    >
      {/* Pin 圖示 */}
      <button
        className={cn(
          'opacity-0 group-hover:opacity-100 transition-opacity',
          tab.isPinned && 'opacity-100 text-blue-500'
        )}
        onClick={(e) => {
          e.stopPropagation();
          onPin();
        }}
        aria-label={tab.isPinned ? '取消釘選' : '釘選'}
        tabIndex={-1}
      >
        <Pin className="w-3 h-3" />
      </button>

      {/* Tab 標題 */}
      <span className="text-sm font-medium truncate max-w-[150px]">
        {tab.title}
      </span>

      {/* 關閉按鈕（不能關閉釘選的 Tab） */}
      {!tab.isPinned && (
        <button
          className="opacity-0 group-hover:opacity-100 transition-opacity hover:text-red-500"
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          aria-label="關閉 Tab"
          tabIndex={-1}
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
