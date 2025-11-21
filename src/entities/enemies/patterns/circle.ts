import type { EnemyPattern } from './types';

export const circlePattern: EnemyPattern = {
  id: 'circle',
  duration: 10,
  initialPositions: (count, screenWidth) => {
    const centerX = screenWidth / 2;
    // Single or few orbits centered
    return Array.from({ length: count }).map((_, i) => ({
      x: centerX,
      y: -200 - i * 40,
      indexInFormation: i,
    }));
  },
  update(enemy, t) {
    const radius = 60;
    const speed = 3;
    const vertical = 80;
    return {
      x: enemy.spawnX + Math.cos(t * speed) * radius,
      y: enemy.spawnY + t * vertical + Math.sin(t * speed) * radius,
    };
  },
};


