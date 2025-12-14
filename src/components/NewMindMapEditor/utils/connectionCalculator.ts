import { Position, MindMapNode } from '../types';

export interface PathPoints {
  start: Position;
  end: Position;
  controlPoint1?: Position;
  controlPoint2?: Position;
}

// 收合點的距離偏移（從節點右邊緣到收合點的距離）
const COLLAPSE_POINT_OFFSET = 20;

/**
 * 計算節點的右邊緣中心點（用於連線起點）
 */
export const calculateNodeRightEdge = (node: MindMapNode): Position => ({
  x: node.position.x + node.size.width,
  y: node.position.y + node.size.height / 2,
});

/**
 * 計算節點的左邊緣中心點（用於連線終點）
 */
export const calculateNodeLeftEdge = (node: MindMapNode): Position => ({
  x: node.position.x,
  y: node.position.y + node.size.height / 2,
});

/**
 * 計算收合點位置（在父節點右邊緣的右側）
 */
export const calculateCollapsePoint = (parentNode: MindMapNode): Position => {
  const rightEdge = calculateNodeRightEdge(parentNode);
  return {
    x: rightEdge.x + COLLAPSE_POINT_OFFSET,
    y: rightEdge.y,
  };
};

/**
 * 計算從父節點右邊緣到收合點的路徑
 */
export const calculateParentToCollapsePointPath = (
  parentNode: MindMapNode
): string => {
  const start = calculateNodeRightEdge(parentNode);
  const end = calculateCollapsePoint(parentNode);
  return `M ${start.x} ${start.y} L ${end.x} ${end.y}`;
};

/**
 * 計算從收合點到子節點左邊緣的曲線路徑
 */
export const calculateCollapsePointToChildPath = (
  collapsePoint: Position,
  targetNode: MindMapNode
): string => {
  const end = calculateNodeLeftEdge(targetNode);
  const dx = end.x - collapsePoint.x;

  // 使用貝茲曲線
  const controlOffset = Math.abs(dx) * 0.4;

  const cp1x = collapsePoint.x + controlOffset;
  const cp1y = collapsePoint.y;
  const cp2x = end.x - controlOffset;
  const cp2y = end.y;

  return `M ${collapsePoint.x} ${collapsePoint.y} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${end.x} ${end.y}`;
};

/**
 * 計算連接路徑（保留向後兼容性）
 * @deprecated 使用 calculateCollapsePointToChildPath 替代
 */
export const calculateConnectionPath = (
  sourceNode: MindMapNode,
  targetNode: MindMapNode,
  type: 'straight' | 'curved' | 'orthogonal' = 'curved'
): string => {
  const start = calculateNodeRightEdge(sourceNode);
  const end = calculateNodeLeftEdge(targetNode);

  switch (type) {
    case 'straight':
      return `M ${start.x} ${start.y} L ${end.x} ${end.y}`;

    case 'curved':
      return calculateCurvedPath(start, end);

    case 'orthogonal':
      return calculateOrthogonalPath(start, end);

    default:
      return calculateCurvedPath(start, end);
  }
};

const calculateCurvedPath = (start: Position, end: Position): string => {
  const dx = end.x - start.x;

  // 使用貝茲曲線
  const controlOffset = Math.abs(dx) * 0.4;

  const cp1x = start.x + controlOffset;
  const cp1y = start.y;
  const cp2x = end.x - controlOffset;
  const cp2y = end.y;

  return `M ${start.x} ${start.y} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${end.x} ${end.y}`;
};

const calculateOrthogonalPath = (start: Position, end: Position): string => {
  const midX = (start.x + end.x) / 2;

  return `M ${start.x} ${start.y} L ${midX} ${start.y} L ${midX} ${end.y} L ${end.x} ${end.y}`;
};

/**
 * 計算箭頭點（保留向後兼容性，但不再使用）
 * @deprecated 不再顯示箭頭
 */
export const calculateArrowPoints = (
  from: Position,
  to: Position,
  size: number = 10
): string => {
  const angle = Math.atan2(to.y - from.y, to.x - from.x);

  const arrowAngle1 = angle + Math.PI * 0.85;
  const arrowAngle2 = angle - Math.PI * 0.85;

  const x1 = to.x + size * Math.cos(arrowAngle1);
  const y1 = to.y + size * Math.sin(arrowAngle1);
  const x2 = to.x + size * Math.cos(arrowAngle2);
  const y2 = to.y + size * Math.sin(arrowAngle2);

  return `M ${to.x} ${to.y} L ${x1} ${y1} M ${to.x} ${to.y} L ${x2} ${y2}`;
};
