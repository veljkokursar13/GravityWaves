// Wave configuration and definitions (data only)
import { WaveConfig } from './waveTypes';

// First five waves use drones only; patterns are randomized per spawn
export const WAVES: WaveConfig[] = [
  {
    id: 1,
    enemies: [
      {
        kind: 'drone',
        count: 10,
        patterns: ['straight', 'zigzag', 'snake', 'sideRush', 'homing'],
      },
    ],
    baseSpeed: 1.8,
    hpMultiplier: 1.0,
    spawnInterval: 900,
  },
  {
    id: 2,
    enemies: [
      {
        kind: 'drone',
        count: 12,
        patterns: ['straight', 'zigzag', 'snake', 'sideRush', 'homing'],
      },
    ],
    baseSpeed: 2.0,
    hpMultiplier: 1.05,
    spawnInterval: 850,
  },
  {
    id: 3,
    enemies: [
      {
        kind: 'drone',
        count: 14,
        patterns: ['straight', 'zigzag', 'snake', 'sideRush', 'homing'],
      },
    ],
    baseSpeed: 2.2,
    hpMultiplier: 1.1,
    spawnInterval: 800,
  },
  {
    id: 4,
    enemies: [
      {
        kind: 'drone',
        count: 16,
        patterns: ['straight', 'zigzag', 'snake', 'sideRush', 'homing'],
      },
    ],
    baseSpeed: 2.4,
    hpMultiplier: 1.2,
    spawnInterval: 750,
  },
  {
    id: 5,
    enemies: [
      {
        kind: 'drone',
        count: 18,
        patterns: ['straight', 'zigzag', 'snake', 'sideRush', 'homing'],
      },
    ],
    baseSpeed: 2.6,
    hpMultiplier: 1.25,
    spawnInterval: 700,
  },
];


