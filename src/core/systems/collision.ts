//collision detection system
import type { Ship } from '../../entities/ship/types';
import type { Enemy } from '../../entities/enemies/types';
import type { SpaceShipProjectile } from '../../entities/projectiles/types';

// Generic entity type for collision detection
interface CollisionEntity {
    x: number;
    y: number;
    width: number;
    height: number;
}

export type ShipEnemyCollision = {
    ship: Ship;
    enemy: Enemy;
}

export type BulletEnemyCollision = {
    bullet: SpaceShipProjectile;
    enemy: Enemy;
}

// AABB collision detection (assumes x/y are center points)
export function detectShipEnemyCollisions(ship: Ship | null, enemies: Enemy[]): ShipEnemyCollision[] {
    if (!ship || !enemies.length) return [];
    
    const collisions: ShipEnemyCollision[] = [];
    
    for (const enemy of enemies) {
        if (checkAABBCollision(ship, enemy)) {
            collisions.push({ ship, enemy });
        }
    }
    
    return collisions;
}

// Detect collisions between bullets and enemies
export function detectBulletEnemyCollisions(
    bullets: SpaceShipProjectile[],
    enemies: Enemy[]
): BulletEnemyCollision[] {
    if (!bullets.length || !enemies.length) return [];
    
    const collisions: BulletEnemyCollision[] = [];
    
    for (const bullet of bullets) {
        for (const enemy of enemies) {
            if (checkAABBCollision(bullet, enemy)) {
                collisions.push({ bullet, enemy });
            }
        }
    }
    
    return collisions;
}

// Generic AABB collision check
function checkAABBCollision(a: CollisionEntity, b: CollisionEntity): boolean {
    const aLeft = a.x - a.width / 2;
    const aRight = a.x + a.width / 2;
    const aTop = a.y - a.height / 2;
    const aBottom = a.y + a.height / 2;
    
    const bLeft = b.x - b.width / 2;
    const bRight = b.x + b.width / 2;
    const bTop = b.y - b.height / 2;
    const bBottom = b.y + b.height / 2;
    
    return (
        aRight > bLeft &&
        aLeft < bRight &&
        aBottom > bTop &&
        aTop < bBottom
    );
}

// Utility: Check if ship is colliding with any enemy
export function isShipColliding(ship: Ship, enemies: Enemy[]): boolean {
    return detectShipEnemyCollisions(ship, enemies).length > 0;
}
