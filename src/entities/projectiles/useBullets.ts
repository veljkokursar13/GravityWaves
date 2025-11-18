//bullets hook
import { useState, useRef, useCallback } from 'react';
import { SpaceShipProjectile } from './types';
import { useWindowDimensions } from 'react-native';

interface ShipBulletsHook {
    bullets: SpaceShipProjectile[];
    addBullet: (bullet: SpaceShipProjectile) => void;
    removeBullet: (id: string) => void;
    updateBullets: (delta: number) => void;
    shoot: (shipX: number, shipY: number, shipHeight: number) => void;
}

const BULLET_SPEED = 700; // px/s
const FIRE_RATE = 0.3; // seconds between shots
const BULLET_WIDTH = 8;
const BULLET_HEIGHT = 16;

function updateBullet(bullet: SpaceShipProjectile, delta: number, screenHeight: number): SpaceShipProjectile | null {
    // Move bullet upward (negative Y direction)
    const newY = bullet.y - bullet.speed * delta;
    
    // Remove if off-screen
    if (newY < -bullet.height) {
        return null;
    }
    
    return {
        ...bullet,
        y: newY,
        time: bullet.time + delta,
    };
}

export const useShipBullets = (): ShipBulletsHook => {
    const { height } = useWindowDimensions();
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
                .map(bullet => updateBullet(bullet, delta, height))
                .filter((bullet): bullet is SpaceShipProjectile => bullet !== null);
            return updated;
        });
    }, [height]);

    const shoot = useCallback((shipX: number, shipY: number, shipHeight: number) => {
        const now = Date.now() / 1000; // Convert to seconds
        if (now - lastFireTime.current < FIRE_RATE) {
            return; // Too soon to fire again
        }
        
        lastFireTime.current = now;
        
        const bullet: SpaceShipProjectile = {
            id: `bullet-${Date.now()}-${Math.random()}`,
            x: shipX,
            y: shipY - shipHeight / 2 - BULLET_HEIGHT / 2, // Spawn from ship front
            width: BULLET_WIDTH,
            height: BULLET_HEIGHT,
            speed: BULLET_SPEED,
            direction: -90, // Upward
            rotation: 0,
            damage: 1,
            type: 'spaceShipProjectile',
            time: 0,
        };
        
        addBullet(bullet);
    }, [addBullet]);

    return { bullets, addBullet, removeBullet, updateBullets, shoot };
}

// Backward/compat exports to avoid import mismatch
export { useShipBullets as useBullets };
export default useShipBullets;