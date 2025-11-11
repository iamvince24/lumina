/**
 * 月曆視圖容器
 * 整合月曆和每日小卡
 */

'use client';

import { useState, useMemo } from 'react';
import { Calendar } from './Calendar';
import { DayCard } from './DayCard';
import { useTab } from '@/hooks/useTab';
import type { MindMap } from '@/types/mindmap';

/**
 * 月曆視圖組件
 */
export function CalendarView() {
  const { openEditorTab } = useTab();

  // 當前月份
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // 選中的日期
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  // TODO: 從 API 載入 MindMaps
  const mindmaps = useMemo<MindMap[]>(() => [], []);

  /**
   * 取得有輸出的日期列表
   */
  const datesWithOutput = useMemo(() => {
    return mindmaps.map((m) => m.date.toISOString().split('T')[0]);
  }, [mindmaps]);

  /**
   * 取得選中日期的 MindMap
   */
  const selectedMindMap = useMemo(() => {
    if (!selectedDate) return null;

    const dateStr = selectedDate.toISOString().split('T')[0];
    return mindmaps.find((m) => m.date.toISOString().split('T')[0] === dateStr);
  }, [selectedDate, mindmaps]);

  /**
   * 處理日期選擇
   */
  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
  };

  /**
   * 處理卡片點擊
   * 使用 Tab 系統開啟該日期的編輯頁面
   */
  const handleCardClick = () => {
    if (!selectedDate) return;

    const dateStr = selectedDate.toISOString().split('T')[0];
    openEditorTab(dateStr);
  };

  return (
    <div className="w-full h-screen flex bg-gray-50">
      {/* 左側：月曆 */}
      <div className="w-2/5 border-r border-gray-200">
        <Calendar
          currentDate={currentMonth}
          datesWithOutput={datesWithOutput}
          selectedDate={selectedDate}
          onDateSelect={handleDateSelect}
          onMonthChange={setCurrentMonth}
        />
      </div>

      {/* 右側：每日小卡 */}
      <div className="flex-1 p-6 overflow-y-auto">
        {selectedMindMap ? (
          <DayCard mindmap={selectedMindMap} onClick={handleCardClick} />
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <p className="text-lg">請選擇一個日期</p>
          </div>
        )}
      </div>
    </div>
  );
}
