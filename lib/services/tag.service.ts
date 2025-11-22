import { db } from '@/lib/db/client';
import { tags } from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';
import type { Tag } from '@/types/tag';

export class TagService {
  /**
   * 取得使用者的所有 Tags
   * @param userId - 使用者 UUID
   * @returns Tags 列表
   */
  async getTagsByUserId(userId: string): Promise<Tag[]> {
    const result = await db
      .select({
        id: tags.id,
        name: tags.name,
        color: tags.color,
        createdAt: tags.createdAt,
      })
      .from(tags)
      .where(eq(tags.userId, userId))
      .orderBy(desc(tags.createdAt));

    return result.map((tag) => ({
      ...tag,
      color: tag.color ?? '#6B7280', // 預設使用 gray-500 顏色
      usageCount: 0, // TODO: 計算使用次數（需要 join nodeTags table）
    }));
  }
}

export const tagService = new TagService();
