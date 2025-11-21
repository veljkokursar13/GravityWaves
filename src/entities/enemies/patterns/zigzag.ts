import type { EnemyPattern } from './types';

export const zigzagPattern: EnemyPattern = {
  id: 'zigzag',
  duration: 8,
  initialPositions: (count, screenWidth) => {
    return Array.from({ length: count }).map((_, i) => ({
      x: (screenWidth / (count + 1)) * (i + 1),
      y: -80 - i * 60,
      indexInFormation: i,
    }));
  },
  update(enemy, t) {
    const amplitude = 70;
    const speed = 2.2;
    const vertical = 90; // px/s
    return {
      x: enemy.spawnX + Math.sin(t * speed) * amplitude,
      y: enemy.spawnY + t * vertical,
    };
  },
};


