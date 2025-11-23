import { db } from '@/lib/db/client';
import { topics, nodes } from '@/lib/db/schema';
import { eq, desc, and, isNull, sql } from 'drizzle-orm';
import type { Topic } from '@/types/topic';

export class TopicService {
  /**
   * 取得使用者的所有 Topics
   * @param userId - 使用者 UUID
   * @returns Topics 列表（包含 pinned 和一般 topics）
   */
  async getTopicsByUserId(userId: string): Promise<Topic[]> {
    const result = await db
      .select({
        id: topics.id,
        userId: topics.userId,
        name: topics.name,
        color: topics.color,
        parentTopicId: topics.parentTopicId,
        isPinned: topics.isPinned,
        createdAt: topics.createdAt,
        updatedAt: topics.updatedAt,
      })
      .from(topics)
      .where(eq(topics.userId, userId))
      .orderBy(desc(topics.isPinned), desc(topics.updatedAt));

    return result.map((topic) => ({
      ...topic,
      parentTopicId: topic.parentTopicId ?? undefined,
      accumulationCount: 0, // TODO: 計算累積次數（需要 join nodes table）
    }));
  }

  /**
   * 取得使用者的 Pinned Topics
   * @param userId - 使用者 UUID
   */
  async getPinnedTopics(userId: string): Promise<Topic[]> {
    const result = await db
      .select({
        id: topics.id,
        userId: topics.userId,
        name: topics.name,
        color: topics.color,
        parentTopicId: topics.parentTopicId,
        isPinned: topics.isPinned,
        createdAt: topics.createdAt,
        updatedAt: topics.updatedAt,
      })
      .from(topics)
      .where(and(eq(topics.userId, userId), eq(topics.isPinned, true)))
      .orderBy(desc(topics.updatedAt));

    return result.map((topic) => ({
      ...topic,
      parentTopicId: topic.parentTopicId ?? undefined,
      accumulationCount: 0,
    }));
  }

  /**
   * 取得使用者的一般 Topics（非 pinned）
   * @param userId - 使用者 UUID
   */
  async getRegularTopics(userId: string): Promise<Topic[]> {
    const result = await db
      .select({
        id: topics.id,
        userId: topics.userId,
        name: topics.name,
        color: topics.color,
        parentTopicId: topics.parentTopicId,
        isPinned: topics.isPinned,
        createdAt: topics.createdAt,
        updatedAt: topics.updatedAt,
      })
      .from(topics)
      .where(and(eq(topics.userId, userId), eq(topics.isPinned, false)))
      .orderBy(desc(topics.updatedAt));

    return result.map((topic) => ({
      ...topic,
      parentTopicId: topic.parentTopicId ?? undefined,
      accumulationCount: 0,
    }));
  }

  /**
   * 取得父 Topics（parentTopicId 為 null 且有子 topics）
   * 包含子 topics 和節點統計資訊
   * @param userId - 使用者 UUID
   */
  async getParentTopicsWithChildren(userId: string) {
    // 1. 獲取所有根層級的 topics（parentTopicId 為 null）
    const parentTopics = await db
      .select({
        id: topics.id,
        userId: topics.userId,
        name: topics.name,
        color: topics.color,
        parentTopicId: topics.parentTopicId,
        isPinned: topics.isPinned,
        createdAt: topics.createdAt,
        updatedAt: topics.updatedAt,
      })
      .from(topics)
      .where(and(eq(topics.userId, userId), isNull(topics.parentTopicId)))
      .orderBy(desc(topics.isPinned), desc(topics.updatedAt));

    // 2. 為每個父 topic 獲取子 topics
    const result = await Promise.all(
      parentTopics.map(async (parentTopic) => {
        // 獲取子 topics
        const childTopics = await db
          .select({
            id: topics.id,
            name: topics.name,
            color: topics.color,
          })
          .from(topics)
          .where(eq(topics.parentTopicId, parentTopic.id));

        // 獲取節點統計（包含父 topic 和所有子 topics 的節點數）
        const topicIds = [
          parentTopic.id,
          ...childTopics.map((child) => child.id),
        ];

        const nodeCountResult = await db
          .select({
            count: sql<number>`cast(count(*) as integer)`,
          })
          .from(nodes)
          .where(
            sql`${nodes.topicId} IN (${sql.join(
              topicIds.map((id) => sql`${id}`),
              sql`, `
            )})`
          );

        const accumulationCount = nodeCountResult[0]?.count || 0;

        return {
          ...parentTopic,
          parentTopicId: parentTopic.parentTopicId ?? undefined,
          accumulationCount,
          childTopics: childTopics.map((child) => ({
            id: child.id,
            name: child.name,
            color: child.color,
          })),
        };
      })
    );

    // 3. 只返回有子 topics 的父 topics
    return result.filter((topic) => topic.childTopics.length > 0);
  }
}

export const topicService = new TopicService();
