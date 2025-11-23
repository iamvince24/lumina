/**
 * 單個日期的小筆記卡片組件
 */

'use client';

import { useTab } from '@/hooks/useTab';
import { cn } from '@/utils';
import type { HTMLAttributes } from 'react';

interface DayNoteCardProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'onClick'> {
  /** 日期字串 (YYYY-MM-DD) */
  date: string;
  /** 標籤列表 */
  tags: string[];
  /** 主題列表（非 topic 的 nodes 內容） */
  topics: string[];
  /** 是否被選中 */
  isSelected?: boolean;
  /** 點擊回調 */
  onClick?: () => void;
}

/**
 * 日期筆記卡片組件
 */
export const DayNoteCard = ({
  id,
  date,
  tags,
  topics,
  isSelected = false,
  onClick,
}: DayNoteCardProps) => {
  const { openEditorTab } = useTab();

  // 解析日期
  const dateObj = new Date(date + 'T00:00:00');
  const month = dateObj.getMonth() + 1;
  const day = dateObj.getDate();
  const weekdays = ['日', '一', '二', '三', '四', '五', '六'];
  const weekday = weekdays[dateObj.getDay()];

  /**
   * 處理卡片點擊
   */
  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      openEditorTab(date);
    }
  };

  const hasContent = tags.length > 0 || topics.length > 0;

  return (
    <div
      id={id}
      onClick={handleClick}
      className={cn(
        'bg-white rounded-lg shadow-sm border p-4',
        'hover:shadow-md transition-all cursor-pointer',
        'flex flex-col gap-3',
        isSelected ? 'border-blue-500 border-2 shadow-md' : 'border-gray-200'
      )}
      role="button"
      tabIndex={0}
      aria-label={`${month}/${day} 的筆記`}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleClick();
        }
      }}
    >
      {/* 日期標題 */}
      <div className="flex items-center gap-2">
        <h3 className="text-lg font-semibold text-gray-900">
          {month}/{day}
        </h3>
        <span className="text-sm text-gray-500">(週{weekday})</span>
      </div>

      {/* 標籤區塊 */}
      {hasContent && tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {tags.map((tag, index) => (
            <span
              key={index}
              className="px-2 py-1 text-xs font-medium rounded-md bg-blue-100 text-blue-700"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* 主題列表 */}
      {hasContent && topics.length > 0 && (
        <ul className="space-y-1 text-sm text-gray-700 list-disc list-inside">
          {topics.map((topic, index) => (
            <li key={index} className="leading-relaxed">
              {topic}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
