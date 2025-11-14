import { useState, useEffect } from 'react';
import { Drone, DronePattern } from './types';
import {Dimensions} from 'react-native';
const { width, height } = Dimensions.get('window');
interface DronesHook {
    drones: Drone[];
    updateDrones: (delta: number, shipX: number, shipY: number) => void;
}

export function useDrones(): DronesHook {
    const [drones, setDrones] = useState<Drone[]>([]);

    // Spawn drones periodically
    useEffect(() => {
        const interval = setInterval(() => {
            // Spawn 5 drones at once in a formation
            const newDrones = spawnDroneFormation(width, height, 5); 
            setDrones(prev => [...prev, ...newDrones]);
        }, 3000); // Spawn every 3 seconds
        return () => clearInterval(interval);
    }, []);

    // Update drone positions
    const updateDrones = (delta: number, shipX: number, shipY: number) => {
        setDrones(prev => 
            prev
                .map(drone => updateDronePosition(drone, delta, shipX, shipY, width, height))
                .filter(drone => drone.y < height + 100) // Remove off-screen drones
        );
    };

    return { drones, updateDrones };
}

function spawnDroneFormation(width: number, height: number, count: number): Drone[] {
    const drones: Drone[] = [];
    const droneSize = 40;
    const spacing = 60; // Horizontal spacing between drones
    const totalWidth = (count - 1) * spacing;
    const startX = (width - totalWidth) / 2;
    
    for (let i = 0; i < count; i++) {
        const id = `${Date.now()}-${i}`;
        const pattern: DronePattern = 'snake';
        
        const drone: Drone = {
            id,
            x: droneSize / 2, // Start from left edge
            y: -droneSize - (i * 40), // Stagger vertically for snake effect
            width: droneSize,
            height: droneSize,
            speed: 50,
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