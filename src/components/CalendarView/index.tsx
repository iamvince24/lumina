/**
 * 月曆視圖容器
 * 整合月曆和每日小卡
 */

'use client';

import { useState, useMemo } from 'react';
import { Calendar } from './Calendar';
import { DayCard } from './DayCard';
import { DecoratorDots } from '@/components/DecoratorDots';
import { useTab } from '@/hooks/useTab';
import type { MindMap } from '@/types/mindmap';
import { useCalendarEntries } from '@/hooks/useCalendar';

/**
 * 月曆視圖組件
 */
export function CalendarView() {
  const { openEditorTab } = useTab();

  // 當前月份
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // 選中的日期
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

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
   * 取得選中日期的資料
   */
  const selectedDayData = useMemo(() => {
    if (!selectedDate || !calendarEntries) return null;

    const dateStr = selectedDate.toISOString().split('T')[0];
    return calendarEntries[dateStr] || null;
  }, [selectedDate, calendarEntries]);

  /**
   * 將 calendar entry 轉換為 MindMap 格式（用於顯示）
   */
  const selectedMindMap = useMemo(() => {
    if (!selectedDayData || !selectedDate) return null;

    // 轉換為 MindMap 格式以相容現有的 DayCard 組件
    return {
      id: `mindmap-${selectedDayData.date}`,
      date: selectedDate,
      title: `心智圖 ${selectedDate.toLocaleDateString('zh-TW')}`,
      nodes: [], // 假資料中不包含詳細節點
      edges: [],
      createdAt: selectedDate,
      updatedAt: selectedDate,
      userId: 'user-1',
    } as MindMap;
  }, [selectedDayData, selectedDate]);

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
      <div className="flex-1 p-6 overflow-y-auto">
        {selectedDate ? (
          selectedDayData ? (
            <div className="space-y-4">
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-2xl font-bold mb-4">
                  {selectedDate.toLocaleDateString('zh-TW', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </h2>

                <div className="space-y-4">
                  <div className="flex gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">節點數量:</span>
                      <span>{selectedDayData.nodeCount}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">主題數量:</span>
                      <span>{selectedDayData.topicCount}</span>
                    </div>
                  </div>

                  {selectedDayData.preview && (
                    <div className="border-l-4 border-blue-600 pl-4 py-2">
                      <p className="text-gray-700">{selectedDayData.preview}</p>
                    </div>
                  )}

                  <button
                    onClick={handleCardClick}
                    className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                  >
                    開啟編輯器
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-gray-500">
              <p className="text-lg">此日期沒有內容</p>
              <button
                onClick={handleCardClick}
                className="mt-4 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition-colors"
              >
                建立新內容
              </button>
            </div>
          )
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <p className="text-lg">請選擇一個日期</p>
          </div>
        )}
      </div>
    </div>
  );
}
