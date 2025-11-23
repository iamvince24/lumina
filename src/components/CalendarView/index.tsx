/**
 * 月曆視圖容器
 * 整合月曆和每日小卡
 */

'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import { Calendar } from './Calendar';
import { DecoratorDots } from '@/components/DecoratorDots';
import { useCalendarEntries } from '@/hooks/useCalendar';
import { NoteCardsView, type ViewMode } from './NoteCardsView';
import { List, Grid, LayoutGrid } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/utils';

/**
 * 月曆視圖組件
 */
export function CalendarView() {
  // 當前月份
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // 選中的日期（用於月曆高亮顯示）
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  // 視圖模式
  const [viewMode, setViewMode] = useState<ViewMode>('list');

  // 滾動容器 ref
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // 獲取月曆資料
  const { data: calendarEntries, isLoading } = useCalendarEntries(
    currentMonth.getFullYear(),
    currentMonth.getMonth() + 1
  );

  /**
   * 取得有輸出的日期列表
   */
  const datesWithOutput = useMemo(() => {
    if (!calendarEntries) return [];
    return Object.keys(calendarEntries).filter(
      (date) => calendarEntries[date].hasContent
    );
  }, [calendarEntries]);

  /**
   * 取得當月有內容的卡片數據
   */
  const cardsData = useMemo(() => {
    if (!calendarEntries) return [];

    return Object.values(calendarEntries)
      .filter((entry) => entry.hasContent)
      .map((entry) => ({
        date: entry.date,
        tags: entry.tags || [],
        topics: entry.topics || [],
      }));
  }, [calendarEntries]);

  /**
   * 處理日期選擇（用於月曆高亮）
   */
  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
  };

  /**
   * 格式化日期為 YYYY-MM-DD（使用本地時區）
   */
  const formatDateLocal = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  /**
   * 當選中日期改變時，滾動到對應的卡片
   */
  useEffect(() => {
    if (!selectedDate || !scrollContainerRef.current) return;

    const dateStr = formatDateLocal(selectedDate);
    const cardElement = document.getElementById(`card-${dateStr}`);

    if (cardElement && scrollContainerRef.current) {
      // 使用 setTimeout 確保 DOM 已更新
      setTimeout(() => {
        const container = scrollContainerRef.current;
        if (!container) return;

        // 計算卡片相對於滾動容器的位置
        const containerRect = container.getBoundingClientRect();
        const cardRect = cardElement.getBoundingClientRect();

        // 計算需要滾動的距離（卡片頂部到容器頂部的距離）
        const scrollTop =
          container.scrollTop + (cardRect.top - containerRect.top);

        // 使用 scrollTo 滾動，只影響滾動容器本身
        container.scrollTo({
          top: scrollTop - 24, // 減去一些 padding，讓卡片不會貼邊
          behavior: 'smooth',
        });
      }, 100);
    }
  }, [selectedDate]);

  if (isLoading) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">載入中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-screen flex bg-gray-50 gap-4">
      {/* 左側：月曆 */}
      <div className="w-80 border-r border-gray-200 ">
        <Calendar
          currentDate={currentMonth}
          datesWithOutput={datesWithOutput}
          selectedDate={selectedDate}
          onDateSelect={handleDateSelect}
          onMonthChange={setCurrentMonth}
        />
      </div>

      {/* 中間裝飾點點 */}
      <DecoratorDots />

      {/* 右側：每日小卡 */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* 視圖切換工具列 */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">
            {currentMonth.getFullYear()} 年 {currentMonth.getMonth() + 1} 月
          </h2>
          <div className="flex items-center gap-2">
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
              aria-label="列表視圖"
              className={cn(
                'h-8 w-8 p-0 transition-all duration-200',
                'hover:scale-110 active:scale-95',
                viewMode === 'list'
                  ? 'bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800'
                  : 'hover:bg-gray-100 active:bg-gray-200'
              )}
            >
              <List className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('grid')}
              aria-label="網格視圖"
              className={cn(
                'h-8 w-8 p-0 transition-all duration-200',
                'hover:scale-110 active:scale-95',
                viewMode === 'grid'
                  ? 'bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800'
                  : 'hover:bg-gray-100 active:bg-gray-200'
              )}
            >
              <Grid className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === 'waterfall' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('waterfall')}
              aria-label="瀑布流視圖"
              className={cn(
                'h-8 w-8 p-0 transition-all duration-200',
                'hover:scale-110 active:scale-95',
                viewMode === 'waterfall'
                  ? 'bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800'
                  : 'hover:bg-gray-100 active:bg-gray-200'
              )}
            >
              <LayoutGrid className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* 卡片視圖區域 */}
        <div
          ref={scrollContainerRef}
          className="flex-1 p-6 overflow-y-auto min-h-0 h-full"
        >
          <NoteCardsView
            viewMode={viewMode}
            cards={cardsData}
            selectedDate={selectedDate}
          />
        </div>
      </div>
    </div>
  );
}
