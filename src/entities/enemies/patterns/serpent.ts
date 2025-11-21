import type { EnemyPattern } from './types';

export const serpentPattern: EnemyPattern = {
  id: 'serpent',
  duration: 10,
  initialPositions: (count, screenWidth) => {
    return Array.from({ length: count }).map((_, i) => ({
      x: (screenWidth / (count + 1)) * (i + 1),
      y: -80 - i * 30,
      indexInFormation: i,
    }));
  },
  update(enemy, t) {
    const amplitude = 90;
    const speed = 2.3;
    const vertical = 85;
    const phaseOffset = (enemy.indexInFormation ?? 0) * 0.6;
    const tt = t + phaseOffset;
    return {
      x: enemy.spawnX + Math.sin(tt * speed) * amplitude,
      y: enemy.spawnY + t * vertical,
    };
  },
};


