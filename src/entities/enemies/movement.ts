import type { Enemy } from '@/entities/enemies/types';

type Bounds = { width: number; height: number };

export function updateEnemyPosition(e: Enemy, bounds: Bounds, dt: number, shipX: number, shipY: number): Enemy {
  // Create a copy to avoid mutation
  const updated = { ...e };
  const t = updated.t + dt;
  const speedPxPerSec = updated.speed * 120;
  const baseY = updated.y + speedPxPerSec * dt;

  switch (updated.pattern) {
    case 'zigzag': {
      const newT = updated.t + dt;
      const AMPLITUDE = 90;
      const FREQUENCY = 2.4;

      return {
        ...updated,
        t: newT,
        x: updated.spawnX + Math.sin(newT * FREQUENCY) * AMPLITUDE,
        y: updated.y + updated.speed * 45 * dt,
        rotation: Math.sin(newT * FREQUENCY) * 0.35,
      };
    }

    case 'sCurve': {
      const newT = updated.t + dt;
      const AMPLITUDE = 120;
      const WAVE_1 = Math.sin(newT * 1.6);
      const WAVE_2 = Math.sin(newT * 0.8) * 0.4;

      return {
        ...updated,
        t: newT,
        x: updated.spawnX + (WAVE_1 + WAVE_2) * AMPLITUDE,
        y: updated.y + updated.speed * 50 * dt,
        rotation: Math.cos(newT * 1.6) * 0.2,
      };
    }

    case 'vFormation': {
      return { ...updated, x: updated.spawnX, y: baseY, t };
    }

    case 'roguePath': {
      const newT = updated.t + dt;
      const screenProgress = updated.y / bounds.height;
      
      const speedMultiplier = screenProgress < 0.10 ? 20 : 220;
      const newY = updated.y + updated.speed * speedMultiplier * dt;

      return {
        ...updated,
        t: newT,
        x: updated.spawnX + Math.sin(newT) * 40,
        y: newY,
        rotation: Math.sin(newT * 2) * 0.15,
      };
    }

    case 'kamikazePath': {
      const newT = updated.t + dt;
      const HOMING = 4.0;

      let dx = shipX - updated.x;
      let dy = shipY - updated.y;
      const len = Math.hypot(dx, dy) || 1;
      
      dx /= len;
      dy /= len;

      return {
        ...updated,
        t: newT,
        x: updated.x + dx * updated.speed * 50 * dt * HOMING,
        y: updated.y + dy * updated.speed * 50 * dt * HOMING,
        rotation: Math.atan2(dy, dx),
      };
    }

    case 'armoredDronePath': {
      const newT = updated.t + dt;

      return {
        ...updated,
        t: newT,
        y: updated.y + updated.speed * 25 * dt,
        x: updated.spawnX + Math.sin(newT * 0.8) * 30,
        rotation: Math.sin(newT * 0.8) * 0.1,
      };
    }

    case 'bossPath': {
      const newT = updated.t + dt;
      const targetY = bounds.height * 0.2;
      const screenProgress = updated.y / bounds.height;
      
      let newY = updated.y;
      if (screenProgress < 0.2) {
        newY = updated.y + updated.speed * 30 * dt;
      } else {
        newY = targetY;
      }
      
      const FOLLOW_SPEED = 80;
      const dx = shipX - updated.x;
      let newX = updated.x;
      
      if (Math.abs(dx) > 10) {
        const direction = dx > 0 ? 1 : -1;
        newX = updated.x + direction * FOLLOW_SPEED * dt;
        
        const halfWidth = updated.width / 2;
        newX = Math.max(halfWidth + 20, Math.min(bounds.width - halfWidth - 20, newX));
      }
      
      return {
        ...updated,
        t: newT,
        x: newX,
        y: newY,
        rotation: Math.sin(newT * 0.5) * 0.05,
      };
    }

    default:
      return { ...updated, y: baseY, t };
  }
}
