import type { EnemyPattern } from './types';
import { zigzagPattern } from './zigzag';
import { sCurvePattern } from './sCurve';
import { vFormationPattern } from './vFormation';
import { circlePattern } from './circle';
import { divePattern } from './dive';
import { serpentPattern } from './serpent';
import { stopperPattern } from './stopper';

export const PATTERN_REGISTRY: Record<string, EnemyPattern> = {
  zigzag: zigzagPattern,
  sCurve: sCurvePattern,
  vFormation: vFormationPattern,
  circle: circlePattern,
  dive: divePattern,
  serpent: serpentPattern,
  stopper: stopperPattern,
};

export function getPattern(id: string | undefined | null): EnemyPattern | undefined {
  if (!id) return undefined;
  return PATTERN_REGISTRY[id];
}

export type PatternId = keyof typeof PATTERN_REGISTRY;


