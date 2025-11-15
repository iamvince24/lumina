/**
 * Mock 資料
 * 用於前端開發時模擬 API 回應
 */

import { MockTopic, MockMindMap, MockTopicNodes } from './types';

/**
 * 已刪除項目的型別
 */
export interface DeletedItem {
  id: string;
  name: string;
  deletedAt: Date;
  type: 'topic' | 'node' | 'mindmap';
}

export interface DeletedTopic {
  id: string;
  name: string;
  color: string;
  deletedAt: Date;
}

export interface DeletedNode {
  id: string;
  label: string;
  mindmapDate: string;
  deletedAt: Date;
}

export interface DeletedMindMap {
  id: string;
  title: string;
  date: string;
  deletedAt: Date;
}

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

/**
 * Mock 已刪除的 Topics
 */
export const MOCK_DELETED_TOPICS: DeletedTopic[] = [
  {
    id: 'deleted-topic-1',
    name: 'Vue.js 基礎',
    color: '#42b883',
    deletedAt: new Date('2024-11-05T14:30:00'),
  },
  {
    id: 'deleted-topic-2',
    name: 'Docker 容器化',
    color: '#2496ed',
    deletedAt: new Date('2024-11-03T09:15:00'),
  },
  {
    id: 'deleted-topic-3',
    name: 'GraphQL API',
    color: '#e10098',
    deletedAt: new Date('2024-11-01T16:45:00'),
  },
];

/**
 * Mock 已刪除的 Nodes
 */
export const MOCK_DELETED_NODES: DeletedNode[] = [
  {
    id: 'deleted-node-1',
    label: 'useState 的陷阱',
    mindmapDate: '2024-11-08',
    deletedAt: new Date('2024-11-09T11:20:00'),
  },
  {
    id: 'deleted-node-2',
    label: 'CSS Grid 佈局技巧',
    mindmapDate: '2024-11-05',
    deletedAt: new Date('2024-11-06T15:30:00'),
  },
  {
    id: 'deleted-node-3',
    label: 'API 錯誤處理',
    mindmapDate: '2024-11-04',
    deletedAt: new Date('2024-11-05T10:00:00'),
  },
  {
    id: 'deleted-node-4',
    label: '效能優化筆記',
    mindmapDate: '2024-11-07',
    deletedAt: new Date('2024-11-08T14:15:00'),
  },
];

/**
 * Mock 已刪除的 MindMaps
 */
export const MOCK_DELETED_MINDMAPS: DeletedMindMap[] = [
  {
    id: 'deleted-mindmap-1',
    title: '心智圖 2024/10/25',
    date: '2024-10-25',
    deletedAt: new Date('2024-10-30T18:00:00'),
  },
  {
    id: 'deleted-mindmap-2',
    title: '心智圖 2024/10/20',
    date: '2024-10-20',
    deletedAt: new Date('2024-10-28T12:30:00'),
  },
];

/**
 * Mock 月曆資料 - 儲存哪些日期有心智圖或筆記
 */
export const MOCK_CALENDAR_ENTRIES: Record<
  string,
  {
    date: string;
    hasContent: boolean;
    nodeCount: number;
    topicCount: number;
    preview?: string;
  }
> = {
  '2024-11-10': {
    date: '2024-11-10',
    hasContent: true,
    nodeCount: 8,
    topicCount: 2,
    preview: '今天學習了 React Hooks 和 TypeScript 進階技巧',
  },
  '2024-11-09': {
    date: '2024-11-09',
    hasContent: true,
    nodeCount: 5,
    topicCount: 1,
    preview: '研究 Next.js App Router 的最佳實踐',
  },
  '2024-11-08': {
    date: '2024-11-08',
    hasContent: true,
    nodeCount: 12,
    topicCount: 3,
    preview: '深入理解 Zustand 狀態管理',
  },
  '2024-11-07': {
    date: '2024-11-07',
    hasContent: true,
    nodeCount: 6,
    topicCount: 2,
    preview: 'CSS 動畫與過渡效果',
  },
  '2024-11-06': {
    date: '2024-11-06',
    hasContent: true,
    nodeCount: 10,
    topicCount: 1,
    preview: 'Web Performance 優化技巧',
  },
  '2024-11-05': {
    date: '2024-11-05',
    hasContent: true,
    nodeCount: 4,
    topicCount: 1,
    preview: 'React Server Components 介紹',
  },
  '2024-11-04': {
    date: '2024-11-04',
    hasContent: true,
    nodeCount: 7,
    topicCount: 2,
    preview: 'TypeScript Utility Types 實戰',
  },
  '2024-11-03': {
    date: '2024-11-03',
    hasContent: true,
    nodeCount: 9,
    topicCount: 1,
    preview: 'Tailwind CSS 進階用法',
  },
  '2024-11-01': {
    date: '2024-11-01',
    hasContent: true,
    nodeCount: 5,
    topicCount: 1,
    preview: 'React Hook Form 表單處理',
  },
  '2024-10-30': {
    date: '2024-10-30',
    hasContent: true,
    nodeCount: 8,
    topicCount: 2,
    preview: 'Jest 單元測試實踐',
  },
  '2024-10-28': {
    date: '2024-10-28',
    hasContent: true,
    nodeCount: 6,
    topicCount: 1,
    preview: 'Git 工作流程與最佳實踐',
  },
  '2024-10-25': {
    date: '2024-10-25',
    hasContent: true,
    nodeCount: 11,
    topicCount: 3,
    preview: 'React Query 資料同步策略',
  },
};
