// Unified enemy type system for all enemy entities

export type EnemyKind = 'drone' | 'heavyDrone' | 'kamikaze' | 'rogue' | 'boss';
export type MovementPattern = 'straight' | 'zigzag' | 'homing' | 'snake' | 'sideRush';

// Main Enemy type - used by new system
export type Enemy = {
    id: string;
    kind: EnemyKind;
    x: number;
    y: number;
    width: number;
    height: number;
    speed: number;
    hp: number;
    maxHp: number;
    pattern: MovementPattern;
    direction: 1 | -1;
    rotation: number;
    t: number; // time accumulator for pattern calculations
};

// Legacy Drone type - kept for backward compatibility with existing DroneSpawn.ts
// TODO: Remove after migration complete
export type DronePattern = 'straight' | 'zigzag' | 'homing' | 'snake';

export type Drone = {
    id: string;
    x: number;
    y: number;
    width: number;
    height: number;
    speed: number;
    direction: number;
    rotation: number;
    pattern: DronePattern;
    zigzagOffset?: number;
};
