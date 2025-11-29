import type { Point } from '../types';

/**
 * 計算兩點之間的距離
 */
export function distance(p1: Point, p2: Point): number {
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * 計算矩形的中心點
 */
export function getRectCenter(
  x: number,
  y: number,
  width: number,
  height: number
): Point {
  return {
    x: x + width / 2,
    y: y + height / 2,
  };
}

/**
 * 計算從矩形中心到邊緣的交點
 *
 * @param center - 矩形中心
 * @param target - 目標點
 * @param width - 矩形寬度
 * @param height - 矩形高度
 * @returns 邊緣交點座標
 */
export function getRectEdgePoint(
  center: Point,
  target: Point,
  width: number,
  height: number
): Point {
  const dx = target.x - center.x;
  const dy = target.y - center.y;

  if (dx === 0 && dy === 0) {
    return center;
  }

  const halfWidth = width / 2;
  const halfHeight = height / 2;

  // 計算射線與矩形邊的交點
  const scaleX = dx !== 0 ? halfWidth / Math.abs(dx) : Infinity;
  const scaleY = dy !== 0 ? halfHeight / Math.abs(dy) : Infinity;
  const scale = Math.min(scaleX, scaleY);

  return {
    x: center.x + dx * scale,
    y: center.y + dy * scale,
  };
}

/**
 * 計算節點之間的連線端點
 */
export function getEdgeEndpoints(
  sourceNode: { position: Point; width: number; height: number },
  targetNode: { position: Point; width: number; height: number }
): { source: Point; target: Point } {
  const sourceCenter = getRectCenter(
    sourceNode.position.x,
    sourceNode.position.y,
    sourceNode.width,
    sourceNode.height
  );

  const targetCenter = getRectCenter(
    targetNode.position.x,
    targetNode.position.y,
    targetNode.width,
    targetNode.height
  );

  return {
    source: getRectEdgePoint(
      sourceCenter,
      targetCenter,
      sourceNode.width,
      sourceNode.height
    ),
    target: getRectEdgePoint(
      targetCenter,
      sourceCenter,
      targetNode.width,
      targetNode.height
    ),
  };
}

/**
 * 判斷點是否在矩形內
 */
export function isPointInRect(
  point: Point,
  rect: { x: number; y: number; width: number; height: number }
): boolean {
  return (
    point.x >= rect.x &&
    point.x <= rect.x + rect.width &&
    point.y >= rect.y &&
    point.y <= rect.y + rect.height
  );
}

/**
 * 判斷兩個矩形是否相交
 */
export function rectsIntersect(
  rect1: { x: number; y: number; width: number; height: number },
  rect2: { x: number; y: number; width: number; height: number }
): boolean {
  return (
    rect1.x < rect2.x + rect2.width &&
    rect1.x + rect1.width > rect2.x &&
    rect1.y < rect2.y + rect2.height &&
    rect1.y + rect1.height > rect2.y
  );
}
