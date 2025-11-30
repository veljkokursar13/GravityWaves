//collision detection system
import type { Ship } from '../../entities/ship/types';
import type { Enemy } from '../../entities/enemies/types';
import type { SpaceShipProjectile, EnemyProjectile } from '../../entities/projectiles/types';

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

export type EnemyBulletShipCollision = {
    bullet: EnemyProjectile;
    ship: Ship;
}

export type GravityField = {
    id: string;
    x: number;
    y: number;
    radius: number; // Expanding radius
    strength: number; // 0-1, fades over time
    time: number;
}

export type GravityEffect = {
    field: GravityField;
    pushX: number;
    pushY: number;
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

// Detect gravity field effects on ship (pushes ship away from explosion center)
export function detectGravityFieldEffects(
    ship: Ship,
    fields: GravityField[]
): GravityEffect[] {
    if (!fields.length) return [];
    
    const effects: GravityEffect[] = [];
    
    for (const field of fields) {
        const dx = ship.x - field.x;
        const dy = ship.y - field.y;
        const dist = Math.hypot(dx, dy);
        
        // Check if ship is within gravity field radius
        if (dist < field.radius && dist > 0) {
            // Push away from center (repulsive force)
            // Stronger near center, weaker at edges
            const forceMagnitude = field.strength * 300 * (1 - dist / field.radius);
            const pushX = (dx / dist) * forceMagnitude;
            const pushY = (dy / dist) * forceMagnitude;
            
            effects.push({ field, pushX, pushY });
        }
    }
    
    return effects;
}

//kamikaze explosion ring collision detection (removed - visual only)

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

// Detect collisions between enemy bullets and ship
export function detectEnemyBulletShipCollisions(
    ship: Ship | null,
    enemyBullets: EnemyProjectile[]
): EnemyBulletShipCollision[] {
    if (!ship || !enemyBullets.length) return [];
    
    const collisions: EnemyBulletShipCollision[] = [];
    
    for (const bullet of enemyBullets) {
        if (checkAABBCollision(ship, bullet)) {
            collisions.push({ bullet, ship });
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
