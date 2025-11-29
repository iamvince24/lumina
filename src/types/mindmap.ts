/**
 * 心智圖相關的型別定義
 * 包含 Node、Edge、MindMap 等核心資料結構
 */

// ========================================
// Node 型別定義（與 React Flow 相容）
// ========================================

/**
 * Node 在畫布上的位置
 */
export interface Position {
  x: number;
  y: number;
}

/**
 * Node 的資料內容
 */
export interface NodeData {
  /** Node 顯示的文字內容 */
  label: string;

  /** 是否為 Topic */
  isTopic?: boolean;

  /** 關聯的 Topic ID */
  topicId?: string;

  /** Node 的顏色（十六進位色碼） */
  color?: string;

  /** Tags 標籤 */
  tags?: Array<{
    id: string;
    name: string;
    color: string;
  }>;

  /** 建立時間 */
  createdAt?: Date;

  /** 最後更新時間 */
  updatedAt?: Date;

  /** 節點深度 (用於樣式渲染) */
  depth?: number;
}

/**
 * Node 的完整定義
 */
export interface Node {
  /** 唯一識別碼 */
  id: string;

  /** Node 類型 */
  type: 'custom' | 'topic' | 'center';

  /** Node 在畫布上的位置 */
  position: Position;

  /** Node 的資料內容 */
  data: NodeData;

  /** 父節點 ID（用於建立階層關係） */
  parentNode?: string;

  /** 限制子節點在父節點範圍內 */
  extent?: 'parent';
}

// ========================================
// Edge 型別定義
// ========================================

/**
 * Edge 的完整定義
 * 描述 Node 之間的連線關係
 */
export interface Edge {
  /** 唯一識別碼 */
  id: string;

  /** 起點 Node ID */
  source: string;

  /** 終點 Node ID */
  target: string;

  /** Edge 類型 */
  type?: string;

  /** 是否顯示動畫效果 */
  animated?: boolean;

  /** 自訂樣式 */
  style?: React.CSSProperties;
}

// ========================================
// MindMap 型別定義
// ========================================

/**
 * 完整的心智圖資料
 */
export interface MindMap {
  /** 心智圖唯一識別碼 */
  id: string;

  /** 心智圖標題 */
  title: string;

  /** 建立日期 */
  date: Date;

  /** 包含的所有 Nodes */
  nodes: Node[];

  /** 包含的所有 Edges */
  edges: Edge[];

  /** 建立時間 */
  createdAt: Date;

  /** 最後更新時間 */
  updatedAt: Date;

  /** 擁有者 User ID */
  userId: string;
}

// ========================================
// 操作相關型別
// ========================================

/**
 * 新增 Node 的參數
 */
export interface AddNodeParams {
  /** Node 顯示的文字 */
  label: string;

  /** 父節點 ID（如果有） */
  parentId?: string;

  /** 初始位置（可選） */
  position?: Position;

  /** 是否為 Topic */
  isTopic?: boolean;

  /** Node 類型（可選，優先於 isTopic） */
  nodeType?: 'custom' | 'topic' | 'center';
}

/**
 * 更新 Node 的參數
 */
export interface UpdateNodeParams {
  /** 要更新的 Node ID */
  id: string;

  /** 要更新的資料（部分更新） */
  data?: Partial<NodeData>;

  /** 要更新的位置 */
  position?: Position;
}
