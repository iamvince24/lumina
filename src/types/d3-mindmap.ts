/**
 * D3.js Mind Map Type Definitions
 * Separate from main mindmap types to avoid conflicts
 */

/**
 * Basic D3 node structure
 */
export interface D3MindMapNode {
  id: string;
  label: string;
  parentId: string | null;
  level: number;
  color?: string;
}

/**
 * Basic D3 link/edge structure
 */
export interface D3MindMapLink {
  source: string;
  target: string;
  id: string;
}

/**
 * Complete D3 mind map data structure
 */
export interface D3MindMapData {
  nodes: D3MindMapNode[];
  links: D3MindMapLink[];
}

/**
 * D3 Simulation Node (extends base node with physics properties)
 */
export interface D3SimulationNode extends D3MindMapNode {
  x?: number;
  y?: number;
  fx?: number | null;
  fy?: number | null;
  vx?: number;
  vy?: number;
  index?: number;
}

/**
 * D3 Simulation Link (with node references)
 */
export interface D3SimulationLink {
  source: D3SimulationNode | string;
  target: D3SimulationNode | string;
  id: string;
  index?: number;
}

/**
 * Zoom transform state
 */
export interface D3ZoomTransform {
  x: number;
  y: number;
  k: number; // scale factor
}

/**
 * Node style configuration
 */
export interface D3NodeStyle {
  width: number;
  height: number;
  borderRadius: number;
  fontSize: number;
  padding: number;
}
