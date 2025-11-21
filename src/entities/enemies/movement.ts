// Enemy movement patterns and logic

import { Enemy } from './types';
import { getPattern } from './patterns';

interface Bounds {
  width: number;
  height: number;
}

// dt in seconds (e.g. 1/60)
export function updateEnemyPosition(
  enemy: Enemy, 
  bounds: Bounds, 
  dt: number,
  shipX?: number,
  shipY?: number
): Enemy {
  const e = { ...enemy };
  e.t = (e.t ?? 0) + dt;
  // Try new pattern system first
  const pattern = getPattern(e.pattern as unknown as string);
  if (pattern) {
    const next = pattern.update(
      { x: e.x, y: e.y, spawnX: e.spawnX, spawnY: e.spawnY, indexInFormation: e.indexInFormation },
      e.t,
      dt,
      { playerX: shipX, playerY: shipY }
    );
    e.x = next.x;
    e.y = next.y;
    if (typeof next.rotation === 'number') {
      e.rotation = next.rotation;
    }
  } else switch (e.pattern) {
    case 'straight':
      e.y += e.speed * dt * 60;
      e.x += Math.sin(e.t * 0.1) * 0.3;
      break;

    case 'zigzag': {
      e.y += e.speed * dt * 60;
      const amplitude = 45;
      const frequency = 0.02;
      e.x += Math.sin(e.t * frequency) * amplitude * dt * 60;
      break;
    }
    case 'snake': {
      e.y += e.speed * dt * 60;
      const amp = bounds.width * 0.35;
      const freq = 0.009;
      e.x += Math.sin(e.t * freq) * amp * dt * 60;
      break;
    }

    case 'sideRush':
      e.y += e.speed  * dt * 60;
      e.x += e.direction * e.speed * dt * 60;
      break;

    case 'homing': {
      if (shipX !== undefined && shipY !== undefined) {
        const dx = shipX - e.x;
        const dy = shipY - e.y;
        const distance = Math.hypot(dx, dy);
        if (distance > 0) {
          const homingSpeed = e.speed * 0.6;
          e.x += (dx / distance) * homingSpeed * dt * 60;
          e.y += (dy / distance) * homingSpeed * dt * 60;
          e.rotation = (Math.atan2(dy, dx) * 180 / Math.PI) - 90;
        }
      } else {
        e.y += e.speed * dt * 60;
      }
      break;
    }
  }

  // Constrain horizontally within screen; allow vertical to pass off bottom
  const halfW = e.width / 2;
  if (e.x < halfW) e.x = halfW;
  if (e.x > bounds.width - halfW) e.x = bounds.width - halfW;

  return e;
};

export function isEnemyOffscreen(enemy: Enemy, bounds: Bounds): boolean {
  const belowBottom = enemy.y - enemy.height / 2 > bounds.height;
  const farOutsideX = enemy.x < -100 || enemy.x > bounds.width + 100;
  return belowBottom || farOutsideX;
}
