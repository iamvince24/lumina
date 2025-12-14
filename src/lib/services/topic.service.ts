import { createClient } from '@/lib/supabase/server';
import {
  Topic,
  ParentTopicWithChildren,
  ChildTopic,
  TopicTag,
} from '@/types/topic';

interface TopicRow {
  id: string;
  name: string;
  color: string;
  parent_topic_id: string | null;
  is_pinned: boolean;
  created_at: string;
  updated_at: string;
  accumulation_count: number;
  user_id: string;
}

interface GetParentTopicsOptions {
  onlyWithTags?: boolean;
  tagId?: string;
}

export const topicService = {
  /**
   * 取得使用者的所有 Topics
   */
  async getTopicsByUserId(userId: string): Promise<Topic[]> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('topics')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching topics:', error);
      throw new Error('Failed to fetch topics');
    }

    return (data || []).map(mapTopic);
  },

  /**
   * 取得使用者的釘選 Topics
   */
  async getPinnedTopics(userId: string): Promise<Topic[]> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('topics')
      .select('*')
      .eq('user_id', userId)
      .eq('is_pinned', true)
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('Error fetching pinned topics:', error);
      throw new Error('Failed to fetch pinned topics');
    }

    return (data || []).map(mapTopic);
  },

  /**
   * 取得使用者的非釘選 Topics
   */
  async getRegularTopics(userId: string): Promise<Topic[]> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('topics')
      .select('*')
      .eq('user_id', userId)
      .eq('is_pinned', false)
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('Error fetching regular topics:', error);
      throw new Error('Failed to fetch regular topics');
    }

    return (data || []).map(mapTopic);
  },

  /**
   * 取得單一 Topic
   */
  async getTopicById(topicId: string): Promise<Topic | null> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('topics')
      .select('*')
      .eq('id', topicId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // Not found
      console.error('Error fetching topic:', error);
      throw new Error('Failed to fetch topic');
    }

    return mapTopic(data);
  },

  /**
   * 取得父 Topics（包含子 topics 和標籤）
   */
  async getParentTopicsWithChildren(
    userId: string,
    options: GetParentTopicsOptions = {}
  ): Promise<ParentTopicWithChildren[]> {
    const supabase = await createClient();

    // 取得所有父 Topics（沒有 parent_topic_id 的）
    const { data: parentTopics, error: parentError } = await supabase
      .from('topics')
      .select('*')
      .eq('user_id', userId)
      .is('parent_topic_id', null)
      .order('updated_at', { ascending: false });

    if (parentError) {
      console.error('Error fetching parent topics:', parentError);
      throw new Error('Failed to fetch parent topics');
    }

    if (!parentTopics || parentTopics.length === 0) {
      return [];
    }

    const parentTopicIds = parentTopics.map((t: TopicRow) => t.id);

    // 取得所有子 Topics
    const { data: childTopics, error: childError } = await supabase
      .from('topics')
      .select('*')
      .eq('user_id', userId)
      .in('parent_topic_id', parentTopicIds);

    if (childError) {
      console.error('Error fetching child topics:', childError);
      throw new Error('Failed to fetch child topics');
    }

    // 建立父 Topic -> 子 Topics 的映射
    const childTopicsMap = new Map<string, ChildTopic[]>();
    (childTopics || []).forEach((child: TopicRow) => {
      if (child.parent_topic_id) {
        const children = childTopicsMap.get(child.parent_topic_id) || [];
        children.push({
          id: child.id,
          name: child.name,
          color: child.color,
        });
        childTopicsMap.set(child.parent_topic_id, children);
      }
    });

    // 如果需要過濾有標籤的 Topics，需要額外查詢
    let topicTagsMap = new Map<string, TopicTag[]>();

    if (options.onlyWithTags || options.tagId) {
      // 這裡假設有一個 topic_tags 或通過 nodes 關聯的表
      // 根據實際資料庫結構調整
      // 暫時返回空的 tags
      topicTagsMap = new Map();
    }

    // 組合結果
    const result: ParentTopicWithChildren[] = parentTopics.map(
      (parent: TopicRow) => ({
        ...mapTopic(parent),
        childTopics: childTopicsMap.get(parent.id) || [],
        tags: topicTagsMap.get(parent.id) || [],
      })
    );

    // 如果只要有標籤的，過濾掉沒有標籤的
    if (options.onlyWithTags) {
      return result.filter((t) => t.tags.length > 0);
    }

    // 如果要過濾特定標籤
    if (options.tagId) {
      return result.filter((t) =>
        t.tags.some((tag) => tag.id === options.tagId)
      );
    }

    return result;
  },

  /**
   * 建立新的 Topic
   */
  async createTopic(
    userId: string,
    data: {
      name: string;
      color?: string;
      parentTopicId?: string;
      isPinned?: boolean;
    }
  ): Promise<Topic> {
    const supabase = await createClient();
    const { data: newTopic, error } = await supabase
      .from('topics')
      .insert({
        user_id: userId,
        name: data.name,
        color: data.color || '#94a3b8',
        parent_topic_id: data.parentTopicId || null,
        is_pinned: data.isPinned || false,
        accumulation_count: 0,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating topic:', error);
      throw new Error('Failed to create topic');
    }

    return mapTopic(newTopic);
  },

  /**
   * 更新 Topic
   */
  async updateTopic(
    topicId: string,
    data: {
      name?: string;
      color?: string;
      isPinned?: boolean;
      parentTopicId?: string;
    }
  ): Promise<Topic> {
    const supabase = await createClient();
    const updateData: Record<string, unknown> = {};

    if (data.name !== undefined) updateData.name = data.name;
    if (data.color !== undefined) updateData.color = data.color;
    if (data.isPinned !== undefined) updateData.is_pinned = data.isPinned;
    if (data.parentTopicId !== undefined)
      updateData.parent_topic_id = data.parentTopicId;
    updateData.updated_at = new Date().toISOString();

    const { data: updatedTopic, error } = await supabase
      .from('topics')
      .update(updateData)
      .eq('id', topicId)
      .select()
      .single();

    if (error) {
      console.error('Error updating topic:', error);
      throw new Error('Failed to update topic');
    }

    return mapTopic(updatedTopic);
  },

  /**
   * 刪除 Topic
   */
  async deleteTopic(topicId: string): Promise<void> {
    const supabase = await createClient();
    const { error } = await supabase.from('topics').delete().eq('id', topicId);

    if (error) {
      console.error('Error deleting topic:', error);
      throw new Error('Failed to delete topic');
    }
  },
};

/**
 * 將資料庫格式轉換為前端格式
 */
function mapTopic(row: TopicRow): Topic {
  return {
    id: row.id,
    name: row.name,
    color: row.color,
    parentTopicId: row.parent_topic_id ?? undefined,
    isPinned: row.is_pinned,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
    accumulationCount: row.accumulation_count,
    userId: row.user_id,
  };
}
