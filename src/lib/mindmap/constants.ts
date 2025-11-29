/**
 * 節點預設尺寸
 */
export const NODE_DEFAULTS = {
  WIDTH: 160,
  HEIGHT: 40,
  MIN_WIDTH: 80,
  MAX_WIDTH: 400,
  PADDING: 12,
  BORDER_RADIUS: 8,
} as const;

/**
 * 佈局預設值
 */
export const LAYOUT_DEFAULTS = {
  HORIZONTAL_SPACING: 200,
  VERTICAL_SPACING: 60,
  RADIAL_RADIUS_BASE: 200,
  RADIAL_RADIUS_INCREMENT: 150,
} as const;

/**
 * 縮放限制
 */
export const ZOOM_LIMITS = {
  MIN: 0.1,
  MAX: 3,
  STEP: 0.1,
} as const;

/**
 * 顏色系統
 */
export const COLORS = {
  // 主題色
  PRIMARY: '#3B82F6',
  SECONDARY: '#10B981',

  // 節點色
  NODE_DEFAULT: '#FFFFFF',
  NODE_TOPIC: '#DBEAFE',
  NODE_BORDER: '#E5E7EB',
  NODE_BORDER_SELECTED: '#3B82F6',

  // 連線色
  EDGE_DEFAULT: '#94A3B8',
  EDGE_COLORS: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'],

  // 文字色
  TEXT_PRIMARY: '#111827',
  TEXT_SECONDARY: '#6B7280',
} as const;

/**
 * 動畫時長
 */
export const ANIMATION = {
  DURATION_FAST: 150,
  DURATION_NORMAL: 200,
  DURATION_SLOW: 300,
  EASING: 'ease-in-out',
} as const;

/**
 * 自動儲存
 */
export const AUTO_SAVE = {
  DEBOUNCE_MS: 2000,
} as const;
