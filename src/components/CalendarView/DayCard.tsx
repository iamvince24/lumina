/**
 * 每日小卡組件
 * 顯示某一天的輸出預覽
 */

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import type { MindMap } from '@/types/mindmap';

interface DayCardProps {
  /** MindMap 資料 */
  mindmap: MindMap;

  /** 點擊回調 */
  onClick: () => void;
}

/**
 * 每日小卡組件
 */
export function DayCard({ mindmap, onClick }: DayCardProps) {
  // 格式化日期
  const formattedDate = new Intl.DateTimeFormat('zh-TW', {
    month: 'numeric',
    day: 'numeric',
    weekday: 'short',
  }).format(mindmap.date);

  // 取得 Topic 標籤
  const topicNodes = mindmap.nodes.filter((n) => n.data.isTopic);

  // 生成預覽文字（前 3 個 Node 的內容）
  const previewText = mindmap.nodes
    .slice(0, 3)
    .map((n) => `• ${n.data.label}`)
    .join('\n');

  /**
   * 處理點擊事件
   */
  const handleClick = () => {
    onClick();
  };

  /**
   * 處理鍵盤事件
   */
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick();
    }
  };

  return (
    <Card
      className="cursor-pointer hover:shadow-lg transition-shadow"
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      aria-label={`${formattedDate} 的輸出記錄`}
      role="button"
    >
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center justify-between">
          <span>{formattedDate}</span>
        </CardTitle>

        {/* Topic 標籤 */}
        {topicNodes.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {topicNodes.map((node) => (
              <span
                key={node.id}
                className="px-2 py-1 text-xs rounded-full"
                style={{
                  backgroundColor: node.data.color || '#e5e7eb',
                  color: '#374151',
                }}
              >
                {node.data.label}
              </span>
            ))}
          </div>
        )}
      </CardHeader>

      <CardContent>
        <pre className="text-sm text-gray-600 whitespace-pre-wrap">
          {previewText}
        </pre>
      </CardContent>
    </Card>
  );
}
