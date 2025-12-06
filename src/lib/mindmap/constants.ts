import type { CurveType, LinkType } from './types';

/**
 * Node default dimensions
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
 * Layout defaults
 */
export const LAYOUT_DEFAULTS = {
  HORIZONTAL_SPACING: 200,
  VERTICAL_SPACING: 60,
  RADIAL_RADIUS: 300,
  RADIAL_RADIUS_BASE: 150,
  RADIAL_RADIUS_INCREMENT: 120,
} as const;

/**
 * Zoom limits
 */
export const ZOOM_LIMITS = {
  MIN: 0.1,
  MAX: 3,
  STEP: 0.1,
} as const;

/**
 * Default link type
 */
export const DEFAULT_LINK_TYPE: LinkType = 'horizontal';

/**
 * Default curve type (for LinePath)
 */
export const DEFAULT_CURVE_TYPE: CurveType = 'linear';

/**
 * Color system
 */
export const COLORS = {
  // Theme colors
  PRIMARY: '#3B82F6',
  SECONDARY: '#10B981',

  // Node colors
  NODE_DEFAULT: '#FFFFFF',
  NODE_TOPIC: '#DBEAFE',
  NODE_BORDER: '#E5E7EB',
  NODE_BORDER_SELECTED: '#3B82F6',
  NODE_BORDER_HOVER: '#93C5FD',

  // Edge color palette
  EDGE_COLORS: [
    '#3B82F6', // Blue
    '#10B981', // Green
    '#F59E0B', // Amber
    '#EF4444', // Red
    '#8B5CF6', // Purple
    '#EC4899', // Pink
    '#06B6D4', // Cyan
    '#F97316', // Orange
  ],

  // Text colors
  TEXT_PRIMARY: '#111827',
  TEXT_SECONDARY: '#6B7280',
  TEXT_PLACEHOLDER: '#9CA3AF',
} as const;

/**
 * Animation settings
 */
export const ANIMATION = {
  DURATION_FAST: 150,
  DURATION_NORMAL: 250,
  DURATION_SLOW: 400,
  EASING: 'ease-out',
} as const;

/**
 * Auto-save settings
 */
export const AUTO_SAVE = {
  DEBOUNCE_MS: 2000,
} as const;
