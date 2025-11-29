/**
 * 視圖模式相關的型別定義
 */

import type { Node } from './mindmap';

// ========================================
// 視圖模式列舉
// ========================================

/**
 * 支援的視圖模式
 */
export type ViewMode = 'radial' | 'outliner' | 'logicChart' | 'horizontal';

/**
 * 佈局方向（用於 Logic Chart）
 */
export type LayoutDirection = 'TB' | 'LR'; // Top-Bottom, Left-Right

/**
 * Topic 詳細頁的視圖模式
 */
export type TopicViewMode = 'integrated' | 'card' | 'timeline';

// ========================================
// 視圖設定
// ========================================

/**
 * 視圖偏好設定
 * 記錄使用者對特定 MindMap 的視圖偏好
 */
export interface ViewPreference {
  /** MindMap ID */
  mindmapId: string;

  /** 偏好的視圖模式 */
  viewMode: ViewMode;

  /** 佈局方向（僅用於 Logic Chart） */
  layoutDirection?: LayoutDirection;

  /** 最後更新時間 */
  lastUpdated: Date;
}

/**
 * 視圖配置
 */
export interface ViewConfig {
  /** 當前視圖模式 */
  mode: ViewMode;

  /** 佈局方向 */
  direction?: LayoutDirection;

  /** 是否顯示日期標籤 */
  showDateLabels?: boolean;

  /** 是否啟用自動佈局 */
  autoLayout?: boolean;
}

// ========================================
// Outliner 專用型別
// ========================================

/**
 * Outliner 視圖中的單一項目
 */
export interface OutlineItem {
  /** 項目 ID（對應 Node ID） */
  id: string;

  /** 顯示文字 */
  label: string;

  /** 縮排層級（0-based） */
  level: number;

  /** 子項目 */
  children: OutlineItem[];

  /** 是否收合 */
  isCollapsed: boolean;

  /** 是否聚焦 */
  isFocused: boolean;

  /** 關聯的原始 Node */
  nodeRef: Node;
}

/**
 * Outliner 視圖狀態
 */
export interface OutlineState {
  /** 所有項目（樹狀結構） */
  items: OutlineItem[];

  /** 當前聚焦的項目 ID */
  focusedId: string | null;

  /** 收合的項目 ID 集合 */
  collapsedIds: Set<string>;
}

// ========================================
// Logic Chart 專用型別
// ========================================

/**
 * Logic Chart 視圖中的樹狀節點
 * 擴展自 Node，增加 D3 計算後的位置資訊
 */
export interface TreeNode extends Node {
  /** 子節點 */
  children?: TreeNode[];

  /** 深度（從 root 開始計算） */
  depth: number;

  /** D3 計算後的 x 座標 */
  x: number;

  /** D3 計算後的 y 座標 */
  y: number;
}
