export type EnemyKind = 'drone' | 'heavy' | 'kamikaze' | 'rogue' | 'boss' | 'armoredDrone';
export type MovementPattern = 'zigzag' | 'sCurve' | 'vFormation' | 'roguePath' | 'armoredDronePath' | 'kamikazePath';

export type Enemy = {
  id: string;
  kind: EnemyKind;
  pattern: MovementPattern;

  x: number;
  y: number;
  spawnX: number;
  spawnY: number;

  width: number;
  height: number;
  speed: number;

  hp: number;
  maxHp: number;

  t: number; // time since spawn (sec)
  rotation: number;
  direction: 1 | -1; // for patterns
  indexInFormation?: number;
};