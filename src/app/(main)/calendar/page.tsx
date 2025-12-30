/**
 * 月曆視圖
 * 路由: /calendar
 */
import { CalendarView } from '@/components/CalendarView';

// 月曆頁面
export default function CalendarPage() {
  return (
    <div className="h-full">
      <CalendarView />
    </div>
  );
}
