import * as allCurves from '@visx/curve';
import type { CurveType } from '../types';

/**
 * Curve type to visx curve function mapping
 */
export const curveFactories: Partial<
  Record<CurveType, typeof allCurves.curveBasis>
> = {
  basis: allCurves.curveBasis,
  basisClosed: allCurves.curveBasisClosed,
  basisOpen: allCurves.curveBasisOpen,
  cardinal: allCurves.curveCardinal,
  cardinalClosed: allCurves.curveCardinalClosed,
  cardinalOpen: allCurves.curveCardinalOpen,
  catmullRom: allCurves.curveCatmullRom,
  catmullRomClosed: allCurves.curveCatmullRomClosed,
  catmullRomOpen: allCurves.curveCatmullRomOpen,
  linear: allCurves.curveLinear,
  linearClosed: allCurves.curveLinearClosed,
  monotoneX: allCurves.curveMonotoneX,
  monotoneY: allCurves.curveMonotoneY,
  natural: allCurves.curveNatural,
  step: allCurves.curveStep,
  stepAfter: allCurves.curveStepAfter,
  stepBefore: allCurves.curveStepBefore,
};

/**
 * Get visx curve function
 *
 * @param type - Curve type
 * @returns visx curve function
 */
export function getCurve(type: CurveType) {
  return curveFactories[type] || allCurves.curveLinear;
}

/**
 * Curve type display names
 */
export const CURVE_TYPE_LABELS: Record<CurveType, string> = {
  basis: 'Smooth (Basis)',
  basisClosed: 'Basis Closed',
  basisOpen: 'Basis Open',
  bundle: 'Bundle',
  cardinal: 'Cardinal',
  cardinalClosed: 'Cardinal Closed',
  cardinalOpen: 'Cardinal Open',
  catmullRom: 'Catmull-Rom',
  catmullRomClosed: 'Catmull-Rom Closed',
  catmullRomOpen: 'Catmull-Rom Open',
  linear: 'Linear',
  linearClosed: 'Linear Closed',
  monotoneX: 'Monotone X',
  monotoneY: 'Monotone Y',
  natural: 'Natural',
  step: 'Step',
  stepAfter: 'Step After',
  stepBefore: 'Step Before',
};

/**
 * Recommended curves for mind maps
 */
export const RECOMMENDED_CURVES: CurveType[] = [
  'basis', // Smooth curve
  'cardinal', // Adjustable tension
  'linear', // Straight line
  'step', // Step
];
