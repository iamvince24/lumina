import { Position, MindMapNode } from '../types';
import { calculateNodeCenter } from './geometry';

export interface PathPoints {
  start: Position;
  end: Position;
  controlPoint1?: Position;
  controlPoint2?: Position;
}

export const calculateConnectionPath = (
  sourceNode: MindMapNode,
  targetNode: MindMapNode,
  type: 'straight' | 'curved' | 'orthogonal' = 'curved'
): string => {
  const start = calculateNodeCenter(sourceNode.position, sourceNode.size);
  const end = calculateNodeCenter(targetNode.position, targetNode.size);

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
  const controlOffset = Math.abs(dx) * 0.5;

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
