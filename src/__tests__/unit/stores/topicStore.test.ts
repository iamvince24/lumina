/**
 * TopicStore 測試
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { useTopicStore } from '@/stores/topicStore';

describe('TopicStore', () => {
  beforeEach(() => {
    useTopicStore.getState().reset();
  });

  describe('createTopic', () => {
    it('應該建立新 Topic', () => {
      const store = useTopicStore.getState();

      const topic = store.createTopic({
        name: 'Test Topic',
        color: '#3b82f6',
      });

      expect(topic.name).toBe('Test Topic');
      expect(topic.color).toBe('#3b82f6');
      expect(useTopicStore.getState().topics).toHaveLength(1);
    });

    it('應該支援父 Topic', () => {
      const store = useTopicStore.getState();

      const parent = store.createTopic({
        name: 'Parent',
        color: '#3b82f6',
      });

      const child = store.createTopic({
        name: 'Child',
        color: '#10b981',
        parentTopicId: parent.id,
      });

      expect(child.parentTopicId).toBe(parent.id);
    });

    it('應該在建立時自動釘選（如果指定）', () => {
      const store = useTopicStore.getState();

      const topic = store.createTopic({
        name: 'Pinned Topic',
        color: '#3b82f6',
        isPinned: true,
      });

      const { pinnedTopicIds } = useTopicStore.getState();
      expect(pinnedTopicIds).toContain(topic.id);
      expect(topic.isPinned).toBe(true);
    });
  });

  describe('updateTopic', () => {
    it('應該正確更新 Topic 的資料', () => {
      const store = useTopicStore.getState();

      const topic = store.createTopic({
        name: 'Original',
        color: '#3b82f6',
      });

      store.updateTopic({
        id: topic.id,
        data: {
          name: 'Updated',
          color: '#10b981',
        },
      });

      const updatedTopic = store.getTopicById(topic.id);
      expect(updatedTopic?.name).toBe('Updated');
      expect(updatedTopic?.color).toBe('#10b981');
    });

    it('應該在更新 isPinned 時同步更新 pinnedTopicIds', () => {
      const store = useTopicStore.getState();

      const topic = store.createTopic({
        name: 'Test',
        color: '#3b82f6',
        isPinned: false,
      });

      // 釘選
      store.updateTopic({
        id: topic.id,
        data: { isPinned: true },
      });

      expect(useTopicStore.getState().pinnedTopicIds).toContain(topic.id);

      // 取消釘選
      store.updateTopic({
        id: topic.id,
        data: { isPinned: false },
      });

      expect(useTopicStore.getState().pinnedTopicIds).not.toContain(topic.id);
    });
  });

  describe('deleteTopic', () => {
    it('應該刪除 Topic', () => {
      const store = useTopicStore.getState();

      const topic = store.createTopic({
        name: 'Test',
        color: '#3b82f6',
      });

      store.deleteTopic(topic.id);

      expect(useTopicStore.getState().topics).toHaveLength(0);
      expect(store.getTopicById(topic.id)).toBeUndefined();
    });

    it('刪除 Topic 時應該同時從 pinnedTopicIds 移除', () => {
      const store = useTopicStore.getState();

      const topic = store.createTopic({
        name: 'Pinned',
        color: '#3b82f6',
        isPinned: true,
      });

      store.deleteTopic(topic.id);

      expect(useTopicStore.getState().pinnedTopicIds).not.toContain(topic.id);
    });

    it('刪除選中的 Topic 時應該清除 selectedTopicId', () => {
      const store = useTopicStore.getState();

      const topic = store.createTopic({
        name: 'Test',
        color: '#3b82f6',
      });

      useTopicStore.setState({ selectedTopicId: topic.id });
      store.deleteTopic(topic.id);

      expect(useTopicStore.getState().selectedTopicId).toBeNull();
    });
  });

  describe('togglePinTopic', () => {
    it('應該釘選/取消釘選 Topic', () => {
      const store = useTopicStore.getState();

      const topic = store.createTopic({
        name: 'Test',
        color: '#3b82f6',
      });

      // 釘選
      store.togglePinTopic(topic.id);
      expect(useTopicStore.getState().pinnedTopicIds).toContain(topic.id);
      expect(store.getTopicById(topic.id)?.isPinned).toBe(true);

      // 取消釘選
      store.togglePinTopic(topic.id);
      expect(useTopicStore.getState().pinnedTopicIds).not.toContain(topic.id);
      expect(store.getTopicById(topic.id)?.isPinned).toBe(false);
    });
  });

  describe('getTopicById', () => {
    it('應該根據 ID 取得 Topic', () => {
      const store = useTopicStore.getState();

      const topic = store.createTopic({
        name: 'Test',
        color: '#3b82f6',
      });

      const found = store.getTopicById(topic.id);

      expect(found).toBeDefined();
      expect(found?.id).toBe(topic.id);
      expect(found?.name).toBe('Test');
    });

    it('找不到時應該返回 undefined', () => {
      const store = useTopicStore.getState();

      const found = store.getTopicById('non-existent-id');

      expect(found).toBeUndefined();
    });
  });

  describe('getPinnedTopics', () => {
    it('應該取得所有釘選的 Topics', () => {
      const store = useTopicStore.getState();

      const pinned1 = store.createTopic({
        name: 'Pinned 1',
        color: '#3b82f6',
        isPinned: true,
      });

      const pinned2 = store.createTopic({
        name: 'Pinned 2',
        color: '#10b981',
        isPinned: true,
      });

      store.createTopic({
        name: 'Not Pinned',
        color: '#f59e0b',
        isPinned: false,
      });

      const pinnedTopics = store.getPinnedTopics();

      expect(pinnedTopics).toHaveLength(2);
      expect(pinnedTopics.map((t) => t.id)).toContain(pinned1.id);
      expect(pinnedTopics.map((t) => t.id)).toContain(pinned2.id);
    });
  });

  describe('getChildTopics', () => {
    it('應該取得子 Topics', () => {
      const store = useTopicStore.getState();

      const parent = store.createTopic({
        name: 'Parent',
        color: '#3b82f6',
      });

      store.createTopic({
        name: 'Child 1',
        color: '#10b981',
        parentTopicId: parent.id,
      });

      store.createTopic({
        name: 'Child 2',
        color: '#f59e0b',
        parentTopicId: parent.id,
      });

      store.createTopic({
        name: 'Other',
        color: '#ef4444',
      });

      const children = store.getChildTopics(parent.id);
      expect(children).toHaveLength(2);
      expect(children.every((c) => c.parentTopicId === parent.id)).toBe(true);
    });

    it('沒有子 Topics 時應該返回空陣列', () => {
      const store = useTopicStore.getState();

      const parent = store.createTopic({
        name: 'Parent',
        color: '#3b82f6',
      });

      const children = store.getChildTopics(parent.id);
      expect(children).toHaveLength(0);
    });
  });

  describe('getTopicStats', () => {
    it('應該取得 Topic 的統計資訊', () => {
      const store = useTopicStore.getState();

      const topic = store.createTopic({
        name: 'Test',
        color: '#3b82f6',
      });

      const stats = store.getTopicStats(topic.id);

      expect(stats).not.toBeNull();
      expect(stats?.topicId).toBe(topic.id);
      expect(stats?.totalEntries).toBe(0);
      expect(stats?.lastUpdated).toBeInstanceOf(Date);
      expect(stats?.firstCreated).toBeInstanceOf(Date);
    });

    it('找不到 Topic 時應該返回 null', () => {
      const store = useTopicStore.getState();

      const stats = store.getTopicStats('non-existent-id');

      expect(stats).toBeNull();
    });
  });

  describe('loadTopics', () => {
    it('應該載入所有 Topics', () => {
      const store = useTopicStore.getState();

      const topics = [
        {
          id: '1',
          name: 'Topic 1',
          color: '#3b82f6',
          isPinned: true,
          createdAt: new Date(),
          updatedAt: new Date(),
          accumulationCount: 0,
          userId: 'user-1',
        },
        {
          id: '2',
          name: 'Topic 2',
          color: '#10b981',
          isPinned: false,
          createdAt: new Date(),
          updatedAt: new Date(),
          accumulationCount: 0,
          userId: 'user-1',
        },
      ];

      store.loadTopics(topics);

      const { topics: loadedTopics, pinnedTopicIds } = useTopicStore.getState();

      expect(loadedTopics).toHaveLength(2);
      expect(pinnedTopicIds).toContain('1');
      expect(pinnedTopicIds).not.toContain('2');
    });
  });

  describe('reset', () => {
    it('應該重置 Store 到初始狀態', () => {
      const store = useTopicStore.getState();

      store.createTopic({
        name: 'Test',
        color: '#3b82f6',
        isPinned: true,
      });

      useTopicStore.setState({ selectedTopicId: 'test-id' });

      store.reset();

      const state = useTopicStore.getState();
      expect(state.topics).toHaveLength(0);
      expect(state.pinnedTopicIds).toHaveLength(0);
      expect(state.selectedTopicId).toBeNull();
      expect(state.isLoading).toBe(false);
      expect(state.error).toBeNull();
    });
  });
});
