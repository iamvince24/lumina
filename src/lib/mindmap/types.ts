/**
 * 座標點
 */
export interface Point {
  x: number;
  y: number;
}

/**
 * Rectangle bounds
 */
export interface Bounds {
  x: number;
  y: number;
  width: number;
  height: number;
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
 * Hierarchical node data (for visx Tree)
 */
export interface MindMapNodeData {
  id: string;
  label: string;
  color?: string;
  fontSize?: number;
  isTopic: boolean;
  topicId?: string;
  isExpanded: boolean;
  children?: MindMapNodeData[];

  // Metadata
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Flat node (for Store and API)
 */
export interface FlatMindMapNode {
  id: string;
  parentId: string | null;
  label: string;
  position: Point;
  width: number;
  height: number;
  color?: string;
  fontSize?: number;
  isTopic: boolean;
  topicId?: string;
  isExpanded: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * visx hierarchy node type
 */
export interface HierarchyMindMapNode {
  data: MindMapNodeData;
  x: number; // visx tree calculated position (vertical direction)
  y: number; // visx tree calculated position (horizontal direction)
  depth: number;
  height: number;
  parent: HierarchyMindMapNode | null;
  children?: HierarchyMindMapNode[];
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
export type ViewMode = 'horizontal' | 'radial' | 'outliner';

/**
 * Curve types (corresponding to @visx/curve)
 */
export type CurveType =
  | 'basis'
  | 'basisClosed'
  | 'basisOpen'
  | 'bundle'
  | 'cardinal'
  | 'cardinalClosed'
  | 'cardinalOpen'
  | 'catmullRom'
  | 'catmullRomClosed'
  | 'catmullRomOpen'
  | 'linear'
  | 'linearClosed'
  | 'monotoneX'
  | 'monotoneY'
  | 'natural'
  | 'step'
  | 'stepAfter'
  | 'stepBefore';

/**
 * Link type
 */
export type LinkType = 'horizontal' | 'vertical' | 'radial' | 'step';

/**
 * 佈局配置
 */
export interface LayoutConfig {
  type: ViewMode;
  horizontalSpacing: number;
  verticalSpacing: number;
  nodeWidth: number;
  nodeHeight: number;
  separation?: (a: HierarchyMindMapNode, b: HierarchyMindMapNode) => number;
}

/**
 * 貝茲曲線類型
 */
export type BezierType = 'quadratic' | 'cubic' | 'smooth';
