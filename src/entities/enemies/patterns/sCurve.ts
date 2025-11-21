import type { EnemyPattern } from './types';

export const sCurvePattern: EnemyPattern = {
  id: 'sCurve',
  duration: 9,
  initialPositions: (count, screenWidth) => {
    return Array.from({ length: count }).map((_, i) => ({
      x: (screenWidth / (count + 1)) * (i + 1),
      y: -90 - i * 50,
      indexInFormation: i,
    }));
  },
  update(enemy, t) {
    const amplitude = 80;
    const smallAmplitude = 20;
    const speed = 2.0;
    const vertical = 85;
    return {
      x: enemy.spawnX + Math.sin(t * speed) * amplitude,
      y: enemy.spawnY + t * vertical + Math.cos(t * speed * 0.5) * smallAmplitude,
    };
  },
};


