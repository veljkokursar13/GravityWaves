// Wave types/interfaces split out from definitions
import { EnemyKind, MovementPattern } from '../enemies/types';

export interface WaveConfig {
  id: number;
  enemies: {
    kind: EnemyKind;
    count: number;
    pattern: MovementPattern;
  }[];
  baseSpeed: number;
  hpMultiplier: number;
  spawnInterval: number; // ms (legacy; not used by pattern spawner)
  isBoss?: boolean;
}

