// Enemy factory for creating different enemy types

import { Enemy, EnemyKind, MovementPattern } from './types';

interface EnemySpawnParams {
  kind: EnemyKind;
  pattern: MovementPattern;
  x: number;
  y: number;
  baseSpeed: number;
  hpMultiplier: number;
}

export function createEnemy(params: EnemySpawnParams): Enemy {
  const { kind, pattern, x, y, baseSpeed, hpMultiplier } = params;

  const id = `${kind}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

  // Base stats per enemy type
  let width = 50;
  let height = 50;
  let baseHp = 1;
  // add small variance to speed for organic feel (±10%)
  const base = baseSpeed * (0.9 + Math.random() * 0.2);
  let speed = base;

  switch (kind) {
    case 'drone':
      width = 52;
      height = 52;
      baseHp = 1;
      speed = base;
      break;

    case 'heavyDrone':
      width = 60;
      height = 60;
      baseHp = 3;
      speed = base * 0.8;
      break;

    case 'kamikaze':
      width = 45;
      height = 45;
      baseHp = 1;
      speed = base * 1.5;
      break;

    case 'rogue':
      width = 55;
      height = 55;
      baseHp = 2;
      speed = base * 1.2;
      break;

    case 'boss':
      width = 100;
      height = 100;
      baseHp = 20;
      speed = base * 0.6;
      break;
  }

  return {
    id,
    kind,
    x,
    y,
    width,
    height,
    speed,
    hp: Math.ceil(baseHp * hpMultiplier),
    maxHp: Math.ceil(baseHp * hpMultiplier),
    pattern,
    direction: Math.random() < 0.5 ? -1 : 1,
    rotation: 0,
    t: 0,
  };
}
