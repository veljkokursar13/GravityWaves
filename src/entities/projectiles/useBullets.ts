//bullets hook
import { useState, useRef, useCallback } from 'react';
import { SpaceShipProjectile } from './types';
import { useWindowDimensions } from 'react-native';

interface ShipBulletsHook {
    bullets: SpaceShipProjectile[];
    addBullet: (bullet: SpaceShipProjectile) => void;
    removeBullet: (id: string) => void;
    updateBullets: (delta: number) => void;
    shoot: (shipX: number, shipY: number, shipHeight: number, doubleShot?: boolean) => void;
}

const BULLET_SPEED = 700; // px/s
const FIRE_RATE = 0.3; // seconds between shots
const BULLET_WIDTH = 8;
const BULLET_HEIGHT = 16;

function updateBullet(bullet: SpaceShipProjectile, delta: number, screenHeight: number, screenWidth: number): SpaceShipProjectile | null {
    // Move bullet upward (negative Y direction)
    const newY = bullet.y - bullet.speed * delta;
    const newX = bullet.x;
    
    // Remove if off-screen (check all edges to prevent memory leak)
    if (newY < -bullet.height || 
        newY > screenHeight + bullet.height ||
        newX < -bullet.width ||
        newX > screenWidth + bullet.width) {
        return null;
    }
    
    return {
        ...bullet,
        x: newX,
        y: newY,
        time: bullet.time + delta,
    };
}

export const useShipBullets = (): ShipBulletsHook => {
    const { height, width } = useWindowDimensions();
    const [bullets, setBullets] = useState<SpaceShipProjectile[]>([]);
    const lastFireTime = useRef<number>(0);
    
    const addBullet = useCallback((bullet: SpaceShipProjectile) => {
        setBullets(prev => [...prev, bullet]);
    }, []);

    const removeBullet = useCallback((id: string) => {
        setBullets(prev => prev.filter(bullet => bullet.id !== id));
    }, []);

    const updateBullets = useCallback((delta: number) => {
        setBullets(prev => {
            const updated = prev
                .map(bullet => updateBullet(bullet, delta, height, width))
                .filter((bullet): bullet is SpaceShipProjectile => bullet !== null);
            return updated;
        });
    }, [height, width]);

    const shoot = useCallback((shipX: number, shipY: number, shipHeight: number, doubleShot: boolean = false) => {
        const now = Date.now() / 1000; // Convert to seconds
        if (now - lastFireTime.current < FIRE_RATE) {
            return; // Too soon to fire again
        }
        
        lastFireTime.current = now;
        
        if (doubleShot) {
            // Double shot mode - fire from both wings
            const wingOffset = 20; // Distance from center to each wing
            // Start bullets from ship's front (slightly inside for visual continuity)
            const bulletY = shipY - shipHeight / 2 + BULLET_HEIGHT * 0.3;
            
            // Left wing bullet
            const bulletLeft: SpaceShipProjectile = {
                id: `bullet-left-${Date.now()}-${Math.random()}`,
                x: shipX - wingOffset,
                y: bulletY,
                width: BULLET_WIDTH,
                height: BULLET_HEIGHT,
                speed: BULLET_SPEED,
                direction: -90,
                rotation: 0,
                damage: 1,
                type: 'spaceShipProjectile',
                time: 0,
            };
            
            // Right wing bullet
            const bulletRight: SpaceShipProjectile = {
                id: `bullet-right-${Date.now()}-${Math.random()}`,
                x: shipX + wingOffset,
                y: bulletY,
                width: BULLET_WIDTH,
                height: BULLET_HEIGHT,
                speed: BULLET_SPEED,
                direction: -90,
                rotation: 0,
                damage: 1,
                type: 'spaceShipProjectile',
                time: 0,
            };
            
            addBullet(bulletLeft);
            addBullet(bulletRight);
        } else {
            // Single shot mode - fire from center
            // Start bullet from ship's front (slightly inside for visual continuity)
            const bullet: SpaceShipProjectile = {
                id: `bullet-${Date.now()}-${Math.random()}`,
                x: shipX,
                y: shipY - shipHeight / 2 + BULLET_HEIGHT * 0.3,
                width: BULLET_WIDTH,
                height: BULLET_HEIGHT,
                speed: BULLET_SPEED,
                direction: -90,
                rotation: 0,
                damage: 1,
                type: 'spaceShipProjectile',
                time: 0,
            };
            
            addBullet(bullet);
        }
    }, [addBullet]);

    return { bullets, addBullet, removeBullet, updateBullets, shoot };
}