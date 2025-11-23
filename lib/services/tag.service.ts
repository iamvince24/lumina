import { db } from '@/lib/db/client';
import { tags, nodeTags } from '@/lib/db/schema';
import { eq, desc, sql, and } from 'drizzle-orm';
import type { Tag } from '@/types/tag';

export class TagService {
  /**
   * 取得使用者的所有 Tags (包含使用次數)
   * @param userId - 使用者 UUID
   * @returns Tags 列表
   */
  async getTagsByUserId(userId: string): Promise<Tag[]> {
    const result = await db
      .select({
        id: tags.id,
        userId: tags.userId,
        name: tags.name,
        color: tags.color,
        createdAt: tags.createdAt,
        usageCount: sql<number>`count(${nodeTags.nodeId})`.mapWith(Number),
      })
      .from(tags)
      .leftJoin(nodeTags, eq(tags.id, nodeTags.tagId))
      .where(eq(tags.userId, userId))
      .groupBy(tags.id)
      .orderBy(desc(tags.createdAt));

    return result.map((tag) => ({
      ...tag,
      color: tag.color ?? '#6B7280',
    }));
  }

  /**
   * 根據 ID 取得 Tag
   */
  async getTagById(tagId: string): Promise<Tag | undefined> {
    const result = await db
      .select({
        id: tags.id,
        userId: tags.userId,
        name: tags.name,
        color: tags.color,
        createdAt: tags.createdAt,
        usageCount: sql<number>`count(${nodeTags.nodeId})`.mapWith(Number),
      })
      .from(tags)
      .leftJoin(nodeTags, eq(tags.id, nodeTags.tagId))
      .where(eq(tags.id, tagId))
      .groupBy(tags.id);

    if (result.length === 0) return undefined;

    const tag = result[0];
    return {
      ...tag,
      color: tag.color ?? '#6B7280',
    };
  }

  /**
   * 建立新 Tag
   */
  async createTag(
    userId: string,
    data: { name: string; color?: string }
  ): Promise<Tag> {
    const [newTag] = await db
      .insert(tags)
      .values({
        userId,
        name: data.name,
        color: data.color ?? '#6B7280',
      })
      .returning();

    return {
      ...newTag,
      color: newTag.color ?? '#6B7280',
      usageCount: 0,
    };
  }

  /**
   * 更新 Tag
   */
  async updateTag(
    tagId: string,
    data: { name?: string; color?: string }
  ): Promise<Tag> {
    await db
      .update(tags)
      .set({
        ...data,
      })
      .where(eq(tags.id, tagId))
      .returning();

    // 重新獲取以取得最新的 usageCount (雖然更新通常不影響 count，但為了資料一致性)
    const fullTag = await this.getTagById(tagId);
    if (!fullTag) throw new Error('Tag not found after update');

    return fullTag;
  }

  /**
   * 刪除 Tag
   * @param removeNodes - 是否同時移除關聯的 Nodes (目前需求是移除關聯，不是刪除 Nodes 本身)
   * 根據 schema, node_tags 有 onDelete: 'cascade'，所以刪除 tag 會自動移除關聯
   */
  async deleteTag(tagId: string): Promise<void> {
    await db.delete(tags).where(eq(tags.id, tagId));
  }

  /**
   * 取得特定 Tag 下的所有 Nodes
   */
  async getNodesByTagId(tagId: string) {
    // 這裡我們需要 join nodes, node_tags, topics (為了顯示來源 Topic)
    // 並且只選取需要的欄位
    const result = await db.query.nodeTags.findMany({
      where: eq(nodeTags.tagId, tagId),
      with: {
        node: {
          with: {
            topic: true,
          },
        },
      },
      orderBy: desc(nodeTags.createdAt),
    });

    return result.map((r) => r.node);
  }

  /**
   * 從 Node 移除 Tag
   */
  async removeTagFromNode(nodeId: string, tagId: string): Promise<void> {
    await db
      .delete(nodeTags)
      .where(and(eq(nodeTags.nodeId, nodeId), eq(nodeTags.tagId, tagId)));
  }
}

export const tagService = new TagService();
