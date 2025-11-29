// Enemy bullets hook - manages projectiles fired by enemies
import { useState, useCallback } from 'react';
import { EnemyProjectile } from './types';
import { useWindowDimensions } from 'react-native';

interface EnemyBulletsHook {
  bullets: EnemyProjectile[];
  addBullet: (bullet: EnemyProjectile) => void;
  removeBullet: (id: string) => void;
  updateBullets: (delta: number) => void;
  shootAtPlayer: (enemyX: number, enemyY: number, enemyHeight: number, playerX: number, playerY: number) => void;
  shootStraight: (enemyX: number, enemyY: number, enemyHeight: number) => void;
}

const BULLET_SPEED = 400; // px/s (slower than player bullets)
const BULLET_WIDTH = 6;
const BULLET_HEIGHT = 14;

function updateBullet(
  bullet: EnemyProjectile,
  delta: number,
  screenHeight: number,
  screenWidth: number
): EnemyProjectile | null {
  // Calculate movement based on direction angle
  const angleRad = (bullet.direction * Math.PI) / 180;
  const dx = Math.cos(angleRad) * bullet.speed * delta;
  const dy = Math.sin(angleRad) * bullet.speed * delta;

  const newX = bullet.x + dx;
  const newY = bullet.y + dy;

  // Remove if off-screen (check all edges)
  if (
    newY < -bullet.height ||
    newY > screenHeight + bullet.height ||
    newX < -bullet.width ||
    newX > screenWidth + bullet.width
  ) {
    return null;
  }

  return {
    ...bullet,
    x: newX,
    y: newY,
    time: bullet.time + delta,
  };
}

export const useEnemyBullets = (): EnemyBulletsHook => {
  const { height, width } = useWindowDimensions();
  const [bullets, setBullets] = useState<EnemyProjectile[]>([]);

  const addBullet = useCallback((bullet: EnemyProjectile) => {
    setBullets((prev) => [...prev, bullet]);
  }, []);

  const removeBullet = useCallback((id: string) => {
    setBullets((prev) => prev.filter((bullet) => bullet.id !== id));
  }, []);

  const updateBullets = useCallback(
    (delta: number) => {
      setBullets((prev) => {
        const updated = prev
          .map((bullet) => updateBullet(bullet, delta, height, width))
          .filter((bullet): bullet is EnemyProjectile => bullet !== null);
        return updated;
      });
    },
    [height, width]
  );

  // Shoot at player position (tracking shot)
  const shootAtPlayer = useCallback(
    (enemyX: number, enemyY: number, enemyHeight: number, playerX: number, playerY: number) => {
      // Calculate angle to player
      const dx = playerX - enemyX;
      const dy = playerY - enemyY;
      const angle = (Math.atan2(dy, dx) * 180) / Math.PI;

      // Spawn bullet from bottom of enemy
      const bulletY = enemyY + enemyHeight / 2;

      const bullet: EnemyProjectile = {
        id: `enemy-bullet-${Date.now()}-${Math.random()}`,
        x: enemyX,
        y: bulletY,
        width: BULLET_WIDTH,
        height: BULLET_HEIGHT,
        speed: BULLET_SPEED,
        direction: angle,
        rotation: 0,
        damage: 1,
        type: 'enemyProjectile',
        time: 0,
      };

      addBullet(bullet);
    },
    [addBullet]
  );

  // Shoot straight down
  const shootStraight = useCallback(
    (enemyX: number, enemyY: number, enemyHeight: number) => {
      // Spawn bullet from bottom of enemy
      const bulletY = enemyY + enemyHeight / 2;

      const bullet: EnemyProjectile = {
        id: `enemy-bullet-${Date.now()}-${Math.random()}`,
        x: enemyX,
        y: bulletY,
        width: BULLET_WIDTH,
        height: BULLET_HEIGHT,
        speed: BULLET_SPEED,
        direction: 90, // Straight down
        rotation: 0,
        damage: 1,
        type: 'enemyProjectile',
        time: 0,
      };

      addBullet(bullet);
    },
    [addBullet]
  );

  return { bullets, addBullet, removeBullet, updateBullets, shootAtPlayer, shootStraight };
};
