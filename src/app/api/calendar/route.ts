import { NextResponse } from 'next/server';
import { MindMapService } from '@/lib/services/mindmap.service';
import { withAuth } from '@/lib/api/middleware';

const mindMapService = new MindMapService();

export const GET = withAuth(async (req, { user }) => {
  try {
    const { searchParams } = new URL(req.url);
    const year = parseInt(searchParams.get('year') || '');
    const month = parseInt(searchParams.get('month') || '');

    if (isNaN(year) || isNaN(month)) {
      return NextResponse.json(
        { error: 'Invalid year or month' },
        { status: 400 }
      );
    }

    const mindMaps = await mindMapService.getMindMapSummaryByMonth(
      user.id,
      year,
      month
    );

    // 轉換為前端需要的格式: Record<dateString, entry>
    const calendarEntries = mindMaps.reduce(
      (acc, mindMap) => {
        // mindMap.date is a string 'YYYY-MM-DD'
        const dateStr = mindMap.date;

        // 計算節點數量
        const nodeCount = mindMap.nodes.length;

        // 計算 Topic 數量 (isTopic = true)
        const topicCount = mindMap.nodes.filter((n) => n.isTopic).length;

        // 取得預覽文字 (第一個非 Topic 的節點，或是第一個節點)
        const firstContentNode =
          mindMap.nodes.find((n) => !n.isTopic) || mindMap.nodes[0];
        const preview = firstContentNode?.content || '';

        // 收集所有唯一的 tags（從所有 nodes 的 tags 中）
        const tagSet = new Set<string>();
        mindMap.nodes.forEach((node) => {
          if (node.tags) {
            node.tags.forEach((nodeTag) => {
              if (nodeTag.tag) {
                tagSet.add(nodeTag.tag.name);
              }
            });
          }
        });
        const tags = Array.from(tagSet);

        // 收集所有非 topic 的 nodes 的 content（作為主題列表）
        const topics = mindMap.nodes
          .filter((n) => !n.isTopic)
          .map((n) => n.content)
          .filter((content) => content.trim().length > 0);

        acc[dateStr] = {
          date: dateStr,
          hasContent: true,
          nodeCount,
          topicCount,
          preview,
          tags,
          topics,
        };
        return acc;
      },
      {} as Record<
        string,
        {
          date: string;
          hasContent: boolean;
          nodeCount: number;
          topicCount: number;
          preview: string;
          tags: string[];
          topics: string[];
        }
      >
    );

    return NextResponse.json({ data: calendarEntries });
  } catch (error) {
    console.error('Calendar API Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch calendar entries' },
      { status: 500 }
    );
  }
});
