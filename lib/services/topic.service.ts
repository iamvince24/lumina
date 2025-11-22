import { db } from '@/lib/db/client';
import { topics } from '@/lib/db/schema';
import { eq, desc, and } from 'drizzle-orm';
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
}

export const topicService = new TopicService();
