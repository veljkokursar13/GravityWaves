import type { EnemyPattern } from './types';

function formationForCount(count: number, screenWidth: number) {
  // Base V of 5, tile if larger
  const base = [
    { x: -40, y: 0 },
    { x: -20, y: 20 },
    { x: 0, y: 40 },
    { x: 20, y: 20 },
    { x: 40, y: 0 },
  ];
  const centerX = screenWidth / 2;
  const rows: { x: number; y: number }[] = [];
  for (let i = 0; i < count; i++) {
    const b = base[i % base.length];
    const row = Math.floor(i / base.length);
    rows.push({ x: centerX + b.x + row * 90, y: -200 - row * 60 + b.y });
  }
  return rows;
}

export const vFormationPattern: EnemyPattern = {
  id: 'vFormation',
  duration: 10,
  initialPositions: (count, screenWidth) => {
    const pts = formationForCount(count, screenWidth);
    return pts.map((p, i) => ({ x: p.x, y: p.y, indexInFormation: i }));
  },
  update(enemy, t) {
    const vertical = 80;
    return {
      x: enemy.spawnX,
      y: enemy.spawnY + t * vertical,
    };
  },
};


