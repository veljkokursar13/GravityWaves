// Wave types/interfaces split out from definitions
import { EnemyKind, MovementPattern } from '../enemies/types';

export interface WaveConfig {
  id: number;
  enemies: {
    kind: EnemyKind;
    count: number;
    patterns: MovementPattern[];
  }[];
  baseSpeed: number;
  hpMultiplier: number;
  spawnInterval: number; // ms
  isBoss?: boolean;
}

