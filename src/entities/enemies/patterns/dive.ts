import type { EnemyPattern } from './types';

export const divePattern: EnemyPattern = {
  id: 'dive',
  duration: 6,
  initialPositions: (count, screenWidth) => {
    return Array.from({ length: count }).map((_, i) => ({
      x: (screenWidth / (count + 1)) * (i + 1),
      y: -100,
      indexInFormation: i,
    }));
  },
  update(enemy, t, dt, ctx) {
    if (t < 1.5) {
      // Hovering descent
      return {
        x: enemy.spawnX,
        y: enemy.spawnY + t * 20,
      };
    }
    const playerX = ctx.playerX ?? enemy.x;
    const playerY = ctx.playerY ?? enemy.y + 200;
    const dx = playerX - enemy.x;
    const dy = playerY - enemy.y;
    const mag = Math.hypot(dx, dy) || 1;
    const vx = (dx / mag) * 350;
    const vy = (dy / mag) * 350;
    return {
      x: enemy.x + vx * dt,
      y: enemy.y + vy * dt,
      rotation: (Math.atan2(dy, dx) * 180) / Math.PI - 90,
    };
  },
};


