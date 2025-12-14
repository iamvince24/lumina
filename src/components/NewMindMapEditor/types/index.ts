// Position and Size
export interface Position {
  x: number;
  y: number;
}

export interface Size {
  width: number;
  height: number;
}

// Node Style
export interface NodeStyle {
  backgroundColor: string;
  textColor: string;
  borderColor: string;
  borderWidth: number;
  borderRadius: number;
  fontSize: number;
  fontWeight: 'normal' | 'bold';
  padding: number;
}

// Mind Map Node
export interface MindMapNode {
  id: string;
  content: string;
  position: Position;
  size: Size;
  parentId: string | null;
  children: string[]; // Child node IDs (maintains order)
  isCollapsed: boolean;
  style: NodeStyle;
  tags?: Array<{ id: string; name: string; color: string }>;
  metadata?: {
    createdAt: Date;
    updatedAt: Date;
  };
}

// Connection Style
export interface ConnectionStyle {
  strokeColor: string;
  strokeWidth: number;
  strokeStyle: 'solid' | 'dashed' | 'dotted';
  arrowSize: number;
}

// Connection
export interface Connection {
  id: string;
  sourceId: string;
  targetId: string;
  style: ConnectionStyle;
}

// Viewport
export interface Viewport {
  x: number;
  y: number;
  zoom: number;
}

// Mind Map State (for internal use)
export interface MindMapState {
  nodes: Map<string, MindMapNode>;
  connections: Connection[];
  selectedNodeIds: string[];
  rootNodeId: string | null;
  viewport: Viewport;
}

// View Mode
export type ViewMode = 'mindmap' | 'outline';

// Editor Mode
export type EditorMode = 'select' | 'pan' | 'connect';

// Drag State
export interface DragState {
  isDragging: boolean;
  nodeId: string | null;
  startPosition: Position | null;
  offset: Position | null;
}

// Drop Target Types
export type DropTargetType = 'child' | 'sibling-before' | 'sibling-after';

export interface DropTarget {
  nodeId: string;
  type: DropTargetType;
  parentId: string | null;
  siblingIndex?: number;
}

export interface DropIndicatorState {
  isVisible: boolean;
  position: Position;
  size: Size;
  type: DropTargetType;
}

// Serialized node format for storage/API
export interface StoredNode {
  id: string;
  content: string;
  position: Position;
  size: Size;
  parentId: string | null;
  children: string[];
  isCollapsed: boolean;
  style: NodeStyle;
  tags?: Array<{ id: string; name: string; color: string }>;
  metadata?: {
    createdAt: string;
    updatedAt: string;
  };
}

// Default node style
export const defaultNodeStyle: NodeStyle = {
  backgroundColor: 'transparent',
  textColor: '#333333',
  borderColor: 'transparent',
  borderWidth: 0,
  borderRadius: 8,
  fontSize: 14,
  fontWeight: 'normal',
  padding: 12,
};

// Default connection style
export const defaultConnectionStyle: ConnectionStyle = {
  strokeColor: '#94a3b8',
  strokeWidth: 2,
  strokeStyle: 'solid',
  arrowSize: 8,
};
