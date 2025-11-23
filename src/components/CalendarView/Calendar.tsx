/**
 * 月曆組件
 * 顯示當月的所有日期和輸出標記
 */

import { useMemo } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/utils';

interface CalendarProps {
  /** 當前日期 */
  currentDate: Date;

  /** 有輸出的日期（YYYY-MM-DD 格式） */
  datesWithOutput: string[];

  /** 選中的日期 */
  selectedDate: Date | null;

  /** 日期選擇回調 */
  onDateSelect: (date: Date) => void;

  /** 月份變更回調 */
  onMonthChange: (date: Date) => void;
}

/**
 * 月曆組件
 */
export function Calendar({
  currentDate,
  datesWithOutput,
  selectedDate,
  onDateSelect,
  onMonthChange,
}: CalendarProps) {
  /**
   * 取得月曆資料
   */
  const calendarData = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    // 當月第一天
    const firstDay = new Date(year, month, 1);
    // 當月最後一天
    const lastDay = new Date(year, month + 1, 0);

    // 計算需要顯示的前後日期
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());

    const endDate = new Date(lastDay);
    endDate.setDate(endDate.getDate() + (6 - lastDay.getDay()));

    // 生成所有日期
    const dates: Date[] = [];
    const current = new Date(startDate);

    while (current <= endDate) {
      dates.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }

    return dates;
  }, [currentDate]);

  /**
   * 格式化日期為 YYYY-MM-DD
   */
  const formatDate = (date: Date): string => {
    return date.toISOString().split('T')[0];
  };

  /**
   * 檢查是否為當月日期
   */
  const isCurrentMonth = (date: Date): boolean => {
    return date.getMonth() === currentDate.getMonth();
  };

  /**
   * 檢查是否為今天
   */
  const isToday = (date: Date): boolean => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  /**
   * 檢查是否有輸出
   */
  const hasOutput = (date: Date): boolean => {
    return datesWithOutput.includes(formatDate(date));
  };

  /**
   * 檢查是否為選中日期
   */
  const isSelected = (date: Date): boolean => {
    if (!selectedDate) return false;
    return formatDate(date) === formatDate(selectedDate);
  };

  /**
   * 切換到上個月
   */
  const goToPreviousMonth = () => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() - 1);
    onMonthChange(newDate);
  };

  /**
   * 切換到下個月
   */
  const goToNextMonth = () => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + 1);
    onMonthChange(newDate);
  };

  /**
   * 回到今天
   */
  const goToToday = () => {
    onMonthChange(new Date());
  };

  return (
    <div className="w-full flex flex-col bg-white">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={goToPreviousMonth}
            aria-label="上個月"
            className="h-8 w-8 p-0"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>

          <h2 className="text-base font-semibold text-gray-800 min-w-[120px] text-center">
            {currentDate.getFullYear()} 年 {currentDate.getMonth() + 1} 月
          </h2>

          <Button
            variant="outline"
            size="sm"
            onClick={goToNextMonth}
            aria-label="下個月"
            className="h-8 w-8 p-0"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={goToToday}
          className="text-sm"
        >
          今天
        </Button>
      </div>

      {/* 星期標題 */}
      <div className="grid grid-cols-7 mb-2 mt-2">
        {['日', '一', '二', '三', '四', '五', '六'].map((day) => (
          <div
            key={day}
            className="py-1 text-center text-xs font-medium text-gray-500"
          >
            {day}
          </div>
        ))}
      </div>

      {/* 日期網格 */}
      <div className="grid grid-cols-7 gap-1 px-2 pb-2">
        {calendarData.map((date, index) => {
          const dateStr = formatDate(date);
          const editorUrl = `/editor/${dateStr}`;
          const isSelectedDate = isSelected(date);
          const isTodayDate = isToday(date);
          const isCurrentMonthDate = isCurrentMonth(date);

          return (
            <Link
              key={index}
              href={editorUrl}
              prefetch={true}
              onClick={(e) => {
                e.preventDefault();
                onDateSelect(date);
              }}
              className={cn(
                'aspect-square flex flex-col items-center justify-center relative rounded-full transition-colors',
                !isCurrentMonthDate && 'text-gray-300',
                isSelectedDate && 'bg-blue-100 text-blue-700 font-semibold',
                !isSelectedDate && isCurrentMonthDate && 'hover:bg-gray-100',
                isTodayDate && !isSelectedDate && 'text-blue-600 font-bold'
              )}
              aria-label={`選擇日期 ${dateStr}`}
              tabIndex={0}
            >
              {/* 日期數字 */}
              <span className="text-sm z-10">{date.getDate()}</span>

              {/* 輸出標記 (小圓點) */}
              {hasOutput(date) && (
                <div
                  className={cn(
                    'w-1 h-1 rounded-full mt-0.5',
                    isSelectedDate ? 'bg-blue-500' : 'bg-blue-400'
                  )}
                />
              )}

              {/* 今天的外框標記 (如果是今天但沒被選中) */}
              {isTodayDate && !isSelectedDate && (
                <div className="absolute inset-0 border border-blue-200 rounded-full" />
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
