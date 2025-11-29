import type { Point, BezierType } from '../types';

/**
 * 計算二次貝茲曲線路徑
 *
 * @param source - 起點座標
 * @param target - 終點座標
 * @returns SVG path 字串
 *
 * @example
 * const path = calculateQuadraticBezierPath(
 *   { x: 0, y: 0 },
 *   { x: 200, y: 100 }
 * );
 * // 回傳: "M 0 0 Q 100 0 200 100"
 */
export function calculateQuadraticBezierPath(
  source: Point,
  target: Point
): string {
  // 控制點位於起點的水平延伸線上
  const controlX = (source.x + target.x) / 2;
  const controlY = source.y;

  return `M ${source.x} ${source.y} Q ${controlX} ${controlY} ${target.x} ${target.y}`;
}

/**
 * 計算三次貝茲曲線路徑（更平滑）
 *
 * @param source - 起點座標
 * @param target - 終點座標
 * @returns SVG path 字串
 */
export function calculateCubicBezierPath(source: Point, target: Point): string {
  const dx = target.x - source.x;

  // 兩個控制點，創造 S 形曲線
  const ctrl1 = {
    x: source.x + dx * 0.4,
    y: source.y,
  };
  const ctrl2 = {
    x: source.x + dx * 0.6,
    y: target.y,
  };

  return `M ${source.x} ${source.y} C ${ctrl1.x} ${ctrl1.y} ${ctrl2.x} ${ctrl2.y} ${target.x} ${target.y}`;
}

/**
 * 計算平滑曲線路徑（適合多段連線）
 *
 * @param points - 路徑點陣列
 * @returns SVG path 字串
 */
export function calculateSmoothPath(points: Point[]): string {
  if (points.length < 2) return '';
  if (points.length === 2) {
    return calculateQuadraticBezierPath(points[0], points[1]);
  }

  let path = `M ${points[0].x} ${points[0].y}`;

  for (let i = 1; i < points.length - 1; i++) {
    const prev = points[i - 1];
    const curr = points[i];
    const next = points[i + 1];

    // 計算控制點
    const ctrl1 = {
      x: prev.x + (curr.x - prev.x) * 0.5,
      y: prev.y + (curr.y - prev.y) * 0.5,
    };
    const ctrl2 = {
      x: curr.x - (next.x - prev.x) * 0.25,
      y: curr.y - (next.y - prev.y) * 0.25,
    };

    path += ` C ${ctrl1.x} ${ctrl1.y} ${ctrl2.x} ${ctrl2.y} ${curr.x} ${curr.y}`;
  }

  // 最後一段
  const last = points[points.length - 1];
  const secondLast = points[points.length - 2];
  path += ` Q ${(secondLast.x + last.x) / 2} ${secondLast.y} ${last.x} ${last.y}`;

  return path;
}

/**
 * 統一的連線路徑計算函式
 *
 * @param source - 起點座標
 * @param target - 終點座標
 * @param type - 曲線類型
 * @returns SVG path 字串
 *
 * @description
 * 這是主要的 API，未來遷移到 D3 時只需修改這個函式的內部實作。
 */
export function calculateEdgePath(
  source: Point,
  target: Point,
  type: BezierType = 'quadratic'
): string {
  switch (type) {
    case 'quadratic':
      return calculateQuadraticBezierPath(source, target);
    case 'cubic':
      return calculateCubicBezierPath(source, target);
    case 'smooth':
      return calculateSmoothPath([source, target]);
    default:
      return calculateQuadraticBezierPath(source, target);
  }
}
