/**
 * 座標點
 */
export interface Point {
  x: number;
  y: number;
}

/**
 * 節點資料
 */
export interface MindMapNode {
  id: string;
  parentId: string | null;
  label: string;
  position: Point;

  // 樣式相關
  width: number;
  height: number;
  color?: string;

  // 狀態相關
  isExpanded: boolean;
  isTopic: boolean;
  topicId?: string;

  // 元資料
  createdAt: Date;
  updatedAt: Date;
}

/**
 * 連線資料
 */
export interface MindMapEdge {
  id: string;
  sourceId: string;
  targetId: string;

  // 樣式相關
  color?: string;
  strokeWidth?: number;
}

/**
 * 視圖狀態
 */
export interface Viewport {
  x: number;
  y: number;
  zoom: number;
}

/**
 * 編輯器視圖模式
 */
export type ViewMode = 'radial' | 'horizontal';

/**
 * 佈局配置
 */
export interface LayoutConfig {
  horizontalSpacing: number;
  verticalSpacing: number;
  nodeWidth: number;
  nodeHeight: number;
}

/**
 * 貝茲曲線類型
 */
export type BezierType = 'quadratic' | 'cubic' | 'smooth';
