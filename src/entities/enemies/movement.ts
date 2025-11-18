// Enemy movement patterns and logic

import { Enemy } from './types';

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

  switch (e.pattern) {
    case 'straight':
      e.y += e.speed * dt * 60;
      e.x += Math.sin(e.t * 0.1) * 0.3;
      break;

    case 'zigzag':
      e.y += e.speed * dt * 60;
      const amplitude = 45;
      const frequency = 0.02;
      e.x += Math.sin(e.t * frequency) * amplitude * dt * 60;
      break;

    case 'snake':
      e.y += e.speed * dt * 60;
      e.x += Math.sin(e.t * 4) * 1.8;
      break;

    case 'sideRush':
      e.y += (e.speed * 0.3) * dt * 60;
      e.x += e.direction * e.speed * dt * 60;
      break;

    case 'homing':
      if (shipX !== undefined && shipY !== undefined) {
        const dx = shipX - e.x;
        const dy = shipY - e.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
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

  return e;
}

export function isEnemyOffscreen(enemy: Enemy, bounds: Bounds): boolean {
  return enemy.y > bounds.height + 100 || enemy.x < -100 || enemy.x > bounds.width + 100;
}
