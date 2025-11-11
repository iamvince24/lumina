/**
 * Topic 時間軸視圖
 * 使用 Mock 資料按日期顯示記錄
 */

'use client';

import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { Calendar, ArrowRight } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useMockTopicNodes } from '@/__mocks__/hooks';

interface TimelineViewProps {
  /** Topic ID */
  topicId: string;
}

/**
 * 日期分組的 nodes
 */
interface DateGroup {
  /** 日期 */
  date: string;

  /** 該日期的 nodes */
  nodes: Array<{
    id: string;
    label: string;
    createdAt: Date;
  }>;
}

/**
 * Topic 時間軸視圖
 */
export function TimelineView({ topicId }: TimelineViewProps) {
  const router = useRouter();

  // 使用 Mock Hook 查詢該 Topic 相關的所有 nodes
  const { data: topicData, isLoading } = useMockTopicNodes(topicId);

  /**
   * 將 nodes 按日期分組
   */
  const dateGroups = useMemo(() => {
    if (!topicData?.nodes) {
      return [];
    }

    // 建立日期 -> nodes 的 Map
    const groupsMap = new Map<string, DateGroup['nodes']>();

    topicData.nodes.forEach((node) => {
      const dateStr = format(node.createdAt, 'yyyy-MM-dd');

      if (!groupsMap.has(dateStr)) {
        groupsMap.set(dateStr, []);
      }

      groupsMap.get(dateStr)!.push({
        id: node.id,
        label: node.data.label,
        createdAt: node.createdAt,
      });
    });

    // 轉換為陣列並按日期倒序排序
    const groups: DateGroup[] = Array.from(groupsMap.entries())
      .map(([date, nodes]) => ({ date, nodes }))
      .sort((a, b) => b.date.localeCompare(a.date));

    return groups;
  }, [topicData]);

  /**
   * 導航到指定日期的編輯頁面
   */
  const handleDateClick = (date: string) => {
    router.push(`/editor/${date}`);
  };

  // 載入中狀態
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-gray-600">載入中...</div>
      </div>
    );
  }

  // 沒有記錄
  if (dateGroups.length === 0) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-gray-500">
          <p className="text-lg mb-2">尚未有任何記錄</p>
          <p className="text-sm">開始編輯心智圖時標記為此 Topic 吧！</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {dateGroups.map((group) => {
        const formattedDate = format(
          new Date(group.date),
          'yyyy 年 MM 月 dd 日'
        );

        return (
          <Card key={group.date}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                {/* 日期 */}
                <CardTitle className="text-base flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-gray-600" />
                  <span>{formattedDate}</span>
                </CardTitle>

                {/* 前往編輯頁面按鈕 */}
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleDateClick(group.date)}
                  className="flex items-center gap-1"
                >
                  <span className="text-sm">查看</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>

            <CardContent>
              {/* Nodes 列表 */}
              <ul className="space-y-2">
                {group.nodes.map((node) => (
                  <li
                    key={node.id}
                    className="flex items-start gap-2 text-gray-700"
                  >
                    <span className="text-gray-400 mt-1">•</span>
                    <span>{node.label}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
