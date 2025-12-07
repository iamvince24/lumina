export interface Position {
  x: number;
  y: number;
}

export interface Size {
  width: number;
  height: number;
}

export interface MindMapNode {
  id: string;
  content: string;
  position: Position;
  size: Size;
  parentId: string | null;
  children: string[];
  isCollapsed: boolean;
  style: NodeStyle;
  metadata?: {
    createdAt: Date;
    updatedAt: Date;
  };
}

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

export interface Connection {
  id: string;
  sourceId: string;
  targetId: string;
  style: ConnectionStyle;
}

export interface ConnectionStyle {
  strokeColor: string;
  strokeWidth: number;
  strokeStyle: 'solid' | 'dashed' | 'dotted';
  arrowSize: number;
}

export interface MindMapState {
  nodes: Map<string, MindMapNode>;
  connections: Connection[];
  selectedNodeIds: string[];
  rootNodeId: string | null;
  viewport: Viewport;
}

export interface Viewport {
  x: number;
  y: number;
  zoom: number;
}

export interface DragState {
  isDragging: boolean;
  nodeId: string | null;
  startPosition: Position | null;
  offset: Position | null;
}

export type EditorMode = 'select' | 'pan' | 'connect';

// Drop target types for drag-and-drop
export type DropTargetType = 'child' | 'sibling-before' | 'sibling-after';

export interface DropTarget {
  nodeId: string; // Target node ID
  type: DropTargetType; // Type of drop action
  parentId: string | null; // Parent ID for sibling drops
  siblingIndex?: number; // Index for sibling reordering
}

export interface DropIndicatorState {
  isVisible: boolean;
  position: Position;
  size: Size;
  type: DropTargetType;
}
