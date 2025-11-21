// Pattern system types for enemy movement and spawning
export type PatternUpdateCtx = {
  playerX?: number;
  playerY?: number;
};

export type EnemySpawnPosition = {
  x: number;
  y: number;
  indexInFormation?: number;
};

// Minimal shape used by patterns to read current/initial state
export type EnemyLike = {
  x: number;
  y: number;
  spawnX: number;
  spawnY: number;
  indexInFormation?: number;
};

export type EnemyPattern = {
  id: string;
  duration: number; // seconds pattern is designed for (advisory)
  initialPositions: (count: number, screenWidth: number, screenHeight?: number) => EnemySpawnPosition[];
  update: (
    enemy: EnemyLike,
    t: number, // seconds since spawn
    dt: number, // frame delta seconds
    ctx: PatternUpdateCtx
  ) => { x: number; y: number; rotation?: number };
};


