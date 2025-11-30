import { useState, useRef, useCallback, useEffect } from 'react';
import { SpaceShipProjectile } from './types';
import { useWindowDimensions } from 'react-native';

interface ShipBulletsHook {
  bullets: SpaceShipProjectile[];
  addBullet: (bullet: SpaceShipProjectile) => void;
  removeBullet: (id: string) => void;
  updateBulletsRef: (delta: number) => void; // Updates ref only, not state
  shoot: (shipX: number, shipY: number, shipHeight: number, doubleShot?: boolean) => void;
}

const BULLET_SPEED = 900; // Increased for more responsive feel
const FIRE_RATE = 0.3;
const BULLET_WIDTH = 8;
const BULLET_HEIGHT = 16;

function updateBullet(
  bullet: SpaceShipProjectile,
  delta: number,
  screenHeight: number,
  screenWidth: number
): SpaceShipProjectile | null {
  const newY = bullet.y - bullet.speed * delta;
  
  if (newY < -bullet.height || 
      newY > screenHeight + bullet.height ||
      bullet.x < -bullet.width ||
      bullet.x > screenWidth + bullet.width) {
    return null;
  }
  
  return {
    ...bullet,
    y: newY,
    time: bullet.time + delta,
  };
}

export const useBulletsOptimized = (): ShipBulletsHook => {
  const { height, width } = useWindowDimensions();
  const [bullets, setBullets] = useState<SpaceShipProjectile[]>([]);
  const bulletsRef = useRef<SpaceShipProjectile[]>([]);
  const lastFireTime = useRef<number>(0);
  
  // Sync ref to state on mount
  useEffect(() => {
    bulletsRef.current = bullets;
  }, [bullets]);
  
  // Sync ref to state at 60fps using requestAnimationFrame for smooth rendering
  useEffect(() => {
    let rafId: number;
    
    const syncState = () => {
      setBullets([...bulletsRef.current]);
      rafId = requestAnimationFrame(syncState);
    };
    
    rafId = requestAnimationFrame(syncState);
    return () => cancelAnimationFrame(rafId);
  }, []);
  
  const addBullet = useCallback((bullet: SpaceShipProjectile) => {
    bulletsRef.current = [...bulletsRef.current, bullet];
    setBullets(bulletsRef.current);
  }, []);

  const removeBullet = useCallback((id: string) => {
    bulletsRef.current = bulletsRef.current.filter(b => b.id !== id);
    setBullets(bulletsRef.current);
  }, []);

  // Updates ref only, not state - called every frame
  const updateBulletsRef = useCallback((delta: number) => {
    bulletsRef.current = bulletsRef.current
      .map(bullet => updateBullet(bullet, delta, height, width))
      .filter((bullet): bullet is SpaceShipProjectile => bullet !== null);
  }, [height, width]);

  const shoot = useCallback((shipX: number, shipY: number, shipHeight: number, doubleShot: boolean = false) => {
    const now = Date.now() / 1000;
    if (now - lastFireTime.current < FIRE_RATE) return;
    
    lastFireTime.current = now;
    
    if (doubleShot) {
      const wingOffset = 20;
      const bulletY = shipY - shipHeight / 2 + BULLET_HEIGHT * 0.3;
      
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

  return { bullets: bulletsRef.current, addBullet, removeBullet, updateBulletsRef, shoot };
};

