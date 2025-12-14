import { Position, Size } from '../types';

export const calculateDistance = (p1: Position, p2: Position): number => {
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  return Math.sqrt(dx * dx + dy * dy);
};

export const calculateNodeCenter = (
  position: Position,
  size: Size
): Position => {
  return {
    x: position.x + size.width / 2,
    y: position.y + size.height / 2,
  };
};

export const calculateAngle = (p1: Position, p2: Position): number => {
  return Math.atan2(p2.y - p1.y, p2.x - p1.x);
};

export const isPointInRect = (
  point: Position,
  rectPos: Position,
  rectSize: Size
): boolean => {
  return (
    point.x >= rectPos.x &&
    point.x <= rectPos.x + rectSize.width &&
    point.y >= rectPos.y &&
    point.y <= rectPos.y + rectSize.height
  );
};

export const clamp = (value: number, min: number, max: number): number => {
  return Math.min(Math.max(value, min), max);
};
