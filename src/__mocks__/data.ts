/**
 * Mock 資料
 * 用於前端開發時模擬 API 回應
 */

import { MockTopic, MockMindMap, MockTopicNodes } from './types';

/**
 * Mock Topics 資料
 */
export const MOCK_TOPICS: MockTopic[] = [
  {
    id: 'topic-1',
    name: 'React Hooks',
    color: '#3b82f6',
    nodeCount: 15,
    relatedDatesCount: 8,
    lastUpdated: new Date('2024-11-08'),
  },
  {
    id: 'topic-2',
    name: 'TypeScript 進階',
    color: '#8b5cf6',
    nodeCount: 12,
    relatedDatesCount: 6,
    lastUpdated: new Date('2024-11-07'),
  },
  {
    id: 'topic-3',
    name: 'Next.js App Router',
    color: '#10b981',
    nodeCount: 20,
    relatedDatesCount: 10,
    lastUpdated: new Date('2024-11-09'),
  },
  {
    id: 'topic-4',
    name: 'CSS 動畫',
    color: '#f59e0b',
    nodeCount: 8,
    relatedDatesCount: 4,
    lastUpdated: new Date('2024-11-05'),
  },
  {
    id: 'topic-5',
    name: 'Web Performance',
    color: '#ef4444',
    nodeCount: 10,
    relatedDatesCount: 5,
    lastUpdated: new Date('2024-11-06'),
  },
];

/**
 * Mock MindMaps 資料（按日期索引）
 */
export const MOCK_MINDMAPS: Record<string, MockMindMap> = {
  '2024-11-10': {
    id: 'mindmap-2024-11-10',
    date: '2024-11-10',
    title: '心智圖 2024/11/10',
    nodes: [
      {
        id: 'node-1',
        type: 'custom',
        position: { x: 0, y: 0 },
        data: { label: '今天學習的內容' },
      },
      {
        id: 'node-2',
        type: 'topic',
        position: { x: 200, y: 0 },
        data: {
          label: 'React Hooks',
          isTopic: true,
          topicId: 'topic-1',
          color: '#3b82f6',
        },
      },
    ],
    edges: [
      {
        id: 'edge-1-2',
        source: 'node-1',
        target: 'node-2',
      },
    ],
    createdAt: new Date('2024-11-10'),
    updatedAt: new Date('2024-11-10'),
  },
  '2024-11-09': {
    id: 'mindmap-2024-11-09',
    date: '2024-11-09',
    title: '心智圖 2024/11/09',
    nodes: [
      {
        id: 'node-3',
        type: 'custom',
        position: { x: 0, y: 0 },
        data: { label: '昨天的學習' },
      },
    ],
    edges: [],
    createdAt: new Date('2024-11-09'),
    updatedAt: new Date('2024-11-09'),
  },
};

/**
 * Mock Topic Nodes 資料（按 Topic ID 索引）
 */
export const MOCK_TOPIC_NODES: Record<string, MockTopicNodes> = {
  'topic-1': {
    nodes: [
      {
        id: 'node-t1-1',
        data: {
          label: 'useState 基礎',
          isTopic: true,
          topicId: 'topic-1',
          color: '#3b82f6',
        },
        position: { x: 0, y: 0 },
        createdAt: new Date('2024-11-08'),
      },
      {
        id: 'node-t1-2',
        data: {
          label: 'useEffect 使用時機',
          isTopic: true,
          topicId: 'topic-1',
          color: '#3b82f6',
        },
        position: { x: 200, y: 0 },
        createdAt: new Date('2024-11-09'),
      },
      {
        id: 'node-t1-3',
        data: {
          label: 'useCallback 優化',
          isTopic: true,
          topicId: 'topic-1',
          color: '#3b82f6',
        },
        position: { x: 400, y: 0 },
        createdAt: new Date('2024-11-10'),
      },
    ],
    edges: [
      {
        id: 'edge-t1-1-2',
        source: 'node-t1-1',
        target: 'node-t1-2',
      },
      {
        id: 'edge-t1-2-3',
        source: 'node-t1-2',
        target: 'node-t1-3',
      },
    ],
  },
  'topic-2': {
    nodes: [
      {
        id: 'node-t2-1',
        data: {
          label: 'Generic Types',
          isTopic: true,
          topicId: 'topic-2',
          color: '#8b5cf6',
        },
        position: { x: 0, y: 0 },
        createdAt: new Date('2024-11-07'),
      },
      {
        id: 'node-t2-2',
        data: {
          label: 'Utility Types',
          isTopic: true,
          topicId: 'topic-2',
          color: '#8b5cf6',
        },
        position: { x: 200, y: 0 },
        createdAt: new Date('2024-11-08'),
      },
    ],
    edges: [
      {
        id: 'edge-t2-1-2',
        source: 'node-t2-1',
        target: 'node-t2-2',
      },
    ],
  },
};
