/**
 * Mock 資料的型別定義
 * 與真實 API 回傳格式保持一致
 */

/**
 * Topic 資料
 */
export interface MockTopic {
  id: string;
  name: string;
  color?: string;
  nodeCount: number;
  relatedDatesCount: number;
  lastUpdated: Date;
}

/**
 * MindMap 資料
 */
export interface MockMindMap {
  id: string;
  date: string; // YYYY-MM-DD 格式
  title: string;
  nodes: Array<{
    id: string;
    type: 'custom' | 'topic';
    position: { x: number; y: number };
    data: {
      label: string;
      isTopic?: boolean;
      topicId?: string;
      color?: string;
    };
  }>;
  edges: Array<{
    id: string;
    source: string;
    target: string;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Topic Nodes 資料
 */
export interface MockTopicNodes {
  nodes: Array<{
    id: string;
    data: {
      label: string;
      isTopic?: boolean;
      topicId?: string;
      color?: string;
    };
    position: { x: number; y: number };
    createdAt: Date;
  }>;
  edges: Array<{
    id: string;
    source: string;
    target: string;
  }>;
}
