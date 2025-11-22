// lib/services/mindmap.service.ts
import 'server-only'; // 確保只在 Server 端執行
import { db } from '../db/client';
import { mindMaps } from '../db/schema';
import { eq, and } from 'drizzle-orm';

export class MindMapService {
  /**
   * 根據日期獲取使用者的心智圖
   */
  async getMindMapByDate(userId: string, date: string) {
    // 使用 Drizzle 的 Query API (Relational Query)
    const mindMap = await db.query.mindMaps.findFirst({
      where: and(eq(mindMaps.userId, userId), eq(mindMaps.date, date)),
      with: {
        // 連同底下的 nodes 一起撈出來
        nodes: true,
      },
    });

    return mindMap || null;
  }
}
