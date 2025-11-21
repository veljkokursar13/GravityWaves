import type { EnemyPattern } from './types';

export const stopperPattern: EnemyPattern = {
  id: 'stopper',
  duration: 9,
  initialPositions: (count, screenWidth) => {
    return Array.from({ length: count }).map((_, i) => ({
      x: (screenWidth / (count + 1)) * (i + 1),
      y: -80 - i * 40,
      indexInFormation: i,
    }));
  },
  update(enemy, t) {
    // Move down -> stop ~0.4s -> move diagonally and exit
    const downTime = 1.0;
    const stopTime = 0.4;
    const diagonalSpeed = 120;
    const vertical = 90;
    if (t < downTime) {
      return { x: enemy.spawnX, y: enemy.spawnY + t * vertical };
    }
    if (t < downTime + stopTime) {
      const yAtStop = enemy.spawnY + downTime * vertical;
      return { x: enemy.spawnX, y: yAtStop };
    }
    const dir = (enemy.indexInFormation ?? 0) % 2 === 0 ? 1 : -1;
    const movePhase = t - (downTime + stopTime);
    const yAtStop = enemy.spawnY + downTime * vertical;
    return {
      x: enemy.spawnX + dir * movePhase * diagonalSpeed,
      y: yAtStop + movePhase * (vertical * 0.9),
    };
  },
};


