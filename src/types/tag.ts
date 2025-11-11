/**
 * Tag 相關的型別定義
 */

/**
 * Tag 基本資料
 */
export interface Tag {
  /** Tag ID */
  id: string;

  /** Tag 名稱 */
  name: string;

  /** Tag 顏色（十六進位） */
  color: string;

  /** 建立時間 */
  createdAt: Date;

  /** 使用次數 */
  usageCount: number;
}

/**
 * Tag 篩選條件
 */
export interface TagFilter {
  /** 要篩選的 Tag IDs */
  tagIds: string[];

  /** 篩選模式：'any' = 符合任一 Tag，'all' = 必須符合所有 Tags */
  mode: 'any' | 'all';
}
