import { DronePattern } from '@/entities/enemies/types';

export interface WaveConfig {
    wave: number;
    enemies: number;
    spawnRate: number;
    speedMultiplier: number;
    hpMultiplier: number;
    pattern: DronePattern; // Use existing DronePattern type
}

export const WAVES: WaveConfig[] = [
    {wave: 1, enemies: 10, spawnRate: 3000, speedMultiplier: 1.0, hpMultiplier: 1.0, pattern: 'snake'},
    {wave: 2, enemies: 15, spawnRate: 2500, speedMultiplier: 1.1, hpMultiplier: 1.1, pattern: 'snake'},
    {wave: 3, enemies: 20, spawnRate: 2000, speedMultiplier: 1.2, hpMultiplier: 1.2, pattern: 'zigzag'},
    {wave: 4, enemies: 25, spawnRate: 1800, speedMultiplier: 1.3, hpMultiplier: 1.3, pattern: 'zigzag'},
    {wave: 5, enemies: 30, spawnRate: 1500, speedMultiplier: 1.4, hpMultiplier: 1.4, pattern: 'homing'},
    {wave: 6, enemies: 35, spawnRate: 1200, speedMultiplier: 1.5, hpMultiplier: 1.5, pattern: 'homing'},
    {wave: 7, enemies: 40, spawnRate: 1000, speedMultiplier: 1.6, hpMultiplier: 1.6, pattern: 'straight'},
    {wave: 8, enemies: 45, spawnRate: 800, speedMultiplier: 1.7, hpMultiplier: 1.7, pattern: 'snake'},
    {wave: 9, enemies: 50, spawnRate: 600, speedMultiplier: 1.8, hpMultiplier: 1.8, pattern: 'zigzag'},
    {wave: 10, enemies: 60, spawnRate: 400, speedMultiplier: 2.0, hpMultiplier: 2.0, pattern: 'homing'},
];

// Helper: Get wave config by wave number
export function getWaveConfig(waveNumber: number): WaveConfig {
    const wave = WAVES.find(w => w.wave === waveNumber);
    return wave || WAVES[0]; // Default to wave 1 if not found
}

// Helper: Calculate wave from score (every 10 enemies defeated = next wave)
export function calculateWaveFromScore(score: number): number {
    const wave = Math.floor(score / 10) + 1;
    return Math.min(wave, WAVES.length); // Cap at max wave
}