// lib/services/mindmap.service.ts
import 'server-only'; // 確保只在 Server 端執行
import { db } from '../db/client';
import { mindMaps } from '../db/schema';
import { eq, and, gte, lte } from 'drizzle-orm';

export class MindMapService {
  /**
   * 根據日期獲取使用者的心智圖
   */
  async getMindMapByDate(userId: string, date: string) {
    // 使用 Drizzle 的 Query API (Relational Query)
    const mindMap = await db.query.mindMaps.findFirst({
      where: and(eq(mindMaps.userId, userId), eq(mindMaps.date, date)),
      with: {
        // 連同底下的 nodes 一起撈出來，包含所有關聯資料
        nodes: {
          with: {
            // 獲取 node 關聯的 tags
            tags: {
              with: {
                tag: true,
              },
            },
            // 獲取 node 關聯的 topic
            topic: true,
          },
        },
      },
    });

    return mindMap || null;
  }

  /**
   * 取得指定月份的心智圖摘要列表
   */
  async getMindMapSummaryByMonth(userId: string, year: number, month: number) {
    // 計算月份的起始和結束日期
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    // 格式化為 YYYY-MM-DD
    const startStr = startDate.toISOString().split('T')[0];
    const endStr = endDate.toISOString().split('T')[0];

    // 查詢範圍內的 MindMaps
    const results = await db.query.mindMaps.findMany({
      where: and(
        eq(mindMaps.userId, userId),
        gte(mindMaps.date, startStr),
        lte(mindMaps.date, endStr)
      ),
      with: {
        nodes: {
          // 只取需要的欄位以優化效能
          columns: {
            id: true,
            content: true,
            isTopic: true,
          },
          with: {
            // 獲取 node 關聯的 tags
            tags: {
              with: {
                tag: true,
              },
            },
          },
        },
      },
    });

    return results;
  }
}
