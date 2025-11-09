/**
 * Topic 系統相關的型別定義
 */

// ========================================
// Topic 型別定義
// ========================================

/**
 * Topic 的完整資料
 */
export interface Topic {
  /** Topic 唯一識別碼 */
  id: string;

  /** Topic 名稱 */
  name: string;

  /** Topic 顏色（十六進位色碼） */
  color: string;

  /** 父 Topic ID（如果有） */
  parentTopicId?: string;

  /** 是否釘選到側邊欄 */
  isPinned: boolean;

  /** 建立時間 */
  createdAt: Date;

  /** 最後更新時間 */
  updatedAt: Date;

  /** 累積次數（被使用的次數） */
  accumulationCount: number;

  /** 擁有者 User ID */
  userId: string;
}

/**
 * 建立 Topic 的參數
 */
export interface CreateTopicParams {
  /** Topic 名稱 */
  name: string;

  /** Topic 顏色 */
  color: string;

  /** 父 Topic ID（可選） */
  parentTopicId?: string;

  /** 是否釘選 */
  isPinned?: boolean;
}

/**
 * 更新 Topic 的參數
 */
export interface UpdateTopicParams {
  /** Topic ID */
  id: string;

  /** 要更新的資料（部分更新） */
  data: Partial<Omit<Topic, 'id' | 'createdAt' | 'userId'>>;
}

// ========================================
// Topic 統計資訊
// ========================================

/**
 * Topic 的統計資訊
 * 用於 Topic 詳細頁的 Header 顯示
 */
export interface TopicStats {
  /** Topic ID */
  topicId: string;

  /** 累積次數 */
  totalEntries: number;

  /** 總 Node 數量 */
  totalNodes: number;

  /** 最後更新日期 */
  lastUpdated: Date;

  /** 第一次建立日期 */
  firstCreated: Date;
}
