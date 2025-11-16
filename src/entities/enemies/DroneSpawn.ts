import { useRef, useState, useEffect } from 'react';
import { Drone, DronePattern } from './types';
import { useWindowDimensions } from 'react-native';
import { WaveConfig } from '@/core/systems/waves';

interface DronesHook {
    drones: Drone[];
    updateDrones: (delta: number, shipX: number, shipY: number) => void;
    removeDrone: (id: string) => void;
    getWaveProgress: () => { spawned: number; remaining: number; total: number };
    drainPassed: () => string[];
    resetWave: () => void;
}

export function useDrones(waveConfig?: WaveConfig): DronesHook {
    const { width, height } = useWindowDimensions();
    const [drones, setDrones] = useState<Drone[]>([]);
    const [spawned, setSpawned] = useState<number>(0);
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const spawnedRef = useRef<number>(0);
    const passedQueueRef = useRef<string[]>([]);
    
    const config = waveConfig || {
        wave: 1,
        enemies: 10,
        spawnRate: 3000,
        speedMultiplier: 1.0,
        hpMultiplier: 1.0,
        pattern: 'snake' as DronePattern
    };

    // Spawn drones using wave config (one per tick until target reached)
    useEffect(() => {
        // reset state on config change
        setDrones([]);
        setSpawned(0);
        spawnedRef.current = 0;
        passedQueueRef.current = [];
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
        const interval = setInterval(() => {
            if (spawnedRef.current >= config.enemies) {
                clearInterval(interval);
                intervalRef.current = null;
                return;
            }
            const newDrones = spawnDroneFormation(width, height, 1, config);
            spawnedRef.current += newDrones.length;
            setSpawned(prev => prev + newDrones.length);
            setDrones(prev => [...prev, ...newDrones]);
        }, config.spawnRate);
        intervalRef.current = interval;
        return () => {
            clearInterval(interval);
            intervalRef.current = null;
        };
    }, [config.spawnRate, config.enemies, config.pattern, config.speedMultiplier, width, height]);

    // Update drone positions
    const updateDrones = (delta: number, shipX: number, shipY: number) => {
        setDrones(prev => {
            const updated: Drone[] = [];
            for (const d of prev) {
                const nd = updateDronePosition(d, delta, shipX, shipY, width, height);
                // Remove if off-screen bottom (passed ship) and queue penalty
                if (nd.y >= height + 50) {
                    passedQueueRef.current.push(nd.id);
                    continue;
                }
                updated.push(nd);
            }
            return updated;
        });
    };

    const removeDrone = (id: string) => {
        setDrones(prev => prev.filter(drone => drone.id !== id));
    };

    const getWaveProgress = () => {
        return {
            spawned,
            remaining: drones.length,
            total: config.enemies,
        };
    };

    const drainPassed = () => {
        const copy = [...passedQueueRef.current];
        passedQueueRef.current = [];
        return copy;
    };

    const resetWave = () => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
        setDrones([]);
        setSpawned(0);
        spawnedRef.current = 0;
        passedQueueRef.current = [];
    };

    return { drones, updateDrones, removeDrone, getWaveProgress, drainPassed, resetWave };
}

function spawnDroneFormation(
    width: number, 
    height: number, 
    count: number,
    config: WaveConfig
): Drone[] {
    // Use config.pattern instead of hardcoded 'snake'
    // Use config.speedMultiplier: speed: 50 * config.speedMultiplier
    const drones: Drone[] = [];
    const droneSize = 40;
    
    for (let i = 0; i < count; i++) {
        const id = `${Date.now()}-${i}`;
        const pattern: DronePattern = config.pattern;
        
        // Initial position: center horizontally, staggered vertically
        const initialX = width / 2;
        const initialY = -droneSize - (i * 40);
        
        const drone: Drone = {
            id,
            x: initialX,
            y: initialY,
            width: droneSize,
            height: droneSize,
            speed: 50 * config.speedMultiplier,
            direction: 90,
            rotation: 0,
            pattern,
            zigzagOffset: i * 1.0, // Offset wave phase for each drone
        };
        drones.push(drone);
    }
    
    return drones;
}

function updateDronePosition(
    drone: Drone, 
    delta: number, 
    shipX: number, 
    shipY: number,
    width: number,
    height: number
): Drone {
    let newX = drone.x;
    let newY = drone.y + drone.speed * delta;
    let newRotation = drone.rotation;
    let newZigzagOffset = drone.zigzagOffset || 0;

    switch (drone.pattern) {
        case 'straight':
            // Just move down
            break;

        case 'snake':
            // Snake movement spanning entire screen width
            newZigzagOffset += delta * 1.8;
            // Map sine wave (-1 to 1) to full screen width
            const normalizedSine = (Math.sin(newZigzagOffset) + 1) / 2; // 0 to 1
            newX = drone.width / 2 + normalizedSine * (width - drone.width);
            // Smooth rotation following the wave
            newRotation = Math.cos(newZigzagOffset) * 20;
            break;

        case 'zigzag':
            newZigzagOffset += delta * 3;
            const zigzagAmplitude = 80;
            newX = drone.x + Math.sin(newZigzagOffset) * zigzagAmplitude;
            newX = Math.max(drone.width / 2, Math.min(width - drone.width / 2, newX));
            newRotation = Math.sin(newZigzagOffset) * 20;
            break;

        case 'homing':
            // Move toward ship
            const dx = shipX - drone.x;
            const dy = shipY - drone.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance > 0) {
                const homingSpeed = drone.speed * 0.6;
                newX = drone.x + (dx / distance) * homingSpeed * delta;
                newY = drone.y + (dy / distance) * homingSpeed * delta;
                newRotation = (Math.atan2(dy, dx) * 180 / Math.PI) - 90;
            }
            break;
    }

    return {
        ...drone,
        x: newX,
        y: newY,
        rotation: newRotation,
        zigzagOffset: newZigzagOffset,
    };
}