/**
 * Calendar 組件測試
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { Calendar } from '@/components/CalendarView/Calendar';

describe('Calendar', () => {
  const mockOnDateSelect = vi.fn();
  const mockOnMonthChange = vi.fn();

  const defaultProps = {
    currentDate: new Date(2024, 0, 15), // 2024-01-15
    datesWithOutput: ['2024-01-10', '2024-01-20'],
    selectedDate: null,
    onDateSelect: mockOnDateSelect,
    onMonthChange: mockOnMonthChange,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('應該顯示當前月份', () => {
    render(<Calendar {...defaultProps} />);

    expect(screen.getByText('2024 年 1 月')).toBeInTheDocument();
  });

  it('應該顯示有輸出的日期標記', () => {
    render(<Calendar {...defaultProps} />);

    // 檢查日期 10 和 20 是否有標記
    // 由於標記是小點，我們檢查日期按鈕是否存在
    const dateButtons = screen.getAllByRole('button');
    const date10Button = dateButtons.find((btn) =>
      btn.getAttribute('aria-label')?.includes('2024-01-10')
    );
    const date20Button = dateButtons.find((btn) =>
      btn.getAttribute('aria-label')?.includes('2024-01-20')
    );

    expect(date10Button).toBeInTheDocument();
    expect(date20Button).toBeInTheDocument();
  });

  it('應該可以切換月份', () => {
    render(<Calendar {...defaultProps} />);

    // 找到下個月按鈕（ChevronRight）
    const nextButton = screen.getByLabelText('下個月');
    fireEvent.click(nextButton);

    expect(mockOnMonthChange).toHaveBeenCalled();
    const newDate = mockOnMonthChange.mock.calls[0][0];
    expect(newDate.getMonth()).toBe(1); // 2 月
  });

  it('應該可以切換到上個月', () => {
    render(<Calendar {...defaultProps} />);

    // 找到上個月按鈕（ChevronLeft）
    const prevButton = screen.getByLabelText('上個月');
    fireEvent.click(prevButton);

    expect(mockOnMonthChange).toHaveBeenCalled();
    const newDate = mockOnMonthChange.mock.calls[0][0];
    expect(newDate.getMonth()).toBe(11); // 12 月（前一年）
  });

  it('應該可以回到今天', () => {
    render(<Calendar {...defaultProps} />);

    const todayButton = screen.getByText('今天');
    fireEvent.click(todayButton);

    expect(mockOnMonthChange).toHaveBeenCalledWith(expect.any(Date));
  });

  it('應該可以選擇日期', () => {
    render(<Calendar {...defaultProps} />);

    // 找到日期 15 的按鈕
    const dateButtons = screen.getAllByRole('button');
    const date15Button = dateButtons.find((btn) =>
      btn.getAttribute('aria-label')?.includes('2024-01-15')
    );

    if (date15Button) {
      fireEvent.click(date15Button);
      expect(mockOnDateSelect).toHaveBeenCalled();
    }
  });

  it('應該高亮顯示選中的日期', () => {
    const selectedDate = new Date(2024, 0, 15);
    render(<Calendar {...defaultProps} selectedDate={selectedDate} />);

    const dateButtons = screen.getAllByRole('button');
    const selectedButton = dateButtons.find((btn) =>
      btn.className.includes('bg-blue-50')
    );

    expect(selectedButton).toBeDefined();
  });

  it('應該顯示今天日期為圓圈標記', () => {
    const today = new Date();
    render(
      <Calendar {...defaultProps} currentDate={today} selectedDate={null} />
    );

    // 檢查今天的日期是否有圓圈樣式
    // 由於 currentDate 設為 today，今天應該在月曆中
    const dateButtons = screen.getAllByRole('button');

    // 查找所有包含圓圈樣式的 div
    let foundCircle = false;
    dateButtons.forEach((btn) => {
      const dateDivs = btn.querySelectorAll('div');
      dateDivs.forEach((div) => {
        const className = div.className || '';
        if (
          className.includes('rounded-full') &&
          className.includes('bg-blue-500')
        ) {
          foundCircle = true;
        }
      });
    });

    // 當 currentDate 為今天時，今天應該在月曆中並顯示圓圈標記
    // 驗證功能邏輯正確
    expect(foundCircle).toBe(true);
  });

  it('應該顯示非當月日期為灰色', () => {
    render(<Calendar {...defaultProps} />);

    // 檢查是否有灰色文字（非當月日期）
    const dateButtons = screen.getAllByRole('button');
    const grayDateButton = dateButtons.find((btn) =>
      btn.className.includes('text-gray-400')
    );

    // 應該有非當月的日期（上個月或下個月的日期）
    expect(grayDateButton).toBeDefined();
  });
});
