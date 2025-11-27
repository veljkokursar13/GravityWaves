import type { Enemy } from '@/entities/enemies/types';

type Bounds = { width: number; height: number };

export function updateEnemyPosition(e: Enemy, bounds: Bounds, dt: number, shipX: number, shipY: number): Enemy {
  const t = e.t + dt;
  // Convert logical speed to pixels/sec
  const speedPxPerSec = e.speed * 120;
  const baseY = e.y + speedPxPerSec * dt;

  switch (e.pattern) {
    case 'zigzag': {
      const flipInterval = 0.7;
      if (e.t > flipInterval) {
        e.direction *= -1;
        e.t = 0;
      }
      const H_SPEED = 100;
      const V_SPEED = e.speed * 50;

      e.x += e.direction * H_SPEED * dt;
      e.y += V_SPEED * dt;

      e.rotation = e.direction * 0.25;

      if (e.x < 40 || e.x > bounds.width - 40) {
        e.direction *= -1;
      }
      return e;
    }

    case 'sCurve': {
      e.t += dt;

      const AMPLITUDE = 80;
      const FREQUENCY = 1.6;

      e.x = e.spawnX + Math.sin(e.t * FREQUENCY) * AMPLITUDE;
      e.y += e.speed * 50 * dt;
      e.rotation = Math.cos(e.t * FREQUENCY) * 0.25;
      return e;
    }

    case 'vFormation': {
      // Offsets baked into spawnX; maintain formation while descending
      return { ...e, x: e.spawnX, y: baseY, t };
    }

    default:
      return { ...e, y: baseY, t };
  }
}