/**
 * 筆記卡片視圖組件
 * 支援 List、Grid、Waterfall 三種視圖模式
 */

'use client';

import { DayNoteCard } from './DayNoteCard';

export type ViewMode = 'list' | 'grid' | 'waterfall';

interface NoteCardsViewProps {
  /** 視圖模式 */
  viewMode: ViewMode;
  /** 卡片數據列表 */
  cards: Array<{
    date: string;
    tags: string[];
    topics: string[];
  }>;
  /** 選中的日期 */
  selectedDate: Date | null;
}

/**
 * 筆記卡片視圖組件
 */
export const NoteCardsView = ({
  viewMode,
  cards,
  selectedDate,
}: NoteCardsViewProps) => {
  // 按日期排序：從最新到最舊
  const sortedCards = [...cards].sort((a, b) => {
    return b.date.localeCompare(a.date);
  });

  /**
   * 格式化日期為 YYYY-MM-DD（使用本地時區）
   */
  const formatDate = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  /**
   * 檢查日期是否被選中
   */
  const isSelected = (dateStr: string): boolean => {
    if (!selectedDate) return false;
    return formatDate(selectedDate) === dateStr;
  };

  // List 視圖：垂直列表，卡片全寬排列
  if (viewMode === 'list') {
    return (
      <div className="flex flex-col gap-4">
        {sortedCards.map((card) => (
          <DayNoteCard
            key={card.date}
            id={`card-${card.date}`}
            date={card.date}
            tags={card.tags}
            topics={card.topics}
            isSelected={isSelected(card.date)}
          />
        ))}
      </div>
    );
  }

  // Grid 視圖：網格排列，響應式欄數
  if (viewMode === 'grid') {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sortedCards.map((card) => (
          <DayNoteCard
            key={card.date}
            id={`card-${card.date}`}
            date={card.date}
            tags={card.tags}
            topics={card.topics}
            isSelected={isSelected(card.date)}
          />
        ))}
      </div>
    );
  }

  // Waterfall 視圖：瀑布流佈局
  return (
    <div className="columns-1 md:columns-2 lg:columns-3 gap-4">
      {sortedCards.map((card) => (
        <div key={card.date} className="break-inside-avoid mb-4">
          <DayNoteCard
            id={`card-${card.date}`}
            date={card.date}
            tags={card.tags}
            topics={card.topics}
            isSelected={isSelected(card.date)}
          />
        </div>
      ))}
    </div>
  );
};
