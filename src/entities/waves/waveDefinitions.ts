// Wave configuration and definitions (data only)
import { WaveConfig } from './waveTypes';

// Waves mapped to requested patterns
export const WAVES: WaveConfig[] = [
  // Wave 1 → Zigzag
  {
    id: 1,
    enemies: [{ kind: 'drone', count: 10, pattern: 'zigzag' }],
    baseSpeed: 1.8,
    hpMultiplier: 1.0,
    spawnInterval: 900,
  },
  // Wave 2 → S-curve
  {
    id: 2,
    enemies: [{ kind: 'drone', count: 12, pattern: 'sCurve' }],
    baseSpeed: 2.0,
    hpMultiplier: 1.05,
    spawnInterval: 850,
  },
  // Wave 3 → V-formation
  {
    id: 3,
    enemies: [{ kind: 'drone', count: 12, pattern: 'vFormation' }],
    baseSpeed: 2.1,
    hpMultiplier: 1.1,
    spawnInterval: 800,
  },
  // Wave 4 → Dive attackers
  {
    id: 4,
    enemies: [{ kind: 'drone', count: 10, pattern: 'dive' }],
    baseSpeed: 2.2,
    hpMultiplier: 1.15,
    spawnInterval: 780,
  },
  // Wave 5 → Circle drones
  {
    id: 5,
    enemies: [{ kind: 'drone', count: 8, pattern: 'circle' }],
    baseSpeed: 2.3,
    hpMultiplier: 1.2,
    spawnInterval: 760,
  },
  // Wave 6 → Serpent chain
  {
    id: 6,
    enemies: [{ kind: 'drone', count: 14, pattern: 'serpent' }],
    baseSpeed: 2.4,
    hpMultiplier: 1.25,
    spawnInterval: 740,
  },
  // Wave 7 → Mix 2 patterns
  {
    id: 7,
    enemies: [
      { kind: 'drone', count: 8, pattern: 'zigzag' },
      { kind: 'drone', count: 8, pattern: 'sCurve' },
    ],
    baseSpeed: 2.5,
    hpMultiplier: 1.3,
    spawnInterval: 720,
  },
  // Wave 8 → Mini boss (circle)
  {
    id: 8,
    enemies: [{ kind: 'boss', count: 1, pattern: 'circle' }],
    baseSpeed: 1.6,
    hpMultiplier: 1.8,
    spawnInterval: 1000,
    isBoss: true,
  },
  // Wave 9 → Mix everything
  {
    id: 9,
    enemies: [
      { kind: 'drone', count: 6, pattern: 'zigzag' },
      { kind: 'drone', count: 6, pattern: 'sCurve' },
      { kind: 'drone', count: 6, pattern: 'serpent' },
      { kind: 'drone', count: 4, pattern: 'dive' },
    ],
    baseSpeed: 2.6,
    hpMultiplier: 1.35,
    spawnInterval: 700,
  },
  // Wave 10 → Boss (stopper-like descent then diagonal)
  {
    id: 10,
    enemies: [{ kind: 'boss', count: 1, pattern: 'stopper' }],
    baseSpeed: 1.5,
    hpMultiplier: 2.2,
    spawnInterval: 1200,
    isBoss: true,
  },
];

