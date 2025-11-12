/**
 * 月曆組件
 * 顯示當月的所有日期和輸出標記
 */

import { useMemo } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/utils/cn';

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
    <div className="w-full h-full flex flex-col bg-white">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={goToPreviousMonth}
            aria-label="上個月"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>

          <h2 className="text-lg font-semibold text-gray-800 min-w-[150px] text-center">
            {currentDate.getFullYear()} 年 {currentDate.getMonth() + 1} 月
          </h2>

          <Button
            variant="outline"
            size="sm"
            onClick={goToNextMonth}
            aria-label="下個月"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>

        <Button variant="outline" size="sm" onClick={goToToday}>
          今天
        </Button>
      </div>

      {/* 星期標題 */}
      <div className="grid grid-cols-7 border-b border-gray-200">
        {['日', '一', '二', '三', '四', '五', '六'].map((day) => (
          <div
            key={day}
            className="py-2 text-center text-sm font-medium text-gray-600"
          >
            {day}
          </div>
        ))}
      </div>

      {/* 日期網格 */}
      <div className="flex-1 grid grid-cols-7 gap-px bg-gray-200">
        {calendarData.map((date, index) => {
          const dateStr = formatDate(date);
          const editorUrl = `/editor/${dateStr}`;

          return (
            <Link
              key={index}
              href={editorUrl}
              prefetch={true}
              onClick={(e) => {
                // 阻止預設導航行為，只執行日期選擇（用於顯示卡片）
                e.preventDefault();
                onDateSelect(date);
              }}
              className={cn(
                'bg-white p-2 hover:bg-gray-50 transition-colors relative block',
                !isCurrentMonth(date) && 'text-gray-400',
                isSelected(date) && 'bg-blue-50 border-2 border-blue-500'
              )}
              aria-label={`選擇日期 ${dateStr}`}
              tabIndex={0}
            >
              {/* 日期數字 */}
              <div
                className={cn(
                  'text-sm font-medium',
                  isToday(date) &&
                    'w-8 h-8 flex items-center justify-center rounded-full bg-blue-500 text-white mx-auto'
                )}
              >
                {date.getDate()}
              </div>

              {/* 輸出標記 */}
              {hasOutput(date) && (
                <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2">
                  <div className="w-1 h-1 bg-blue-500 rounded-full" />
                </div>
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
