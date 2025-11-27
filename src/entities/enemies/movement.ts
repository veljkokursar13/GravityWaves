import type { Enemy } from '@/entities/enemies/types';

type Bounds = { width: number; height: number };

export function updateEnemyPosition(e: Enemy, bounds: Bounds, dt: number, shipX: number, shipY: number): Enemy {
  const t = e.t + dt;
  // Treat speed as logical units; convert to pixels/sec
  const speedPxPerSec = e.speed * 120;
  const baseY = e.y + speedPxPerSec * dt;

  switch (e.pattern) {
    case 'zigzag': {
      const amplitude = Math.max(20, e.width * 0.8);
      const freq = 1.6; // Hz
      return {
        ...e,
        y: baseY,
        x: e.spawnX + amplitude * Math.sin(2 * Math.PI * freq * t) * e.direction,
        t,
      };
    }

    case 'sCurve': {
      const amplitude = Math.max(30, e.width);
      const curve = amplitude * Math.sin(1.2 * t) + 0.5 * amplitude * Math.sin(2.4 * t);
      return { ...e, y: baseY, x: e.spawnX + curve, t };
    }

    case 'vFormation': {
      // indexInFormation can fan out horizontally while moving down
      const index = e.indexInFormation ?? 0;
      const spread = e.width * 1.1;
      const xOffset = index * spread;
      return { ...e, y: baseY, x: e.spawnX + xOffset, t };
    }

    default:
      return { ...e, y: baseY, t };
  }
}